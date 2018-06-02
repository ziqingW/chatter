const express = require('express');
const app = express();
const http = require('http').Server(app);
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const io = require('socket.io')(http);
const session = require('express-session');
const body_parser = require('body-parser');
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true
});
var PORT = process.env.PORT || 8000;
var people = {};
var names = [];
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SECRET_KEY || 'dev',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 6000000 }
}));
app.use(body_parser.urlencoded({ extended: false }));

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
            people[client.id] = name;
            names.push(name);
            console.log(names, people);
            client.emit("login_success", name);
            client.broadcast.emit("login_message", name + " joinned the channel");
            io.emit("online", people);
        }
        else {
            client.emit("login_fail", "Nickname existed, choose other one");
        }
    });
    // disconnect event handler  
    client.on('disconnect', function() {
        console.log('a user disconnected');
        var nick = people[client.id];
        delete people[client.id];
        io.emit("login_message", nick + " exited");
    });
    // receive message from client  
    client.on("chat_message", function(msg) {
        client.broadcast.emit('chat_message', msg);
    });
    // see whos typing
    client.on("typing", function() {
        var nick = people[client.id];
        client.broadcast.emit('typing', nick + " is typing...");
    });
    client.on("notyping", function() {
        io.emit('notyping');
    });
    //private chat
    client.on("private", function(user) {
        client.emit('private');
        client.on("private_msg", function(msg) {
            client.to(user).emit("private_msg", msg);
        });
    });
});
http.listen(PORT, function() {
    console.log("app starting at port " + PORT);
});
