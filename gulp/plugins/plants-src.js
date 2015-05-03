var slug = require('slug');
var path = require('path');
var request = require('superagent');
var _ = require('lodash');
var  through2 = require('through2');
var File = require('vinyl');

function createFile(file, encoding, cb) {
  return cb(null, new File(file));
};

module.exports = function(plants) {
  var cb, stream, withImages;

  withImages = _.filter(plants, function(p) {
    return p.image;
  });

  cb = _.after(withImages.length, function() {
    stream.end();
  });

  stream = through2.obj(createFile);

  _.each(withImages, function(plant) {
    request.get(plant.image).end(function(err, resp) {
      if (err != null) {
        console.error(err);
      } else {
        stream.write({
          base: path.resolve('src'),
          path: path.resolve('src/images/plants/' + slug(plant.name) + path.extname(plant.image).toLowerCase()),
          contents: resp.body
        });
      }

      cb();
    });
  });

  return stream;
};
