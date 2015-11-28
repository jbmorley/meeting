var express = require('express'),
    path = require('path'),
    http = require('http'),
    socket = require('socket.io');

var app = express(),
    server = http.Server(app),
    io = socket(server);

app.use(express.static(path.join(__dirname, 'static')));

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  }).on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
