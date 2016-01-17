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

var express = require('express');
var path = require('path');
var HTTP = require('http');
var SocketIO = require('socket.io');
var fs = require('fs');
var busboyBodyParser = require('busboy-body-parser');
var busboy = require('connect-busboy');
var gm = require('gm');
var uuid = require('node-uuid');
var exec = require('child_process').exec;
var util = require('util');
var gravatar = require('nodejs-gravatar');
var update = require('react-addons-update');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser');

var values = require('./lib/values');
var parse_message = require('./lib/parse-message');
var config = require('./lib/config');

var app = express();
var server = HTTP.Server(app);
var io = SocketIO(server);

// Application state.
state = {
  title: "Example Meeting",
  items: [],
  selection: false,
  users: {},
  offer: undefined,
  answer: undefined,
}

passport.serializeUser(function(user, done) {
    console.log("Serialize user '" + user.username + "'.");
    done(null, user.username);
});

passport.deserializeUser(function(id, done) {
    console.log("Deserialize user '" + id + "'.");
    done(null, {username: id});
});

// Configure passport with a local authentication strategy.
// This is an extremely simple dictionary look-up and should be replaced with a database model in the future.
passport.use(new LocalStrategy(
    function(username, password, done) {
        if (username in config.users && config.users[username] == password) {
            console.log("Successfully authenticated user '" + username + "'.");
            return done(null, {username: username});
        } else {
            console.log("Failed to authenticate user '" + username + "'.");
            return done(null, false, {message: 'Unable to sign in.'})
        }
    }
));

// Configure the basic routes and middleware.
app.use(session({
    secret: config.secret,
    proxy: true,
    resave: true,
    saveUninitialized: true,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: 3600000 * 72 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(busboy());
app.use('/css', express.static(path.join(__dirname, 'static/css')));
app.use('/images', express.static(path.join(__dirname, 'static/images')));
app.use('/login', express.static(path.join(__dirname, 'static/login.html')));
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}));
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});
app.all('*', function(req, res, next) {
    console.log("Checking authentication...");
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
});
app.use(express.static(path.join(__dirname, 'static')));

// Post route for performing the authentication and setting the session state.

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

                // N.B. We explicitly specify the URL here (inc. 'index.html') to ensure this URL is different
                // to the top-level URL of the application itself. For some reason, when the two paths match,
                // Firefox will not load the contents of the iframes.
                // Doubtless there is 'correct' solution to this, but time is short.
                state.items.push({
                    uuid: uuid.v4(),
                    title: title,
                    url: "/index.html#/viewer/" + path.basename(filename),
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
