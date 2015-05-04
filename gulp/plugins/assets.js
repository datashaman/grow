var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var through2 = require('through2');
var File = require('vinyl');
var startReg = /<!--\s*build:(\w+)(?:(?:\(([^\)]+?)\))?\s+(\/?([^\s]+?))?)?\s*-->/gim;
var endReg = /<!--\s*endbuild\s*-->/im;
var jsReg = /<\s*script\s+.*?src\s*=\s*("|')([^"']+?)\1.*?><\s*\/\s*script\s*>/gi;
var cssReg = /<\s*link\s+.*?href\s*=\s*("|')([^"']+)\1.*?>/gi;

module.exports = function(opt) {
  var func = function(file, encoding, cb) {
    var _, buildFragment, cwd, end, endMarkerLength, html, insert, log, match, outputPath, outputUrl, pushOutputPath, start, startFragment, startMarkerLength, type;

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError('assets', 'doesn\'t support stream'));
    }

    while (match = startReg.exec(file.contents)) {
      start = match.index;
      type = match[1], outputPath = match[3];

      outputUrl = opt.config.site.baseurl + outputPath;

      cwd = path.resolve(opt.root);
      outputPath = path.join(cwd, outputPath);

      startMarkerLength = match[0].length;
      startFragment = match.input.slice(match.index + startMarkerLength);

      match = endReg.exec(startFragment);

      log = [startFragment, match, endReg];

      if (match != null) {
        pushOutputPath = function(reg, fragment, outputPath) {
            var contents = new Buffer(), m, newFile, thisPath;

            while (m = reg.exec(fragment)) {
              thisPath = m[2];
              thisPath = thisPath.replace(opt.config.site.baseurl, '');
              contents.write(fs.readFileSync(cwd + thisPath));
              contents.write('\n');
            }

            newFile = new File({
              cwd: cwd,
              path: outputPath,
              contents: contents
            });

            return _this.push(newFile);
        };

        buildFragment = match.input.slice(0, match.index);

        endMarkerLength = match[0].length;
        end = start + startMarkerLength + match.index + endMarkerLength;

        if (type === 'js') {
          pushOutputPath(jsReg, buildFragment, outputPath);
          insert = '<script defer src="' + outputUrl + '"></script>';
        } else if (type === 'css') {
          pushOutputPath(cssReg, buildFragment, outputPath);
          insert = '<link rel="stylesheet" type="text/css" href="' + outputUrl + '" />';
        }

        html = file.contents.toString('utf8');
        file.contents = new Buffer(html.substr(0, start) + insert + html.substr(end));
      } else {
        console.log(log);
        return cb(new gutil.PluginError('assets', 'cannot find endbuild tag'));
      }
    }

    return cb(null, file);
  };

  return through2.obj(func);
};
