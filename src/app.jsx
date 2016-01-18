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

import Avatar from 'material-ui/lib/avatar';
import Divider from 'material-ui/lib/divider';
import ExitToApp from 'material-ui/lib/svg-icons/action/exit-to-app';
import FileUpload from 'material-ui/lib/svg-icons/file/file-upload';
import InsertLink from 'material-ui/lib/svg-icons/editor/insert-link';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import MenuItem from 'material-ui/lib/menus/menu-item';
import ModeEdit from 'material-ui/lib/svg-icons/editor/mode-edit';
import Photo from 'material-ui/lib/svg-icons/image/photo';
import RaisedButton from 'material-ui/lib/raised-button';
import RemoveRedEye from 'material-ui/lib/svg-icons/image/remove-red-eye';
import Star from 'material-ui/lib/svg-icons/toggle/star';
import ThemeManager from 'material-ui/lib/styles/theme-manager';

import MeetingAddItemDialog from './lib/components/meeting-add-item-dialog.jsx';
import MeetingAppScreen from './lib/components/meeting-app-screen.jsx';
import MeetingDocumentViewer from './lib/components/meeting-document-viewer.jsx';
import MeetingDragTarget from './lib/components/meeting-drag-target.jsx';
import MeetingGridView from './lib/components/meeting-grid-view.jsx';
import MeetingTheme from './lib/components/meeting-theme.jsx';
import MeetingWebRTC from './lib/components/meeting-web-rtc.jsx';
import MeetingProgressView from './lib/components/meeting-progress-view.jsx';

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
            showProgress: false,

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
        engine.connect();
    }

    componentWillUnmount() {
        engine.removeStateObserver(this.engineStateObserver);
    }

    uploadFiles(files) {
        this.setState({showProgress: true});
        engine.uploadFiles(files, () => {
            this.setState({showProgress: false});
        });
    }

    render() {
        var self = this;

        const menuItems = [
            <MenuItem
                key="add-url-menu-item"
                primaryText="Add URL"
                leftIcon={<InsertLink />}
                onTouchTap={() => this.setState({showAddItemDialog: true})} />,
            <MenuItem
                key="add-file-menu-item"
                primaryText="Add file"
                leftIcon={<FileUpload />}
                onTouchTap={() => this.refs.input.click()} />,
            <MenuItem
                key="add-photo-menu-item"
                primaryText="Add photo"
                leftIcon={<Photo />}
                onTouchTap={() => this.refs.input.click()} />,
            <Divider
                key="divider-1" />,
            <MenuItem
                key="add-continuous-improvement-menu-item"
                primaryText="Add continuous improvement"
                leftIcon={<Star />}
                onTouchTap={() => engine.addItem({
                    title: "Continuous Improvement",
                    url: "uploads/table.html"
                })} />,
            <MenuItem
                key="add-shared-notes-menu-item"
                primaryText="Add shared notes"
                leftIcon={<ModeEdit />}
                onTouchTap={() => engine.addItem({
                    title: "Shared Notes",
                    url: "http://46.101.84.147/p/meeting-notes"
                })} />,
            <Divider
                key="divider-2" />,
            <MenuItem
                key="leave-meeting-menu-item"
                primaryText="Log out"
                leftIcon={<ExitToApp />}
                onTouchTap={() => {
                    window.location.href = "/logout";
                }} />
        ];

        const defaultNavigationItems = [
            <MenuItem
                key="menu-item-navigation-item"
                primaryText="Live"
                leftIcon={<RemoveRedEye />}
                onTouchTap={() => {
                    this.context.history.push(`/meeting/${this.props.uuid}`);
                    this.setState({showNavigation: false});
                }} />,
            <Divider
                key="divider-3" />,
        ];

        var navigationItems = defaultNavigationItems.concat([
            <List
                key="connected-users-list"
                subheader="Connected users">
                {this.state.users.map(function(item, index) {
                    return (
                        <ListItem
                            key={item.uuid}
                            primaryText={item.name}
                            leftAvatar={<Avatar src={item.avatar} />} />
                    );
                })}
            </List>
        ]);

        return (
            <div>

                <input
                    type="file"
                    accept="image/*"
                    id="file"
                    name="file"
                    ref="input"
                    onChange={(event) => this.uploadFiles(event.target.files)}
                    hidden />

                <MeetingDragTarget 
                    onDropFile={(files) => this.uploadFiles(files)}/>

                <MeetingProgressView 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 1200,
                    }}
                    open={this.state.showProgress}/>

                <MeetingAppScreen
                    title={this.state.title}
                    navigationItems={navigationItems}
                    menuItems={menuItems}
                    showNavigation={this.state.showNavigation}
                    onShowNavigation={(show) => this.setState({showNavigation: show})}>

                    {this.props.children}                    

                </MeetingAppScreen>

                <MeetingAddItemDialog
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
            <MeetingGridView
                items={this.state.items}
                onRemoveItem={(index) => engine.removeItem(index)}
                selection={this.state.selection}
                onSelect={(uuid) => engine.setSelection(uuid)}
                onDeselect={() => engine.clearSelection()}/>
        );
    }

}

ReactDOM.render((
    <Router history={browserHistory}>
        <Route path="/" component={MeetingApp}>
            <IndexRoute component={Live} />
        </Route>
        <Route path="/viewer/:path" component={MeetingDocumentViewer} />
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
