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

const Avatar = require('material-ui/lib/avatar');
const Card = require('material-ui/lib/card/card');
const CardActions = require('material-ui/lib/card/card-actions');
const CardExpandable = require('material-ui/lib/card/card-expandable');
const CardHeader = require('material-ui/lib/card/card-header');
const CardMedia = require('material-ui/lib/card/card-media');
const CardText = require('material-ui/lib/card/card-text');
const CardTitle = require('material-ui/lib/card/card-title');
const CloseIcon = require('material-ui/lib/svg-icons/navigation/close');
const IconButton = require('material-ui/lib/icon-button');
const IconMenu = require('material-ui/lib/menus/icon-menu');
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const MenuItem = require('material-ui/lib/menus/menu-item');
const MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');

var ItemGrid = React.createClass({

    render: function() {
        var self = this;
        return (
            <div className="grid">
                {this.props.items.map(function(item) {
                    return (
                        <Card
                            key={item.uuid}
                            className="grid-item"
                            style={{boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.06), 0px 1px 4px rgba(0, 0, 0, 0.06)"}}>

                            <CardText
                                style={{
                                    padding: '8px',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '18px',
                                        display: 'inline-block',
                                    }}
                                >
                                    {item.title}
                                </div>
                                <IconButton
                                    onTouchTap={function(event) {
                                        self.props.onRemoveItem(item.uuid);
                                    }} >
                                    <CloseIcon />
                                </IconButton>
                            </CardText>

                            <CardText style={{padding: '0'}}>
                                <div
                                    style={{
                                        position: "relative",
                                        width: "100%",
                                        height: "400px",
                                    }} >
                                    <iframe
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            border: 0,
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        scrolling="no"
                                        src={item.url} />
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            cursor: 'zoom-in',
                                        }}
                                        onTouchTap={function(event) {
                                            self.props.onSelect(item.uuid);
                                        }} >
                                    </div>
                                </div>
                            </CardText>

                        </Card>
                    );
                })}
            </div>
        );
    },

});

module.exports = ItemGrid;
