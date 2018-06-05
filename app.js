const express = require('express');
const app = express();
const http = require('http').Server(app);
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const io = require('socket.io')(http);


nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true
});
var PORT = process.env.PORT || 8000;
var people = {};
var names = [];
var colors = ['red', 'pink', 'blue', 'orange', 'green', 'black', 'grey', 'purple','cyan'];

app.use(morgan('dev'));
app.use(express.static('public'));



//main room
app.get('/', function(req, resp, next) {
    resp.render('main.html');
});
//interactions between client and server(io)
io.on('connection', function(client) {
    console.log('a user connected');
    // make a nickname to join a chatroom 
    client.on("join", function(name) {
        if (names.indexOf(name) == -1) {
            var pick = Math.floor(Math.random() * 9);
            var nameColor = colors[pick];
            people[client.id] = [name, nameColor];
            names.push(name);
            console.log(people);
            console.log(people[client.id][0]);
            client.emit("login_success", name);
            client.broadcast.emit("login_message", `<h6><span style="color: ${nameColor};">${name}</span> joinned the channel</h6>`);
            io.emit("online", people);
        }
        else {
            client.emit("login_fail", "Nickname existed, choose other one");
        }
    });
    // disconnect event handler  
    client.on('disconnect', function() {
        console.log('a user disconnected');
        var nick;
        if (people[client.id]) {
            nick = people[client.id][0];
        } else {
            nick = 'A chatter';
        }
        delete people[client.id];
        client.broadcast.emit("login_message", `<h6>${nick} exited the channel</h6>`);
        client.broadcast.emit("online", people);
    });
    // receive message from client  
    client.on("chat_message", function(msg) {
        var nick, color;
        if (people[client.id]) {
            nick = people[client.id][0];
            color = people[client.id][1];
        } else {
            nick = 'A chatter';
            color = "#757575";
        }
        client.broadcast.emit('chat_message', [msg, nick, color]);
    });
    // see whos typing
    client.on("typing", function() {
        var nick, color;
        if (people[client.id]) {
            nick = people[client.id][0];
            color = people[client.id][1];
        } else {
            nick = 'A chatter';
            color = "#757575";
        }
        client.broadcast.emit('typing', [nick, color]);
    });
    client.on("notyping", function() {
        io.emit('notyping');
    });
    //private chat
    client.on("private_msg", function(data) {
        var nick, color;
        if (people[client.id]) {
            nick = people[client.id][0];
            color = people[client.id][1];
        } else {
        nick = "A chatter";
        color = "#757575";
        }
        client.to(data[1]).emit("private_msg", [data[0], nick, color]);
    });
    
});
http.listen(PORT, function() {
    console.log("app starting at port " + PORT);
});
