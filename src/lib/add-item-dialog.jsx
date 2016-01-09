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
import Dialog from 'material-ui/lib/dialog';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';

export default class AddItemDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {title: '', url: ''};
    }

    onTitleChange(value) {
        this.setState({title: value});
    }

    onURLChange(value) {
        this.setState({url: value});
    }

    handleSubmit() {
        if (this.props.onSubmit) {
            this.props.onSubmit(this.state.title, this.state.url);
        }
    }

    handleCancel() {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    }

    render() {
        var self = this;

        const actions = [
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={function() { self.handleCancel(); }} />,
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onTouchTap={function() { self.handleSubmit(); }} />,
        ];

        return (
            <Dialog
                title="Add item"
                actions={actions}
                open={this.props.open}
                onRequestClose={this.onAddItemDialogClose}>

                <TextField
                    ref="title"
                    value={this.state.title}
                    onChange={function() { self.onTitleChange(self.refs.title.getValue()); }}
                    hintText="Title" />

                <br />

                <TextField
                    ref="url"
                    value={this.state.url}
                    onChange={function() { self.onURLChange(self.refs.url.getValue()); }}
                    hintText="URL" />

            </Dialog>
        );
    }
}
