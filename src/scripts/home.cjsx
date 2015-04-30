'use strict'

React = require 'react'
window.React = React

Schedule = require('./schedule')

window.jQuery(document).ready ($) ->
  React.render <Schedule />, document.getElementById('schedule')
