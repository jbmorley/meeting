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

import MeetingContentResizer from './meeting-content-resizer.jsx';
import MeetingGridViewItem from './meeting-grid-view-item.jsx';

export default class MeetingItemGrid extends React.Component {

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
                onWindowResize={(dimensions) => {
                    this.setState({
                        width: dimensions.content.width,
                        height: dimensions.window.height - dimensions.content.top
                    });
                }}>

                {(() => {
                    var titleHeight = 48;
                    var margin = 8
                    var ratio = 4 / 3;
                    var width = 0;
                    var height = 0;

                    var columns = 1;
                    while (self.props.items.length) {
                        var rows = Math.ceil(self.props.items.length / columns);
                        width = ((self.state.width / columns) - (margin * 2));
                        height = width / ratio;
                        if (((height + titleHeight) * rows) < self.state.height) {
                            break;
                        }
                        columns = columns + 1;
                    }

                    return this.props.items.map((item, index) => {
                        return (
                            <MeetingGridViewItem
                                key={item.uuid}
                                title={item.title}
                                url={item.url}
                                width={width}
                                height={height}
                                onSelect={() => this.props.onSelect(index)}
                                onRemove={() => this.props.onRemoveItem(index)} />
                        );
                    });
                })()}
            </MeetingContentResizer>
        );
    }

}
