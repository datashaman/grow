var _ = require('lodash');
var React = require('react');
var LibAPI = require('./libapi');
var store = require('store2');
var config = require('./config');
var slug = require('slug');
var Spinner = require('spin.js');

slug.defaults.mode = 'rfc3986';

Schedule = React.createClass({
  componentWillMount: function() {
    this.fetchData();
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
  },
  componentWillUnmount: function() {
    if (this.state.spinner != null) {
      this.state.spinner.stop();
    }
  },
  getInitialState: function() {
    var today = new Date();
    var defaultTypes = _.map(config.types, function(type) {
      return type.title;
    });
    return {
      types: store != null ? store.get('types', defaultTypes) : defaultTypes,
      climate: store != null ? store.get('climate', 'Dry Summer - Wet Winter') : 'Dry Summer - Wet Winter',
      month: config.months[today.getMonth()],
      fetching: true,
      plants: [],
      schedule: [],
      spinner: null
    };
  },
  handleTypeClick: function(type) {
    return function(e) {
      var pos;
      e.preventDefault();
      pos = this.state.types.indexOf(type);
      if (pos === -1) {
        this.state.types.push(type);
      } else {
        if (this.state.types.length === 1) {
          return;
        }
        this.state.types.splice(pos, 1);
      }
      store.set('types', this.state.types);
      this.fetchData();
    }.bind(this);
  },
  handleMonthClick: function(month) {
    return function(e) {
      e.preventDefault();
      this.state.month = month;
      this.fetchData();
    }.bind(this);
  },
  fetchData: function() {
    this.setState({
      fetching: true
    });
    LibAPI.fetchData(this.state.climate, this.state.types, this.state.month, function(err, data) {
        data.fetching = false;
        this.setState(data);
    }.bind(this));
  },
  getGlyphiconByType: function(title) {
    return _.find(config.types, function(type) {
      return type.title === title;
    }).icon;
  },
  renderTypes: function() {
    return _.map(config.types, function(type) {
      var active, pos;
      pos = this.state.types.indexOf(type.title);
      active = pos !== -1;
      return (<button key={type.title} type="button"
        onClick={this.handleTypeClick(type.title)}
        className={'btn btn-default' + (active ? ' active' : '')}>
        <span className={'glyphicon glyphicon-' + type.icon}></span>
        <span className="type">{type.title}</span>
      </button>);
    }.bind(this));
  },
  renderMonths: function() {
    return _.map(config.months, function(month) {
      var active;
      active = month === this.state.month;
      return (<button key={month} type="button"
        onClick={this.handleMonthClick(month)}
        className={'col-xs-4 col-md-1 btn btn-default' + (active ? ' active' : '')}>
        {{ month }}
      </button>);
    }.bind(this));
  },
  renderPlants: function() {
    if (this.state.fetching) {
      return '';
    } else {
      return _.map(this.state.schedule, function(schedule) {
          var image, imageSource, instruction, name, plant, schedulePlant, type, wikipedia;
          schedulePlant = schedule[0], instruction = schedule[1], type = schedule[2];
          plant = _.find(this.state.plants, function(plant) {
            return plant[0] === schedulePlant;
          });
          if (plant != null) {
            name = plant[0], wikipedia = plant[1], image = plant[2], imageSource = plant[3];
            return (<li key={name} className="list-group-item">
              <img width="120" height="120" src={config.site.baseurl + '/images/plants/' + slug(name) + '.png'} alt={ imageSource }/>
              {wikipedia
                ? <a target="_blank" className="pull-right wikipedia" href={wikipedia}>
                    <img width="20" height="20" src={config.site.baseurl + "/images/icons/wikipedia.png"} />
                  </a>
                : ''}
              <span className="instruction pull-right">{config.instructions[instruction]}</span>
              <span className={'glyphicon glyphicon-' + this.getGlyphiconByType(type)} aria-hidden="true"></span>
              {name}
            </li>);
          } else {
            return '';
          }
      }.bind(this));
    }
  },
  render: function() {
    return (<div>
      <div className="page-header">
        <div className="container">
          <div id="types" className="btn-group pull-right" role="toolbar" aria-label="plant types">
            { this.renderTypes() }
          </div>
          <h2>{ this.state.climate }</h2>
        </div>
      </div>

      <div className="months container">
        <div className="btn-group btn-group-lg">{ this.renderMonths() }</div>
      </div>

      <div className="container">
        <ul id="plants" className="list-group">{ this.renderPlants() }</ul>
      </div>
    </div>);
  }
});

module.exports = Schedule;
