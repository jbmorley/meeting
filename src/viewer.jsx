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

const React = require('react')
const ReactDOM = require('react-dom')
const LinkedStateMixin = require('react-addons-linked-state-mixin')
const Router = require('react-router').Router
const Route = require('react-router').Route
const Link = require('react-router').Link

const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

var DocumentViewer = React.createClass({

    mixins: [LinkedStateMixin],

    getInitialState: function() {
        return {
            path: "/uploads/" + this.props.params.path
        };
    },

    render: function() {
        return (
            <div>
                <img src={this.state.path} width="100%" height="100%" />
            </div>
        );
    },

});

ReactDOM.render((
    <Router>
        <Route path="/:path" component={DocumentViewer} />
    </Router>
), document.getElementById('app'))
