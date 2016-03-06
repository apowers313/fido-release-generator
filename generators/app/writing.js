module.exports = {
	refs: update_refs,
	html: modify_html_files,
	pdf: create_pdfs,
	// txt: modify_text_files,
	copy: copy_files,
	commit: github_commit
};
// 
// TODO: there are probably some dead modules in here
var fse = require("fs-extra");
var path = require("path");
var gulpFilter = require("gulp-filter");
var gulpReplace = require("gulp-replace");
var gulpClone = require("gulp-clone");
var gulpRename = require("gulp-rename");
var gulpIf = require("gulp-if");
var through = require("through2");
var gulpDebug = require("gulp-debug");
var gulpRespec = require("./gulp-respec2html");
var gulpWkhtmltopdf = require("./gulp-wkhtmltopdf");

var isRespecFile = false;

// release.pl:358-513
function update_refs() {
	console.log ("CORE MANIFEST:\n", this.coreManifest);
	// just work on the fido-refs.js file
	var refsFilter = gulpFilter("resources/fido-refs.js", {
		restore: true
	});
	this.registerTransformStream(refsFilter);

	var i, fileNames;
	// make an array of HTML file name strings, and remove their ".html" ending
	fileNames = this.coreManifest.files
		.filter (function (element, index, array) {
			return (element.split('.').pop() === "html");
		})
		.map (function(element, index, array) {
			return (element.substring(0, element.length - 5));
		});

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
	this.log.debug("Ref regex:", refRegex);

	var matchVersionLabel = "-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8}"; // this just matches a version label like "-v1.1-id-20150902"

	this.registerTransformStream(gulpReplace(refRegex, function(found) {
		var localPath = "./";
		var publicPath = "https://fidoalliance.org/specs/";
		var newPath = ((this.public === true) ? (publicPath + this.releaseDirectory + "/") : localPath);
		var tmp, ext;

		// make sure the reference is one from this package -- we don't want to mess with references from other FIDO specs
		if (new RegExp(fileNames.join("|")).test(found)) {
			// this.log.debug(found, "is part of this spec set");
		} else {
			this.log.debug("IGNORING REFERENCE: ", found);
			return (found);
		}

		// replace path with our desired destination path
		found = found.replace(new RegExp("\\./|(http|https)://fidoalliance\\.org/specs/(fido-[\\w]+-v\\d+\\.\\d+-(wd|rd|id|ps)-\\d{8}/)?", "g"), newPath);
		// this.log.debug("New Path:", found);

		// replace version label with the most recent one
		found = found.replace(new RegExp(matchVersionLabel, "g"), this.versionLabel);
		// this.log.debug("New Version Label:", found);

		// insert tag if not found
		if (found.match(matchVersionLabel) === null) {
			tmp = found.split(".");

			// see if we have a file extension, which should end up after the version label
			ext = tmp.pop();
			if (ext != "html" || ext != "pdf") {
				tmp.push(ext);
				ext = null;
			}

			// add the version label to the end of the file
			tmp.push (this.versionLabel);

			// now add our file extension back
			if (ext !== null) {
				tmp.push(ext);
			}

			// put the pieces back together
			found = tmp.join(".");
		}
		return (found);
	}.bind(this)));

	// go back to working on all files
	this.registerTransformStream(refsFilter.restore);
}

// edit HTML, release.pl:622-671
function modify_html_files() {
	// only work on HTML files
	var htmlFilter = gulpFilter("**/*.html", {
		restore: true
	});
	this.registerTransformStream(htmlFilter);

	// update URLs in HTML files
	if (!this.answers.public) {
		this.registerTransformStream(gulpReplace(/href='https:\/\/fidoalliance.org\/specs\/[\w\d\-.]+\//g, "href='./"));
	} else {
		// TODO: public links
	}

	// Check to see if this is a respec HTML file
	this.registerTransformStream(through.obj(function(chunk, enc, cb) { // set isRespec to 'false'
		isRespecFile = false;
		cb(null, chunk);
	}));
	this.registerTransformStream(gulpReplace("respecConfig", function(string) { // if the HTML file contains 'respecConfig' it must be a respec files
		isRespecFile = true;
		return string;
	}));

	// Update respec variables
	this.registerTransformStream(gulpReplace(/specStatus:\s+"[\w]+"\s*,/g, "specStatus: \"" + this.answers.specstatus.toUpperCase() + "\","));
	this.registerTransformStream(gulpReplace(/specVersion:\s+"[v.\d]+"\s*,/g, "specVersion: \"v" + this.answers.specversion + "\","));
	this.registerTransformStream(gulpReplace(/specFamily:\s+"[\w\d]+"\s*,/g, "specFamily: \"" + this.answers.specset + "\","));
	var respecPublishDate = // convert date from 20161225 to 2016-12-25
		this.answers.publishdate.substring(0, 4) + "-" +
		this.answers.publishdate.substring(4, 6) + "-" +
		this.answers.publishdate.substring(6, 8);
	this.registerTransformStream(gulpReplace(/publishDate:\s+"[\d-]*",/g, "publishDate: \"" + respecPublishDate + "\","));

	// convert to static HTML, inline respec; runs: 
	// phantomjs --ignore-ssl-errors=true --ssl-protocol=any ./release-tool/respec2html.js ./$specSet-specs/$filename ./$rd/$fileNoExt-$versionLabel.html
	this.registerTransformStream(gulpIf(function() { // run all respec files through phantomjs for respec2html
		return isRespecFile;
	}, gulpRespec(this.templatePath())));

	// Rename file
	this.registerTransformStream(gulpRename({
		suffix: this.versionLabel
	}));

	// go back to working on all files
	this.registerTransformStream(htmlFilter.restore);
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
		// console.log("Copying", src, "to", dst, "...");

		this.fs.copy(src, dst);
	}
	// TODO: merge config, then copy templates with applied config
	// needs discussion with group about use of EJS
}

// release.pl: 285-329
function copy_files() {
	this.log.debug("Copying files from spec manifest...");
	copy_manifest_files.call(this, this.coreManifest, ".");
	this.log.debug("Copying files from resources manifest...");
	copy_manifest_files.call(this, this.resourcesManifest, "resources");
}

// UAF, release.pl:687-745
// U2F, release.pl:746-779

// Done via manifest file:
// release.pl: 275-279
// release.pl:781-784

// release.pl:673-685
function create_pdfs() {
	// only work on HTML files
	var filter = gulpFilter("**/*.html", {
		restore: true
	});
	this.registerTransformStream(filter);

	// this.registerTransformStream (gulpDebug({title: "PDF in"}));

	// duplicate HTML files to convert them to PDF files
	var cloneSink = gulpClone.sink();
	this.registerTransformStream(cloneSink);

	// // do the conversion from HTML to PDF
	this.registerTransformStream(gulpWkhtmltopdf({
			htmlPath: this.templatePath(),
			wkhtmltopdfArgs: ["--user-style-sheet", __dirname + "/bugfix.css"]
		}));

	// // put our old HTML files back into the stream
	this.registerTransformStream(cloneSink.tap());

	// this.registerTransformStream (gulpDebug({title: "PDF out"}));
	// this.log("Removing", this.templatePath());
	// fse.removeSync(this.templatePath());
	// this.log("Creating", this.templatePath());
	// fse.mkdirsSync(this.templatePath());
  
	// go back to working on all files
	this.registerTransformStream(filter.restore);
}

// release.pl:786-842
function github_commit() {

}