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
const RaisedButton = require('material-ui/lib/raised-button');
const TextField = require('material-ui/lib/text-field');
const List = require('material-ui/lib/lists/list');
const ListDivider = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const Checkbox = require('material-ui/lib/checkbox');

const MessageList = require('./message-list.jsx');

var MeetingApp = React.createClass({

    getInitialState: function() {
        return {items: [], text: '', messages: []};
    },

    onChange: function(e) {
        this.setState({text: e.target.value});
    },

    handleSubmit: function(e) {
        e.preventDefault();
        var nextItems = this.state.items.concat([<ListItem primaryText={this.state.text} />]);
        socket.emit('chat message', this.state.text);
        var nextText = '';
        this.setState({items: nextItems, text: nextText});
    },

    render: function() {
        return (
            <div>
            <AppBar title="Meeting" />
            <List>
            {this.state.items}
            </List>
            <TextField onChange={this.onChange} value={this.state.text} hintText="New URL" />
            <RaisedButton label="Add URL" onTouchTap={this.handleSubmit} primary={true} disabled={!this.state.text} />
            <MessageList messages={this.state.messages} />
            </div>
        );
    },

    _onMessageReceived: function(message) {
        this.setState({messages: this.state.messages.concat(message)})
    }

});

var meeting = ReactDOM.render(
    <MeetingApp />,
    document.getElementById('app')
);

var socket = io();
socket.emit('chat message', 'Some message sent here!');
socket.on('chat message', function(msg) {
    console.log('Received: ' + msg);
    meeting._onMessageReceived(msg);
});
