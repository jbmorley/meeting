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
 import LeftNav from 'material-ui/lib/left-nav';
 import MenuItem from 'material-ui/lib/menus/menu-item';
 import MenuDivider from 'material-ui/lib/menus/menu-divider';
 import RaisedButton from 'material-ui/lib/raised-button';


 export default class Navigation extends React.Component {

    constructor(props) {
        super(props);
    }

    /**
     * Expose the internal LeftNav toggle function.
     *
     * Work around for the current implementation of LeftNav which doesn't seem to correctly honour the open property as
     * described in the documentation. It seems that, for the time being at least, it actually uses a state internally
     * and not a property.
     */
    toggle() {
        this.refs.leftNav.toggle();
    }

    render() {
        return (
            <LeftNav ref="leftNav" docked={false}>
                <MenuItem>Menu Item</MenuItem>
                <MenuItem disabled={true}>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuDivider />
                <MenuItem>Menu Item 3</MenuItem>
            </LeftNav>
            );
    }
}
