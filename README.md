# Chatter
I created this app with express and socket.io. It was an assigned project from DigitalCrafts.

It's working like an online chat room. Different people can join in one same room and communicate with each other. 

You can send public or private messages to the other users, or receive the messages from them.

## How to chat
- The app will ask you for a nickname to log in before you enter the chat room
- When you in the lobby, you can check the online user in the left panel
- Click other user's name in left panel to start the private chat with her/him
- CLick 'Main' will go back to public broadcast

___
## Nerd's thinking
### Gains:
- It was functionally useful as an real life app
- As my first time using socket.io it was fun

### Pains:
- It was not easy to debug, I had to insert a lot of console.log() into the program
- It was very tricky to select and get the attribute value of the particular user for private chat by JQuery, which took me most of the time in trying it

## Major Techs:
- HTML
- CSS
- JQuery
- Node.js
- Express
- Socket.io

## Published:
[Heroku: mini-chatter](https://mini-chatter.herokuapp.com/)