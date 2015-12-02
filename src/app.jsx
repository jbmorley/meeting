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

const CustomTheme = require('./custom-theme.jsx');
const ItemGrid = require('./item-grid.jsx');
const VideoCall = require('./video-call.jsx');

var menuItems = [
  { route: 'get-started', text: 'Get Started' },
  { route: 'customization', text: 'Customization' },
  { route: 'components', text: 'Components' },
];

const CallState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

var MeetingApp = React.createClass({

    //the key passed through context must be called "muiTheme"
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
            messages: [],
            state: CallState.DISCONNECTED,
            showAddItemDialog: false
        };
    },

    onChangeTitle: function(e) {
        this.setState({newItemTitle: e.target.value});
    },

    onChangeURL: function(e) {
        this.setState({newItemURL: e.target.value});
    },

    _touch: function(e) {
        this.refs.leftNav.toggle();
    },

    _addItem: function(e) {
        this.setState({showAddItemDialog: true});
    },

    _resetItems: function(e) {
        engine.resetItems();
    },

    _onAddItemDialogSubmit: function() {
        this.setState({showAddItemDialog: false});
        engine.addItem({title: this.state.newItemTitle, url: this.state.newItemURL});
        this.setState({newItemTitle: '', newItemURL: ''});
    },

    _onAddItemDialogClose: function() {
        this.setState({showAddItemDialog: false});
        this.setState({text: ''});
    },

    render: function() {
        return (
            <div>
                <AppBar 
                    title="Meeting" 
                    className="app-bar"
                    onLeftIconButtonTouchTap={this._touch}
                    style={{position: "fixed", top: "0"}}
                    iconElementRight={
                        <IconMenu iconButtonElement={
                          <IconButton><MoreVertIcon /></IconButton>
                        }>
                          <MenuItem primaryText="Add item" onTouchTap={this._addItem} />
                          <MenuItem primaryText="Reset items" onTouchTap={this._resetItems} />
                        </IconMenu>} />

                <Dialog
                    title="Add item"
                    actions={[
                        { text: "Cancel" },
                        { text: "OK", onTouchTap: this._onAddItemDialogSubmit, ref: "OK" }
                    ]}
                    actionFocus="submit"
                    open={this.state.showAddItemDialog}
                    onRequestClose={this._onAddItemDialogClose}
                    modal={false}>
                    <TextField onChange={this.onChangeTitle} value={this.state.newItemTitle} hintText="Title" />
                    <TextField onChange={this.onChangeURL} value={this.state.newItemURL} hintText="URL" />
                </Dialog>

                {this.state.state == CallState.CONNECTED
                    ? (<VideoCall 
                           localStream={this.state.localStream}
                           remoteStream={this.state.remoteStream} />)
                    : (<FloatingActionButton style={{position: "fixed",
                                                     bottom: "36px",
                                                     right: "36px",
                                                     zIndex: 8}}
                           onTouchTap={this._startCall}>
                       <AVVideocamIcon />
                </FloatingActionButton>)}

                <div className="content">
                    <ItemGrid items={this.state.messages} onRemoveItem={this._removeItem} />
                    <LeftNav ref="leftNav" docked={false} menuItems={menuItems} />
                </div>
            </div>
        );
    },

    _startCall: function() {
        engine.startCall();
    },

    _callConnected: function() {
        this.setState({state: CallState.CONNECTED});
    },

    _setLocalStream: function(url) {
        this.setState({localStream: url});
    },

    _setRemoteStream: function(url) {
        this.setState({remoteStream: url});
    },

    _setItems: function(items) {
        this.setState({messages: items})
    },

    _removeItem: function(uuid) {
        engine.removeItem(uuid);
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
        self._socket.on('server-set-items', function(msg) {
            self._meeting._setItems(JSON.parse(msg));
        }).on('server-call-add-ice-candidate', function(candidate) {
            webRTC.addIceCandidate(JSON.parse(candidate));
        }).on('server-call-set-session', function(session) {
            webRTC.handleSessionDescription(JSON.parse(session)).then(function(details) {
                self._meeting._callConnected();
            }).catch(function(error) {
                alert("Something went wrong: " + error);
            });
        });
    },

    resetItems: function() {
        var self = this;
        self._socket.emit('client-reset-items');
    },

    addItem: function(item) {
        var self = this;
        self._socket.emit('client-add-item', JSON.stringify(item));
    },

    removeItem: function(uuid) {
        var self = this;
        self._socket.emit('client-remove-item', JSON.stringify({uuid: uuid}));
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
        self._meeting._setLocalStream(stream);
    },

    setRemoteStream: function(stream) {
        var self = this;
        self._meeting._setRemoteStream(stream);
    }

};

webRTC.onIceCandidate = function (candidate) { engine.addIceCandidate(candidate); }
webRTC.onSessionDescription = function(session) { engine.setSession(session); }
webRTC.onAttachLocalStream = function(stream) { engine.setLocalStream(stream); }
webRTC.onAttachRemoteStream = function(stream) { engine.setRemoteStream(stream); }

engine.connect(meeting)
