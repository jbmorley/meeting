/*
 * Copyright (C) 2015 InSeven Limited.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

var Express = require('express'),
    Path = require('path'),
    HTTP = require('http'),
    SocketIO = require('socket.io');

var app = Express(),
    server = HTTP.Server(app),
    io = SocketIO(server);

// TODO Something nicer than this please.
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

app.use(Express.static(Path.join(__dirname, 'static')));

state = {
  // items: []
  items: [
    {uuid: 1, url: "http://jbmorley.co.uk/photos/2015/11/san-francisco/20-image.jpg"},
    {uuid: 2, url: "http://www.dx13.co.uk"},
    {uuid: 3, url: "http://bbc.com/news"},
    {uuid: 4, url: "http://jbmorley.co.uk"},
    {uuid: 4, url: "http://pdavision.co.uk"}
  ]
};

io.on('connection', function(socket) {
  console.log('a user connected');

  // TODO Broadcast the current call information to the current user.
  // TODO Store the user which established a call and revoke the call when they disconnect.

  // Send the current state to the newly connected client.
  socket.emit('server-set-items', JSON.stringify(state.items));

  socket.on('disconnect', function() {

    console.log('user disconnected');

  }).on('client-add-item', function(msg) {

    item = JSON.parse(msg);
    item.uuid = guid();
    state.items = state.items.concat([item]);
    io.emit('server-set-items', JSON.stringify(state.items));

  }).on('client-call-add-ice-candidate', function(candidate) {

    console.log('received ice candidate: ' + candidate);
    socket.broadcast.emit('server-call-add-ice-candidate', candidate);

  }).on('client-call-set-session', function(session) {

    console.log('received session description: ' + session);
    socket.broadcast.emit('server-call-set-session', session);

  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
