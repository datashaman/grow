'use strict';

var _ = require('lodash');
var assets = require('./gulp/plugins/assets');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var del = require('del');
var es = require('event-stream');
var fs = require('fs');
var gulp = require('gulp');
var index = require('./gulp/plugins/index');
var libapi = require('./src/scripts/libapi');
var path = require('path');
var plantsSrc = require('./gulp/plugins/plants-src');
var plugins = require('gulp-load-plugins')();
var reload = browserSync.reload;
var request = require('superagent');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');
var slug = require('slug');
var source = require('vinyl-source-stream');
var swig = require('swig');

var config = require('./src/scripts/config');

slug.defaults.mode = 'rfc3986';

swig.setDefaults({
  loader: swig.loaders.fs('templates')
});

swig.setFilter('baseurl', function(input) {
  return config.site.baseurl + input;
});

swig.setFilter('absolute', function(input) {
  return config.site.url + config.site.baseurl + input;
});

swig.setFilter('truncate', function(input, maxlength) {
  return input.slice(0, maxlength);
});

gulp.task('clean', function(cb) {
  return del(['build', 'dist'], cb);
});

gulp.task('bower', function() {
  return gulp
    .src('bower_components/**/*')
    .pipe(plugins.changed('build/bower_components'))
    .pipe(gulp.dest('build/bower_components'));
});

gulp.task('fonts', function() {
  return gulp
    .src(['bower_components/bootstrap/fonts/**/*'])
    .pipe(gulp.dest('build/fonts')).pipe(reload({
      stream: true
    }));
});

gulp.task('jsx', function() {
  return gulp
    .src(['src/**/*.jsx'])
    .pipe(plugins.changed('build', {
      extension: '.js'
    }))
    .pipe(plugins.jsx({
      factory: 'React.createElement'
    }))
    .pipe(gulp.dest('build'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('markdown', function() {
  return gulp
    .src(['src/**/*.md'])
    .pipe(plugins.changed('build', {
      extension: '.html'
    }))
    .pipe(plugins.frontMatter({
      property: 'data'
    }))
    .pipe(plugins.data({
      config: config
    }))
    .pipe(index({
      root: 'src'
    }))
    .pipe(plugins.markdown())
    .pipe(gulp.dest('build'));
});

gulp.task('swig', function() {
  return gulp
    .src(['src/**/*.html'])
    .pipe(plugins.frontMatter({
      property: 'data'
    }))
    .pipe(plugins.data({
      config: config
    }))
    .pipe(index({
      root: 'src'
    }))
    .pipe(plugins.swig({
      defaults: {
        cache: false
      }
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('sass', function() {
  return gulp
    .src(['src/**/*.{sass,scss}'])
    .pipe(plugins.changed('build', {
      extension: '.css'
    }))
    .pipe(plugins.sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('build'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('less', function() {
  return gulp
    .src(['src/**/*.less'])
    .pipe(plugins.changed('build', {
      extension: '.css'
    }))
    .pipe(plugins.less({
      compress: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('original-images', function() {
  return libapi.fetchPlants(function(err, plants) {
    if (err != null) {
      return console.error(err);
    }
    return plantsSrc(plants)
      .pipe(plugins.save('pristine'))
      .pipe(gulp.dest('original'))
      .pipe(plugins.save.restore('pristine'))
      .pipe(plugins.imageResize({
        width: 120,
        height: 120,
        upscale: false,
        crop: true,
        gravity: 'Center',
        format: 'png',
        filter: 'Catrom',
        sharpen: true
      }))
      .pipe(gulp.dest('src'));
  });
});

gulp.task('images', function() {
  return gulp
    .src(['src/**/*.{png,gif,jpg}'])
    .pipe(gulp.dest('build'));
});

gulp.task('assets', ['build'], function() {
  return gulp
    .src([
      '!build/bower_components/**/*.html',
      'build/**/*.html'
    ], {
      base: 'build'
    })
    .pipe(assets({
      root: 'build',
      config: config
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('minify-css', function() {
  return gulp
    .src(['build/styles/**/*.css'])
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest('build/styles'));
});

gulp.task('minify-js', function() {
  return gulp
    .src(['build/assets/**/*.js'])
    .pipe(plugins.uglify())
    .pipe(gulp.dest('build/assets'));
});

gulp.task('minify-images', function() {
  return gulp
    .src(['src/**/*.{png,gif,jpg}'], {
      base: 'src'
    })
    .pipe(plugins.changed('build'))
    .pipe(plugins.imagemin())
    .pipe(gulp.dest('build'))
    .pipe(reload({
      stream: true
    }));
});

gulp.task('minify-assets', ['minify-css', 'minify-images']);

gulp.task('serve', function() {
  var bs = browserSync.create();

  bs.init({
    logLevel: 'warn',
    server: {
      baseDir: 'build'
    }
  });

  gulp.watch('bower_components/**/*', ['bower']);
  gulp.watch('src/**/*.{js,jsx}', ['browserify']).on('change', reload);
  gulp.watch('src/**/*.md', ['markdown']).on('change', reload);
  gulp.watch(['src/**/*.html', 'templates/**/*.html'], ['swig']).on('change', reload);
  gulp.watch('src/**/*.{sass,scss}', ['sass']);
  gulp.watch('src/**/*.less', ['less']);
});

gulp.task('deploy-gh-pages', ['build-gh-pages'], function() {
  return gulp
    .src('build/**/*')
    .pipe(plugins.ghPages());
});

gulp.task('build-gh-pages', ['clean'], function(cb) {
  config.site.url = 'http://datashaman.github.io';
  config.site.baseurl = '/grow';
  return runSequence('build', 'minify-assets', cb);
});

gulp.task('components', ['bower']);

gulp.task('content', ['markdown', 'swig']);

gulp.task('styles', ['sass', 'less']);

gulp.task('build', ['components', 'scripts', 'content', 'styles', 'fonts', 'images']);

gulp.task('scripts', function() {
  var index, settings;

  index = browserify('./src/scripts/index.jsx')
    .ignore('unicode/category/So')
    .bundle()

  index
    .pipe(source('index.js'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(gulp.dest('build/scripts'));

  settings = browserify('./src/scripts/settings.js')
    .bundle()

  settings
    .pipe(source('settings.js'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(gulp.dest('build/scripts'));

  return es.concat(index, settings);
});

gulp.task('deploy', ['deploy-gh-pages']);

gulp.task('default', ['build']);
