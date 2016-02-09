var gitConfig = require("git-config");

// TODO: read manifest file
// TODO: require ("update-notifier");

module.exports = {
    debug: function() {
      this.log.debug = this.log;
      this.log.warn = this.log;
      this.log.error = this.log;
      this.log.debug("Initializing...");
    },

    // TODO: remove gitConfig?
    gitConfig: function() {
      var done = this.async();

      // check local directory for a git repo, use those settings if available
      var pathToRepo = require("path").resolve("./.git");
      this.log.debug("Path to repo: ", pathToRepo);

      // get info from the local git config file
      gitConfig(function(err, config) {
        if (err) {
          if (err instanceof Error) throw err;
          this.log.error("Git config error: " + err);
        }
        this.default_git_username = config.user.name;
        this.log.debug("Default Git Username: " + this.default_git_username);
        this.default_git_email = config.user.email;
        this.log.debug("Default Git Email: ", this.default_git_email);
        done();
      }.bind(this));
    },

    dateTag: function() {
      var d = new Date();
      var yyyy = d.getFullYear().toString();
      var mm = (d.getMonth() + 1).toString();
      mm = (mm[1] ? mm : "0" + mm[0]); // padding
      var dd = d.getDate().toString();
      dd = (dd[1] ? dd : "0" + dd[0]); // padding
      this.def_date_tag = yyyy + mm + dd;
      this.log.debug("Date tag:", this.def_date_tag);
    },

    defaultPaths: function() {
      this.defaultSourcePath = "./.fidoTemplate";
      this.defaultDestinationPath = ".";
    }
  };