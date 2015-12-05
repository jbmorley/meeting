/*
 * Copyright (C) 2015 InSeven Limited.
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

const AppBar = require('material-ui/lib/app-bar');
const IconButton = require('material-ui/lib/icon-button');
const NavigationClose = require('material-ui/lib/svg-icons/navigation/close');

var ItemView = React.createClass({

    render: function() {
        var self = this;
        return (
            <div
                style={{
                    position: 'fixed',
                    boxSizing: 'border-box',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                    onTouchTap={this.props.onRequestClose}
                >

                    <AppBar
                        style={{boxShadow: 0}}
                        title={this.props.title}
                        iconElementLeft={
                            <IconButton
                                onTouchTap={self.props.onRequestClose}>
                                <NavigationClose />
                            </IconButton>
                        } />

                    <div
                        style={{
                            position: 'relative',
                            boxSizing: 'border-box',
                            flexGrow: '1',
                            backgroundColor: '#fff',
                            maxWidth: '600px',
                            maxHeight: '600px',
                            margin: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                        <iframe
                            style={{
                                width: '100%',
                                height: '100%',
                                border: '0',
                                flexGrow: '1',
                            }}
                            src={this.props.url} />
                    </div>

                </div>

            </div>
        );
    },

});

module.exports = ItemView;
