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

import Card from 'material-ui/lib/card/card';
import CardText from 'material-ui/lib/card/card-text';
import CloseIcon from 'material-ui/lib/svg-icons/navigation/close';
import IconButton from 'material-ui/lib/icon-button';

import MeetingProgressView from './meeting-progress-view.jsx';

export default class MeetingGridViewItem extends React.Component {

    TITLE_HEIGHT = 48;

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    render() {

        var style = {
            position: 'absolute',
            top: this.props.frame.top + 'px',
            left: this.props.frame.left + 'px',
            width: this.props.frame.width + 'px',
            height: this.props.frame.height + 'px',
            boxSizing: 'border-box',
            display: 'inline-block',
            boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.06), 0px 1px 4px rgba(0, 0, 0, 0.06)",
        };

        if (this.props.selected) {
            style.zIndex = 20;
            style.boxShadow = "0px 1px 10px rgba(0, 0, 0, 0.3), 0px 1px 10px rgba(0, 0, 0, 0.3)";
        }

        var frameHeight = this.props.frame.height - this.TITLE_HEIGHT;

        return (

            <Card
                style={style}>

                <CardText
                    style={{
                        padding: 0,
                        position: 'relative',
                        height: this.TITLE_HEIGHT + 'px',
                        lineHeight: this.TITLE_HEIGHT + 'px',
                    }} >
                    <div
                        style={{
                            boxSizing: 'border-box',
                            fontSize: '18px',
                            verticalAlign: 'middle',
                            padding: '0 0 0 12px',
                            textOverflow: 'ellipsis',
                            overflow: 'auto',
                            whiteSpace: 'nowrap',
                            marginRight: this.TITLE_HEIGHT + 'px',
                            width: (this.props.frame.width - this.TITLE_HEIGHT) + 'px'
                        }} >
                        {this.props.title}
                    </div>
                    <IconButton
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                        }}
                        onTouchTap={() => this.props.onRemove()} >
                        <CloseIcon />
                    </IconButton>
                </CardText>

                <CardText style={{padding: '0'}}>
                    <div
                        style={{
                            position: "relative",
                            width: this.props.frame.width + 'px',
                            height: frameHeight + 'px',
                        }} >

                        <iframe
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                border: 0,
                                width: this.props.frame.width + 'px',
                                height: frameHeight + 'px',
                            }}
                            scrolling="no"
                            src={this.props.url}
                            onLoad={() => this.setState({loading: false})} />

                        <MeetingProgressView
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: this.props.frame.width + 'px',
                                height: frameHeight + 'px'
                            }}
                            open={this.state.loading} />

                        {(() => {
                            if (!this.props.selected) {
                                return (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: this.props.frame.width + 'px',
                                            height: frameHeight + 'px',
                                            cursor: 'zoom-in',
                                        }}
                                        onTouchTap={() => this.props.onSelect()}/>
                                );
                            }
                        })()}

                    </div>
                </CardText>

            </Card>

        );
    }

}
