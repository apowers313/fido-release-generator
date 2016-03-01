// 'use strict';
var path = require('path');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var nsp = require('gulp-nsp');
var plumber = require('gulp-plumber');
var gulpReplace = require("gulp-replace");
var gulpDebug = require("gulp-debug");

var respec = require("./generators/app/gulp-respec2html");

gulp.task('static', function() {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('nsp', function(cb) {
  // nsp({
  //   package: path.resolve('package.json')
  // }, cb);
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
    .pipe(respec("/Users/apowers/Projects/generator-fido-release/.fido-template"))
    .pipe(gulp.dest("."));
});

// for testing html2pdf
gulp.task('test-html2pdf', function(cb) {
  gulp.src(['.fido-template/*.html'])
    .pipe(respec("/Users/apowers/Projects/generator-fido-release/.fido-template"))
    .pipe(html2pdf())
    .pipe(gulp.dest("./tmp"));
});

// for testing the conversion of fido-refs.js
gulp.task('test-refs', function(cb) {
  var i, htmlFiles = ['fido-uaf-overview.html',
    'fido-uaf-protocol.html',
    'fido-uaf-client-api-transport.html',
    'fido-uaf-asm-api.html',
    'fido-uaf-authnr-cmds.html',
    'fido-uaf-reg.html',
    'fido-uaf-apdu.html',
    'fido-metadata-service.html',
    'fido-registry.html',
    'fido-appid-and-facets.html',
    'fido-security-ref.html',
    'fido-glossary.html'
  ];

  this.public = false;
  this.releaseDirectory = "fido-uaf-v1.0-wd-20160219";
  this.versionLabel = "-uaf-v1.0-wd-20160219";
  this.specset = "uaf";

  var localPath = "./";
  var publicPath = "https://fidoalliance.org/specs/";
  var newPath = ((this.public === true) ? (publicPath + this.releaseDirectory + "/") : localPath);
  console.log("New path:", newPath);

  i = 0;
  var fileNames = [];
  for (i = 0; i < htmlFiles.length; i++) {
    fileNames[i] = htmlFiles[i].substring(0, htmlFiles[i].length - 5);
  }
  var matchVersionLabel = "-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8}";
  // WARNING: BIG UGLY REGEX AHEAD
  // This RegEx attempts to update all filename and paths for the current spec release
  // Because of the diversity of paths and file names, this RegEx is complex
  // Here are some of the examples of paths it is trying to normalize:
  //     https://fidoalliance.org/specs/fido-uaf-v1.1-id-20150902/fido-appid-and-facets-v1.1-id-20150902.html
  //     https://fidoalliance.org/specs/fido-uaf-v1.1-id-20150902/fido-appid-and-facets-v1.1-id-20150902.pdf
  //     ./fido-appid-and-facets-v1.1-id-20150902.html
  //     http://fidoalliance.org/specs/fido-appid-and-facets-v1.1-id-20150902.html
  //     https://fidoalliance.org/specs/fido-uaf-v1.1-id-20150902/fido-appid-and-facets.html
  //     fido-appid-and-facets-v1.1-id-20150902.html
  //     fido-appid-and-facets-v1.1-id-20150902.pdf
  // This RegEx will eventually break, and I apologize to future generations that end up maintaining it
  // I would strongly recommend a service like https://regex101.com/ for developing and maintaing this RegEx
  // but I've attempted to document it below just so it's more clear how to make chagnes
  // refRegex = new RegExp("(((\\./|(http|https)://fidoalliance\\.org/specs/(fido-[\\w]+-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8}/)?)fido((?!-v\\d+\\.\\d+)-[\\w]+)+(-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8})?)|fido((?!-v\\d+\\.\\d+)-[\\w]+)+(-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8})?(\\.html|\\.pdf))", "g");
  refRegex = new RegExp(
    "(" + 
      "(" + 
        "(" + // this section matches the path, such as "http:// ..." or "./ ..." with all the variations of directories that may follow
           "\\./|" + // if the path matches a local file such as "./fido-appid-and-facets-v1.1-id-20150902.html" or ...
           "(http|https)://fidoalliance\\.org/specs/" + // it matches something like "http://fidoalliance.org/specs/" ...
           "(fido-[\\w]+-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8}/)?" + // maybe with a version label like "-v1.1-id-20150902" at the end to make a path like "https://fidoalliance.org/specs/fido-uaf-v1.1-id-20150902/"
        ")" + // this section matches the file name 
           "fido" + // the file name has to start with "fido"
           "((?!-v\\d+\\.\\d+)" + // look ahead to make sure we aren't matching a version label like "-v1.1-id-20150902"
           "-[\\w]+)+" + // but match anything that looks like "-word" such as "-uaf" or "-appid-and-facets"
           "(-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8})?" + // and maybe the file name has a version label at the end like "-v1.1-id-20150902"
        ")" +
        "|" + // or, if there isn't a "http:// ..." or "./ ..." path, maybe it's just a simple file name without a path. this matches just file names without paths
           "fido" + // the file name has to start with "fido"
           "((?!-v\\d+\\.\\d+)" + // look ahead to make sure we aren't matching a version label like "-v1.1-id-20150902"
           "-[\\w]+)+" + // but match anything that looks like "-word" such as "-uaf" or "-appid-and-facets"
           "(-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8})?" + // and maybe the file name has a version label at the end like "-v1.1-id-20150902"
           "(\\.html|\\.pdf))", // and the file should end in ".html" or ".pdf"
           "g"); // and do it globally
  console.log("Ref regex:", refRegex);

  gulp.src(['test/fixtures/resources/fido-refs.js'])
    .pipe(gulpDebug({
      title: 'refs:'
    }))
    .pipe(gulpReplace(refRegex, function(found) {
      // make sure the reference is one from this package -- we don't want to mess with references from other FIDO specs
      if (new RegExp(fileNames.join("|")).test(found)) {
        console.log(found, "is one of ours");
      } else {
        console.log("IGNORING: ", found);
        return (found);
      }
      // replace path
      found = found.replace(new RegExp("\\./|(http|https)://fidoalliance\\.org/specs/(fido-[\\w]+-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8}/)?", "g"), newPath);
      console.log("New Path:", found);
      // replace tag
      found = found.replace(new RegExp(matchVersionLabel, "g"), this.versionLabel);
      console.log("New Version Label:", found);
      // insert tag if not found
      if (found.match(matchVersionLabel) === null) {
        console.log("Should insert tag, but I don't know how yet...");
      }
      return (found);
    }.bind(this)))
    .pipe(gulp.dest("."));
});

gulp.task('prepublish', ['nsp']);
// gulp.task('default', ['static', 'test']);
gulp.task('default', ['test']);