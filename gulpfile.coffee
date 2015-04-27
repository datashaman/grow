'use strict'

gutil = require('gulp-util')
gulp = require('gulp')
jshint = require('gulp-jshint')
sourcemaps = require('gulp-sourcemaps')
cjsx = require('gulp-cjsx')
sass = require('gulp-sass')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
rename = require('gulp-rename')

gulp.task 'cjsx', ->
  gulp.src [ 'assets/scripts/**/*.cjsx' ]
    .pipe sourcemaps.init()
    .pipe cjsx
      harmony: true
      bare: true
    .pipe jshint '.jshintrc'
    .pipe jshint.reporter 'default'
    .pipe sourcemaps.write '.'
    .pipe gulp.dest 'scripts'
    .on 'error', gutil.log

gulp.task 'vendor', ->
  gulp.src [
      'bower_components/bootstrap/dist/js/bootstrap.js'
      'bower_components/lodash/lodash.js'
      'bower_components/store/dist/store2.js'
      'bower_components/react/react-with-addons.js',
      'bower_components/spin.js/spin.js'
    ]
    .pipe sourcemaps.init()
    .pipe concat 'vendor.js'
    .pipe gulp.dest 'scripts'
    .pipe uglify()
    .pipe rename 'vendor.min.js'
    .pipe sourcemaps.write '.'
    .pipe gulp.dest 'scripts'
    .on 'error', gutil.log

gulp.task 'sass', ->
  gulp.src [ 'assets/styles/*.{sass,scss}' ]
    .pipe sourcemaps.init()
    .pipe sass()
    .pipe sourcemaps.write()
    .pipe gulp.dest 'styles'
    .on 'error', gutil.log

gulp.task 'watch', ['default'], ->
  gulp.watch 'assets/scripts/**/*.cjsx', ['cjsx']
  gulp.watch 'assets/styles/**/*.{sass,scss}', ['sass']

gulp.task 'scripts', ['cjsx', 'vendor']

gulp.task 'styles', ['sass']

gulp.task 'default', ['scripts', 'styles']
