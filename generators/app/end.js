module.exports = {
	bigpdf: create_complete_pdf,
	zip: zip_dir,
	cleanup: remove_template,
};

var fse = require("fs-extra");
var zipdir = require('zip-dir');
var wkhtmltopdf = require("wkhtmltopdf-installer");
var spawn = require("child_process").spawn;

// build the complete PDF file like FIDO-UAF-COMPLETE-v1.0-wd-20160229.pdf
// this has to be done at the end because all the other .html files that 
// are included in it need to be created first
function create_complete_pdf() {
	var args = [];
	var command = wkhtmltopdf.path;
	var done = this.async();

	// wkhtmltopdf toc --xsl-style-sheet ./release-tool/fido-wkhtmltopdf-toc.xsl --user-style-sheet ./release-tool/bugfix.css {{files}}
	args.push("toc");
	args.push("--xsl-style-sheet");
	args.push(__dirname + "/fido-wkhtmltopdf-toc.xsl");
	args.push("--user-style-sheet");
	args.push(__dirname + "/bugfix.css");

	// make a list of .html and .txt files
	var fileNames = this.coreManifest.files
		.filter(function(element, index, array) {
			if (element.match(/fido-metadata-statement/)) return false; // TODO XXX: is causing an "unknown protocol error" in wkhtmltopdf, probably because of the TeX .js
			if (element.split('.').pop() === "html") {
				return true;
			}

			// TODO
			// if (element.split('.').pop() === "txt") {
			// 	return true;
			// }

			return false;
		});

	// create args from manifest
	var i, filename;
	for (i = 0; i < fileNames.length; i++) {
		filename = fileNames[i].replace(/(\.txt|\.html)$/, this.versionLabel + "$1");
		this.log.debug ("filename:", filename);
		args.push("file://" + this.destinationPath(filename));
		// args.push("./" + this.releaseDirectory + "/" + filename);
	}

	// output filename
	args.push(this.destinationPath() + "/FIDO-" + this.answers.specset.toUpperCase() + "-COMPLETE" + this.versionLabel + ".pdf");

	// wkhtml to pdf
	this.log.debug (command);
	this.log.debug (args);
	var program = spawn(command, args);

	// exit? done? close?
	program.on("exit", function(code) {
		this.log  ("wkhtmltopdf completed with code:", code);
		done();
	}.bind(this));
	program.stdout.on('data', function(data) {
		console.log(data.toString());
	}.bind(this));
	program.stderr.on('data', function(data) {
		console.log(data.toString());
	}.bind(this));
}

// create a new directory of the release dir, like fido-uaf-v1.0-wd-20160229.zip
function zip_dir() {
	var done = this.async();

	zipdir(this.destinationPath(), {
		saveTo: this.destinationPath() + ".zip"
	}, function(err, buffer) {
		if (err) {
			this.log.error("Error zipping:", err);
			return;
		}
		this.log("Done creating", this.destinationPath() + ".zip");
		done();
	}.bind(this));
}

// remove the template directory that stored all the original GitHub files -- we don't need it anymore
function remove_template() {
	// this.log.debug ("Removing", this.templatePath());
	// fse.removeSync(this.templatePath());
}