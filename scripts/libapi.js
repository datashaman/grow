var CSON, LibAPI, _, config, generateSql, request, responseHandler;

if (typeof window !== "undefined" && window !== null) {
  console.log(window);
}

if (typeof window === "undefined" || window === null) {
  _ = require('lodash');
  request = require('superagent');
  CSON = require('cson');
  config = CSON.requireFile(__dirname + '/../config.cson');
  if (config instanceof Error) {
    throw config;
  }
}

generateSql = function(climate, types, month) {
  var columns, filters;
  filters = [];
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
  return ['select ' + columns.join(', ') + ' FROM ' + config.services.google.tables.schedule + ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name', columns];
};

responseHandler = function(columns, cb) {
  return function(err, resp) {
    var rows;
    if (err != null) {
      return cb(err);
    }
    if (resp.ok) {
      rows = _.map(resp.body.rows, function(row) {
        _.each(columns, function(column, index) {
          var name;
          name = column[0].toLowerCase() + column.slice(1);
          return row[name] = row[index];
        });
        return row;
      });
      return cb(null, rows);
    } else {
      return cb('resp not ok');
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
    return request.get('https://www.googleapis.com/fusiontables/v1/query').query({
      sql: sql
    }).query({
      key: config.services.google.apiKey
    }).end(responseHandler(columns, cb));
  },
  fetchPlants: function(cb) {
    var columns;
    columns = ['Name', 'Wikipedia', 'Image', 'ImageSource'];
    return request.get('https://www.googleapis.com/fusiontables/v1/query').query({
      sql: 'select ' + columns.join(', ') + ' FROM ' + config.services.google.tables.plants + ' ORDER BY Name'
    }).query({
      key: config.services.google.apiKey
    }).end(responseHandler(columns, cb));
  }
};

if (typeof module !== "undefined" && module !== null) {
  module.exports = LibAPI;
}
