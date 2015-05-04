'use strict';

var React = require('react');
var Actions = require('./actions.jsx');
var Schedule = require('./schedule.jsx');

r(() => {
  Actions.fetchData();
  React.render(<Schedule />, document.getElementById('schedule'));
});
