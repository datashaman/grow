gutil = require 'gulp-util'
through2 = require 'through2'

module.exports = (opt) ->
    func = (file, encoding, done) ->
        return done(null, file) if file.isNull()

        if file.isStream()
            return done(new gutil.PluginError('gulp-index', 'doesn\'t support Streams'))

        if /\.html$/.test(file.path) and !/index\.html$/.test(file.path)
          file.path = file.path.replace(/\.html$/, '/index.html')

        done(null, file)

    through2.obj(func)
