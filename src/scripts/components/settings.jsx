'use strict';

var _ = require('lodash');

var Store = require('../flux/store.jsx');
var Actions = require('../flux/actions.jsx');

var config = require('../config.jsx')();

var Settings = React.createClass({
  componentWillMount: function() {
    Store.addChangeListener(this._onChange);
  },
  componentWillUnmount: function() {
    Store.removeChangeListener(this._onChange);
  },
  _onChange: function() {
    this.setState({ data: Store.getData() });
  },
  getInitialState: function() {
    var data = Store.getData();
    var state = {
      // Local interface state only, saved on submit
      climate: data.get('climate'),
      data: Store.getData()
    };
    return state;
  },
  handleSubmit: function(e) {
    e.preventDefault();
    Actions.setClimate(this.state.climate);
    window.location.href = config.get('site').get('baseurl') + '/';
  },
  handleClick: function(climate) {
    return function(e) {
      this.setState({  climate: climate });
    }.bind(this);
  },
  render: function() {
    return (<div>
      <div className="page-header">
          <div className="container">
              <h2>Settings</h2>
          </div>
      </div>

      <div className="container">
          <div className="form-group">
              <label for="select-climate">Select Climate</label>

              <ul id="select-climate" className="list-group">
                  {config.get('climates').map(function(climate) {
                    return <li className={"list-group-item" + (climate == this.state.climate ? " active" : '')} onClick={this.handleClick(climate)}>{climate}</li>;
                  }.bind(this))}
              </ul>
          </div>

          <button type="submit" className="btn btn-default" onClick={this.handleSubmit}>Save</button>
      </div>
    </div>);
  }
});

module.exports = Settings;
