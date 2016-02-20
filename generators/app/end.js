module.exports = {
	zip: zip_dir,
	cleanup: remove_template,
	die: ungraceful_death
};

var fse = require("fs-extra");
var zipdir = require('zip-dir');
// var wtfnode = require("wtfnode");
// var pstree = require("ps-tree");
var terminate = require("terminate");

function remove_template() {
	// TODO: add this back in
	// fse.removeSync (this.templatePath());
}

// XXX die an ungraceful death because wkhtmltopdf processes are hanging
// see: https://github.com/igorzoriy/gulp-html2pdf/issues/2
function ungraceful_death() {
	// wtfnode.dump();
	// var done = this.async();
	// pstree(process.pid, function(err, children) {
	// 	children.map(function(proc) {
	// 		console.log("Killing Child:", proc.PID);
	// 		terminate(proc.PID, function(err, done) {
	// 			if (err) {
	// 				console.log("Oopsy: " + err);
	// 			} else {
	// 				console.log(done);
	// 			}
	// 		});
	// 	});
	// });

	// suicide is not the answer
	terminate(process.pid);
}

function zip_dir() {
	var done = this.async();

	zipdir(this.destinationPath(), {
		saveTo: this.destinationPath() + ".zip"
	}, function(err, buffer) {
		if (err) {
			this.log.error("Error zipping:", err);
			return;
		}
		this.log.debug("done zipping");
		done();
	}.bind(this));
}