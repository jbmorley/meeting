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

const React = require('react');
const ReactDOM = require('react-dom');
const LinkedStateMixin = require('react-addons-linked-state-mixin');

var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

const AppBar = require('material-ui/lib/app-bar');
const AVVideocamIcon = require('material-ui/lib/svg-icons/av/videocam');
const Checkbox = require('material-ui/lib/checkbox');
const CommunicationChatIcon = require('material-ui/lib/svg-icons/communication/chat');
const Dialog = require('material-ui/lib/dialog');
const FloatingActionButton = require('material-ui/lib/floating-action-button');
const IconButton = require('material-ui/lib/icon-button');
const IconMenu = require('material-ui/lib/menus/icon-menu');
const LeftNav = require('material-ui/lib/left-nav');
const List = require('material-ui/lib/lists/list');
const ListDivider = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const Menu = require('material-ui/lib/menus/menu');
const MenuDivider = require('material-ui/lib/menus/menu-divider');
const MenuItem = require('material-ui/lib/menus/menu-item');
const MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');
const Paper = require('material-ui/lib/paper');
const RaisedButton = require('material-ui/lib/raised-button');
const Snackbar = require('material-ui/lib/snackbar');
const TextField = require('material-ui/lib/text-field');
const ThemeManager = require('material-ui/lib/styles/theme-manager');

const CustomTheme = require('./lib/custom-theme.jsx');
const ItemGrid = require('./lib/item-grid.jsx');
const ItemView = require('./lib/item-view.jsx');
const VideoCall = require('./lib/video-call.jsx');

const webRTC = require('./lib/webrtc.jsx');
const values = require('./lib/values');
const parse_message = require('./lib/parse-message');

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
            callState: webRTC.DISCONNECTED,

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

    onChangeURL: function(e) {
        var self = this;
        self.setState({newItemURL: e.target.value});
    },

    _addItem: function(e) {
        var self = this;
        self.setState({showAddItemDialog: true});
    },

    _resetItems: function(e) {
        var self = this;
        engine.resetItems();
    },

    _onUserDetailsDialogSubmit: function() {
        var self = this;
        engine.setUser({name: self.state.name, email: self.state.email});
        self.setState({showUserDetailsDialog: false});
    },

    _onAddItemDialogSubmit: function() {
        var self = this;
        self.setState({showAddItemDialog: false});
        engine.addItem({title: self.state.newItemTitle, url: self.state.newItemURL});
        self.setState({newItemTitle: '', newItemURL: ''});
    },

    _onAddItemDialogClose: function() {
        var self = this;
        self.setState({showAddItemDialog: false});
        self.setState({text: ''});
    },

    _onCloseFullscreenDocument: function() {
        var self = this;
        engine.setSelection(undefined);
    },

    render: function() {
        var self = this;
        return (
            <div>
                <AppBar 
                    title="Meeting" 
                    className="app-bar"
                    iconElementLeft={<IconButton />}
                    style={{
                        position: "fixed",
                        top: "0"
                    }}
                    iconElementRight={
                        <IconMenu iconButtonElement={
                            <IconButton>
                                <MoreVertIcon />
                            </IconButton>
                        }>
                            <MenuItem
                                primaryText="Add item"
                                onTouchTap={this._addItem} />
                            <MenuItem
                                primaryText="Reset items"
                                onTouchTap={this._resetItems} />
                        </IconMenu>
                    } />

                <Dialog
                    title="Set user details"
                    actions={[
                        { text: "OK", onTouchTap: this._onUserDetailsDialogSubmit, ref: "OK" }
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
                        { text: "OK", onTouchTap: this._onAddItemDialogSubmit, ref: "OK" }
                    ]}
                    actionFocus="submit"
                    open={this.state.showAddItemDialog}
                    onRequestClose={this._onAddItemDialogClose}>
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
                    onRequestClose={this._onCloseFullscreenDocument} />)

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
