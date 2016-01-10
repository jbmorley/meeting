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
import AppBar from 'material-ui/lib/app-bar';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import IconButton from 'material-ui/lib/icon-button';

export default class MeetingAppBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        var iconElementRight = this.props.menuItems ? (
            <IconMenu
                iconButtonElement={
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                }
                targetOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'top'}}>
                {this.props.menuItems}
            </IconMenu>
        ) : undefined;

        return (
            <AppBar 
                title={this.props.title}
                className="app-bar"
                style={{
                    position: "fixed",
                    top: "0"
                }}
                onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap}
                iconElementRight={iconElementRight} />
        );

    }
}
