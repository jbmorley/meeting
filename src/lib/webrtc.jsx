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

const peerConnectionConfig = require('../config.jsx');

var constraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

function isSupported() {
    return navigator.getUserMedia != undefined;
}

var webRTC = {

    UNSUPPORTED: 0,
    DISCONNECTED: 1,
    OFFERING: 2,
    ANSWERING: 3,
    CONNECTED: 4,

    state: isSupported() ? 1 : 0,

    onIceCandidate: function(candidate) {
        console.log("WARNING: webRTC.onIceCandidate not implemented");
    },

    onAddRemoteStream: function(event) {
        if (webRTC.onAttachRemoteStream != null) {
            webRTC.onAttachRemoteStream(window.URL.createObjectURL(event.stream));
        } else {
            console.log("ERROR: onAttachRemoteStream not defined");
        }
    },

    _checkSupport: function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (isSupported()) {
                console.log("WebRTC is available");
                resolve(true);
            } else {
                reject("Your browser does not support WebRTC");
            }
        });
    },

    _getUserMedia: function(details) {
        var self = this;

        if (window.getUserMediaPromise != null) {
            return window.getUserMediaPromise;
        }

        window.getUserMediaPromise = new Promise(function(resolve, reject) {
            navigator.getUserMedia({ video: true, audio: true }, function(localStream) {
                console.log("Successfully got local stream");
                details.peerConnection.addStream(localStream);
                details.localStream = localStream;
                resolve(details);
            }, reject);
        });

        return window.getUserMediaPromise;
    },

    _attachLocalStream: function(details) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (webRTC.onAttachLocalStream != null) {
                webRTC.onAttachLocalStream(window.URL.createObjectURL(details.localStream));
            } else {
                reject("onAttachLocalStream not defined");
            }
            resolve(details);
        });
    },

    _getPeerConnection: function() {

        if (window.peerConnectionPromise != null) {
            return window.peerConnectionPromise;
        }

        console.log("Configuring a new peer connection");
        window.peerConnectionPromise = new Promise(function(resolve, reject) {
            console.log("Creating new RTCPeerConnection");
            peerConnection = new RTCPeerConnection(peerConnectionConfig);
            peerConnection.onicecandidate = function(event) {
                if (event.candidate != null) {
                    webRTC.onIceCandidate(event.candidate)
                }
            };
            peerConnection.onaddstream = function(event) { webRTC.onAddRemoteStream(event); }
            resolve({peerConnection: peerConnection});
        });

        return window.peerConnectionPromise;
    },

    _createOffer: function(details) {
        console.log("Creating the offer");
        return new Promise(function(resolve, reject) {
            details.peerConnection.createOffer(function(description) {
                details.description = description;
                resolve(details);
            }, reject /* , constraints */);
        });
    },

    _setState: function(state) {
        webRTC.state = state;
        console.log("Setting WebRTC state to " + state + "...");
        if (webRTC.onStateChange != undefined) {
            webRTC.onStateChange(state);
        }
        return function(details) {
            return new Promise(function(resolve, reject) {
                resolve(details);
            });
        };
    },

    _setLocalDescription: function(details) {
        return new Promise(function(resolve, reject) {
            details.peerConnection.setLocalDescription(details.description, function() {
                resolve(details);
            }, reject);
        });
    },

    _sendDescription: function(details) {
        console.log("Sending the session description to the server");
        return new Promise(function(resolve, reject) {
            if (webRTC.onSessionDescription) {
                webRTC.onSessionDescription(details.description)
                resolve(details);
            } else {
                reject("onSessionDescription not defined");
            }
        });
    },

    _createAnswer: function(details) {
        console.log("Creating answer");
        return new Promise(function (resolve, reject) {
            peerConnection.createAnswer(function(description) {
                details.description = description;
                resolve(details);
            }, reject /* , constraints */);
        });
    },

    _addIceCandidate: function(candidate) {
        return function(details) {
            console.log("Add ice candidate");
            return new Promise(function(resolve, reject) {
                details.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                resolve(details);
            });
        }
    },

    _setRemoteDescription: function(description) {
        return function(details) {
            console.log("Add remote description");
            return new Promise(function(resolve, reject) {
                details.peerConnection.setRemoteDescription(new RTCSessionDescription(description), function() {
                    resolve(details);
                }, reject);
            });
        }
    },

    startCall: function() {
        var self = this;
        self._checkSupport()
            .then(self._setState(webRTC.OFFERING))
            .then(self._getPeerConnection)
            .then(self._getUserMedia)
            .then(self._attachLocalStream)
            .then(self._createOffer)
            .then(self._setLocalDescription)
            .then(self._sendDescription)
            .catch(function(error) {
                alert("Unable to start call: " + error);
            });
    },

    addIceCandidate: function(candidate) {
        var self = this;
        self._checkSupport()
            .then(self._getPeerConnection)
            .then(self._addIceCandidate(candidate))
            .catch(function(error) {
                alert("Unable to add ice candidiate: " + error);
            });
    },

    handleSessionDescription: function(description) {
        var self = this;

        if (description.type == "answer") {

            return self._checkSupport()
                .then(self._getPeerConnection)
                .then(self._getUserMedia)
                .then(self._attachLocalStream)
                .then(self._setRemoteDescription(description))
                .then(self._setState(webRTC.CONNECTED))

        } else {

            return self._checkSupport()
                .then(self._setState(webRTC.ANSWERING))
                .then(self._getPeerConnection)
                .then(self._getUserMedia)
                .then(self._attachLocalStream)
                .then(self._setRemoteDescription(description))
                .then(self._createAnswer)
                .then(self._setLocalDescription)
                .then(self._sendDescription)
                .then(self._setState(webRTC.CONNECTED));

        }

    },

};

module.exports = webRTC;
