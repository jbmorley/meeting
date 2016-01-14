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

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link } from 'react-router'

class MeetingDocumentViewer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            path: '/uploads/' + this.props.params.path,
            width: '100%',
            height: '100%'
        };
    }

    updateDimensions = () => {
        var w = window,
            d = document,
            documentElement = d.documentElement,
            body = d.getElementsByTagName('body')[0],
            width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
            height = w.innerHeight || documentElement.clientHeight|| body.clientHeight;

        this.setState({
            width: width,
            height: height
        });
    }

    componentWillMount() {
        this.updateDimensions();
    }

    onImageLoad(event) {
        this.setState({
            contentWidth: event.target.naturalWidth,
            contentHeight: event.target.naturalHeight
        });
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions);
    }

    render() {

        var width = '100%';
        var height = '100%';

        if (this.state.contentWidth && this.state.contentHeight) {

            if (this.state.contentWidth <= this.state.width &&
                this.state.contentHeight <= this.state.width) {

                width = this.state.contentWidth;
                height = this.state.contentHeight;

            } else {

                var windowRatio = this.state.width / this.state.height;
                var contentRatio = this.state.contentWidth / this.state.contentHeight;

                if (contentRatio > windowRatio) {

                    width = Math.min(this.state.width, this.state.contentWidth);
                    height = width / contentRatio;

                } else {

                    height = Math.min(this.state.height, this.state.contentHeight);
                    width = height * contentRatio;

                }

            }

        }

        return (
            <div
                style={{
                    textAlign: 'center'
                }} >
                <img
                    src={this.state.path}
                    width={width}
                    height={height}
                    onLoad={(event) => this.onImageLoad(event)} />
            </div>
        );
    }

}

ReactDOM.render((
    <Router>
        <Route path="/:path" component={MeetingDocumentViewer} />
    </Router>
), document.getElementById('app'))
