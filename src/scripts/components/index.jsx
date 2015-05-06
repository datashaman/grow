'use strict';

var _ = require('lodash');
var React = require('react');
var slug = require('slug');
var Spinner = require('spin.js');
var Immutable = require('immutable');

var LibAPI = require('../flux/libapi.jsx');
var Actions = require('../flux/actions.jsx');
var Store = require('../flux/store.jsx');

var config = require('../config.jsx')();

slug.defaults.mode = 'rfc3986';

var Index = React.createClass({
  componentWillMount: function() {
    Store.addChangeListener(this._onChange);
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
    Store.removeChangeListener(this._onChange);

    if (this.state.spinner != null) {
      this.state.spinner.stop();
    }
  },
  _onChange: function() {
    this.setState({ data: Store.getData() });
  },
  getInitialState: function() {
    var state = {
      data: Store.getData(),
      fetching: false,
      spinner: null
    };
    return state;
  },
  handleTypeClick: function(type) {
    return function(e) {
      e.preventDefault();

      var types = this.state.data.get('types').toJS();
      var pos = types.indexOf(type);

      if (pos === -1) {
        types.push(type);
      } else {
        if (types.length === 1) {
          return;
        }
        types.splice(pos, 1);
      }

      Actions.setTypes(types);
    }.bind(this);
  },
  handleMonthClick: function(month) {
    return function(e) {
      e.preventDefault();
      Actions.setMonth(month);
    };
  },
  getGlyphiconByType: function(title) {
    return config.get('types').find(function(type) {
      return type.get('title') === title;
    }).get('icon');
  },
  renderTypes: function() {
    return config.get('types').map(function(type) {
      var active, pos;
      var types = this.state.data.get('types');
      pos = types.indexOf(type.get('title'));
      active = pos !== -1;
      return (<button key={type.get('title')} type="button"
        onClick={this.handleTypeClick(type.get('title'))}
        className={'btn btn-default' + (active ? ' active' : '')}>
        <span className={'glyphicon glyphicon-' + type.get('icon')}></span>
        <span className="type">{type.get('title')}</span>
      </button>);
    }.bind(this));
  },
  renderMonths: function() {
    return config.get('months').map(function(month) {
      var active;
      active = month === this.state.data.get('month');
      return (<button key={month} type="button"
        onClick={this.handleMonthClick(month)}
        className={'col-xs-4 col-md-1 btn btn-default' + (active ? ' active' : '')}>
        {{ month }}
      </button>);
    }.bind(this));
  },
  renderPlants: function() {
    var baseurl = config.get('site').get('baseurl');
    var instructions = config.get('instructions');
    var schedule = this.state.data.get('schedule');
    var plants = this.state.data.get('plants');
    return schedule
      ? schedule.map(function(schedule) {
          var image, imageSource, instruction, name, plant, schedulePlant, type, wikipedia;
          schedulePlant = schedule.get(0), instruction = schedule.get(1), type = schedule.get(2);
          plant = plants.find(function(plant) {
            return plant.get(0) === schedulePlant;
          });
          if (plant != null) {
            name = plant.get(0), wikipedia = plant.get(1), image = plant.get(2), imageSource = plant.get(3);
            return (<li key={name} className="list-group-item">
              <img width="120" height="120" src={baseurl + '/images/plants/' + slug(name) + '.png'} title={ imageSource }/>
              {wikipedia
                ? <a target="_blank" className="pull-right wikipedia" href={wikipedia}>
                    <img width="20" height="20" src={baseurl + "/images/icons/wikipedia.png"} />
                  </a>
                : ''}
              <span className="instruction pull-right">{instructions.get(instruction)}</span>
              <span className={'glyphicon glyphicon-' + this.getGlyphiconByType(type)} aria-hidden="true"></span>
              {name}
            </li>);
          } else {
            return '';
          }
        }.bind(this))
      : '';
  },
  render: function() {
    return (<div>
      <div className="page-header">
        <div className="container">
          <div id="types" className="btn-group pull-right" role="toolbar" aria-label="plant types">
            { this.renderTypes() }
          </div>
          <h2>{ this.state.data.get('climate') }</h2>
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

module.exports = Index;
