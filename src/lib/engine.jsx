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

import io from 'socket.io-client';

import parse_message from './parse-message';
import values from './values';

export default class Engine {

    constructor() {
        this.stateObservers = [];
        this.state = {};
    }

    addStateObserver(observer) {
        this.stateObservers.push(observer);
        observer(this.state);
    }

    removeStateObserver(observer) {
        delete this.stateObservers[this.stateObservers.indexOf(observer)];
    }

    setState(state) {
        // TODO Diff the state.
        // TODO Immtable copy here please.
        this.state = state;
        for (var i in this.stateObservers) {
            this.stateObservers[i](state);
        }
    }

    connect() {
        var self = this;
        self._socket = io()
        self._socket.on('server-set-state', parse_message(function(state) {

            self.setState({
                title: state.title,
                items: state.items,
                users: values(state.users),
                selection: state.selection != undefined ? state.items[state.selection] : undefined,
                offer: state.offer,
                answer: state.answer,
            });

            if (state.answer != undefined && webRTC.state == webRTC.OFFERING) {
                webRTC.setAnswer(state.answer);
                engine._sendMessage('client-call-set-answer', undefined);
            }

        })).on('server-call-add-ice-candidate', parse_message(function(candidate) {

            if (webRTC.state != webRTC.UNSUPPORTED) {
                console.log("Receiving ICE Candidate: " + candidate.candidate);
                webRTC.addIceCandidate(candidate);
            }

        }));
    }

    _sendMessage(message, parameters) {
        this._socket.emit(message, JSON.stringify(parameters));
    }

    setUser(user) {
        this._sendMessage('client-set-user', user);
    }

    resetItems() {
        this.addItem({title: "UWO Activity - Sessions/Users", url: "/viewer.html#/activity.jpg"});
        this.addItem({title: "UWO Engagement - Pages/Session", url: "/viewer.html#/engagement_pages_session.jpg"});
        this.addItem({title: "UWO Engagement - Av Session Duration", url: "/viewer.html#/engagement_session_duration.jpg"});
        this.addItem({title: "Unique opens of UWO campaign (CM)", url: "/viewer.html#/unique_opens.jpg"});
        this.addItem({title: "% Unsubscribed (CM)", url: "/viewer.html#/unsubscribed.jpg"});
        this.addItem({title: "% Clicked a link (CM)", url: "/viewer.html#/clicked.jpg"});
        this.addItem({title: "Continuous improvement", url: "charts/table.html"});
        this.addItem({title: "Bar chart", url: "charts/bar.html"});
    }

    addItem(item) {
        this._sendMessage('client-add-item', item);
    }

    removeItem(index) {
        this._sendMessage('client-remove-item', {index: index});
    }

    setSelection(index) {
        this._sendMessage('client-set-selection', {index: index});
    }

    startCall() {
        webRTC.startCall();
    }

    addIceCandidate(candidate) {
        this._sendMessage('client-call-add-ice-candidate', candidate);
    }

    setSession(session) {
        console.log(session);
        if (session.type == "offer") {
            this._sendMessage('client-call-set-offer', session);
        } else if (session.type == "answer") {
            this._sendMessage('client-call-set-answer', session)
        } else {
            alert("Unsupported session type!");
        }
    }

    setLocalStream(stream) {
        // this._meeting.setState({localStream: stream});
    }

    setRemoteStream(stream) {
        // this._meeting.setState({remoteStream: stream});
    }

    setCallState(state) {
        // this._meeting.setState({callState: state});
    }

    upload(file) {
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        formData.append("file", file);
        function reqListener () {
            console.log(this.responseText);
        }
        xhr.addEventListener("load", reqListener);
        xhr.open("POST", "/upload");
        xhr.send(formData);
    }

}
