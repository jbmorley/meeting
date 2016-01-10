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

import React from 'react';
import ReactDOM from 'react-dom';

var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

import Divider from 'material-ui/lib/divider';
import MenuItem from 'material-ui/lib/menus/menu-item';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import AddItemDialog from './lib/add-item-dialog.jsx';
import CustomTheme from './lib/custom-theme.jsx';
import ItemGrid from './lib/item-grid.jsx';
import ItemView from './lib/item-view.jsx';
import MeetingWebRTC from './lib/meeting-web-rtc.jsx';
import MeetingAppScreen from './lib/meeting-app-screen.jsx';

import webRTC from './lib/webrtc.jsx';
import values from './lib/values';
import parse_message from './lib/parse-message';

const CallState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

class MeetingApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

            title: "Cheese",
            items: [],
            users: [],
            selection: undefined,

            showAddItemDialog: false,

            callState: webRTC.UNSUPPORTED,
            offer: undefined,
            answer: undefined,

        };

    }

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(CustomTheme),
        };
    }

    render() {
        var self = this;

        const menuItems = [
            <MenuItem
                key="add-menu-item"
                primaryText="Add item"
                onTouchTap={() => self.setState({showAddItemDialog: true})} />,
            <MenuItem
                key="reset-menu-item"
                primaryText="Reset items"
                onTouchTap={() => engine.resetItems()} />
        ];

        const navigationItems = [
            <MenuItem
                key="menu-item-navigation-item"
                primaryText="Menu Item" />,
            <MenuItem
                key="menu-item-disabled-navigation-item"
                disabled={true}
                primaryText="Menu Item 2" />,
            <Divider
                key="divider-navigation-item" />
        ];

        return (
            <div>

                <MeetingAppScreen
                    title={this.state.title}
                    navigationItems={navigationItems}
                    menuItems={menuItems}>

                    <ItemGrid
                        items={this.state.items}
                        onRemoveItem={(index) => engine.removeItem(index)}
                        onSelect={(index) => engine.setSelection(index)} />

                    <ItemView
                        open={this.state.selection != undefined}
                        item={this.state.selection}
                        onRequestClose={() => engine.setSelection(undefined)} />)

                </MeetingAppScreen>

                <AddItemDialog
                    open={this.state.showAddItemDialog}
                    onSubmit={(title, url) => {
                        this.setState({showAddItemDialog: false});
                        engine.addItem({title: title, url: url});
                    }}
                    onCancel={() => this.setState({showAddItemDialog: false})} />

                <MeetingWebRTC
                    useAppRTC={true}
                    callState={self.state.callState}
                    offer={self.state.offer}
                    localStream={self.state.localStream}
                    remoteStream={self.state.remoteStream}
                    onStartCall={() => engine.startCall()}
                    onAcceptCall={() => {

                        if (webRTC.state == webRTC.DISCONNECTED) {
                            webRTC.setOffer(self.state.offer);
                            engine._sendMessage('client-call-set-offer', undefined);
                        } else {
                            alert("Received offer in unexpected state (" + webRTC.state + ")");
                        }

                    }} />

            </div>
        );
    }
}

MeetingApp.childContextTypes = {
    muiTheme: React.PropTypes.object,
};

var meeting = ReactDOM.render(<MeetingApp />, document.getElementById('app'));

var engine = {

    connect: function(meeting) {
        var self = this;
        self._meeting = meeting;
        self._socket = io()
        self._socket.on('server-set-state', parse_message(function(state) {

            self._meeting.setState({
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
    },

    _sendMessage: function(message, parameters) {
        this._socket.emit(message, JSON.stringify(parameters));
    },

    setUser: function(user) {
        this._sendMessage('client-set-user', user);
    },

    resetItems: function() {
        this._socket.emit('client-reset-items');
    },

    addItem: function(item) {
        this._sendMessage('client-add-item', item);
    },

    removeItem: function(index) {
        this._sendMessage('client-remove-item', {index: index});
    },

    setSelection: function(index) {
        this._sendMessage('client-set-selection', {index: index});
    },

    startCall: function() {
        webRTC.startCall();
    },

    addIceCandidate: function(candidate) {
        this._sendMessage('client-call-add-ice-candidate', candidate);
    },

    setSession: function(session) {
        console.log(session);
        if (session.type == "offer") {
            this._sendMessage('client-call-set-offer', session);
        } else if (session.type == "answer") {
            this._sendMessage('client-call-set-answer', session)
        } else {
            alert("Unsupported session type!");
        }
    },

    setLocalStream: function(stream) {
        this._meeting.setState({localStream: stream});
    },

    setRemoteStream: function(stream) {
        this._meeting.setState({remoteStream: stream});
    },

    setCallState: function(state) {
        this._meeting.setState({callState: state});
    },

};

webRTC.onIceCandidate = function (candidate) {
    if (candidate.candidate.indexOf("relay") < 0) {
        // return;
    }
    console.log("Sending ICE Candidate: " + candidate.candidate);
    engine.addIceCandidate(candidate);
}

webRTC.onSessionDescription = function(session) { engine.setSession(session); }
webRTC.onAttachLocalStream = function(stream) { engine.setLocalStream(stream); }
webRTC.onAttachRemoteStream = function(stream) { engine.setRemoteStream(stream); }
webRTC.onStateChange = function(state) { engine.setCallState(state); }

engine.connect(meeting);

webRTC.setup();
