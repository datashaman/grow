'use strict';


var month;

var React = window.React;

var Schedule = React.createClass({
  render: function() {
  }
});

React.render(
  <Schedule />,
  document.getElementById('schedule')
);

window.jQuery(document).ready(function($) {
  var googleApiKey = window.googleApiKey;
  var data = window.data;
  var store = window.store;
  var _ = window._;

  function refreshDisplay() {
    var buttons = $('.months button').removeClass('active').get();

    _.find(buttons, function(button) {
      if ($(button).html() === month) {
        $(button).addClass('active');
        return true;
      }
    });

    var settings = store();
    var filters = [];

    if (settings.types) {
      if (settings.types.length === 0) {
        // If no types selected, no rows returned
        filters = ['1 = 0'];
      } else if (settings.types.length === data.types.length) {
        // If all types selected, all rows returned (no filter)
      } else {
        // Filter one or the other type
        filters = _.map(settings.types, function(type) {
          return 'Type = \'' + type + '\'';
        });
      }

      $('#types button').removeClass('active');

      $('#types button').each(function() {
        var type = $('.type', this).html();
        var pos = settings.types.indexOf(type);
        if (pos !== -1) {
          $(this).addClass('active');
        }
      });
    }

    filters.push('Climate = \'' + settings.climate + '\'');
    filters.push(month + ' NOT EQUAL TO \'\'');

    var sql = 'select Name, ' + month + ', Type FROM ' + data.tables.schedule +
      ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name';

    $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
      sql: sql,
      key: googleApiKey
    }, function(scheduleResponse) {
      $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
        sql: 'select Name, Wikipedia FROM ' + data.tables.plants +
          ' ORDER BY Name',
        key: googleApiKey
      }, function(plantsResponse) {
        var plants = _.map(scheduleResponse.rows, function(schedule) {
          var name = schedule[0];
          var plant = _.find(plantsResponse.rows, function(plant) {
            return plant[0] === name;
          });
          var wikipedia = plant ? plant[1] : null;

          return '<li class="list-group-item">' +
            (wikipedia ? '<a target="_blank" class="wikipedia" href="' + wikipedia + '">' +
              '<span class="glyphicon glyphicon-info-sign pull-right"></span></a>' : '') +
              '<span class="instruction pull-right">' + data.instructions[schedule[1]] + '</span>' +
              '<span class="glyphicon glyphicon-' + data.glyphicons[schedule[2]] + '" aria-hidden="true"></span>' +
              schedule[0] +
              '</li>';
        }).join('');
        $('#plants').html(plants);
      });
    });
  }

  if (!store.has('types')) {
    store('types', data.types);
  }

  if (typeof month === 'undefined') {
    var today = new Date();
    month = data.months[today.getMonth()];
  }

  $('.months button').click(function() {
    month = $(this).html();
    refreshDisplay();
  });

  $('#types button').click(function() {
    var type = $('.type', this).html();
    var types = store('types');
    var pos = types.indexOf(type);
    if (pos === -1) {
      types.push(type);
    } else {
      types.splice(pos, 1);
    }
    store('types', types);
    refreshDisplay();
  });

  $('.page-header .climate').html(store('climate')).removeClass('invisible');

  refreshDisplay();
});
