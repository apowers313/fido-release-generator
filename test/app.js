//"use strict";
var path = require("path");
var assert = require("chai").assert;
var fsassert = require("yeoman-assert");
var helpers = require("yeoman-generator").test;
var mockery = require("mockery");
var fse = require("fs-extra");
var fs = require("fs");

var default_prompts = {
  cont: true,
  test: false,
  specset: "uaf",
  specversion: "1.0",
  specstatus: "wd",
  tagdate: "20160202",
  tagaddon: "",
  public: false
};
var expectedFolder = "fido-uaf-v1.0-wd-20160202";
var expectedFolderPath;
var templateFolderPath;
var fixturesPath = path.join(__dirname, "fixtures");

var default_arguments = {

};

function github_full_mock(repo, destPath, depth, cb) {
  var srcPath;

  switch (repo) {
    case "https://github.com/fido-alliance/uaf-specs":
      srcPath = path.join(fixturesPath, "uaf-specs");
      break;
    case "https://github.com/fido-alliance/common-specs":
      srcPath = path.join(fixturesPath, "common-specs");
      break;
    case "https://github.com/fido-alliance/resources":
      srcPath = path.join(fixturesPath, "resources");
      break;
    default:
      console.log("ERROR: unexpected github repo in test fixture mock");
  }

  // console.log ("Copying", srcPath, "to", destPath);
  fse.copy(srcPath, destPath, function(err) {
    return cb(err);
  });
}

function github_simple_mock(repo, destPath, depth, cb) {
  var srcPath;

  switch (repo) {
    case "https://github.com/fido-alliance/uaf-specs":
      srcPath = path.join(fixturesPath, "simple");
      break;
    case "https://github.com/fido-alliance/common-specs":
      srcPath = path.join(fixturesPath, "empty");
      break;
    case "https://github.com/fido-alliance/resources":
      srcPath = path.join(fixturesPath, "empty");
      break;
    default:
      console.log("ERROR: unexpected github repo in test fixture mock");
  }

  // console.log ("Copying", srcPath, "to", destPath);
  fse.copy(srcPath, destPath, function(err) {
    return cb(err);
  });
}

describe.only("simple transforms", function() {
  context("creating private files and links", function() {
    before(function(done) {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
      });
      mockery.registerMock("gift", {
        clone: github_simple_mock
      });
      // running the generator will do a `git clone` which may be slow, based on your location and connection speed
      this.timeout(30000);
      helpers.run(path.join(__dirname, "../generators/app"))
        // .withOptions({})
        .withPrompts(default_prompts)
        .on("end", function() {
          templateFolderPath = path.join(process.cwd(), "../.fido-template");
          console.log("Template Path:", templateFolderPath);
          expectedFolderPath = path.join(process.cwd(), "../" + expectedFolder);
          console.log("Destination Path:", expectedFolderPath);
          done();
        });
    });

    after(function() {
      mockery.disable();
    });

    it("has manifests", function() {
      fsassert.file([
        path.join(templateFolderPath, ".fido-manifest.json"),
        path.join(templateFolderPath, "common/.fido-manifest.json"),
        path.join(templateFolderPath, "resources/.fido-manifest.json")
      ]);
    });

    it("has source files", function() {
      fsassert.file([
        path.join(templateFolderPath, "simple.html"),
        path.join(templateFolderPath, "README.txt")
      ]);
    });

    it("copied files", function() {
      fsassert.file([
        path.join(expectedFolderPath, "simple-v1.0-wd-20160202.html"),
        path.join(expectedFolderPath, "README.txt")
      ]);
      fsassert.noFile([
        path.join(expectedFolderPath, ".fido-manifest.json"),
      ]);
    });

    it("modified URLs in HTML to be local", function() {
      var expectedSimpleFile = fs.readFileSync(path.join(fixturesPath, "simple-results/simple-local.html"), {
        encoding: "utf8"
      });
      fsassert.fileContent(path.join(expectedFolderPath, "simple-v1.0-wd-20160202.html"), expectedSimpleFile);
    });

    it("updated ReSpec variables", function() {
      var expectedRespecFile = fs.readFileSync(path.join(fixturesPath, "simple-results/respec.html"), {
        encoding: "utf8"
      });
      fsassert.fileContent(path.join(expectedFolderPath, "respec-v1.0-wd-20160202.html"), expectedRespecFile);
    });

    it("didn't modify URLs in README.txt", function() {
      var expectedReadmeFile = fs.readFileSync(path.join(fixturesPath, "simple-results/README.txt"), {
        encoding: "utf8"
      });
      fsassert.fileContent(path.join(expectedFolderPath, "README.txt"), expectedReadmeFile);

    });

    it("inlined JavaScript");

    it("created pdf", function() {
      fsassert.file([
        path.join(expectedFolderPath, "simple-v1.0-wd-20160202.pdf")
      ]);
    });

    it("created zip");
  });

  context("creating public files and links", function() {
    it("created public links");
  });
});

describe("generator-fido-release:app", function() {

  before(function(done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.registerMock("gift", {
      clone: github_full_mock
    });
    // running the generator will do a `git clone` which may be slow, based on your location and connection speed
    this.timeout(30000);
    helpers.run(path.join(__dirname, "../generators/app"))
      // .withOptions({})
      .withPrompts(default_prompts)
      .on("end", function() {
        expectedFolderPath = path.join(process.cwd(), "../" + expectedFolder);
        done();
      });
  });

  after(function() {
    mockery.disable();
  });

  this.timeout(2000);

  it("creates folder" + expectedFolder, function() {
    fsassert.file([
      expectedFolderPath
    ]);
  });

  it("creates files", function() {
    var file = path.join(expectedFolderPath, "fido-glossary.html");
    fsassert.file([
      file
    ]);
  });
});