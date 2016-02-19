module.exports = {
	cleanup: remove_template,
	zip: zip_dir
};

var fse = require("fs-extra");
var zipdir = require('zip-dir');

function remove_template() {
	// TODO: add this back in
	// fse.removeSync (this.templatePath());
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
		this.log.debug ("done zipping");
		done();
	}).bind(this);
}