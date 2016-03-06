module.exports = {
  vars: create_derived_vars,
  paths: set_paths,
  template: remove_existing,
  clone: clone_from_github,
  maifest: load_manifests,
  merge: merge_common
};

// translation table from 'this.answers.specset' to GitHub URL
var repos = {
  uaf: "https://github.com/fido-alliance/uaf-specs",
  u2f: "https://github.com/fido-alliance/u2f-specs.git",
  "fido-2": "https://github.com/fido-alliance/fido-2-specs",
  common: "https://github.com/fido-alliance/common-specs",
  resources: "https://github.com/fido-alliance/resources"
};

var git = require("gift");
var path = require("path");
var fse = require("fs-extra");
var _ = require("lodash");

function create_derived_vars() {
  this.versionLabel = "-" +
    "v" + this.answers.specversion + "-" +
    this.answers.specstatus + "-" +
    ((this.answers.tagaddon.length > 0) ? (this.answers.tagaddon + "-") : ("")) +
    this.answers.publishdate +
    "";
  this.releaseDirectory = this.tag =
    "fido" + "-" +
    this.answers.specset +
    this.versionLabel;
  this.log.debug("Release Directory:", this.releaseDirectory);

  switch (this.answers.specstatus) {
    case "wd":
      this.answers.specphrase = "Working Draft (Work in progress)";
      break;
    case "rd":
      this.answers.specphrase = "Review Draft (Work in progress)";
      break;
    case "id":
      this.answers.specphrase = "Implemenation Draft (Work in progress)";
      break;
    case "ps":
      this.answers.specphrase = "Proposed Standard";
  }

  this.test = this.answers.test;
}

function set_paths() {
  this.sourceRoot(this.defaultSourcePath);

  var path = this.destinationPath(this.releaseDirectory);
  this.log("Removing", path);
  fse.removeSync(path);
  this.destinationRoot(path); // will be created automatically

  this.log.debug("Template dir:", this.templatePath());
  this.log("Destination dir:", this.destinationPath());
}

function remove_existing() {
  this.log("Removing", this.templatePath());
  fse.removeSync(this.templatePath());
  this.log("Creating", this.templatePath());
  fse.mkdirsSync(this.templatePath());

  this.log("Removing ", this.destinationPath() + ".zip");
  fse.removeSync(this.destinationPath() + ".zip");
}

// release.pl: 250-273
function clone_from_github() {
  var thread_count = 0;

  var clone_github_sync = function(repo, dest) {
    var depth = 2;
    var done = this.async();
    this.log.debug("Cloning GitHub repo:", repo, "to", dest, "...");
    // console.log("Cloning GitHub repo:", repo, "to", dest, "...");
    thread_count++;

    git.clone(repo, dest, 0, function(err) {
      if (err) {
        this.log.error("FATAL ERROR: git clone: ", err);
        throw (err);
        process.exit(-1); // TODO: is there a way to skip to the clean-up / end?
      }

      --thread_count;
      this.log.debug("Done cloning", repo, "::", thread_count, "remaining ...");
      // console.log("Done cloning", repo, "::", thread_count, "remaining ...");
      if (thread_count === 0) {
        done();
      }
    }.bind(this));
  }.bind(this);

  this.log.debug("Setting template source to:" + this.defaultSourcePath + " ...");
  console.log("CWD", process.cwd());
  clone_github_sync(repos[this.answers.specset], this.templatePath());
  clone_github_sync(repos["resources"], this.templatePath("resources"));
  clone_github_sync(repos["common"], this.templatePath("common"));
}


function load_manifests() {
  this.coreManifest = require(this.templatePath(".fido-manifest.json"));
  this.commonManifest = require(this.templatePath("common/.fido-manifest.json"));
  this.resourcesManifest = require(this.templatePath("resources/.fido-manifest.json"));
}

// git.clone doesn't like to clone into the same directory, so we have to manually shuffle the files from the "common-specs" repo around
// XXX this is perhaps the one part of the program that makes the most assumptions of the file hierarchy in GitHub... but isn't that the point of "common"?
function merge_common() {
  fse.copySync(this.templatePath("common"), this.templatePath(), {
    clobber: true
  });
  fse.removeSync(this.templatePath("common"));

  this.coreManifest.files = _.union(this.coreManifest.files, this.commonManifest.files);
  this.coreManifest.templates = _.union(this.coreManifest.templates, this.commonManifest.templates);
  this.coreManifest.config = _.extend(this.coreManifest.config, this.commonManifest.config);
}