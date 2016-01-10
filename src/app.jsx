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
import { Router, Route, IndexRoute, Link, browserHistory } from 'react-router'

var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

import Divider from 'material-ui/lib/divider';
import MenuItem from 'material-ui/lib/menus/menu-item';
import RaisedButton from 'material-ui/lib/raised-button';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import AddItemDialog from './lib/components/add-item-dialog.jsx';
import MeetingTheme from './lib/components/meeting-theme.jsx';
import ItemGrid from './lib/components/item-grid.jsx';
import ItemView from './lib/components/item-view.jsx';
import MeetingWebRTC from './lib/components/meeting-web-rtc.jsx';
import MeetingAppScreen from './lib/components/meeting-app-screen.jsx';

import Engine from './lib/engine.jsx';
import webRTC from './lib/webrtc.jsx';

const CallState = {
    DISCONNECTED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
};

var engine = new Engine();

class MeetingApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

            title: "",
            items: [],
            users: [],
            selection: undefined,

            showNavigation: false,
            showAddItemDialog: false,

            callState: webRTC.UNSUPPORTED,
            offer: undefined,
            answer: undefined,

        };

    }

    getChildContext() {
        return {
            muiTheme: ThemeManager.getMuiTheme(MeetingTheme),
        };
    }

    engineStateObserver = (state) => {
        this.setState(state);
    }

    componentDidMount() {
        engine.addStateObserver(this.engineStateObserver);
    }

    componentWillUnmount() {
        engine.removeStateObserver(this.engineStateObserver);
    }

    render() {
        var self = this;

        const menuItems = [
            <MenuItem
                key="add-menu-item"
                primaryText="Add item"
                onTouchTap={() => this.setState({showAddItemDialog: true})} />,
            <MenuItem
                key="reset-menu-item"
                primaryText="Reset items"
                onTouchTap={() => engine.resetItems()} />
        ];

        const navigationItems = [
            <MenuItem
                key="menu-item-navigation-item"
                primaryText="Live"
                onTouchTap={() => {
                    this.context.history.push('/');
                    this.setState({showNavigation: false});
                }} />,
            <MenuItem
                key="menu-item-disabled-navigation-item"
                primaryText="Camera"
                onTouchTap={() => {
                    this.context.history.push('/camera');
                    this.setState({showNavigation: false});
                }} />,
            <Divider
                key="divider-navigation-item" />
        ];

        return (
            <div>

                <MeetingAppScreen
                    title={this.state.title}
                    navigationItems={navigationItems}
                    menuItems={menuItems}
                    showNavigation={this.state.showNavigation}
                    onShowNavigation={(show) => this.setState({showNavigation: show})}>

                    {this.props.children}

                    <ItemView
                        open={this.state.selection != undefined}
                        item={this.state.selection}
                        onRequestClose={() => engine.setSelection(undefined)} />

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

MeetingApp.contextTypes = {
    history: React.PropTypes.object.isRequired,
};

MeetingApp.childContextTypes = {
    muiTheme: React.PropTypes.object,
};

class Live extends React.Component {

    constructor(props) {
        super(props);
        this.state = {items: []};
    }

    engineStateObserver = (state) => {
        this.setState(state);
    }

    componentDidMount() {
        engine.addStateObserver(this.engineStateObserver);
    }

    componentWillUnmount() {
        engine.removeStateObserver(this.engineStateObserver);
    }

    render() {
        return (
            <ItemGrid
                items={this.state.items}
                onRemoveItem={(index) => engine.removeItem(index)}
                onSelect={(index) => engine.setSelection(index)} />
        );
    }

}

class Camera extends React.Component {

    constructor(props) {
        super(props);
    }

    onUploadFile() {
        var xhr = new XMLHttpRequest();
        var formData = new FormData();
        formData.append("file", this.file);
        function reqListener () {
            console.log(this.responseText);
        }
        xhr.addEventListener("load", reqListener);
        xhr.open("POST", "/upload");
        xhr.send(formData);
    }

    render() {
        return (
            <div>

                <input
                    type="file"
                    accept="image/*"
                    id="file"
                    name="file"
                    onChange={(event) => {
                        this.setState({file: event.target.value});
                        console.log(event.target.files[0]);
                        this.file = event.target.files[0];
                    }} />

                <RaisedButton
                    label="Upload"
                    primary={true}
                    onTouchTap={() => this.onUploadFile()} />

            </div>
        );
    }

}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={MeetingApp}>
            <IndexRoute component={Live} />
            <Route path="camera" component={Camera} />
        </Route>
    </Router>
), document.getElementById('app'));

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
webRTC.setup();

engine.connect();

