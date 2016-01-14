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

export default class MeetingDragTarget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hover: false
        }
    }

    onDragOver(event) {

        event.stopPropagation();
        event.preventDefault();

        this.setState({
            hover: true
        });

    }

    onDragLeave(event) {

        event.stopPropagation();
        event.preventDefault();

        this.setState({
            hover: false
        });

    }

    onDrop(event) {

        event.stopPropagation();
        event.preventDefault();

        this.setState({
            hover: false
        });

        if (this.props.onDropFile) {
            this.props.onDropFile(event.target.files || event.dataTransfer.files);
        }
    }

    render() {

        return (
            <div
                style={{
                    minWidth: '100px',
                    minHeight: '400px',
                    borderRadius: '20px',
                    position: 'relative',
                }}
                onDragOver={(event) => this.onDragOver(event)}
                onDrop={(event) => this.onDrop(event)}>

                {this.props.children}

                {(() => {
                    if (this.state.hover) {
                        return (
                            <div
                                style={{
                                    backgroundColor: 'black',
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: '0',
                                    left: '0',
                                    opacity: '0.2',
                                    borderRadius: '2px',
                                }}
                                onDragLeave={(event) => this.onDragLeave(event)} />
                        );
                    }
                })()}

            </div>
        );
    }
}
