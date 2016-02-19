module.exports = main_questions;

function main_questions() {
	var done = this.async();

	// For details on how to use the prompting API, see:
	// https://github.com/SBoudrias/Inquirer.js
	this.prompt([{
				message: "Would you like to continue?",
				type: "confirm",
				name: "cont",
				default: true
			},

			{
				message: "Would you like to perform a dry-run?",
				// don't continue if answer to "Continue?" was false
				when: function(answers) {
					if (answers.cont !== true) {
						this.log.error("Bummer!");
						process.exit();
					}

					return true;
				}.bind(this),
				type: "confirm",
				name: "test",
				default: false, // TODO: BAD DEFAULT, FOR DEVELOPMENT ONLY
				validate: function(bool) {
					if (bool === false) {
						this.log.warn("WARNING! WARNING! WARNING!");
						this.log.warn("You are performing an actual release. Changes will be pushed to GitHub.");
						this.log.warn("WARNING! WARNING! WARNING!");
					}
					return true;
				}
			},

			{
				message: "Spec set family to release?",
				type: "list",
				name: "specset",
				choices: [ // User friendly strings for prompt
					"UAF",
					"U2F",
					"FIDO 2.0"
				],
				filter: function(str) { // convert user friendly strings to our desired format
					switch (str) {
						case "UAF":
							return "uaf";
						case "U2F":
							return "u2f";
						case "FIDO 2.0":
							return "fido-2";
					}
				}
			},

			{
				message: "What is the target version?",
				type: "input",
				name: "specversion",
				default: "1.0"
					// TODO: validate
			},

			{
				message: "What is the spec status?",
				type: "list",
				name: "specstatus",
				choices: [
					"Working Draft (Work in progress)",
					"Review Draft (Work in progress)",
					"Implemenation Draft (Work in progress)",
					"Proposed Standard"
				],
				filter: function(str) { // convert user friendly strings to our desired format
					switch (str) {
						case "Working Draft (Work in progress)":
							return "wd";
						case "Review Draft (Work in progress)":
							return "rd";
						case "Implemenation Draft (Work in progress)":
							return "id";
						case "Proposed Standard":
							return "ps";
					}
				}
			},

			{
				message: "What publishing date would you like to use?",
				type: "input",
				name: "publishdate",
				default: this.def_date_tag
					// TODO: validate
			},

			{
				message: "Add any additional tag descriptors (leave blank for none)",
				type: "input",
				name: "tagaddon",
				default: ""
			},

			{
				message: "Will this be published to public fidoalliance.org website? (Use global URLs or local paths)",
				type: "confirm",
				name: "public",
				default: false
			},

			// TODO: select files from directory; defaults based on manifest
			// TODO: public release?

		],

		// TODO
		// "github account to use? " when !test
		// "You entered: $githubAcnt  -- is that correct? [N]: "
		// "Are you ready to proceed with generating the fido-$specSet-$versionLabel spec set crafted for "

		function(answers) {
			this.log.debug("Your configuration:");
			this.log.debug(answers);
			// this.log.debug(answers.cont);
			// this.log.debug(answers.specset);
			this.answers = answers;
			done();
		}.bind(this));
}