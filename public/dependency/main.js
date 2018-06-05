$(document).ready(function(){
    var socket = io();
    socket.on('connect', function (s) {
            console.log('connected');
        });
    $("#online").on('click', 'li a', function(e) {
            e.preventDefault();
            let user = $(this).text();
            if (user != $("#you").text()) {
                let chatter_id = $(this).attr("href").slice(1);
                $("#private_chatter").html(`<span id="private-wrap" style="font-size: 1em; font-weight: bold;" data-id="${chatter_id}">${user}</span>`);
                $("#privateform").css("display", "flex");
                $("#msgform").css("display", "none");
            } else {
                return false;
            }
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
        $(".nick").html(`<b>${name}</b>`);
        $("#conversation").append($("<h6>").text('You (' + name + ') joined the chatroom'));
        $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
    });
    //info to everyone connected
    socket.on("login_message", function(msg) {
        $("#conversation").append(msg);
        $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
    });
    //chatting
    $('#msgform').submit(function(){
        let msg = $('#public').val();
        socket.emit("chat_message", msg);
        $('#public').val("");
        $("#conversation").append(`<div class="own-msg"><p>${msg}</p></div>`);
        $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
        return false;
    });
    socket.on("chat_message", function(data) {
        $("#conversation").append(`<div class="other-msg"><p style="color: ${data[2]};" class="other-msg-name" >${data[1]} :</p><p class="other-msg-contents">${data[0]}</p></div>`);
        $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
    });
    //whos typing
    $('.msg-input').on('input', function(){
        socket.emit("typing");
    });
    $('.msg-input').on('focusout', function(){
        socket.emit("notyping");
    });
    socket.on("typing", function(data) {
        $("#typing").html(`<p><span style="color: ${data[1]};">${data[0]}</span> is typing...</p>`);
        $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
    });
    socket.on("notyping", function() {
        $("#typing").empty();
    });
    // whos online
    socket.on("online", function(people){
        let onlines = "";
        people = Object.entries(people);
        people.forEach(function(user) {
            onlines += (`<li><a class="onlineUser" href="/${user[0]}">${user[1][0]}</a></li>`);
        });
        $("#online").html(onlines);
    });
    // private chat
    $("#privateform").submit(function(){
       let msg = $("#private").val();
       let chatter_id = $("#private-wrap").data()['id'];
       let chatter = $("#private-wrap").text();
       socket.emit("private_msg", [msg,chatter_id]);
       $("#conversation").append(`<div class="private-chatter"><p class="private-msg-name"><i>you whispered ${chatter}</i></p><div class="private-contents-wrap"><p class="private-msg-contents">${msg}</p></div></div>`);
       $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
       $("#private").val("");
       return false;
    });
    $("#lobby").click(function(){
        $("#private").val("");
        $("#privateform").css("display", "none");
        $("#msgform").css("display", "flex");
    });
    socket.on("private_msg", function(data) {
        $("#conversation").append(`<div class="private-chatter"><p class="private-msg-name"><i>whisper from <span style="color: ${data[2]};">${data[1]}</span></i></p><div class="private-contents-wrap"><p class="private-msg-contents">${data[0]}</p></div></div>`);
        $(".chat-window").scrollTop($(".chat-window")[0].scrollHeight);
    });
    
});