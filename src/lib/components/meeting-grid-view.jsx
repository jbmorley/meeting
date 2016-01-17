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
import update from 'react-addons-update';

import MeetingGridViewItem from './meeting-grid-view-item.jsx';
import MeetingScrollLock from './meeting-scroll-lock.jsx';

export default class MeetingGridView extends React.Component {

    ITEM_MARGIN = 8;

    constructor(props) {
        super(props);
        this.state = {
            width: 0,
            height: 0,
        };
    }

    updateDimensions = () => {
        var documentElement = document.documentElement,
            body = document.getElementsByTagName('body')[0],
            width = window.innerWidth || documentElement.clientWidth || body.clientWidth,
            height = window.innerHeight || documentElement.clientHeight|| body.clientHeight,
            scrollLeft = window.pageXOffset || body.scrollLeft,
            scrollTop = window.pageYOffset || body.scrollTop;

        var visibleRect = {
            left: scrollLeft,
            top: scrollTop,
            width: 0,
            height: 0,
        }

        if (this.refs.root) {

            var visibleRect = {
                left: scrollLeft,
                top: scrollTop,
                width: width,
                height: height - this.refs.root.getBoundingClientRect().top - scrollTop,
            };

            console.log(visibleRect);

            this.setState(visibleRect);

        }
    }

    componentWillMount() {
        this.updateDimensions();
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
        window.addEventListener("scroll", this.updateDimensions);
        this.updateDimensions();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
        window.removeEventListener("scroll", this.updateDimensions);
    }

    insetRect(frame, margin) {
        return update(frame, {
            left: {$set: frame.left + margin},
            top: {$set: frame.top + margin},
            width: {$set: frame.width - (2 * margin)},
            height: {$set: frame.height - (2 * margin)},
        });
    }

    render() {

        // Determine the correct dimensions.
        var ratio = 4 / 3;
        var width = 0;
        var height = 0;
        var minWidth = 400;
        var maxColumns = this.state.width / minWidth;

        var columns = 1;
        while (this.props.items.length) {
            var rows = Math.ceil(this.props.items.length / columns);
            width = (this.state.width / columns);
            height = width / ratio;
            if ((height * rows) < this.state.height ||
                columns >= maxColumns) {
                break;
            }
            columns = columns + 1;
        }

        var viewHeight = rows * height;

        return (
            <div
                ref='root'
                style={{
                    position: 'relative',
                    height: viewHeight + 'px',
                }}>

                <MeetingScrollLock
                    active={this.props.selection}/>

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

                        frame = this.insetRect(frame, this.ITEM_MARGIN);

                        const SELECTED_WIDTH = 700;
                        const SELECTED_HEIGHT = 525;

                        if (this.props.selection == item.uuid) {

                            if (SELECTED_WIDTH >= this.state.width ||
                                SELECTED_HEIGHT >= this.state.height) {
                                frame.width = this.state.width;
                                frame.height = this.state.height;
                            } else {
                                frame.width = SELECTED_WIDTH;
                                frame.height = SELECTED_HEIGHT;
                            }

                            frame.left = Math.floor((this.state.width - frame.width) / 2) + this.state.left;
                            frame.top = Math.floor((this.state.height - frame.height) / 2) + this.state.top;
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
            </div>
        );
    }

}
