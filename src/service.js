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
  items: {}
};

function values() {
  var items = [];
  for (var uuid in state.items) {
    if (state.items.hasOwnProperty(uuid)) {
      items.push(update(state.items[uuid], {}));
    }
  }
  return items;
}

function resetItems() {
  state.items = update(DEFAULT_ITEMS, {});
}

function sendItems(socket) {
  io.emit('server-set-items', JSON.stringify(values(state.items)));
}

function parseJSON(callback) {
  return function(message) {
    callback(JSON.parse(message));
  }
}

resetItems();

io.on('connection', function(socket) {

  // Send the current state to the newly connected client.
  sendItems(socket);

  socket.on('disconnect', function() {

  }).on('client-reset-items', function(message) {

    resetItems();
    sendItems(socket);

  }).on('client-add-item', parseJSON(function(item) {

    item.uuid = guid();
    state.items[item.uuid] = item;
    sendItems(socket);

  })).on('client-remove-item', parseJSON(function(message) {

    delete state.items[message.uuid];
    sendItems(socket);

  })).on('client-set-selection', parseJSON(function(message) {

  })).on('client-call-add-ice-candidate', function(candidate) {

    socket.broadcast.emit('server-call-add-ice-candidate', candidate);

  }).on('client-call-set-session', function(session) {

    socket.broadcast.emit('server-call-set-session', session);

  });
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
