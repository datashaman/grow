gulp = require('gulp')
fs = require 'fs'
yaml = require 'js-yaml'
plugins = require('gulp-load-plugins')()
marked = require('gulp-marked')

swig = require('swig')

config = yaml.safeLoad fs.readFileSync 'config.yaml', 'utf8'

swig.setDefaults loader: swig.loaders.fs(__dirname + '/templates')

swig.setFilter 'baseurl', (input) -> config.site.baseurl + input
swig.setFilter 'absolute', (input) -> config.site.url + config.site.baseurl + input
swig.setFilter 'truncate', (input, maxlength) -> input.slice(0, maxlength)

gulp.task 'clean', ->
  gulp.src 'build', read: false
    .pipe plugins.clean()

gulp.task 'components', ->
  gulp.src 'bower_components'
    .pipe gulp.dest 'build'

gulp.task 'markdown', ->
  gulp.src 'src/**/*.md'
    .pipe plugins.data config
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.markdown()
    .pipe gulp.dest 'build'

gulp.task 'swig', ->
  gulp.src 'src/**/*.html'
    .pipe plugins.data config
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.swig()
    .pipe gulp.dest 'build'

gulp.task 'content', [ 'markdown', 'swig' ]
gulp.task 'default', [ 'components', 'content' ]
