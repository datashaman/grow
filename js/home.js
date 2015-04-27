'use strict';

window.jQuery(document).ready(function($) {
  var googleApiKey = window.googleApiKey;
  var store = window.store;
  var _ = window._;
  var data = window.data;
  var React = window.React;

  var Schedule = React.createClass({displayName: 'Schedule',
    componentDidMount: function() {
      this.fetchData();
    },
    componentDidUpdate: function() {
      if (this.state.fetching) {
        this.state.spinner = new Spinner().spin(document.getElementById('plants'));
      } else {
        this.state.spinner.stop();
        this.state.spinner = null;
      }
    },
    componentWillUnmount: function() {
      if (this.state.spinner) {
        this.state.spinner.stop();
      }
    },
    getInitialState: function() {
      var today = new Date();

      return {
        types: store.get('types', _.clone(data.types)),
        climate: store.get('climate', 'Dry Summer - Wet Winter'),
        month: data.months[today.getMonth()],
        fetching: true,
        plants: [],
        schedule: [],
        spinner: null
      };
    },
    handleTypeClick: function(e) {
      var $btn;

      if ($(e.target).hasClass('btn')) {
        $btn = $(e.target);
      } else {
        $btn = $(e.target).closest('.btn');
      }

      var type = $btn.find('.type').text();
      var pos = this.state.types.indexOf(type);
      if (pos === -1) {
        this.state.types.push(type);
      } else {
        this.state.types.splice(pos, 1);
      }

      store('types', this.state.types);
      this.fetchData();
    },
    handleMonthClick: function(e) {
      this.state.month = $(e.target).text();
      this.fetchData();
    },
    generateSql: function() {
      var filters = [];

      if (this.state.types.length === 0) {
        // If no types selected, no rows returned
        filters = ['1 = 0'];
      } else if (this.state.types.length === data.types.length) {
        // If all types selected, all rows returned (no filter)
      } else {
        // Filter one or the other type
        filters = _.map(this.state.types, function(type) {
          return 'Type = \'' + type + '\'';
        });
      }

      filters.push('Climate = \'' + this.state.climate + '\'');
      filters.push(this.state.month + ' NOT EQUAL TO \'\'');

      var sql = 'select Name, ' + this.state.month + ', Type FROM ' + data.tables.schedule +
        ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name';

      return sql;
    },
    fetchData: function() {
      this.setState({ fetching: true });

      $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
        sql: this.generateSql(),
        key: googleApiKey
      }, function(scheduleResponse) {
        $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
          sql: 'select Name, Wikipedia FROM ' + data.tables.plants +
            ' ORDER BY Name',
          key: googleApiKey
        }, function(plantsResponse) {
          this.setState({
            fetching: false,
            schedule: scheduleResponse.rows,
            plants: plantsResponse.rows
          });
        }.bind(this));
      }.bind(this));
    },
    render: function() {
      var types = _.map(data.glyphicons, function(icon, name) {
        var pos = this.state.types.indexOf(name);
        var active = pos !== -1;
        return React.createElement("button", {key: name, type: "button", onClick: this.handleTypeClick, className: "btn btn-default" + (active ? " active" : "")}, React.createElement("span", {className: "glyphicon glyphicon-" + icon}), React.createElement("span", {className: "type"}, name));
      }.bind(this));

      var months = data.months.map(function(month) {
        var active = month == this.state.month;
        return React.createElement("button", {key: month, type: "button", onClick: this.handleMonthClick, className: "col-xs-2 col-md-1 btn btn-default" + (active ? " active" : "")}, { month});
      }.bind(this));

      var plants;

      if (this.state.fetching) {
        plants = '';
      } else {
        plants = _.map(this.state.schedule, function(schedule) {
          var name = schedule[0];
          var plant = _.find(this.state.plants, function(plant) {
            return plant[0] === name;
          });
          var wikipedia = plant ? plant[1] : null;

          return React.createElement("li", {key: schedule[0], className: "list-group-item"}, 
            wikipedia ? React.createElement("a", {target: "_blank", className: "wikipedia", href: wikipedia}, 
            React.createElement("span", {className: "glyphicon glyphicon-info-sign pull-right"})) : '', 
            React.createElement("span", {className: "instruction pull-right"}, data.instructions[schedule[1]]), 
            React.createElement("span", {className: "glyphicon glyphicon-" + data.glyphicons[schedule[2]], 'aria-hidden': "true"}), 
            schedule[0]
          );
        }.bind(this));
      }

      return (React.createElement("div", null, 
        React.createElement("div", {className: "page-header"}, 
            React.createElement("div", {className: "container"}, 
                React.createElement("h2", null,  this.state.climate), 
                React.createElement("div", {id: "types", className: "btn-group", role: "toolbar", 'aria-label': "plant types"}, 
                    types
                )
            )
        ), 

        React.createElement("div", {className: "container"}, 
            React.createElement("div", {className: "months row"}, months), 
            React.createElement("ul", {id: "plants", className: "list-group"}, plants)
        )
      ));
    }
  });

  var schedule = React.render(
    React.createElement(Schedule, null),
    document.getElementById('schedule')
  );
});

// vim: set ft=jsx:
