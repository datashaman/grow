fs = require 'fs'
gutil = require 'gulp-util'
path = require 'path'
through2 = require 'through2'
File = require 'vinyl'

startReg = /<!--\s*build:(\w+)(?:(?:\(([^\)]+?)\))?\s+(\/?([^\s]+?))?)?\s*-->/gim
endReg = /<!--\s*endbuild\s*-->/im
jsReg = /<\s*script\s+.*?src\s*=\s*("|')([^"']+?)\1.*?><\s*\/\s*script\s*>/gi
cssReg = /<\s*link\s+.*?href\s*=\s*("|')([^"']+)\1.*?>/gi

module.exports = (opt) ->
  func = (file, encoding, cb) ->
    return cb(null, file) if file.isNull()
    return cb(new gutil.PluginError('assets', 'doesn\'t support stream')) if file.isStream()

    while match = startReg.exec(file.contents)
      start = match.index

      [ _, type, _, outputPath ] = match
      outputUrl = opt.config.site.baseurl + outputPath

      cwd = path.resolve(opt.root)
      outputPath = path.join(cwd, outputPath)

      startMarkerLength = match[0].length
      startFragment = match.input.slice(match.index + startMarkerLength)
      match = endReg.exec(startFragment)

      log = [ startFragment, match, endReg ]

      if match?
        pushOutputPath = (reg, fragment, outputPath) =>
          contents = []

          while m = reg.exec(fragment)
            thisPath = m[2]
            thisPath = thisPath.replace(opt.config.site.baseurl, '')
            contents.push(fs.readFileSync(cwd + thisPath))

          newFile = new File
            cwd: cwd
            path: outputPath
            contents: new Buffer(contents.join('\n'))

          @push newFile

        buildFragment = match.input.slice(0, match.index)

        endMarkerLength = match[0].length
        end = start + startMarkerLength + match.index + endMarkerLength

        if type == 'js'
          pushOutputPath jsReg, buildFragment, outputPath
          insert = '<script defer src="' + outputUrl + '"></script>'
        else if type == 'css'
          pushOutputPath cssReg, buildFragment, outputPath
          insert = '<link rel="stylesheet" type="text/css" href="' + outputUrl + '" />'

        html = file.contents.toString('utf8')
        file.contents = new Buffer(html.substr(0, start) + insert + html.substr(end))
      else
        console.log log
        return cb(new gutil.PluginError('assets', 'cannot find endbuild tag'))

    cb(null, file)

  through2.obj(func)
