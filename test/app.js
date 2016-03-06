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
  publishdate: "20160202",
  tagaddon: "",
  public: false
};

var default_arguments = {};

var expectedFolder = "fido-uaf-v1.0-wd-20160202";
var expectedFolderPath;
var templateFolderPath;
var fixturesPath = path.join(__dirname, "fixtures");

function github_full_mock(repo, destPath, depth, cb) {
  var srcPath;
  console.log("github_full_mock");

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

  console.log("Copying", srcPath, "to", destPath);
  fse.copy(srcPath, destPath, function(err) {
    return cb(err);
  });
}

function github_simple_mock(repo, destPath, depth, cb) {
  var srcPath;
  console.log("github_simple_mock");

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

  console.log("Copying", srcPath, "to", destPath);
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
      mockery.deregisterAll();
      mockery.disable();
      // console.log("Deleting:", templateFolderPath);
      // fse.removeSync(templateFolderPath);
      // console.log("Deleting:", expectedFolderPath);
      // fse.removeSync(expectedFolderPath);
      // console.log("Deleting:", expectedFolderPath + ".zip");
      // fse.removeSync(expectedFolderPath + ".zip");
    });

    it("has manifests", function() {
      fsassert.file([
        path.join(templateFolderPath, ".fido-manifest.json"),
        // path.join(templateFolderPath, "common/.fido-manifest.json"),
        path.join(templateFolderPath, "resources/.fido-manifest.json")
      ]);
    });

    it("merges manifests correctly");

    it("has source files", function() {
      fsassert.file([
        path.join(templateFolderPath, "simple.html"),
        path.join(templateFolderPath, "README.txt")
      ]);
    });

    it("creates folder" + expectedFolder, function() {
      fsassert.file([
        expectedFolderPath
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

    it("updated ReSpec variables and inlined JavaScript", function() {
      var expectedRespecFile = fs.readFileSync(path.join(fixturesPath, "simple-results/respec.html"), {
        encoding: "utf8"
      });
      fsassert.fileContent(path.join(expectedFolderPath, "respec-v1.0-wd-20160202.html"), expectedRespecFile);
    });

    it.skip("didn't modify URLs in README.txt", function() {
      var expectedReadmeFile = fs.readFileSync(path.join(fixturesPath, "simple-results/README.txt"), {
        encoding: "utf8"
      });
      fsassert.fileContent(path.join(expectedFolderPath, "README-v1.0-wd-20160202.txt"), expectedReadmeFile);
    });

    it("created individual PDFs", function() {
      fsassert.file([
        path.join(expectedFolderPath, "simple-v1.0-wd-20160202.pdf")
      ]);
    });

    it("updated fido-refs.js");

    it("PDFs use bugfix.css");

    it("created combined PDF");

    it("doesn't create conditional manifest files");

    it("does create conditional manifest files");

    it("created zip", function() {
      fsassert.file([
        path.join(expectedFolderPath + ".zip")
      ]);
    });

    it("zip contains right files");

    it("updated GitHub");
  });

  context("creating public files and links", function() {
    it("created public links");
  });
});

describe("full UAF file set", function() {

  before(function(done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.registerMock("gift", {
      clone: github_full_mock
    });
    // running the generator will create a lot of PDFs, which is really slow...
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
    mockery.deregisterAll();
    mockery.disable();
    // console.log("Deleting:", templateFolderPath);
    // fse.removeSync(templateFolderPath);
    // console.log("Deleting:", expectedFolderPath);
    // fse.removeSync(expectedFolderPath);
    // console.log("Deleting:", expectedFolderPath + ".zip");
    // fse.removeSync(expectedFolderPath + ".zip");
  });

  it("creates folder" + expectedFolder, function() {
    fsassert.file([
      expectedFolderPath
    ]);
  });

  it("creates files", function() {
    fsassert.file([
      path.join(expectedFolderPath, "fido-uaf-overview-v1.0-wd-20160202.html"),
      path.join(expectedFolderPath, "fido-uaf-overview-v1.0-wd-20160202.pdf")
    ]);
  });

  it("creates PDFs");

  it("has right-sized PDFs");
});