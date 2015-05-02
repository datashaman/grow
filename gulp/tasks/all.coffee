_ = require 'lodash'
request = require 'superagent'
gulp = require 'gulp'
fs = require 'fs'
del = require 'del'
CSON = require 'cson'
plugins = require('gulp-load-plugins')()
index = require '../plugins/index'
assets = require '../plugins/assets'
plantsSrc = require '../plugins/plants-src'
browserSync = require 'browser-sync'
runSequence = require 'run-sequence'
LibAPI = require '../../src/scripts/libapi'
path = require 'path'
reload = browserSync.reload
swig = require 'swig'

config = CSON.requireFile 'src/config.cson'
throw config if config instanceof Error

swig.setDefaults loader: swig.loaders.fs('templates')

swig.setFilter 'baseurl', (input) -> config.site.baseurl + input
swig.setFilter 'absolute', (input) -> config.site.url + config.site.baseurl + input
swig.setFilter 'truncate', (input, maxlength) -> input.slice(0, maxlength)

gulp.task 'clean', (cb) ->
  del(['build', 'dist'], cb)

gulp.task 'bower', ->
  gulp.src 'bower_components/**/*'
    .pipe plugins.changed 'build/bower_components'
    .pipe gulp.dest 'build/bower_components'

gulp.task 'fonts', ->
  gulp.src [
      'bower_components/bootstrap/fonts/**/*'
    ]
    .pipe gulp.dest 'build/fonts'
    .pipe reload stream: true

gulp.task 'cjsx', ->
  gulp.src [
      'src/**/*.cjsx'
    ]
    .pipe plugins.changed 'build', extension: '.js'
    .pipe plugins.cjsx bare: true
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'markdown', ->
  gulp.src [
      'src/**/*.md'
    ]
    .pipe plugins.changed 'build', extension: '.html'
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.data config: config
    .pipe index root: 'src'
    .pipe plugins.markdown()
    .pipe gulp.dest 'build'

gulp.task 'swig', ->
  gulp.src [
      'src/**/*.html'
    ]
    .pipe plugins.frontMatter property: 'data'
    .pipe plugins.data config: config
    .pipe index root: 'src'
    .pipe plugins.swig
      defaults: cache: false
    .pipe gulp.dest 'build'

gulp.task 'sass', ->
  gulp.src [
      'src/**/*.{sass,scss}'
    ]
    .pipe plugins.changed 'build', extension: '.css'
    .pipe plugins.sass outputStyle: 'compressed'
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'less', ->
  gulp.src [
      'src/**/*.less'
    ]
    .pipe plugins.debug minimal: false
    .pipe plugins.changed 'build', extension: '.css'
    .pipe plugins.less compress: true
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'images', ->
  LibAPI.fetchPlants (err, plants) ->
    return console.error(err) if err?

    plantsSrc plants
      .pipe plugins.imageResize
        width: 120
        height: 120
        upscale: false
        crop: true
        gravity: 'Center'
        format: 'png'
        filter: 'Catrom'
        sharpen: true
      .pipe gulp.dest 'src'

gulp.task 'assets', [ 'build' ], ->
  gulp.src [
    '!build/bower_components/**/*.html',
    'build/**/*.html'
    ], base: 'build'
    .pipe assets root: 'build', config: config
    .pipe gulp.dest 'build'

gulp.task 'minify-css', ->
  gulp.src [
    'build/styles/**/*.css'
    ]
    .pipe plugins.minifyCss()
    .pipe gulp.dest 'build/styles'

gulp.task 'minify-js', ->
  gulp.src [
    'build/assets/**/*.js'
    ]
    .pipe plugins.uglify()
    .pipe gulp.dest 'build/assets'

gulp.task 'minify-images', ->
  gulp.src [
      'src/**/*.{png,gif,jpg}'
    ], base: 'src'
    .pipe plugins.changed 'build'
    .pipe plugins.imagemin()
    .pipe gulp.dest 'build'
    .pipe reload stream: true

gulp.task 'minify-assets', [ 'minify-css', 'minify-js', 'minify-images' ]

gulp.task 'serve', ->
  bs = browserSync.create()

  bs.init
    logLevel: 'warn'
    server:
      baseDir: 'build'

  gulp.watch 'bower_components/**/*', [ 'bower' ]
  gulp.watch 'src/**/*.cjsx', [ 'cjsx' ]
  gulp.watch('src/**/*.md', [ 'markdown' ]).on('change', reload)
  gulp.watch([
    'src/**/*.html',
    'templates/**/*.html'
  ], [ 'swig' ]).on('change', reload)
  gulp.watch 'src/**/*.{sass,scss}', [ 'sass' ]
  gulp.watch 'src/**/*.less', [ 'less' ]

gulp.task 'deploy-gh-pages', [ 'build-gh-pages' ], ->
  gulp.src 'build/**/*'
    .pipe plugins.ghPages()

gulp.task 'build-gh-pages', [ 'clean' ], (cb) ->
  config.site.url = 'http://datashaman.github.io'
  config.site.baseurl = '/grow'
  runSequence 'assets', 'minify-assets', cb

gulp.task 'components', [ 'bower' ]
gulp.task 'content', [ 'markdown', 'swig' ]
gulp.task 'scripts', [ 'cjsx' ]
gulp.task 'styles', [ 'sass', 'less' ]
gulp.task 'build', [ 'components', 'scripts', 'content', 'styles', 'images', 'fonts' ]
gulp.task 'deploy', [ 'deploy-gh-pages' ]
gulp.task 'default', [ 'build' ]
