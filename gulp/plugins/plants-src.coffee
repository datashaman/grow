slug = require 'slug'
path = require 'path'
request = require 'superagent'
_ = require 'lodash'
through2 = require 'through2'
File = require 'vinyl'

createFile = (file, encoding, cb) ->
  cb(null, new File(file))

module.exports = (plants) ->
  withImages = _.filter(plants, (p) -> p.image)

  cb = _.after withImages.length, -> stream.end()

  stream = through2.obj(createFile)

  _.each withImages, (plant) ->
    request.get plant.image
      .end (err, resp) ->
        if err?
          console.error(err)
        else
          stream.write
            base: path.resolve 'src'
            path: path.resolve 'src/images/plants/' + slug(plant.name) + path.extname(plant.image)
            contents: resp.body
        cb()

  stream
