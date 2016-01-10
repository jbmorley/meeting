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

import AVVideocamIcon from 'material-ui/lib/svg-icons/av/videocam';
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Snackbar from 'material-ui/lib/snackbar';

import MeetingAppRTC from './meeting-app-rtc.jsx';
import VideoCall from './video-call.jsx';

import webRTC from './webrtc.jsx';

export default class MeetingAppScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            navigationOpen: false
        };
    }

    render() {
        var self = this;
        return (
            <div>
                {(() => {

                    if (self.props.useAppRTC) {

                        return (
                            <MeetingAppRTC />
                        );

                    } else {

                        switch (self.props.callState) {
                            case webRTC.UNSUPPORTED:
                                return '';
                            case webRTC.CONNECTED:
                                return (
                                    <VideoCall 
                                        localStream={self.props.localStream}
                                        remoteStream={self.props.remoteStream} />
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
                                        onTouchTap={() => self.props.onStartCall()}>
                                        <AVVideocamIcon />
                                    </FloatingActionButton>
                                );
                        }

                    }

                })()}

                <Snackbar
                    open={!self.useAppRTC && self.props.offer != undefined && self.props.callState == webRTC.DISCONNECTED}
                    message="Incoming call"
                    action="Accept"
                    onActionTouchTap={() => self.props.onAcceptCall()}
                    onRequestClose={() => {}} />

            </div>
        );
    }
}
