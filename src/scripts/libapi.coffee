unless window?
  _ = require('lodash')
  request = require 'superagent'
  CSON = require 'cson'
  config = CSON.requireFile __dirname + '/../config.cson'
  throw config if config instanceof Error

generateSql = (climate, types, month) ->
  filters = []

  if types.length == 0
    # If no types selected, no rows returned
    filters = ['1 = 0']
  else if types.length == config.types.length
    # If all types selected, all rows returned (no filter)
  else
    # Filter one or the other type
    filters = _.map types, (type) ->
      'Type = \'' + type + '\''

  filters.push('Climate = \'' + climate + '\'')
  filters.push(month + ' NOT EQUAL TO \'\'')

  'select Name, ' + month + ', Type FROM ' + config.services.google.tables.schedule +
    ' WHERE ' + filters.join(' AND ') + ' ORDER BY Name'

responseHandler = (columns, cb) ->
  (err, resp) ->
    return cb(err) if err?

    if resp.ok
      rows = _.map resp.body.rows, (row) ->
        _.each columns, (column, index) ->
          name = column[0].toLowerCase() + column.slice(1)
          row[name] = row[index]
        row
      cb null, rows
    else
      cb 'resp not ok'

@LibAPI =
  fetchData: (climate, types, month, cb) ->
    fetchSchedule climate, types, month, (err, schedule) ->
      return cb(err) if err?

      fetchPlants (err, plants) ->
        return cb(err) if err?

        cb null,
          schedule: schedule
          plants: plants

  fetchSchedule: (climate, types, month, cb) ->
    [ sql, columns ] = generateSql(climate, types, month)
    request.get 'https://www.googleapis.com/fusiontables/v1/query'
      .set 'Referer', config.site.url
      .query sql: sql
      .query key: config.services.google.apiKey
      .end responseHandler columns, cb

  fetchPlants: (cb) ->
    columns = [ 'Name', 'Wikipedia', 'Image', 'ImageSource' ]
    request.get 'https://www.googleapis.com/fusiontables/v1/query'
      .set 'Referer', config.site.url
      .query sql: 'select ' + columns.join(', ') + ' FROM ' + config.services.google.tables.plants + ' ORDER BY Name'
      .query key: config.services.google.apiKey
      .end responseHandler columns, cb

module.exports = @LibAPI if module?
