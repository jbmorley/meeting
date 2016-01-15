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
import CircularProgress from 'material-ui/lib/circular-progress';
import CloseIcon from 'material-ui/lib/svg-icons/navigation/close';
import IconButton from 'material-ui/lib/icon-button';

export default class MeetingGridViewItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    render() {

        const titleHeight = 48;
        const margin = 8;

        return (

            <Card
                style={{
                    boxSizing: 'border-box',
                    display: 'inline-block',
                    boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.06), 0px 1px 4px rgba(0, 0, 0, 0.06)",
                    width: this.props.width + 'px',
                    height: (this.props.height + titleHeight) + 'px',
                    margin: margin + 'px'
                }}>

                <CardText
                    style={{
                        padding: 0,
                        position: 'relative',
                    }} >
                    <div
                        style={{
                            boxSizing: 'border-box',
                            fontSize: '18px',
                            display: 'table-cell',
                            height: '48px',
                            verticalAlign: 'middle',
                            padding: '0 12px',
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
                            width: this.props.width + 'px',
                            height: this.props.height + 'px',
                        }} >
                        <iframe
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                border: 0,
                                width: this.props.width + 'px',
                                height: this.props.height + 'px',
                            }}
                            scrolling="no"
                            src={this.props.url}
                            onLoad={() => {
                                this.setState({loading: false});
                            }} />

                        <CircularProgress
                            mode="indeterminate"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                display: this.state.loading ? 'block' : 'none'
                            }} />
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: this.props.width + 'px',
                                height: this.props.height + 'px',
                                cursor: 'zoom-in',
                            }}
                            onTouchTap={() => this.props.onSelect()} >
                        </div>
                    </div>
                </CardText>

            </Card>

        );
    }

}
