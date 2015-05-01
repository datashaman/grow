gutil = require 'gulp-util'
path = require 'path'
through2 = require 'through2'

module.exports = (opt) ->
  func = (file, encoding, cb) ->
    return cb(null, file) if file.isNull()
    return cb(null, new gutil.PluginError('index', 'doesn\'t support stream')) if file.isStream()

    if /\.html$/.test(file.path)
      unless /index\.html$/.test(file.path)
        file.path = file.path.replace(/\.html$/, '/index.html')

    url = path.relative(path.resolve(opt.root), file.path)
    url = url.replace(/index\.html$/, '') if /index\.html$/.test(file.path)

    file.data.url = '/' + url

    cb(null, file)

  through2.obj(func)
