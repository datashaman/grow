'use strict';

var Immutable = require('immutable');
var _ = require('lodash');
var request = require('superagent');

var config = require('../config.jsx')();

var generateSql = function(climate, types, month) {
  var sql, columns, filters = new Immutable.List();

  if (types.size === 0) {
    filters = filters.push('1 = 0');
  } else if (types.size === config.get('types').size) {
  } else {
    filters = types.map(function(type) {
      return 'Type = \'' + type + '\'';
    });
  }

  filters = filters.push('Climate = \'' + climate + '\'');
  filters = filters.push(month + ' NOT EQUAL TO \'\'');

  columns = ['Name', month, 'Type'];
  sql = 'select ' + columns.join(', ') + ' FROM ' + config.getIn([ 'services', 'google', 'tables', 'schedule']) +
    ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name';
  console.log(sql);
  return [sql, columns];
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

var LibAPI = {
  fetchSchedule: function(climate, types, month, cb) {
    var columns, ref, sql;
    ref = generateSql(climate, types, month), sql = ref[0], columns = ref[1];
    return request.get('https://www.googleapis.com/fusiontables/v1/query')
      .set({ Referer: 'http://localhost:3000' })
      .query({ sql: sql })
      .query({ key: config.getIn(['services','google','apiKey']) })
      .end(responseHandler(columns, cb));
  },

  fetchPlants: function(cb) {
    var columns;
    columns = ['Name', 'Wikipedia', 'Image', 'ImageSource'];
    return request.get('https://www.googleapis.com/fusiontables/v1/query')
      .set({ Referer: 'http://localhost:3000' })
      .query({ sql: 'select ' + columns.join(', ') + ' FROM ' + config.getIn(['services','google','tables','plants']) + ' ORDER BY Name' })
      .query({ key: config.getIn(['services','google','apiKey']) })
      .end(responseHandler(columns, cb));
  }
};

module.exports = LibAPI;
