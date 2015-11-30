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

const ThemeManager = require('material-ui/lib/styles/theme-manager');
const CustomTheme = require('./custom-theme.jsx');

const AppBar = require('material-ui/lib/app-bar');
const RaisedButton = require('material-ui/lib/raised-button');
const TextField = require('material-ui/lib/text-field');
const List = require('material-ui/lib/lists/list');
const ListDivider = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const Checkbox = require('material-ui/lib/checkbox');
const FloatingActionButton = require('material-ui/lib/floating-action-button');

const Menu = require('material-ui/lib/menus/menu');
const MenuItem = require('material-ui/lib/menu/menu-item');
const MenuDivider = require('material-ui/lib/menus/menu-divider');
const LeftNav = require('material-ui/lib/left-nav');

const IconButton = require('material-ui/lib/icon-button');

const Paper = require('material-ui/lib/paper');

const ToggleStarIcon = require('material-ui/lib/svg-icons/toggle/star');
const CommunicationChatIcon = require('material-ui/lib/svg-icons/communication/chat');
const AVVideocamIcon = require('material-ui/lib/svg-icons/av/videocam');

const MessageList = require('./message-list.jsx');

var menuItems = [
  { route: 'get-started', text: 'Get Started' },
  { route: 'customization', text: 'Customization' },
  { route: 'components', text: 'Components' },
];

var MeetingApp = React.createClass({

    //the key passed through context must be called "muiTheme"
    childContextTypes: {
        muiTheme: React.PropTypes.object,
    },

    getChildContext: function () {
        return {muiTheme: ThemeManager.getMuiTheme(CustomTheme) };
    },

    getInitialState: function() {
        return {items: [], text: '', messages: []};
    },

    onChange: function(e) {
        this.setState({text: e.target.value});
    },

    handleSubmit: function(e) {
        e.preventDefault();
        engine.sendMessage(this.state.text);
        this.setState({text: ''});
    },

    _touch: function(e) {
        this.refs.leftNav.toggle();
    },

    render: function() {
        return (
            <div>
                <AppBar 
                    title="Meeting" 
                    className="app-bar"
                    iconElementRight={
                        <IconButton tooltip="Start call"
                                    touch={true}
                                    tooltipPosition="bottom-left"
                                    onTouchTap={this._startCall}>
                            <AVVideocamIcon />
                        </IconButton>
                    }
                    onLeftIconButtonTouchTap={this._touch} 
                    onRightIconButtonTouchTap={this._startCall} />

                <div className="content">
                    <MessageList messages={this.state.messages} />
                    <TextField onChange={this.onChange} value={this.state.text} hintText="New URL" />
                    <RaisedButton label="Add URL" onTouchTap={this.handleSubmit} primary={true} disabled={!this.state.text} />
                </div>
                <Paper zDepth={1} className="video-remote">
                    <video src={this.state.remoteStream} autoPlay />
                    <Paper zDepth={1} className="video-local">
                        <video src={this.state.localStream} autoPlay />
                    </Paper>
                </Paper>
                <LeftNav ref="leftNav" docked={false} menuItems={menuItems} />
            </div>
        );
    },

    _startCall: function() {
        engine.startCall();
    },

    _setLocalStream: function(url) {
        this.setState({localStream: url});
    },

    _setRemoteStream: function(url) {
        this.setState({remoteStream: url});
    },

    _onMessageReceived: function(message) {
        this.setState({messages: this.state.messages.concat(message)})
    }

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
        self._socket.on('chat message', function(msg) {
            self._meeting._onMessageReceived(msg);
        }).on('server-call-add-ice-candidate', function(candidate) {
            webRTC.addIceCandidate(JSON.parse(candidate));
        }).on('server-call-set-session', function(session) {
            webRTC.handleSessionDescription(JSON.parse(session)).catch(function(error) {
                alert("Something went wrong: " + error);
            });
        });
    },

    sendMessage: function(message) {
        var self = this;
        self._socket.emit('chat message', message);
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