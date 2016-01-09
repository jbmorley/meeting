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
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const AppBar = require('material-ui/lib/app-bar');
const IconButton = require('material-ui/lib/icon-button');
const NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
const Paper = require('material-ui/lib/paper');

var ItemView = React.createClass({

    updateDimensions: function() {
        this.setState({width: window.innerWidth, height: window.innerHeight});
    },

    componentWillMount: function() {
        this.updateDimensions();
    },

    componentDidMount: function() {
        window.addEventListener("resize", this.updateDimensions);
    },

    componentWillUnmount: function() {
        window.removeEventListener("resize", this.updateDimensions);
    },

    render: function() {
        var self = this;
        return (
            <ReactCSSTransitionGroup
                transitionName="example"
                transitionEnterTimeout={150}
                transitionLeaveTimeout={150}
            >
                {function() {
                    if (self.props.open) {
                        return (
                            <div
                                key={self.props.item.url}
                                style={{
                                    position: 'fixed',
                                    boxSizing: 'border-box',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 10,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                }}
                            >

                                <AppBar
                                    style={{
                                        boxShadow: 0,
                                        position: 'fixed',
                                        top: 0,
                                        left: 0,
                                    }}
                                    title={self.props.item.title}
                                    iconElementLeft={
                                        <IconButton
                                            onTouchTap={self.props.onRequestClose}>
                                            <NavigationClose />
                                        </IconButton>
                                    } />

                                <div
                                    style={{
                                        width: self.state.width + 'px',
                                        height: self.state.height + 'px',
                                        textAlign: 'center',
                                    }}
                                >

                                    <Paper
                                        style={{
                                            boxSizing: 'border-box',
                                            width: Math.min(1024, self.state.width) + 'px',
                                            height: (self.state.height - 64) + 'px',
                                            margin: 'auto',
                                            marginTop: '64px',
                                        }}
                                        zDepth={2}
                                    >
                                        <iframe
                                            style={{
                                                boxSizing: 'border-box',
                                                width: Math.min(1024, self.state.width) + 'px',
                                                height: (self.state.height - 64) + 'px',
                                                border: '0',
                                                margin: 'auto',
                                                backgroundColor: '#fff',
                                            }}
                                            src={self.props.item.url} />
                                    </Paper>

                                </div>

                            </div>
                        );
                    }
                }()}
            </ReactCSSTransitionGroup>
        );
    },

});

module.exports = ItemView;
