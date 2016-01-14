/*
 * Copyright (C) 2015-2016 InSeven Limited.
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

var update = require('react-addons-update')
var values = require('./lib/values')
var parse_message = require('./lib/parse-message')

var Express = require('express'),
    path = require('path'),
    HTTP = require('http'),
    SocketIO = require('socket.io'),
    fs = require('fs'),
    busboyBodyParser = require('busboy-body-parser'),
    busboy = require('connect-busboy'),
    gm = require('gm'),
    uuid = require('node-uuid')

var app = Express(),
    server = HTTP.Server(app),
    io = SocketIO(server)

state = {
  title: "Example Meeting",
  items: [],
  selection: undefined,
  users: {},
  offer: undefined,
  answer: undefined,
}

const uploadDir = __dirname + '/static/uploads/';

// Support parsing multipart/form-data.
app.use(busboy())

// Render static pages.
app.use(Express.static(path.join(__dirname, 'static')))

// Accept file uploads.
app.post('/upload', function(req, res) {
    var fstream
    req.pipe(req.busboy)
    req.busboy.on('file', function(fieldname, file, filename) {

        var uploadFilename = uuid.v4() + path.extname(filename);
        var uploadPath = uploadDir + uploadFilename;

        var fstream = fs.createWriteStream(uploadPath);
        file.pipe(fstream)
        fstream.on('close', function() {
            image = gm(uploadPath);
            image.autoOrient().write(uploadPath, function() {
                state.items.push({
                    uuid: uuid.v4(),
                    title: path.basename(filename, path.extname(filename)),
                    url: "/viewer.html#/" + uploadFilename
                })
                state.selection = state.items.length - 1;
                broadcastState();
            });
        })
    })
})

offerSocket = undefined;

io.emitJSON = function(message, parameters) {
  io.emit(message, JSON.stringify(parameters))
}

function broadcastState() {
  io.emitJSON('server-set-state', state)
}

io.on('connection', function(socket) {

  state.users[socket] = {uuid: uuid.v4(), name: '', email: ''}
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

  })).on('client-add-item', parse_message(function(item) {

    item.uuid = uuid.v4();
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
