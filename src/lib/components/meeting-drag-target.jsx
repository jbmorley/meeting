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

export default class MeetingDragTarget extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hover: false
        }
    }

    dragOverListener = (event) => {
        this.onDragOver(event);
    }

    dragLeaveListener = (event) => {
        this.onDragLeave(event);
    }

    dropListener = (event) => {
        this.onDrop(event);
    }

    componentDidMount() {
        window.addEventListener("dragover", this.dragOverListener);
        window.addEventListener("dragover", this.dragLeaveListener);
        window.addEventListener("drop", this.dropListener);
    }

    componentWillUnmount() {
        window.removeEventListener("dragover", this.dragOverListener);
        window.removeEventListener("dragover", this.dragLeaveListener);
        window.removeEventListener("drop", this.dropListener);
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
                    height: '50px',
                    borderRadius: '20px',
                    position: 'relative',
                }}>

                <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={310}
                >
                    {(() => {
                        if (this.state.hover) {
                            return (
                                <div
                                    key='meeting-drag-target-root'
                                    style={{
                                        backgroundColor: 'black',
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        top: '0',
                                        left: '0',
                                        opacity: '0.2',
                                        borderRadius: '2px',
                                    }}/>
                            );
                        }
                    })()}
                </ReactCSSTransitionGroup>

            </div>
        );
    }
}
