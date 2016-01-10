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

import MeetingAppBar from './meeting-app-bar.jsx';


export default class MeetingAppScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>

                <LeftNav
                    open={this.props.showNavigation}
                    docked={false}
                    onRequestChange={open => this.props.onShowNavigation(open)}>
                    {this.props.navigationItems}
                </LeftNav>

                <MeetingAppBar
                    title={this.props.title}
                    onLeftIconButtonTouchTap={() => this.props.onShowNavigation(true)}
                    menuItems={this.props.menuItems} />

                <div className="content">
                    {this.props.children}
                </div>
                
            </div>
        );
    }
}
