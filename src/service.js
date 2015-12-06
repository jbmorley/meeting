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
var guid = require('./lib/guid');
var values = require('./lib/values');
var parse_message = require('./lib/parse-message');

var Express = require('express'),
    Path = require('path'),
    HTTP = require('http'),
    SocketIO = require('socket.io');

var app = Express(),
    server = HTTP.Server(app),
    io = SocketIO(server);

app.use(Express.static(Path.join(__dirname, 'static')));

DEFAULT_ITEMS = [
  {uuid: guid(), title: "UWO Activity - Sessions/Users", url: "examples/activity.pdf"},
  {uuid: guid(), title: "UWO Engagement - Pages/Session", url: "examples/engagement_pages_session.pdf"},
  {uuid: guid(), title: "UWO Engagement - Av Session Duration", url: "examples/engagement_session_duration.pdf"},
  {uuid: guid(), title: "Unique opens of UWO campaign (CM)", url: "examples/unique_opens.pdf"},
  {uuid: guid(), title: "% Unsubscribed (CM)", url: "examples/unsubscribed.pdf"},
  {uuid: guid(), title: "% Clicked a link (CM)", url: "examples/clicked.pdf"},
  {uuid: guid(), title: "Continuous improvement", url: "charts/table.html"},
  {uuid: guid(), title: "Bar chart", url: "charts/bar.html"},
];

DEFAULT_ITEMS = [];

state = {
  items: {},
  selection: undefined,
  users: {},
  offer: undefined,
  answer: undefined,
};

offerSocket = undefined;

io.emitJSON = function(message, parameters) {
  io.emit(message, JSON.stringify(parameters));
};

function resetItems() {
  state.items = update(DEFAULT_ITEMS, {});
}

function broadcastState() {
  io.emitJSON('server-set-state', state);
}

resetItems();

io.on('connection', function(socket) {

  state.users[socket] = {uuid: guid(), name: '', email: ''};
  broadcastState();

  socket.on('disconnect', function() {

    delete state.users[socket];
    if (offerSocket == socket) {
      state.offer = undefined;
      state.answer = undefined;
    }
    broadcastState();

  }).on('client-set-user', parse_message(function(user) {

    state.users[socket].name = user.name;
    state.users[socket].email = user.email;
    broadcastState();

  })).on('client-reset-items', function(message) {

    resetItems();
    broadcastState();

  }).on('client-add-item', parse_message(function(item) {

    item.uuid = guid();
    state.items.push(item);
    broadcastState();

  })).on('client-remove-item', parse_message(function(message) {

    state.items.splice(message.index, 1);
    broadcastState();

  })).on('client-set-selection', parse_message(function(message) {

    state.selection = message.index;
    broadcastState();

  })).on('client-call-add-ice-candidate', function(candidate) {

    socket.broadcast.emit('server-call-add-ice-candidate', candidate);

  }).on('client-call-set-offer', parse_message(function(offer) {

    state.offer = offer;
    offerSocket = socket;
    broadcastState();

  })).on('client-call-set-answer', parse_message(function(answer) {

    state.answer = answer;
    broadcastState();

  }));
});

server.listen(3000, function(){
  console.log('listening on *:3000');
});
