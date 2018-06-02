$(document).ready(function(){
    var socket = io();
    socket.on('connect', function (s) {
            console.log('connected');
        });
    $("#online").on('click', 'li a', function(e) {
            e.preventDefault();
            let user = $(this).text();
            $("#private_chatter").text(user);
            socket.emit("private", $(this).attr("href").slice(1));
    });
    //login info to client only
    $('#nicknameform').submit(function(){
        let name = $('#nickContent').val();
        socket.emit("join", name);
        return false;
    });
    socket.on("login_fail", function(msg) {
        $("#fail-msg").html(msg);
    });
    socket.on("login_success", function(name) {
        $("#nick-back").css("display", 'none');
        $("#nick").append($("<h6>").text(name));
        $("#conversation").append($("<h6>").text('You joined the chatroom'));
    });
    //info to everyone connected
    socket.on("login_message", function(msg) {
        $("#conversation").append($("<h6>").text(msg));
    });
    //chatting
    $('#msgform').submit(function(){
        let msg = $('#msgContent').val();
        socket.emit("chat_message", msg);
        $('#msgContent').val("");
        $("#conversation").append($("<p>").text(msg));
        return false;
    });
    socket.on("chat_message", function(msg) {
        $("#conversation").append($("<p>").text(msg));
    });
    //whos typing
    $('.msg-input').on('input', function(){
        socket.emit("typing");
    });
    $('.msg-input').on('focusout', function(){
        socket.emit("notyping");
    });
    socket.on("typing", function(msg) {
        $("#typing").html($("<p>").text(msg));
    });
    socket.on("notyping", function() {
        $("#typing").empty();
    });
    // whos online
    socket.on("online", function(people){
        let onlines = "";
        people = Object.entries(people);
        people.forEach(function(user) {
            onlines += (`<li><a class="onlineUser" href="/${user[0]}">${user[1]}</a></li>`);
        });
        $("#online").html(onlines);
    });
    // private chat
    socket.on("private", function(){
        $("#private-panel").css("display", "block");
    });
    $("#private-panel").submit(function(){
       let msg = $("#private").val();
       socket.emit("private_msg", msg);
       $("#conversation").append($("<p>").text(msg));
       $("#private").val("");
       return false;
    });
    socket.on("private_msg", function(msg) {
        $("#conversation").append($("<p>").text(msg));
    });
});