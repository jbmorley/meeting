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

var update = require('react-addons-update');
var guid = require('./guid.js');

var Express = require('express'),
    Path = require('path'),
    HTTP = require('http'),
    SocketIO = require('socket.io');

var app = Express(),
    server = HTTP.Server(app),
    io = SocketIO(server);

app.use(Express.static(Path.join(__dirname, 'static')));

DEFAULT_ITEMS = {
  1: {uuid: 1, title: "Bar chart", url: "charts/bar.html"},
  2: {uuid: 2, title: "Pie chart", url: "charts/pie.html"},
  3: {uuid: 3, title: "Line chart", url: "charts/line.html"},
  4: {uuid: 4, title: "Continuous improvement", url: "charts/table.html"}
};

state = {
  items: {},
  selection: undefined,
  users: {},
};

function values(object) {
  var items = [];
  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      items.push(update(object[key], {}));
    }
  }
  return items;
}

io.emitJSON = function(message, parameters) {
  io.emit(message, JSON.stringify(parameters));
};

function resetItems() {
  state.items = update(DEFAULT_ITEMS, {});
}

function broadcastItems() {
  io.emitJSON('server-set-items', values(state.items));
}

function broadcastUsers() {
  io.emitJSON('server-set-users', values(state.users));
}

function broadcastSelection() {
  io.emitJSON('server-set-selection', {uuid: state.selection});
}

function parse_message(callback) {
  return function(message) {
    callback(JSON.parse(message));
  }
}

resetItems();

io.on('connection', function(socket) {

  state.users[socket] = {uuid: guid(), name: '', email: ''};
  broadcastItems();
  broadcastUsers();
  broadcastSelection();

  socket.on('disconnect', function() {

    delete state.users[socket];
    broadcastUsers();

  }).on('client-set-user', parse_message(function(user) {

    console.log("User " + user.name + " with email " + user.email + " connected");
    state.users[socket].name = user.name;
    state.users[socket].email = user.email;
    broadcastUsers();

  })).on('client-reset-items', function(message) {

    resetItems();
    broadcastItems();

  }).on('client-add-item', parse_message(function(item) {

    item.uuid = guid();
    state.items[item.uuid] = item;
    broadcastItems();

  })).on('client-remove-item', parse_message(function(message) {

    delete state.items[message.uuid];
    broadcastItems();

  })).on('client-set-selection', parse_message(function(message) {

    state.selection = message.uuid;
    broadcastSelection();

  })).on('client-call-add-ice-candidate', function(candidate) {

    socket.broadcast.emit('server-call-add-ice-candidate', candidate);

  }).on('client-call-set-session', function(session) {

    socket.broadcast.emit('server-call-set-session', session);

  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
