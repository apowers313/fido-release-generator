// 'use strict';
var path = require('path');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');

var respec = require("./generators/app/gulp-respec2html");

gulp.task('static', function() {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('nsp', function(cb) {
  nsp({
    package: path.resolve('package.json')
  }, cb);
});

gulp.task('pre-test', function() {
  return gulp.src('generators/**/*.js')
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function(cb) {
  var mochaErr;

  gulp.src(['test/**/*.js', '!test/fixtures/**/*.js', '!**/respec2html.js'])
    .pipe(plumber())
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', function(err) {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', function() {
      cb(mochaErr);
    });
});

// for testing gulp-respec2html
gulp.task('test-respec', function(cb) {
  gulp.src(['test/fixtures/simple/respec.html'])
    .pipe(respec())
    .pipe(gulp.dest("."));
});

gulp.task('prepublish', ['nsp']);
// gulp.task('default', ['static', 'test']);
gulp.task('default', ['test']);