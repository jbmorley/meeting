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
const TextField = require('material-ui/lib/text-field');
const ThemeManager = require('material-ui/lib/styles/theme-manager');

const CustomTheme = require('./lib/custom-theme.jsx');
const ItemGrid = require('./lib/item-grid.jsx');
const ItemView = require('./lib/item-view.jsx');
const VideoCall = require('./lib/video-call.jsx');

const webRTC = require('./lib/webrtc.jsx');

const CallState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

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
            state: CallState.DISCONNECTED,

            showUserDetailsDialog: false,
            showAddItemDialog: false,
            selection: undefined,

            user: 'Jason Barrie Morley',
            email: 'jason.morley@inseven.co.uk',

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
        engine.clearSelection();
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

                    if (webRTC.isSupported()) {
                        if (self.state.state == CallState.CONNECTED) {
                            return (
                                <VideoCall 
                                    localStream={self.state.localStream}
                                    remoteStream={self.state.remoteStream} />
                            );
                        } else {
                            return (
                                <FloatingActionButton
                                    style={{
                                        position: "fixed",
                                        bottom: "36px",
                                        right: "36px",
                                        zIndex: 8}}
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
                        onRemoveItem={this._removeItem}
                        onSelect={this._onSelectItem} />
                </div>

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

    _removeItem: function(uuid) {
        var self = this;
        engine.removeItem(uuid);
    },

    _onSelectItem: function(uuid) {
        var self = this;
        engine.selectItem(uuid);
    },

});

var meeting = ReactDOM.render(
    <MeetingApp />,
    document.getElementById('app')
);

function parse_message(callback) {
  return function(message) {
    callback(JSON.parse(message));
  }
}

var engine = {

    connect: function(meeting) {
        var self = this;
        self._meeting = meeting;
        self._socket = io()
        self._socket.on('server-set-items', parse_message(function(items) {

            self._meeting.setState({items: items});

        })).on('server-set-users', parse_message(function(users) {

            self._meeting.setState({users: users});

        })).on('server-clear-selection', function() {

            self._meeting.setState({selection: undefined});

        }).on('server-set-selection', parse_message(function(selection) {

            for (i in self._meeting.state.items) {
                item = self._meeting.state.items[i];
                if (item.uuid == selection.uuid) {
                    console.log("Setting selection to " + selection.uuid);
                    self._meeting.setState({selection: item});
                }
            }

        })).on('server-call-add-ice-candidate', parse_message(function(candidate) {

            webRTC.addIceCandidate(candidate);

        })).on('server-call-set-session', parse_message(function(session) {

            webRTC.handleSessionDescription(session).then(function(details) {
                self._meeting._callConnected();
            }).catch(function(error) {
                alert("Something went wrong: " + error);
            });

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

    removeItem: function(uuid) {
        var self = this;
        self._sendMessage('client-remove-item', {uuid: uuid});
    },

    clearSelection: function() {
        var self = this;
        self._socket.emit('client-clear-selection');
    },

    selectItem: function(uuid) {
        var self = this;
        self._sendMessage('client-set-selection', {uuid: uuid});
    },

    startCall: function() {
        var self = this;
        webRTC.startCall();
    },

    addIceCandidate: function(candidate) {
        var self = this;
        self._socket.emit('client-call-add-ice-candidate', candidate);
    },

    setSession: function(session) {
        var self = this;
        self._socket.emit('client-call-set-session', session);
    },

    setLocalStream: function(stream) {
        var self = this;
        self._meeting.setState({localStream: stream});
    },

    setRemoteStream: function(stream) {
        var self = this;
        self._meeting.setState({remoteStream: stream});
    }

};

webRTC.onIceCandidate = function (candidate) { engine.addIceCandidate(candidate); }
webRTC.onSessionDescription = function(session) { engine.setSession(session); }
webRTC.onAttachLocalStream = function(stream) { engine.setLocalStream(stream); }
webRTC.onAttachRemoteStream = function(stream) { engine.setRemoteStream(stream); }

engine.connect(meeting)
