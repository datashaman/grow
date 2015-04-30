gutil = require 'gulp-util'
path = require 'path'
through2 = require 'through2'

module.exports = (opt) ->
    func = (file, encoding, done) ->
        return done(null, file) if file.isNull()

        if file.isStream()
            return done(new gutil.PluginError('gulp-index', 'doesn\'t support Streams'))

        if /\.html$/.test(file.path)
          unless /index\.html$/.test(file.path)
            file.path = file.path.replace(/\.html$/, '/index.html')

        url = path.relative(__dirname + '/../src', file.path)

        if /index\.html$/.test(file.path)
          url = url.replace(/index\.html$/, '')

        file.data.url = '/' + url

        done(null, file)

    through2.obj(func)
