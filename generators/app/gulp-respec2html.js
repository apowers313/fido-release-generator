// XXX: someday this might be refactored into its own NPM module

// inspired by https://github.com/cognitom/gulp-phantom

var spawn = require("child_process").spawn;
var path = require("path");
var through = require("through2");
var gutil = require("gulp-util");
var phantomjs = require("phantomjs-prebuilt");
var uuid = require("uuid");
var fs = require("fs");

// var command = path.join(__dirname, "../../node_modules/.bin/phantomjs");
var command = phantomjs.path;
var phantom_script = path.join(__dirname, "./respec2html.js");
var srcPath;

var PLUGIN_NAME = "gulp-respec2html";

module.exports = function(pathIn) {
	srcPath = pathIn;

	return through.obj(function(file, encoding, callback) {

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			this.emit("error", new gutil.PluginError(PLUGIN_NAME, "Streaming not supported"));
			return callback();
		}

		var origCwd = process.cwd();
		// need to make sure that we are in the right directory so that phantomjs picks up any JavaScript includes from their relative paths
		process.chdir (srcPath);

		// sadly, phantomjs doesn't seem to accept opening a page from stdin very well
		// here we create a temporary file and write out the contents of our file to it so that it can be passed into phantomjs
		// this destroys some of the efficency of gulp, but the phantomjs processing is an order of magnitude longer than writing the file to disk
		sourceFile = path.join (srcPath, uuid.v4() + ".html"); 
		console.log ("Tempfile is:", sourceFile);
		fs.writeFileSync(sourceFile, file.contents);

		// call `phantomjs --ignore-ssl-errors=true --ssl-protocol=any respec2html.js <inputfile>`
		// phantomjs stdout to be collected below and piped to next gulp plugin
		
		// var sourceFile = path.join (srcPath, path.parse(file.path).base);

		
		var args = [];
		// console.log ("Calling: `" + command + " --ignore-ssl-errors=true --ssl-protocol=any " + phantom_script + " " + sourceFile + "`");
		args.push("--ignore-ssl-errors=true");
		args.push("--ssl-protocol=any");
		args.push(phantom_script);
		args.push(sourceFile);
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
				// todo: remove sourceFile
				return callback(null, file);
			};
		})(this));
	});
};