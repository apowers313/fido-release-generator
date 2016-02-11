module.exports = {
	clean: clean_directory,
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
};

var commonManifest = {
	files: [
	],
	templates: [],
	config: {}
};

var fse = require ("fs-extra");
var path = require("path");
// require ("nodegit");

// release.pl: 213-248
function clean_directory() {
	this.log.debug("Cleaning directory...");
	
	// don't remove files if just testing
	if (this.test) {
		this.log.warn("TEST: not removing files from current directory");
		return;
	}

	// this.log("Removing", this.templatePath());
	// fse.removeSync (this.templatePath());

	this.log.debug("Destination directory: " + this.destinationPath() + " ...");
	fse.removeSync (this.destinationPath());

	// check if release dir exists

	// remove <sepc>-specs
	// remove common-specs
	// remove resources
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