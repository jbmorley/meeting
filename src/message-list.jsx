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
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const IconButton = require('material-ui/lib/icon-button');

const Card = require('material-ui/lib/card/card');
const CardActions = require('material-ui/lib/card/card-actions');
const CardExpandable = require('material-ui/lib/card/card-expandable');
const CardHeader = require('material-ui/lib/card/card-header');
const CardMedia = require('material-ui/lib/card/card-media');
const CardText = require('material-ui/lib/card/card-text');
const CardTitle = require('material-ui/lib/card/card-title');

const Avatar = require('material-ui/lib/avatar');

const IconNavigationClose = require('material-ui/lib/svg-icons/navigation/close');

var MessageList = React.createClass({

    render: function() {
        return (
            <div className="grid">
                {this.props.messages.map(function(item) {
                    return (
                        <Card
                            className="grid-item"
                            key={item.url}>
                            <CardText style={{padding: '0'}} expandable={true}>
                            </CardText>
                            <CardText style={{padding: '0'}}>
                                <iframe scrolling="no" src={item.url}></iframe>
                            </CardText>
                        </Card>
                    );
                })}
            </div>
        );
    },

    _removeItem: function() {
        alert("REMOVE ITEM!");
    }

});

module.exports = MessageList;
