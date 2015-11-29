const React = require('react');
const List = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');

var MessageList = React.createClass({

    render: function() {
        return (
            <List>
                {this.props.messages.map(function(message) {
                    return (
                        <ListItem key={message} primaryText={message} />
                    );
                })}
            </List>
        );
    }

});

module.exports = MessageList;
