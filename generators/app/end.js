module.exports = {
	zip: zip_dir,
	cleanup: remove_template,
};

var fse = require("fs-extra");
var zipdir = require('zip-dir');

function remove_template() {
	// TODO: add this back in
	fse.removeSync (this.templatePath());
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
		this.log ("done creating", this.destinationPath() + ".zip");
		done();
	}.bind(this));
}