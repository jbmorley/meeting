// main.js
var ReactDOM = require('react-dom');

// Provides onTouchTap
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

const React = require('react');
const AppBar = require('material-ui/lib/app-bar');
const RaisedButton = require('material-ui/lib/raised-button');
const TextField = require('material-ui/lib/text-field');
const List = require('material-ui/lib/lists/list');
const ListDivider = require('material-ui/lib/lists/list');
const ListItem = require('material-ui/lib/lists/list-item');
const Checkbox = require('material-ui/lib/checkbox');

var Timer = React.createClass({
  getInitialState: function() {
    return {secondsElapsed: 0};
  },
  tick: function() {
    this.setState({secondsElapsed: this.state.secondsElapsed + 1});
  },
  componentDidMount: function() {
    this.interval = setInterval(this.tick, 1000);
  },
  componentWillUnmount: function() {
    clearInterval(this.interval);
  },
  render: function() {
    return (
      <div>Seconds Elapsed: {this.state.secondsElapsed}</div>
    );
  }
});

var TodoApp = React.createClass({

  getInitialState: function() {
    return {items: [], text: ''};
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var nextItems = this.state.items.concat([<ListItem leftCheckbox={<Checkbox />} primaryText={this.state.text} />]);
    var nextText = '';
    this.setState({items: nextItems, text: nextText});
  },

  render: function() {
    return (
      <div>
        <AppBar title="Meeting" />
        <List>
          {this.state.items}
        </List>
        <TextField onChange={this.onChange} value={this.state.text} hintText="New task" />
        <RaisedButton label="Add task" onTouchTap={this.handleSubmit} primary={true} />
      </div>
    );
  }

});

ReactDOM.render(<Timer />, document.getElementById('timer'));
ReactDOM.render(<TodoApp />, document.getElementById('app'));