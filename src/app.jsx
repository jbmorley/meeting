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
import LinkedStateMixin from 'react-addons-linked-state-mixin';

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
import Navigation from './lib/navigation.js'

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

    mixins: [LinkedStateMixin],

    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext: function () {
        return {muiTheme: ThemeManager.getMuiTheme(CustomTheme) };
    },

    getInitialState: function() {
        return {

            items: [],
            newItemTitle: '',
            newItemURL: '',
            items: [],
            users: [],
            callState: webRTC.UNSUPPORTED,

            navigationOpen: false,

            showUserDetailsDialog: false,
            showAddItemDialog: false,
            selection: undefined,

            user: 'Jason Barrie Morley',
            email: 'jason.morley@inseven.co.uk',

            offer: undefined,
            answer: undefined,

        };
    },

    onChangeTitle: function(e) {
        var self = this;
        self.setState({newItemTitle: e.target.value});
    },

    onChangeURL(e) {
        this.setState({newItemURL: e.target.value});
    },

    onAddItem() {
        this.setState({showAddItemDialog: true});
    },

    onResetItems() {
        engine.resetItems();
    },

    onUserDetailsDialogSubmit() {
        engine.setUser({name: this.state.name, email: this.state.email});
        this.setState({showUserDetailsDialog: false});
    },

    onAddItemDialogSubmit() {
        var self = this;
        self.setState({showAddItemDialog: false});
        engine.addItem({title: self.state.newItemTitle, url: self.state.newItemURL});
        self.setState({newItemTitle: '', newItemURL: ''});
    },

    onAddItemDialogClose() {
        this.setState({showAddItemDialog: false});
        this.setState({text: ''});
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

                <Navigation ref="navigation" open={this.state.navigationOpen} />

                <Dialog
                    title="Set user details"
                    actions={[
                        { text: "OK", onTouchTap: this.onUserDetailsDialogSubmit, ref: "OK" }
                    ]}
                    actionFocus="submit"
                    open={this.state.showUserDetailsDialog}>
                    <TextField
                        style={{width: "100%"}}
                        valueLink={this.linkState('name')}
                        hintText="Name" /><br />
                    <TextField
                        style={{width: "100%"}}
                        valueLink={this.linkState('email')}
                        hintText="E-mail Address" />
                </Dialog>

                <Dialog
                    title="Add item"
                    actions={[
                        { text: "Cancel" },
                        { text: "OK", onTouchTap: this.onAddItemDialogSubmit, ref: "OK" }
                    ]}
                    actionFocus="submit"
                    open={this.state.showAddItemDialog}
                    onRequestClose={this.onAddItemDialogClose}>
                    <TextField
                        onChange={this.onChangeTitle}
                        value={this.state.newItemTitle}
                        hintText="Title" /><br />
                    <TextField
                        onChange={this.onChangeURL}
                        value={this.state.newItemURL}
                        hintText="URL" />
                </Dialog>

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

    _startCall: function() {
        var self = this;
        engine.startCall();
    },

    _callConnected: function() {
        var self = this;
        self.setState({state: CallState.CONNECTED});
    },

    _onRemoveItem: function(index) {
        var self = this;
        engine.removeItem(index);
    },

    _onSelectItem: function(index) {
        var self = this;
        engine.setSelection(index);
    },

    _handleCallAccept: function() {
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
        var self = this;
        self._socket.emit(message, JSON.stringify(parameters));
    },

    setUser: function(user) {
        var self = this;
        self._sendMessage('client-set-user', user);
    },

    resetItems: function() {
        var self = this;
        self._socket.emit('client-reset-items');
    },

    addItem: function(item) {
        var self = this;
        self._sendMessage('client-add-item', item);
    },

    removeItem: function(index) {
        var self = this;
        self._sendMessage('client-remove-item', {index: index});
    },

    setSelection: function(index) {
        var self = this;
        self._sendMessage('client-set-selection', {index: index});
    },

    startCall: function() {
        var self = this;
        webRTC.startCall();
    },

    addIceCandidate: function(candidate) {
        var self = this;
        self._sendMessage('client-call-add-ice-candidate', candidate);
    },

    setSession: function(session) {
        var self = this;
        console.log(session);
        if (session.type == "offer") {
            self._sendMessage('client-call-set-offer', session);
        } else if (session.type == "answer") {
            self._sendMessage('client-call-set-answer', session)
        } else {
            alert("Unsupported session type!");
        }
    },

    setLocalStream: function(stream) {
        var self = this;
        self._meeting.setState({localStream: stream});
    },

    setRemoteStream: function(stream) {
        var self = this;
        self._meeting.setState({remoteStream: stream});
    },

    setCallState: function(state) {
        var self = this;
        self._meeting.setState({callState: state});
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
