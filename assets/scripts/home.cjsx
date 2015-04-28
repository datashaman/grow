'use strict'

Schedule = require('./schedule')

window.jQuery(document).ready ($) ->
  React.render <Schedule />, document.getElementById('schedule')
