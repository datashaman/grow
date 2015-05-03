var gutil = require('gulp-util');
var path = require('path');
var through2 = require('through2');

module.exports = function(opt) {
  return through2.obj(function(file, encoding, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(null, new gutil.PluginError('index', 'doesn\'t support stream'));
    }

    if (/\.html$/.test(file.path)) {
      if (!/index\.html$/.test(file.path)) {
        file.path = file.path.replace(/\.html$/, '/index.html');
      }
    }

    file.data.url = path.relative(path.resolve(opt.root), file.path);
    if (/index\.html$/.test(file.path)) {
      file.data.url = file.data.url.replace(/index\.html$/, '');
    }

    file.data.url = '/' + file.data.url;
    return cb(null, file);
  });
};
