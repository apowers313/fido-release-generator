// TODO: require ("update-notifier");

module.exports = {
  debug: function() {
    this.log = console.log;
    this.log.debug = console.log;
    // if (this.options.debug) {
    //   this.log.debug = this.log;
    // } else {
    //   this.log.debug = function() {};
    // }
    // this.log.warn = this.log;
    // this.log.error = this.log;
    this.log.debug("Initializing...");
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
    this.defaultSourcePath = "./.fido-template";
    this.defaultDestinationPath = ".";
  }
};