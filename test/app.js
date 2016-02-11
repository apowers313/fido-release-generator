//'use strict';
var path = require('path');
// var assert = require("chai");
var fsassert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

var default_prompts = {
  cont: true,
  test: false,
  specset: "uaf",
  specversion: '1.0',
  specstatus: 'wd',
  tagdate: "20160202",
  tagaddon: ""
};
var expectedFolder = "fido-uaf-v1.0-wd-20160202";
var expectedFolderPath;

var default_arguments = {

};

describe('generator-fido-release:app', function() {

  before(function(done) {
    // running the generator will do a `git clone` which may be slow, based on your location and connection speed
    this.timeout(120000);
    helpers.run(path.join(__dirname, '../generators/app'))
      // .withOptions({})
      .withPrompts(default_prompts)
      .on('end', function() {
        expectedFolderPath = path.join(process.cwd(), "../" + expectedFolder);
        done();
      });
  });

  this.timeout(2000);

  it('creates folder ' + expectedFolder, function() {
    fsassert.file([
      expectedFolderPath
    ]);
  });

  it('creates files', function() {
    var file = path.join(expectedFolderPath, 'fido-glossary.html');
    fsassert.file([
      file
    ]);
  });
});