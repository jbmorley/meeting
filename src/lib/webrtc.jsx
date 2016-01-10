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

const peerConnectionConfig = require('../config.jsx');

var webRTC = {

    UNSUPPORTED: 0,
    DISCONNECTED: 1,
    OFFERING: 2,
    ANSWERING: 3,
    CONNECTED: 4,

    state: (navigator.getUserMedia != undefined) ? 1 : 0,

    // Callbacks.
    onIceCandidate: function(candidate) { console.log("WARNING: webRTC.onIceCandidate not implemented"); },
    onAttachLocalStream: function(url) { console.log("WARNING: webRTC.onAttachLocalStream not implemented"); },
    onAttachRemoteStream: function(url) { console.log("WARNING: webRTC.onAttachRemoteStream not implemented"); },

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

    _getUserMedia: function(details) {
        var self = this;
        return new Promise(function(resolve, reject) {
            navigator.getUserMedia({video: true, audio: true}, function(localStream) {
                window.peerConnection.addStream(localStream);
                webRTC.onAttachLocalStream(window.URL.createObjectURL(localStream))
                resolve(details);
            }, reject);
        });
    },

    _createOffer: function(details) {
        console.log("Creating the offer");
        return new Promise(function(resolve, reject) {
            window.peerConnection.createOffer(function(offer) {
                window.peerConnection.setLocalDescription(new RTCSessionDescription(offer), function() {
                    webRTC.onSessionDescription(offer);
                    resolve(details);
                }, reject);
            }, reject);
        });
    },

    _createAnswer: function(details) {
        console.log("Creating answer");
        return new Promise(function (resolve, reject) {
            peerConnection.createAnswer(function(answer) {
                peerConnection.setLocalDescription(new RTCSessionDescription(answer), function() {
                    webRTC.onSessionDescription(answer);
                    resolve(details);
                }, reject);
            }, reject);
        });
    },

    _setRemoteDescription: function(description) {
        return function(details) {
            console.log("Add remote description");
            return new Promise(function(resolve, reject) {
                window.peerConnection.setRemoteDescription(new RTCSessionDescription(description), function() {
                    resolve(details);
                }, reject);
            });
        }
    },

    setup: function() {
        var self = this;

        if (webRTC.state == webRTC.UNSUPPORTED) {
            return;
        }

        webRTC._setState(webRTC.state);

        window.peerConnection = new RTCPeerConnection(peerConnectionConfig);

        window.peerConnection.onicecandidate = function(event) {
            if (event.candidate != null) {
                webRTC.onIceCandidate(event.candidate)
            }
        };

        window.peerConnection.onaddstream = function(event) {
            webRTC._setState(webRTC.CONNECTED);
            webRTC.onAttachRemoteStream(window.URL.createObjectURL(event.stream));
        };
    },

    startCall: function() {
        var self = this;
        self._setState(webRTC.OFFERING)({})
            .then(self._getUserMedia)
            .then(self._createOffer)
            .catch(function(error) {
                console.log("ERROR: startCall: " + error);
            });
    },

    addIceCandidate: function(candidate) {
        var self = this;
        window.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    },

    setAnswer: function(sdp) {
        var self = this;
        self._setRemoteDescription(sdp)({})
            .catch(function(error) {
                console.log("ERROR: setAnswer: " + error);
            });
    },

    setOffer: function(sdp) {
        var self = this;
        self._setState(webRTC.ANSWERING)({})
            .then(self._getUserMedia)
            .then(self._setRemoteDescription(sdp))
            .then(self._createAnswer)
            .catch(function(error) {
                console.log("ERROR: setOffer: " + error);
            });
    },

};

module.exports = webRTC;
