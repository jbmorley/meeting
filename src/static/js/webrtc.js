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

var peerConnectionConfig = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;


var webRTC = {

    // onIceCandidate: null,
    onIceCandidate: function(candidate) {
        console.log("WARNING: webRTC.onIceCandidate not implemented");
    },

    // Glue code to tell us when we've received an incoming stream. Feels like this really needs to be a callback.
    // Interestingly this should just flatten down to one callback which is addStream(LOCAL/REMOTE, URL);

    // _gotDescription: function(description) {
    //     console.log('Received session description: ' + JSON.stringify({'sdp': description}));

    //     // peerConnection.setLocalDescription(description, function () {
    //     //     serverConnection.send(JSON.stringify({'sdp': description}));
    //     // }, function() {console.log('set description error')});
    // },

    onAddRemoteStream: function(event) {
        console.log('Received a remote stream');
        // remoteVideo.src = window.URL.createObjectURL(event.stream);
    },

    checkSupport: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (navigator.getUserMedia) {
                console.log("WebRTC is available");
                resolve(true);
            } else {
                reject("Your browser does not support WebRTC");
            }
        });
    },

    getUserMedia: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            navigator.getUserMedia({ video: true, audio: true }, function(localStream) {
                console.log("Successfully got local stream");
                resolve(localStream);
            }, reject);
        });
    },

    attachLocalStream: function(stream) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (webRTC.onAttachLocalStream != null) {
                webRTC.onAttachLocalStream(window.URL.createObjectURL(stream));
            } else {
                reject("onAttachLocalStream not defined");
            }
            resolve(stream);
        });
    },

    getPeerConnection: function(localStream) {
        console.log("Configuring a new peer connection");
        return new Promise(function(resolve, reject) {
            console.log("Creating new RTCPeerConnection");
            peerConnection = new RTCPeerConnection(peerConnectionConfig);
            peerConnection.onicecandidate = function(event) {
                if (event.candidate != null) {
                    webRTC.onIceCandidate(JSON.stringify(event.candidate))
                }
            };
            peerConnection.onaddstream = function(event) { webRTC.onAddRemoteStream(event); }
            resolve(peerConnection);

            console.log("Adding local stream to peer connection");
            peerConnection.addStream(localStream);

            resolve(peerConnection);
        });
    },

    createOffer: function(peerConnection) {
        console.log("Creating the offer");
        return new Promise(function(resolve, reject) {
            peerConnection.createOffer(function(description) {
                resolve({peerConnection: peerConnection, description: description});
            }, reject);
        });
    },

    setLocalDescription: function(details) {
        return new Promise(function(resolve, reject) {
            details.peerConnection.setLocalDescription(details.description, function() {
                resolve(details);
            }, reject);
        });
    },

    sendDescription: function(details) {
        console.log("Sending the session description to the server");
        return new Promise(function(resolve, reject) {
            if (webRTC.onSessionDescription) {
                webRTC.onSessionDescription(JSON.stringify(details.description))
                resolve(details);
            } else {
                reject("onSessionDescription not defined");
            }
        });
    },

    startCall: function() {
        var self = this;
        self.checkSupport()
            .then(self.getUserMedia)
            .then(self.attachLocalStream)
            .then(self.getPeerConnection)
            .then(self.createOffer)
            .then(self.setLocalDescription)
            .then(self.sendDescription)
            .catch(function(error) {
                alert("Unable to start call: " + error);
            });
    },

    joinCall: function() {

    },

};

