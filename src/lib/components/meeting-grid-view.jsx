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

const React = require('react');
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import MeetingContentResizer from './meeting-content-resizer.jsx';
import MeetingGridViewItem from './meeting-grid-view-item.jsx';
import MeetingScrollLock from './meeting-scroll-lock.jsx';

export default class MeetingGridView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            width: 0,
            height: 0,
        }
    }

    render() {

        var self = this;
        return (
            <MeetingContentResizer
                style={{
                    position: 'relative',
                }}
                onWindowResize={(dimensions) => {
                    this.setState({
                        width: dimensions.content.width,
                        height: dimensions.window.height - dimensions.content.top
                    });
                }}>

                <MeetingScrollLock
                    active={this.props.selection != undefined}/>

                <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}
                >
                    {(() => {
                        if (this.props.selection) {
                            return (
                                <div
                                    key="meeting-grid-view-overlay"
                                    style={{
                                        position: 'fixed',
                                        width: '100%',
                                        height: '100%',
                                        top: 0,
                                        left: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        zIndex: 10,
                                    }}
                                    onTouchTap={() => this.props.onDeselect()}/>
                            )
                        }
                    })()}
                </ReactCSSTransitionGroup>

                {(() => {
                    var ratio = 4 / 3;
                    var width = 0;
                    var height = 0;
                    var minWidth = 300;
                    var maxColumns = self.state.width / minWidth;

                    var columns = 1;
                    while (self.props.items.length) {
                        var rows = Math.ceil(self.props.items.length / columns);
                        width = (self.state.width / columns);
                        height = width / ratio;
                        if ((height * rows) < self.state.height ||
                            columns >= maxColumns) {
                            break;
                        }
                        columns = columns + 1;
                    }

                    return this.props.items.map((item, index) => {

                        var row = Math.floor(index / columns);
                        var column = index % columns;
                        var left = column * width;
                        var top = row * height;

                        var frame = {
                            left: left,
                            top: top,
                            width: width,
                            height: height
                        }

                        // const SELECTED_WIDTH = 600;
                        // const SELECTED_HEIGHT = 400;
                        const SELECTED_WIDTH = 2000;
                        const SELECTED_HEIGHT = 2000;

                        if (this.props.selection == item.uuid) {
                            frame.width = Math.min(SELECTED_WIDTH, this.state.width);
                            frame.height = Math.min(SELECTED_HEIGHT, this.state.height);
                            frame.left = Math.floor((this.state.width - frame.width) / 2);
                            frame.top = Math.floor((this.state.height - frame.height) / 2);
                        }

                        return (
                            <MeetingGridViewItem
                                key={item.uuid}
                                title={item.title}
                                url={item.url}
                                frame={frame}
                                selected={this.props.selection == item.uuid}
                                onSelect={() => this.props.onSelect(item.uuid)}
                                onRemove={() => {
                                    if (this.props.selection) {
                                        this.props.onDeselect();
                                    } else {
                                        this.props.onRemoveItem(index);
                                    }
                                }}
                                onDeselect={() => this.props.onDeselect()} />
                        );
                    });
                })()}
            </MeetingContentResizer>
        );
    }

}
