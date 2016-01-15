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
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import CircularProgress from 'material-ui/lib/circular-progress';

export default class MeetingProgressView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (

            <ReactCSSTransitionGroup
                transitionName="fade"
                transitionEnterTimeout={300}
                transitionLeaveTimeout={310}
            >
                {(() => {
                    if (this.props.open) {
                        return (
                            <div
                                key='progress-overlay'
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    width: '100%',
                                    height: '100%',
                                    position: 'relative',
                                    textAlign: 'center',
                                }}>
                                <CircularProgress
                                    mode="indeterminate"
                                    style={{
                                        margin: 0,
                                        padding: 0,
                                        // position: 'absolute',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                    }} />
                            </div>
                        );
                    }
                })()}
            </ReactCSSTransitionGroup>
        );
    }

}
