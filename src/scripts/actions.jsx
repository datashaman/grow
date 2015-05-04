var Immutable = require('immutable');
var AppDispatcher = require('./dispatcher.jsx');
var Constants = require('./constants.jsx');

module.exports = {
  fetchData: function() {
    AppDispatcher.dispatch({
      actionType: Constants.FETCH_DATA
    });
  },

  setClimate: function(climate) {
    AppDispatcher.dispatch({
      actionType: Constants.SET_CLIMATE,
      climate: climate
    });
  },

  setTypes: function(types) {
    AppDispatcher.dispatch({
      actionType: Constants.SET_TYPES,
      types: types
    });
  },

  setMonth: function(month) {
    AppDispatcher.dispatch({
      actionType: Constants.SET_MONTH,
      month: month
    });
  }
};
