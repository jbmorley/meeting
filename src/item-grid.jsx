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

var ItemGrid = React.createClass({

    render: function() {
        var self = this;
        return (
            <div className="grid">
                {this.props.items.map(function(item) {
                    return (
                        <Card
                            key={item.uuid}
                            className="grid-item">
                            <CardText style={{padding: '0'}}>
                                <IconButton onTouchTap={function(e) {
                                    self.props.onRemoveItem(item.uuid);
                                }}>
                                    <IconNavigationClose />
                                </IconButton>
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

});

module.exports = ItemGrid;