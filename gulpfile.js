'use strict';

var reactify = require('reactify');
var _ = require('lodash');
var gutil = require('gulp-util');
var browserify = require('browserify');
var browserifyShim = require('browserify-shim');
var envify = require('envify');
var browserSync = require('browser-sync');
var del = require('del');
var es = require('event-stream');
var fs = require('fs');
var gulp = require('gulp');
var assets = require('./gulp/plugins/assets');
var index = require('./gulp/plugins/index');
var plantsSrc = require('./gulp/plugins/plants-src');
var LibAPI = require('./src/scripts/flux/libapi.jsx');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var reload = browserSync.reload;
var request = require('superagent');
var requireDir = require('require-dir');
var runSequence = require('run-sequence');
var slug = require('slug');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var swig = require('swig');

var config = require('./src/scripts/config.jsx')();

slug.defaults.mode = 'rfc3986';

swig.setDefaults({
  loader: swig.loaders.fs('templates')
});

swig.setFilter('baseurl', function(input) {
  return config.getIn(['site','baseurl']) + input;
});

swig.setFilter('absolute', function(input) {
  return config.getIn(['site','url']) + config.getIn(['site','baseurl']) + input;
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
      config: config.toJS()
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
  return LibAPI.fetchPlants(function(err, plants) {
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
    .pipe(plugins.imagemin())
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
  gulp.watch('src/**/*.{js,jsx}', ['scripts']).on('change', reload);
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
  return runSequence('build', 'minify-assets', cb);
});

gulp.task('components', ['bower']);

gulp.task('content', ['markdown', 'swig']);

gulp.task('styles', ['sass', 'less']);

gulp.task('build', ['components', 'scripts', 'content', 'styles', 'fonts', 'images']);

gulp.task('scripts', function() {
  var browserifyFile = function(file) {
    var b = browserify(file.src, {
      extensions: [ '.jsx' ],
      debug: true
    });

    b.ignore('unicode/category/So');

    return b.bundle()
      .pipe(source(file.dest))
      .pipe(buffer())
      .pipe(plugins.uglify())
      .pipe(gulp.dest('build/scripts'));
  };

  var files = [
    { src: './src/scripts/index.jsx', dest: 'index.js' },
    { src: './src/scripts/settings.jsx', dest: 'settings.js' }
  ];

  return es.merge(files.map(browserifyFile));
});

gulp.task('deploy', ['deploy-gh-pages']);

gulp.task('default', ['build']);
