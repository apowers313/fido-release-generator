module.exports = {
	clean: clean_directory,
	clone: clone_from_github,
	refs: update_refs,
	html: modify_html_files,
	copy: copy_files,
	copy_common: copy_common_files,
	pdf: create_pdfs,
	zip: create_zip,
	commit: github_commit
};

var uafManifest = {
	files: [
		"fido-uaf-README.txt",
		"fido-uaf-overview.html",
		"fido-uaf-protocol.html",
		"fido-uaf-client-api-transport.html",
		"fido-uaf-asm-api.html",
		"fido-uaf-authnr-cmds.html",
		"fido-metadata-statement.html", // common
		"fido-metadata-service.html", // common
		"fido-uaf-reg.html",
		"fido-registry.html", // common
		"fido-appid-and-facets.html", // common
		"fido-security-ref.html", // common
		"fido-glossary.html", // common
		"fido-uaf-apdu.html", // added
		"img",
	],
	templates: [],
	config: {}
};

// resources/FIDO-$specStatusUC.css
// resources/blueprint-dark.png
//copy ./resources/logo.png <tag>
//copy ./resources/respec-fido-common.js
//copy ./resources/spec-logo.png
//if !ps copy ./resources/draftBkgd.png
var resourcesManifest = {
	files: [
		"logo.png",
		"respec-fido-common.js",
		"spec-logo.png"
	],
	templates: [],
	config: {}
}

var commonManifest = {
	files: [
	],
	templates: [],
	config: {}
}

// TODO cleanup
// var mkdir = require("mkdirp");
// var rm = require("rimraf");

var fse = require ("fs-extra");
var git = require("gift");
var path = require("path");
// require ("nodegit");

// translation table from 'this.answers.specset' to GitHub URL
var repos = {
	uaf: "https://github.com/fido-alliance/uaf-specs",
	u2f: "https://github.com/fido-alliance/u2f-specs.git",
	"fido-2": "https://github.com/fido-alliance/fido-2-specs",
	common: "https://github.com/fido-alliance/common-specs",
	resources: "https://github.com/fido-alliance/resources"
};

// release.pl: 213-248
function clean_directory() {
	this.log.debug("Cleaning directory...");
	// don't remove files if just testing
	if (this.test) {
		this.log.warn("TEST: not removing files from current directory");
		return;
	}

	this.log("Removing", this.defaultSourcePath);
	fse.removeSync (this.defaultSourcePath);

	var path = this.destinationPath(this.tag);
	fse.removeSync (path);
	this.log.debug("Destination directory: " + path + " ...");
	this.destinationRoot(path); // will be created automatically

	// TODO cleanup
	// var done = this.async();
	// rm(this.defaultSourcePath, function(err) {
	// 	if (err) {
	// 		this.log.warn(err);
	// 	}
	// 	done();
	// }.bind(this));

	// check if release dir exists

	// remove <sepc>-specs
	// remove common-specs
	// remove resources
}


// release.pl: 250-273
function clone_from_github() {
	var thread_count = 0;
	var clone_github_sync = function (repo, dest) {
		var depth = 2;
		var done = this.async();
		this.log.debug("Cloning GitHub repo:", repo, "to", dest, "...");
		thread_count++;

		git.clone(repo, dest, 0, function(err) {
			if (err) {
				this.log.error("FATAL ERROR: git clone: ", err);
				throw (err);
				// process.exit(-1); // TODO: is there a way to skip to the clean-up / end?
			}

			--thread_count;
			this.log.debug ("Done cloning", repo, "::", thread_count, "remaining ...");
			if (thread_count == 0) {
				// git.clone doesn't like to clone into the same directory, so we have to manually shuffle the files from the "common-specs" repo around
				fse.copySync (this.templatePath("common"), this.templatePath());
				fse.removeSync (this.templatePath("common"));
				done();
			}
		}.bind(this));
	}.bind(this);

	this.log.debug("Setting template source to:" + this.defaultSourcePath + " ...");
	this.sourceRoot(this.defaultSourcePath);
	clone_github_sync(repos[this.answers.specset], this.templatePath());
	clone_github_sync(repos["resources"], this.templatePath("resources"));
	clone_github_sync(repos["common"], this.templatePath("common"));
}

// edit HTML, release.pl:622-671
function modify_html_files() {
	// $data =~ s/specStatus:\s+"[\w]+",/specStatus: "$specStatusUC",/g;
	// $data =~ s/specVersion:\s+"[v.\d]+"\s+,/specVersion: "$targetVersion",/g;
	// $data =~ s/specFamily:\s+"[\w\d]+"\s+,/specFamily: "$specSet",/g;
	// $data =~ s/publishDate:\s+"[\d-]*",/publishDate: "$publishYear-$publishMonth-$publishDay",/g;
	// convert to static HTML
	// phantomjs --ignore-ssl-errors=true --ssl-protocol=any ./release-tool/respec2html.js ./$specSet-specs/$filename ./$rd/$fileNoExt-$versionLabel.html
}

function copy_manifest_files (manifest, path) {
	if (manifest === undefined) return;

	// copy based on manifest
	var files = manifest.files;
	var file, src, dst, i;

	this.log.debug("Copying", files.length, "files...");
	this.log.debug(files);

	for (i = 0; i < files.length; i++) {
		file = files[i];
		src = this.templatePath(path + "/" + file);
		// dst = this.destinationPath(path + "/" + file);
		dst = this.destinationPath(path + "/" + file);
		this.log.debug("Copying", src, "to", dst, "...");

		this.fs.copy(src, dst);
	}
	// TODO: merge config, then copy templates with applied config
	// needs discussion with group about use of EJS
}

// release.pl: 285-329
function copy_files() {
	this.log.debug ("Copying files from spec manifest...");
	copy_manifest_files.call (this, uafManifest, ".");
	this.log.debug ("Copying files from resources manifest...");
	copy_manifest_files.call (this, resourcesManifest, "resources");
}

function copy_common_files() {
	// this.registerTransformStream(beautifyFilter);
	// this.registerTransformStream(beautify());
	// this.registerTransformStream(beautifyFilter.restore)

	// # now we need to edit $rd/resources/fido-refs.js such that it contains the
	// # correct verbage for the 'specStatusPhrase' and also has correct filenames
	// # having versionLabel appended...
	// TODO: fido-refs.js filter
	// # we can use just a single line of code here to edit ALL the occurances of "specStatusPhrase"
	// # in the file because of the magic "g" switch meaning "global"...
	// $refsData =~ s/specStatusPhrase/$specStatusPhrase/g;

	// http://yeoman.io/authoring/file-system.html
	// var beautify = require('gulp-beautify');
	// this.registerTransformStream(beautify({indentSize: 2 }));
	//https://github.com/robrich/gulp-if
	//https://github.com/sindresorhus/gulp-filter

	this.log.debug ("Copying files from common manifest...");
	copy_manifest_files.call (this, commonManifest, "common");
}

// UAF, release.pl:687-745
// U2F, release.pl:746-779

// Done via manifest file:
// release.pl: 275-279
// release.pl:781-784

// release.pl:358-513
function update_refs() {

}

// release.pl:673-685
function create_pdfs() {

}

// release.pl:
function create_zip() {

}

// release.pl:786-842
function github_commit() {

}