// XXX: someday this might be refactored into its own NPM module

// inspired by https://github.com/cognitom/gulp-html2pdf

var spawn = require("child_process").spawn;
var path = require("path");
var through = require("through2");
var gutil = require("gulp-util");
var wkhtmltopdf = require("wkhtmltopdf-installer");
var uuid = require("uuid");
var fs = require("fs");
var gutil = require('gulp-util');

var command = wkhtmltopdf.path;
var srcPath;

var PLUGIN_NAME = "gulp-wkhtmltopdf";

module.exports = function(opts) {
	if (opts === undefined) opts = {};
	srcPath = opts.htmlPath;
	if (srcPath === undefined) srcPath = ".";
	var wkhtmltopdfArgs = opts.wkhtmltopdfArgs;

	return through.obj(function(file, encoding, callback) {

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			this.emit("error", new gutil.PluginError(PLUGIN_NAME, "Streaming not supported"));
			return callback();
		}

		file.path = gutil.replaceExtension(file.path, '.pdf');

		// need to make sure that we are in the right directory so that wkhtmltopdf picks up any JavaScript includes from their relative paths
		var origCwd = process.cwd();
		process.chdir (srcPath);

		// sadly, wkhtmltopdf doesn't seem to accept opening a page from stdin very well
		// here we create a temporary file and write out the contents of our file to it so that it can be passed into wkhtmltopdf
		// this destroys some of the efficency of gulp, but the wkhtmltopdf processing is an order of magnitude longer than writing the file to disk
		sourceFile = path.join (srcPath, uuid.v4() + ".html"); 
		fs.writeFileSync(sourceFile, file.contents);

		// call `wkhtmltopdf --ignore-ssl-errors=true --ssl-protocol=any respec2html.js <inputfile>`
		// wkhtmltopdf stdout to be collected below and piped to next gulp plugin
		
		// var sourceFile = path.join (srcPath, path.parse(file.path).base);

		
		var args = [];
		args.push("--quiet");
		if (wkhtmltopdfArgs !== undefined) args = args.concat(wkhtmltopdfArgs);
		args.push(sourceFile);
		args.push("-");
		// console.log (command, args);
		var program = spawn(command, args, {
			// TODO: cwd here
			// cwd: srcPath
		});

		// TODO: check for file.dirname + resources/respec-fido-common.js exists

		// collect output and send to next gulp plugin
		var b = new Buffer(0);
		program.stdout.on("readable", (function(_this) {
			return function() {
				var chunk;
				var _results = [];
				while (chunk = program.stdout.read()) {
					_results.push(b = Buffer.concat([b, chunk], b.length + chunk.length));
				}
				return _results;
			};
		})(this));
		program.stdout.on("end", (function(_this) {
		// program.on("done", (function(_this) {
			return function() {
				file.contents = b;
				process.chdir (origCwd);
				// fs.unlinkSync (sourceFile);
				return callback(null, file);
			};
		})(this));
	});
};