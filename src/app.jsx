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

import AVVideocamIcon from 'material-ui/lib/svg-icons/av/videocam';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Menu from 'material-ui/lib/menus/menu';
import MenuDivider from 'material-ui/lib/menus/menu-divider';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Paper from 'material-ui/lib/paper';
import Snackbar from 'material-ui/lib/snackbar';
import ThemeDecorator from 'material-ui/lib/styles/theme-decorator';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import AddItemDialog from './lib/add-item-dialog.jsx';
import CustomTheme from './lib/custom-theme.jsx';
import ItemGrid from './lib/item-grid.jsx';
import ItemView from './lib/item-view.jsx';
import MeetingAppBar from './lib/meeting-app-bar.jsx';
import MeetingAppRTC from './lib/meeting-app-rtc.jsx';
import Navigation from './lib/navigation.jsx';
import VideoCall from './lib/video-call.jsx';

import webRTC from './lib/webrtc.jsx';
import values from './lib/values';
import parse_message from './lib/parse-message';

const CallState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

var useAppRTC = true;

class MeetingApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

            title: "Cheese",
            items: [],
            users: [],
            selection: undefined,

            navigationOpen: false,
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

    onAddItemDialogSubmit(title, url) {
        this.setState({showAddItemDialog: false});
        engine.addItem({title: title, url: url});
    }

    onCloseFullscreenDocument() {
        engine.setSelection(undefined);
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

        return (
            <div>

                <MeetingAppBar
                    title={this.state.title}
                    onLeftIconButtonTouchTap={() => this.setState({navigationOpen: true})}
                    menuItems={menuItems} />

                <Navigation
                    ref="navigation"
                    open={this.state.navigationOpen}
                    onRequestChange={(open) => self.setState({navigationOpen: open})} />

                <AddItemDialog
                    open={this.state.showAddItemDialog}
                    onSubmit={(title, url) => this.onAddItemDialogSubmit(title, url)} 
                    onCancel={() => this.setState({showAddItemDialog: false})} />

                <ItemView
                    open={this.state.selection != undefined}
                    item={this.state.selection}
                    onRequestClose={this.onCloseFullscreenDocument} />)

                <div className="content">
                    <ItemGrid
                        items={this.state.items}
                        onRemoveItem={this._onRemoveItem}
                        onSelect={(index) => engine.setSelection(index)} />
                </div>

                {(() => {

                    if (useAppRTC) {

                        return (
                            <MeetingAppRTC />
                        );

                    } else {

                        switch (self.state.callState) {
                            case webRTC.UNSUPPORTED:
                                return '';
                            case webRTC.CONNECTED:
                                return (
                                    <VideoCall 
                                        localStream={self.state.localStream}
                                        remoteStream={self.state.remoteStream} />
                                );
                            case webRTC.DISCONNECTED:
                                return (
                                    <FloatingActionButton
                                        style={{
                                            position: "fixed",
                                            bottom: "36px",
                                            right: "36px",
                                            zIndex: 8,
                                        }}
                                        onTouchTap={self._startCall}>
                                        <AVVideocamIcon />
                                    </FloatingActionButton>
                                );
                        }

                    }

                })()}

                {(() => {
                    if (self.state.offer != undefined &&
                        self.state.callState == webRTC.DISCONNECTED) {
                        return (
                            <Snackbar
                                openOnMount={true}
                                message="Incoming call"
                                action="Accept"
                                onActionTouchTap={self._handleCallAccept} />
                        );
                    }
                })()}

            </div>
        );
    }

    _startCall() {
        engine.startCall();
    }

    _callConnected() {
        this.setState({state: CallState.CONNECTED});
    }

    _onRemoveItem(index) {
        engine.removeItem(index);
    }

    _handleCallAccept() {
        var self = this;
        if (webRTC.state == webRTC.DISCONNECTED) {
            webRTC.setOffer(self.state.offer);
            engine._sendMessage('client-call-set-offer', undefined);
        } else {
            alert("Received offer in unexpected state (" + webRTC.state + ")");
        }
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
