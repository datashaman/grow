var React, Schedule, _, data, request, store;

if (typeof window !== "undefined" && window !== null) {
  store = window.store;
}

data = require(__dirname + '/../_data');

React = require('react/addons');

_ = require('lodash');

request = require('superagent');

Schedule = React.createClass({
  statics: {
    generateSql: function(climate, types, month) {
      var filters;
      filters = [];
      if (types.length === 0) {
        filters = ['1 = 0'];
      } else if (types.length === data.types.length) {

      } else {
        filters = _.map(types, function(type) {
          return 'Type = \'' + type + '\'';
        });
      }
      filters.push('Climate = \'' + climate + '\'');
      filters.push(month + ' NOT EQUAL TO \'\'');
      return 'select Name, ' + month + ', Type FROM ' + data.tables.schedule + ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name';
    },
    doFetchData: function(climate, types, month, done) {
      return request.get('https://www.googleapis.com/fusiontables/v1/query').set('Referer', 'http://localhost:4000').query({
        sql: Schedule.generateSql(climate, types, month)
      }).query({
        key: data.config.googleApiKey
      }).end((function(_this) {
        return function(err, scheduleResponse) {
          if (scheduleResponse.ok) {
            return request.get('https://www.googleapis.com/fusiontables/v1/query').set('Referer', 'http://localhost:4000').query({
              sql: 'select Name, Wikipedia FROM ' + data.tables.plants + ' ORDER BY Name'
            }).query({
              key: data.config.googleApiKey
            }).end(function(err, plantsResponse) {
              if (plantsResponse.ok) {
                return done(null, {
                  plants: plantsResponse.body.rows,
                  schedule: scheduleResponse.body.rows
                });
              } else {
                return done(err, null);
              }
            });
          }
        };
      })(this));
    }
  },
  componentWillMount: function() {
    this.fetchData();
    return null;
  },
  componentDidUpdate: function() {
    if (typeof window !== "undefined" && window !== null) {
      if (this.state.fetching) {
        this.state.spinner = new window.Spinner().spin(document.getElementById('plants'));
      } else {
        if (this.state.spinner) {
          this.state.spinner.stop();
          this.state.spinner = null;
        }
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
    var defaultTypes, today;
    today = new Date();
    defaultTypes = _.clone(data.types);
    return {
      types: store != null ? store.get('types', defaultTypes) : defaultTypes,
      climate: store != null ? store.get('climate', 'Dry Summer - Wet Winter') : 'Dry Summer - Wet Winter',
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
  fetchData: function() {
    this.setState({
      fetching: true
    });
    return Schedule.doFetchData(this.state.climate, this.state.types, this.state.month, (function(_this) {
      return function(err, data) {
        data.fetching = false;
        return _this.setState(data);
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

module.exports = Schedule;

//# sourceMappingURL=schedule.js.map