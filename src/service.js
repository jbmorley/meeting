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

var Express = require('express'),
    path = require('path'),
    HTTP = require('http'),
    SocketIO = require('socket.io'),
    fs = require('fs'),
    busboyBodyParser = require('busboy-body-parser'),
    busboy = require('connect-busboy'),
    gm = require('gm'),
    uuid = require('node-uuid'),
    exec = require('child_process').exec,
    util = require('util'),
    gravatar = require('nodejs-gravatar'),
    update = require('react-addons-update');

var values = require('./lib/values'),
    parse_message = require('./lib/parse-message');

var app = Express(),
    server = HTTP.Server(app),
    io = SocketIO(server);

state = {
  title: "Example Meeting",
  items: [],
  selection: false,
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

        var uploadWithExtension = function(extension) {
            return __dirname + '/static/uploads/' + uuid.v4() + extension;
        };

        var extension = path.extname(filename);
        var uploadPath = uploadWithExtension(extension);

        var fstream = fs.createWriteStream(uploadPath);
        file.pipe(fstream);
        fstream.on('close', function() {

            var completion = function(title, filename, cleanup) {

                state.items.push({
                    uuid: uuid.v4(),
                    title: title,
                    url: "/#/viewer/" + path.basename(filename),
                    cleanup: cleanup
                });
                broadcastState();

            };

            if (extension == '.jpg' || extension == '.jpeg' || extension == '.png' || extension == '.gif') {

                var imagePath = uploadPath;
                gm(uploadPath).autoOrient().write(uploadPath, function() {
                    completion(path.basename(filename, extension), uploadPath, function() {
                        fs.unlink(imagePath, function(error) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    });
                    res.sendStatus(200);
                });

            } else if (extension == '.pdf') {

                var thumbnailPath = uploadWithExtension('.jpg');
                var command = util.format(
                    'gs -dBATCH -dNOPAUSE -sDEVICE=jpeg -r200 -sOutputFile=%s %s',
                    thumbnailPath, uploadPath);
                exec(command, function(error) {

                    if (error) {
                        console.log("Encountered an error generating PDF preview.");
                        console.log(error);
                        res.sendStatus(500);
                        return;
                    }

                    completion(path.basename(filename, extension), thumbnailPath, function() {
                        fs.unlink(uploadPath, function(error) {
                            if (error) {
                                console.log(error);
                            }
                        });
                        fs.unlink(thumbnailPath, function(error) {
                            if (error) {
                                console.log(error);
                            }
                        });
                    });

                    res.sendStatus(200);

                });

            } else {
                console.log(util.format("Unsupported file with extension '%s'", extension));
                fs.unlink(uploadPath, function(error) {
                    if (error) {
                        console.log(error);
                    }
                });
            }

        })
    })
})

offerSocket = undefined;

function broadcastState() {
    var clientState = update(state, {
        users: {$set: values(state.users)}
    })
    io.emit('server-set-state', JSON.stringify(clientState));
}

io.on('connection', function(socket) {

    socket.uuid = uuid.v4(),
    state.users[socket.uuid] = {
        uuid: socket.uuid,
        name: 'Jason Morley',
        email: 'jason.morley@inseven.co.uk',
        avatar: gravatar.imageUrl('jason.morley@inseven.co.uk', { "size": "128" })
    }
    broadcastState();

  socket.on('disconnect', function() {

    delete state.users[socket.uuid];
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

    var item = state.items[0];
    if (item.cleanup) {
        item.cleanup();
    }
    state.items.splice(message.index, 1);
    broadcastState();

  })).on('client-set-selection', parse_message(function(message) {

    state.selection = message.uuid;
    broadcastState();

  })).on('client-clear-selection', parse_message(function(message) {

    state.selection = false;
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
