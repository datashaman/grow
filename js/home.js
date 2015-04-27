'use strict';
window.jQuery(document).ready(function($) {
  var React, Schedule, _, data, googleApiKey, store;
  googleApiKey = window.googleApiKey;
  store = window.store;
  _ = window._;
  data = window.data;
  React = window.React;
  Schedule = React.createClass({
    componentDidMount: function() {
      this.fetchData();
      return null;
    },
    componentDidUpdate: function() {
      if (this.state.fetching) {
        this.state.spinner = new window.Spinner().spin(document.getElementById('plants'));
      } else {
        if (this.state.spinner) {
          this.state.spinner.stop();
          this.state.spinner = null;
        }
      }
      return null;
    },
    componentWillUnmount: function() {
      if (this.state.spinner) {
        this.state.spinner.stop();
      }
      return null;
    },
    getInitialState: function() {
      var today;
      today = new Date();
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
      return (function(_this) {
        return function() {
          var pos;
          pos = _this.state.types.indexOf(type);
          if (pos === -1) {
            _this.state.types.push(type);
          } else {
            if (_this.state.types.length === 1) {
              return false;
            }
            _this.state.types.splice(pos, 1);
          }
          store('types', _this.state.types);
          _this.fetchData();
          return false;
        };
      })(this);
    },
    handleMonthClick: function(month) {
      return (function(_this) {
        return function() {
          _this.state.month = month;
          _this.fetchData();
          return false;
        };
      })(this);
    },
    generateSql: function() {
      var filters;
      filters = [];
      if (this.state.types.length === 0) {
        filters = ['1 = 0'];
      } else if (this.state.types.length === data.types.length) {

      } else {
        filters = _.map(this.state.types, function(type) {
          return 'Type = \'' + type + '\'';
        });
      }
      filters.push('Climate = \'' + this.state.climate + '\'');
      filters.push(this.state.month + ' NOT EQUAL TO \'\'');
      return 'select Name, ' + this.state.month + ', Type FROM ' + data.tables.schedule + ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name';
    },
    fetchData: function() {
      this.setState({
        fetching: true
      });
      return $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
        sql: this.generateSql(),
        key: googleApiKey
      }, (function(_this) {
        return function(scheduleResponse) {
          return $.getJSON('https://www.googleapis.com/fusiontables/v1/query', {
            sql: 'select Name, Wikipedia FROM ' + data.tables.plants + ' ORDER BY Name',
            key: googleApiKey
          }, function(plantsResponse) {
            return _this.setState({
              fetching: false,
              schedule: scheduleResponse.rows,
              plants: plantsResponse.rows
            });
          });
        };
      })(this));
    },
    render: function() {
      var months, plants, types;
      types = _.map(data.glyphicons, (function(_this) {
        return function(icon, name) {
          var active, pos;
          pos = _this.state.types.indexOf(name);
          active = pos !== -1;
          return React.createElement("button", {
            "key": name,
            "type": "button",
            "onClick": _this.handleTypeClick(name),
            "className": 'btn btn-default' + (active ? ' active' : '')
          }, React.createElement("span", {
            "className": 'glyphicon glyphicon-' + icon
          }), React.createElement("span", {
            "className": "type"
          }, name));
        };
      })(this));
      months = data.months.map((function(_this) {
        return function(month) {
          var active;
          active = month === _this.state.month;
          return React.createElement("button", {
            "key": month,
            "type": "button",
            "ref": "button",
            "onClick": _this.handleMonthClick(month),
            "className": 'col-xs-2 col-md-1 btn btn-default' + (active ? ' active' : '')
          }, {
            month: month
          });
        };
      })(this));
      if (this.state.fetching) {
        plants = '';
      } else {
        plants = _.map(this.state.schedule, (function(_this) {
          return function(schedule) {
            var name, plant, wikipedia;
            name = schedule[0];
            plant = _.find(_this.state.plants, function(plant) {
              return plant[0] === name;
            });
            wikipedia = plant ? plant[1] : null;
            return React.createElement("li", {
              "key": schedule[0],
              "className": "list-group-item"
            }, (wikipedia ? React.createElement("a", {
              "target": "_blank",
              "className": "wikipedia",
              "href": wikipedia
            }, React.createElement("span", {
              "className": "glyphicon glyphicon-info-sign pull-right"
            })) : void 0), React.createElement("span", {
              "className": "instruction pull-right"
            }, data.instructions[schedule[1]]), React.createElement("span", {
              "className": 'glyphicon glyphicon-' + data.glyphicons[schedule[2]],
              "aria-hidden": "true"
            }), schedule[0]);
          };
        })(this));
      }
      return React.createElement("div", null, React.createElement("div", {
        "className": "page-header"
      }, React.createElement("div", {
        "className": "container"
      }, React.createElement("h2", null, this.state.climate), React.createElement("div", {
        "id": "types",
        "className": "btn-group",
        "role": "toolbar",
        "aria-label": "plant types"
      }, types))), React.createElement("div", {
        "className": "container"
      }, React.createElement("div", {
        "className": "months row"
      }, months), React.createElement("ul", {
        "id": "plants",
        "className": "list-group"
      }, plants)));
    }
  });
  return React.render(React.createElement(Schedule, null), document.getElementById('schedule'));
});

//# sourceMappingURL=home.js.map