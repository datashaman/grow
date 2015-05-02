var Schedule;

Schedule = React.createClass({
  componentWillMount: function() {
    this.fetchData();
    return null;
  },
  componentDidUpdate: function() {
    if (this.state.fetching) {
      this.state.spinner = new Spinner().spin($('#plants').get(0));
    } else {
      if (this.state.spinner != null) {
        this.state.spinner.stop();
      }
      this.state.spinner = null;
    }
    return null;
  },
  componentWillUnmount: function() {
    if (this.state.spinner != null) {
      this.state.spinner.stop();
    }
    return null;
  },
  getInitialState: function() {
    var defaultTypes, today;
    today = new Date();
    defaultTypes = _.map(config.types, function(type) {
      return type.title;
    });
    return {
      types: typeof store !== "undefined" && store !== null ? store.get('types', defaultTypes) : defaultTypes,
      climate: typeof store !== "undefined" && store !== null ? store.get('climate', 'Dry Summer - Wet Winter') : 'Dry Summer - Wet Winter',
      month: config.months[today.getMonth()],
      fetching: true,
      plants: [],
      schedule: [],
      spinner: null
    };
  },
  handleTypeClick: function(type) {
    return (function(_this) {
      return function(e) {
        var pos;
        e.preventDefault();
        pos = _this.state.types.indexOf(type);
        if (pos === -1) {
          _this.state.types.push(type);
        } else {
          if (_this.state.types.length === 1) {
            return;
          }
          _this.state.types.splice(pos, 1);
        }
        store.set('types', _this.state.types);
        _this.fetchData();
        return null;
      };
    })(this);
  },
  handleMonthClick: function(month) {
    return (function(_this) {
      return function(e) {
        e.preventDefault();
        _this.state.month = month;
        _this.fetchData();
        return null;
      };
    })(this);
  },
  fetchData: function() {
    this.setState({
      fetching: true
    });
    return LibAPI.fetchData(this.state.climate, this.state.types, this.state.month, (function(_this) {
      return function(err, data) {
        data.fetching = false;
        return _this.setState(data);
      };
    })(this));
  },
  getGlyphiconByType: function(title) {
    return _.find(config.types, function(type) {
      return type.title === title;
    }).icon;
  },
  renderTypes: function() {
    return _.map(config.types, (function(_this) {
      return function(type) {
        var active, pos;
        pos = _this.state.types.indexOf(type.title);
        active = pos !== -1;
        return React.createElement("button", {
          "key": type.title,
          "type": "button",
          "onClick": _this.handleTypeClick(type.title),
          "className": 'btn btn-default' + (active ? ' active' : '')
        }, React.createElement("span", {
          "className": 'glyphicon glyphicon-' + type.icon
        }), React.createElement("span", {
          "className": "type"
        }, type.title));
      };
    })(this));
  },
  renderMonths: function() {
    return _.map(config.months, (function(_this) {
      return function(month) {
        var active;
        active = month === _this.state.month;
        return React.createElement("button", {
          "key": month,
          "type": "button",
          "onClick": _this.handleMonthClick(month),
          "className": 'col-xs-4 col-md-1 btn btn-default' + (active ? ' active' : '')
        }, {
          month: month
        });
      };
    })(this));
  },
  renderPlants: function() {
    if (this.state.fetching) {
      return '';
    } else {
      return _.map(this.state.schedule, (function(_this) {
        return function(schedule) {
          var image, imageSource, instruction, name, plant, schedulePlant, type, wikipedia;
          schedulePlant = schedule[0], instruction = schedule[1], type = schedule[2];
          plant = _.find(_this.state.plants, function(plant) {
            return plant[0] === schedulePlant;
          });
          if (plant != null) {
            name = plant[0], wikipedia = plant[1], image = plant[2], imageSource = plant[3];
            return React.createElement("li", {
              "key": name,
              "className": "list-group-item"
            }, React.createElement("img", {
              "width": "120",
              "height": "120",
              "src": config.site.baseurl + '/images/plants/' + slug(name) + '.png',
              "alt": imageSource
            }), (wikipedia ? React.createElement("a", {
              "target": "_blank",
              "className": "pull-right wikipedia",
              "href": wikipedia
            }, React.createElement("img", {
              "width": "20",
              "height": "20",
              "src": "/images/icons/wikipedia.png"
            })) : ''), React.createElement("span", {
              "className": "instruction pull-right"
            }, config.instructions[instruction]), React.createElement("span", {
              "className": 'glyphicon glyphicon-' + _this.getGlyphiconByType(type),
              "aria-hidden": "true"
            }), name);
          } else {
            return '';
          }
        };
      })(this));
    }
  },
  render: function() {
    return React.createElement("div", null, React.createElement("div", {
      "className": "page-header"
    }, React.createElement("div", {
      "className": "container"
    }, React.createElement("div", {
      "id": "types",
      "className": "btn-group pull-right",
      "role": "toolbar",
      "aria-label": "plant types"
    }, this.renderTypes()), React.createElement("h2", null, this.state.climate))), React.createElement("div", {
      "className": "months container"
    }, React.createElement("div", {
      "className": "btn-group btn-group-lg"
    }, this.renderMonths())), React.createElement("div", {
      "className": "container"
    }, React.createElement("ul", {
      "id": "plants",
      "className": "list-group"
    }, this.renderPlants())));
  }
});
