'use strict'

gutil = require('gulp-util')
gulp = require('gulp')
jshint = require('gulp-jshint')
sourcemaps = require('gulp-sourcemaps')
cjsx = require('gulp-cjsx')
sass = require('gulp-sass')

gulp.task 'cjsx', ->
  gulp.src [ 'cjsx/**/*.cjsx' ]
    .pipe sourcemaps.init()
    .pipe cjsx
      harmony: true
      bare: true
    .pipe jshint '.jshintrc'
    .pipe jshint.reporter 'default'
    .pipe sourcemaps.write('.')
    .pipe gulp.dest 'js'
    .on 'error', gutil.log

gulp.task 'sass', ->
  gulp.src [ 'sass/*.{sass,scss}' ]
    .pipe sourcemaps.init()
    .pipe sass()
    .pipe sourcemaps.write()
    .pipe gulp.dest 'css'
    .on 'error', gutil.log

gulp.task 'watch', ['default'], ->
  gulp.watch 'cjsx/**/*.cjsx', ['cjsx']
  gulp.watch 'sass/**/*.{sass,scss}', ['sass']

gulp.task 'scripts', ['cjsx']

gulp.task 'styles', ['sass']

gulp.task 'default', ['scripts', 'styles']
