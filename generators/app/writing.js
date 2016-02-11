module.exports = {
	clean: clean_directory,
	maifest: load_manifests,
	refs: update_refs,
	html: modify_html_files,
	// txt: modify_text_files,
	copy: copy_files,
	copy_common: copy_common_files,
	pdf: create_pdfs,
	zip: create_zip,
	commit: github_commit
};

var fse = require("fs-extra");
var path = require("path");
var gulpFilter = require("gulp-filter");
var gulpReplace = require("gulp-replace");
var gulpClone = require("gulp-clone");
var gulpHtmlToPdf = require("gulp-html-pdf");
var gulpRename = require("gulp-rename");

var coreManifest;
var resourcesManifest;
var commonManifest;

// release.pl: 213-248
function clean_directory() {
	this.log.debug("Cleaning directory...");

	// don't remove files if just testing
	if (this.test) {
		this.log.warn("TEST: not removing files from current directory");
		return;
	}

	// TODO: check if release dir exists
	this.log.debug("Destination directory: " + this.destinationPath() + " ...");
	fse.removeSync(this.destinationPath());
}

function load_manifests() {
	coreManifest = require(this.templatePath(".fido-manifest.json"));
	// console.log ("coreManifest");
	// console.log (coreManifest);

	commonManifest = require(this.templatePath("common/.fido-manifest.json"));
	// console.log ("commonManifest");
	// console.log (commonManifest);

	resourcesManifest = require(this.templatePath("resources/.fido-manifest.json"));
	// console.log ("resourcesManifest");
	// console.log (resourcesManifest);
}

// edit HTML, release.pl:622-671
function modify_html_files() {
	// only work on HTML files
	var filter = gulpFilter("**/*.html", {
		restore: true
	});
	this.registerTransformStream(filter);

	// update URLs in HTML files
	if (!this.answers.public) {
		this.registerTransformStream(gulpReplace(/href='https:\/\/fidoalliance.org\/specs\/[\w\d\-.]+\//g, "href='./"));
	} else {
		// TODO: public links
	}

	// TODO: update ReSpec params
	// $data =~ s/specStatus:\s+"[\w]+",/specStatus: "$specStatusUC",/g;
	// $data =~ s/specVersion:\s+"[v.\d]+"\s+,/specVersion: "$targetVersion",/g;
	// $data =~ s/specFamily:\s+"[\w\d]+"\s+,/specFamily: "$specSet",/g;
	// $data =~ s/publishDate:\s+"[\d-]*",/publishDate: "$publishYear-$publishMonth-$publishDay",/g;

	// TODO: convert to static HTML
	// phantomjs --ignore-ssl-errors=true --ssl-protocol=any ./release-tool/respec2html.js ./$specSet-specs/$filename ./$rd/$fileNoExt-$versionLabel.html

	// Rename file
	this.registerTransformStream(gulpRename({
		suffix: this.versionLabel
	}));

	// go back to working on all files
	this.registerTransformStream(filter.restore);
}

function modify_text_files() {
	// only work on text files
	var filter = gulpFilter("**/*.txt", {
		restore: true
	});

	// go back to working on all files
	this.registerTransformStream(filter.restore);
}

function copy_manifest_files(manifest, path) {
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
	this.log.debug("Copying files from spec manifest...");
	copy_manifest_files.call(this, coreManifest, ".");
	this.log.debug("Copying files from resources manifest...");
	copy_manifest_files.call(this, resourcesManifest, "resources");
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

	this.log.debug("Copying files from common manifest...");
	copy_manifest_files.call(this, commonManifest, "common");
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
	// only work on HTML files
	var filter = gulpFilter("**/*.html", {
		restore: true
	});
	this.registerTransformStream(filter);

	// duplicate HTML files to convert them to PDF files
	var cloneSink = gulpClone.sink();
	this.registerTransformStream(cloneSink);

	// do the conversion from HTML to PDF
	this.registerTransformStream(gulpHtmlToPdf());

	// put our old HTML files back into the stream
	this.registerTransformStream(cloneSink.tap());

	// go back to working on all files
	this.registerTransformStream(filter.restore);
}

// release.pl:
function create_zip() {

}

// release.pl:786-842
function github_commit() {

}