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
import Paper from 'material-ui/lib/paper';

export default class MeetingAppRTC extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                {(() => {
                    if (navigator.getUserMedia != undefined) {
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
                            )
                    } else {
                        return ''
                    }
                })()}
            </div>
        )
    }
}
