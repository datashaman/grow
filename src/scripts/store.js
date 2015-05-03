var _ = require('lodash');
var store = require('store2');
var Constants = require('./constants');

var Store = _.assign({}, EventEmitter.prototype, {
  emitChange: function() {
    return this.emit('change');
  },

  addChangeListener: function(cb) {
    return this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    return this.removeListener('change', cb);
  }
});

AppDispatcher.register(function(action) {
  switch (action.actionType) {
    case Constants.SET_SCHEDULES:
      store.set('schedules', action.schedules);
      Store.emitChange();
      break;
    case Constants.SET_PLANTS:
      store.set('plants', action.schedules);
      Store.emitChange();
      break;
    default:
  }
});

module.exports = Store;
