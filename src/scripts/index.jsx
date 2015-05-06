'use strict';

var React = require('react');
var Actions = require('./flux/actions.jsx');
var Index = require('./components/index.jsx');

r(() => {
  Actions.fetchData();
  React.render(<Index />, document.getElementById('index'));
});
