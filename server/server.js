const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4000;

const app = express();

const server = http.createServer(app);

//connect socket io to the server
const io = socketIo(server);

//maintain a list of online users
const users = {};

//listen for new connections
io.on("connection", socket => {
  if (!users[socket.id]) {
    users[socket.id] = socket.id;
    console.log(`${users[socket.id]} is now online!`);
  }
  //emit the user id
  socket.emit("yourID", socket.id);
  //emit all the users
  //WE NEED TO HAVE SOME KIND OF FILTER HERE
  //SO WE CAN ONLY SHOW THE USERS ASSCOCIATED
  //WITH THE PRACTICTIONER
  io.sockets.emit("allUsers", users);
  socket.on("callUser", data => {
    io.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from
    });
  });
  socket.on("acceptCall", data => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
  //disconnect
  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} is now offline!`);
    delete users[socket.id];
    io.sockets.emit("allUsers", users);
  });
});

server.listen(port, error => {
  if (error) return;
  console.log(`Listening on port ${port}`);
});
