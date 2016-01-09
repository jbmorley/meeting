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

import AppBar from 'material-ui/lib/app-bar'
import AVVideocamIcon from 'material-ui/lib/svg-icons/av/videocam'
import Checkbox from 'material-ui/lib/checkbox'
import CommunicationChatIcon from 'material-ui/lib/svg-icons/communication/chat'
import Dialog from 'material-ui/lib/dialog'
import FloatingActionButton from 'material-ui/lib/floating-action-button'
import IconButton from 'material-ui/lib/icon-button'
import IconMenu from 'material-ui/lib/menus/icon-menu'
import List from 'material-ui/lib/lists/list'
import ListDivider from 'material-ui/lib/lists/list'
import ListItem from 'material-ui/lib/lists/list-item'
import Menu from 'material-ui/lib/menus/menu'
import MenuDivider from 'material-ui/lib/menus/menu-divider'
import MenuItem from 'material-ui/lib/menus/menu-item'
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert'
import Paper from 'material-ui/lib/paper'
import RaisedButton from 'material-ui/lib/raised-button'
import Snackbar from 'material-ui/lib/snackbar'
import TextField from 'material-ui/lib/text-field'
import ThemeManager from 'material-ui/lib/styles/theme-manager'

import CustomTheme from './lib/custom-theme.jsx'
import ItemGrid from './lib/item-grid.jsx'
import ItemView from './lib/item-view.jsx'
import VideoCall from './lib/video-call.jsx'
import Navigation from './lib/navigation.jsx'
import AddItemDialog from './lib/add-item-dialog.jsx'

import webRTC from './lib/webrtc.jsx';
import values from './lib/values';
import parse_message from './lib/parse-message';

const CallState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

var useAppRTC = true;

var MeetingApp = React.createClass({

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext() {
        return {muiTheme: ThemeManager.getMuiTheme(CustomTheme) };
    },

    getInitialState() {
        return {

            items: [],
            users: [],
            callState: webRTC.UNSUPPORTED,

            navigationOpen: false,

            showAddItemDialog: false,
            selection: undefined,

            user: 'Jason Barrie Morley',
            email: 'jason.morley@inseven.co.uk',

            offer: undefined,
            answer: undefined,

        };
    },

    onAddItem() {
        this.setState({showAddItemDialog: true});
    },

    onResetItems() {
        engine.resetItems();
    },

    onAddItemDialogSubmit(title, url) {
        this.setState({showAddItemDialog: false});
        engine.addItem({title: title, url: url});
    },

    onAddItemDialogCancel() {
        this.setState({showAddItemDialog: false});
    },

    onCloseFullscreenDocument() {
        engine.setSelection(undefined);
    },

    onAppBarLeftIconButtonTouchTap() {
        this.setState({navigationOpen: !this.state.navigationOpen});
    },

    render() {
        var self = this;
        return (
            <div>
                <AppBar 
                    title="Meeting" 
                    className="app-bar"
                    style={{
                        position: "fixed",
                        top: "0"
                    }}
                    onLeftIconButtonTouchTap={this.onAppBarLeftIconButtonTouchTap}
                    iconElementRight={
                        <IconMenu iconButtonElement={
                            <IconButton>
                                <MoreVertIcon />
                            </IconButton>
                        }>
                            <MenuItem
                                primaryText="Add item"
                                onTouchTap={this.onAddItem} />
                            <MenuItem
                                primaryText="Reset items"
                                onTouchTap={this.onResetItems} />
                        </IconMenu>
                    } />

                <Navigation
                    ref="navigation"
                    open={this.state.navigationOpen}
                    onRequestChange={open => this.setState({navigationOpen: open})} />

                <AddItemDialog
                    open={this.state.showAddItemDialog}
                    onSubmit={this.onAddItemDialogSubmit} 
                    onCancel={this.onAddItemDialogCancel} />

                {function() {

                    if (useAppRTC && self.state.callState != webRTC.UNSUPPORTED) {

                        return (
                            <Paper
                                zDepth={3}
                                style={{
                                    position: "fixed",
                                    width: "400px",
                                    height: "300px",
                                    bottom: "20px",
                                    right: '20px',
                                    zIndex: 8,
                                }} >
                                <iframe
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        border: 0,
                                    }}
                                    src="https://apprtc.webrtc.org/r/047684326" />
                            </Paper>
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

                }()}

                <ItemView
                    open={this.state.selection != undefined}
                    item={this.state.selection}
                    onRequestClose={this.onCloseFullscreenDocument} />)

                <div className="content">
                    <ItemGrid
                        items={this.state.items}
                        onRemoveItem={this._onRemoveItem}
                        onSelect={this._onSelectItem} />
                </div>

                {function() {
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
                }()}

            </div>
        );
    },

    _startCall() {
        var self = this;
        engine.startCall();
    },

    _callConnected() {
        this.setState({state: CallState.CONNECTED});
    },

    _onRemoveItem(index) {
        engine.removeItem(index);
    },

    _onSelectItem(index) {
        var self = this;
        engine.setSelection(index);
    },

    _handleCallAccept() {
        var self = this;
        if (webRTC.state == webRTC.DISCONNECTED) {
            webRTC.setOffer(self.state.offer);
            engine._sendMessage('client-call-set-offer', undefined);
        } else {
            alert("Received offer in unexpected state (" + webRTC.state + ")");
        }
    },

});

var meeting = ReactDOM.render(
    <MeetingApp />,
    document.getElementById('app')
);

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
