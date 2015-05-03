var _ = require('lodash');
var request = require('superagent');
var config = require('./config');

var generateSql = function(climate, types, month) {
  var columns, filters = [];

  if (types.length === 0) {
    filters = ['1 = 0'];
  } else if (types.length === config.types.length) {
  } else {
    filters = _.map(types, function(type) {
      return 'Type = \'' + type + '\'';
    });
  }

  filters.push('Climate = \'' + climate + '\'');
  filters.push(month + ' NOT EQUAL TO \'\'');

  columns = ['Name', month, 'Type'];
  return ['select ' + columns.join(', ') + ' FROM ' + config.services.google.tables.schedule +
    ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name', columns];
};

var responseHandler = function(columns, cb) {
  return function(err, resp) {
    var rows;
    if (err != null) {
      return cb(err);
    }
    if (resp.ok) {
      rows = _.map(resp.body.rows, function(row) {
        _.each(columns, function(column, index) {
          var name = column[0].toLowerCase() + column.slice(1);
          row[name] = row[index];
        });
        return row;
      });

      cb(null, rows);
    } else {
      cb('resp not ok');
    }
  };
};

LibAPI = {
  fetchData: function(climate, types, month, cb) {
    return LibAPI.fetchSchedule(climate, types, month, function(err, schedule) {
      if (err != null) {
        return cb(err);
      }
      return LibAPI.fetchPlants(function(err, plants) {
        if (err != null) {
          return cb(err);
        }
        return cb(null, {
          schedule: schedule,
          plants: plants
        });
      });
    });
  },

  fetchSchedule: function(climate, types, month, cb) {
    var columns, ref, sql;
    ref = generateSql(climate, types, month), sql = ref[0], columns = ref[1];
    return request.get('https://www.googleapis.com/fusiontables/v1/query')
      .query({ sql: sql })
      .query({ key: config.services.google.apiKey })
      .end(responseHandler(columns, cb));
  },

  fetchPlants: function(cb) {
    var columns;
    columns = ['Name', 'Wikipedia', 'Image', 'ImageSource'];
    return request.get('https://www.googleapis.com/fusiontables/v1/query')
      .query({ sql: 'select ' + columns.join(', ') + ' FROM ' + config.services.google.tables.plants + ' ORDER BY Name' })
      .query({ key: config.services.google.apiKey })
      .end(responseHandler(columns, cb));
  }
};

module.exports = LibAPI;
