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

var call = { session: null, candidates: [] };

app.use(Express.static(Path.join(__dirname, 'static')));

io.on('connection', function(socket) {
  console.log('a user connected');

  // TODO Broadcast the current call information to the current user.
  // TODO Store the user which established a call and revoke the call when they disconnect.

  socket.on('disconnect', function() {

    console.log('user disconnected');

  }).on('chat message', function(msg) {

    io.emit('chat message', msg);

  }).on('client-call-start', function(msg) {

    console.log('client requested a new call');
    io.emit('server-call-notify');

  }).on('client-call-add-ice-candidate', function(candidate) {

    console.log('received ice candidate: ' + candidate);
    call.candidates.push(candidate);
    io.emit('server-call-add-ice-candidate', candidate);

  }).on('client-call-set-session', function(session) {

    // TODO Handle the error case where a client is attempting to overwrite a session.
    console.log('received session description: ' + session);
    call.session = session;

  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
