'use strict';

window.jQuery(document).ready(function($) {
  var googleApiKey = window.googleApiKey;
  var store = window.store;
  var _ = window._;
  var data = window.data;
  var React = window.React;

  var Schedule = React.createClass({
    componentDidMount: function() {
      this.fetchData();
    },
    componentDidUpdate: function() {
      if (this.state.fetching) {
        this.state.spinner = new Spinner().spin(document.getElementById('plants'));
      } else {
        if (this.state.spinner) {
          this.state.spinner.stop();
          this.state.spinner = null;
        }
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
    handleTypeClick: function(type) {
      return function() {
        var pos = this.state.types.indexOf(type);
        if (pos === -1) {
          this.state.types.push(type);
        } else {
          this.state.types.splice(pos, 1);
        }

        store('types', this.state.types);
        console.log(this.state.types);
        this.fetchData();
      }.bind(this);
    },
    handleMonthClick: function(month) {
      return function() {
        this.state.month = month;
        this.fetchData();
      }.bind(this);
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
        return <button key={name} type="button" onClick={this.handleTypeClick(name)} className={"btn btn-default" + (active ? " active" : "")}><span className={"glyphicon glyphicon-" + icon}></span><span className="type">{name}</span></button>;
      }.bind(this));

      var months = data.months.map(function(month) {
        var active = month == this.state.month;
        return <button key={month} type="button" ref="button" onClick={this.handleMonthClick(month)} className={"col-xs-2 col-md-1 btn btn-default" + (active ? " active" : "")}>{{ month }}</button>;
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

          return <li key={schedule[0]} className="list-group-item">
            {wikipedia ? <a target="_blank" className="wikipedia" href={wikipedia}>
            <span className="glyphicon glyphicon-info-sign pull-right"></span></a> : ''}
            <span className="instruction pull-right">{data.instructions[schedule[1]]}</span>
            <span className={"glyphicon glyphicon-" + data.glyphicons[schedule[2]]} aria-hidden="true"></span>
            {schedule[0]}
          </li>;
        }.bind(this));
      }

      return (<div>
        <div className="page-header">
            <div className="container">
                <h2>{ this.state.climate }</h2>
                <div id="types" className="btn-group" role="toolbar" aria-label="plant types">
                    {types}
                </div>
            </div>
        </div>

        <div className="container">
            <div className="months row">{months}</div>
            <ul id="plants" className="list-group">{plants}</ul>
        </div>
      </div>);
    }
  });

  var schedule = React.render(
    <Schedule />,
    document.getElementById('schedule')
  );
});

// vim: set ft=jsx:
