'use strict';

var _ = require('lodash');
var Cookies = require('cookies-js');
var Immutable = require('immutable');
var { EventEmitter2 } = require('eventemitter2');

var config = require('../config.jsx')();

var constants = require('./constants.jsx');
var AppDispatcher = require('./dispatcher.jsx');
var LibAPI = require('./libapi.jsx');

var types = Cookies.get('types');
if (types) {
  types = JSON.parse(types);
} else {
  types = [ 'Fruit / Vegetable', 'Herb' ];
}
var today = new Date();
var months = config.get('months');

var defaults = {
  climate: Cookies.get('climate') || 'Dry Summer - Wet Winter',
  types: types,
  month: months.get(today.getMonth())
};

var data = new Immutable.fromJS(defaults);

var Store = _.assign({}, EventEmitter2.prototype, {
  emitChange: function() {
    return this.emit('change');
  },

  addChangeListener: function(cb) {
    return this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    return this.removeListener('change', cb);
  },

  getData: function() {
    return data;
  },
});

function fetchPlants(cb) {
  LibAPI.fetchPlants(function(err, plants) {
    if (err != null) { return cb(err); }
    data = data.set('plants', Immutable.fromJS(plants));
    cb();
  });
};

function fetchSchedule() {
  var climate = data.get('climate');
  var types = data.get('types');
  var month = data.get('month');

  LibAPI.fetchSchedule(climate, types, month, function(err, schedule) {
    if (err != null) { return cb(err); }
    data = data.set('schedule', Immutable.fromJS(schedule));
    Store.emitChange();
  });
};

AppDispatcher.register((action) => {
  switch (action.actionType) {
    case constants.FETCH_DATA:
      fetchPlants(function(err) {
        if (err != null) { return console.error(err); }
        fetchSchedule();
      });
      break;
    case constants.SET_CLIMATE:
      data = data.set('climate', action.climate);
      Cookies.set('climate', action.climate);
      fetchSchedule();
      break;
    case constants.SET_TYPES:
      data = data.set('types', Immutable.fromJS(action.types));
      Cookies.set('types', JSON.stringify(action.types));
      fetchSchedule();
      break;
    case constants.SET_MONTH:
      data = data.set('month', action.month);
      fetchSchedule();
      break;
    default:
  }
});

module.exports = Store;
