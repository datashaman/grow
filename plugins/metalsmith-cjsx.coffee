path = require 'path'
transform = require 'coffee-react-transform'
coffee = require 'coffee-script'
_ = require 'lodash'

module.exports = (options) ->
  defaults =
    bare: true

  options ?= {}

  _.defaults options, defaults

  (files, metalsmith, done) ->
    for name, data of files
      if /\.cjsx/.test(path.extname(name))
        newName = path.join(path.dirname(name), path.basename(name, '.cjsx') + '.js')

        data.contents = coffee.compile(transform(data.contents.toString('utf8')), options)
        newData = _.cloneDeep data, (value) -> new Buffer(value) if value is Buffer

        files[newName] = newData
        delete files[name]

    done()
