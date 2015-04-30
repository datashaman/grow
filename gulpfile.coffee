gulp = require 'gulp'
fs = require 'fs'
del = require 'del'
yaml = require 'js-yaml'
plugins = require('gulp-load-plugins')()
index = require './plugins/gulp-index'
browserSync = require 'browser-sync'
reload = browserSync.reload
swig = require 'swig'

config = yaml.safeLoad fs.readFileSync 'config.yaml', 'utf8'

swig.setDefaults loader: swig.loaders.fs('templates')

swig.setFilter 'baseurl', (input) -> config.site.baseurl + input
swig.setFilter 'absolute', (input) -> config.site.url + config.site.baseurl + input
swig.setFilter 'truncate', (input, maxlength) -> input.slice(0, maxlength)

gulp.task 'clean', ->
  del('build')

gulp.task 'bower', ->
  gulp.src 'bower_components/**/*'
    .pipe plugins.changed 'build/bower_components'
    .pipe gulp.dest 'build/bower_components'

gulp.task 'cjsx', ->
  gulp.src 'src/**/*.cjsx'
    .pipe plugins.changed 'build', extension: '.js'
    .pipe plugins.cjsx bare: true
    .pipe plugins.uglify()
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'markdown', ->
  gulp.src 'src/**/*.md'
    .pipe plugins.changed 'build', extension: '.html'
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.data config: config
    .pipe index root: 'src'
    .pipe plugins.markdown()
    .pipe gulp.dest 'build'

gulp.task 'swig', ->
  gulp.src 'src/**/*.html'
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.data config: config
    .pipe index root: 'src'
    .pipe plugins.swig
      defaults: cache: false
    .pipe gulp.dest 'build'

gulp.task 'sass', ->
  gulp.src 'src/**/*.{sass,scss}'
    .pipe plugins.changed 'build', extension: '.css'
    .pipe plugins.sass outputStyle: 'compressed'
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'less', ->
  gulp.src 'src/**/*.less'
    .pipe plugins.changed 'build', extension: '.css'
    .pipe plugins.less compress: true
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'serve', [ 'default' ], ->
  browserSync server: 'build'

  gulp.watch 'bower_components/**/*', [ 'bower' ]
  gulp.watch 'src/**/*.cjsx', [ 'cjsx' ]
  gulp.watch('src/**/*.md', [ 'markdown' ]).on('change', reload)
  gulp.watch([
    'src/**/*.html',
    'templates/**/*.html'
  ], [ 'swig' ]).on('change', reload)
  gulp.watch 'src/**/*.{sass,scss}', [ 'sass' ]
  gulp.watch 'src/**/*.less', [ 'less' ]

gulp.task 'deploy', [ 'build' ], ->
  gulp.src 'build/**/*'
    .pipe plugins.ghPages()

gulp.task 'components', [ 'bower' ]
gulp.task 'content', [ 'markdown', 'swig' ]
gulp.task 'scripts', [ 'cjsx' ]
gulp.task 'styles', [ 'sass', 'less' ]
gulp.task 'build', [ 'components', 'scripts', 'content', 'styles' ]
gulp.task 'default', [ 'build' ]
