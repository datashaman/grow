buf = require('buffer')
Buffer = buf.Buffer
gutil = require 'gulp-util'
fs = require 'fs'
path = require 'path'
through2 = require 'through2'
_ = require 'lodash'

module.exports = (opt) ->
  func = (file, encoding, done) ->
    return done(null, file) if file.isNull()

    if file.isStream()
      done(new gutil.PluginError('gulp-index', 'doesn\'t support Streams'))
    else
      if file.data.scripts?
        scriptContent = []
        for script in file.data.scripts
          content = _.find [ 'build', 'src' ], (folder) ->
            scriptPath = path.resolve(folder) + script
            contents = fs.readFileSync(scriptPath)
            scriptContent.push(contents.toString('utf8'))
        combined = scriptContent.join('\n')
        newFile = new gutil.File
          cwd: file.cwd
          base: file.base
          path: file.base + '/assets/' + path.basename(file.path, path.extname(file.path)) + '.js'
          content: new Buffer(combined)
        this.push(newFile)

      done(null, file)

  through2.obj(func)
