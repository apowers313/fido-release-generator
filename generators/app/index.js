var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

/****
 * This is the general framework of a Yeoman generator
 * See this URL for details:
 *   http://yeoman.io/authoring/running-context.html
 *
 * Each part of our generator has been broken out into a separate file to help with read-ability
 */
module.exports = yeoman.generators.Base.extend({
  constructor: function() {
    yeoman.generators.Base.apply(this, arguments);
      this.option("debug", {
        desc: "Display debug messages",
        type: Boolean,
        defaults: false
      });
    },

  initializing: require("./initializing"),

  prompting: {
    welcome: welcome,
    main: require("./questions"),
    uaf: require("./questions-uaf"),
    u2f: require("./questions-u2f"),
    fido2: require("./questions-fido-2"),
  },
  configuring: require("./configure"),
  default: function() {},

  writing: require ("./writing"),

  install: function() {},
  end: require ("./end")
});

function welcome() {
  this.log(fido_banner());
  this.log("Welcome to the FIDO Specification Release Tool!");
  this.log("This is the welcome message. TODO.\n\n");
}

function fido_banner() {
  return "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "               ;+++++++++`                 .,,,,,                                   \n" +
    "             `+++++++++++.                 .,,,,,                                   \n" +
    "            `++++++++++++                  .,,,,,                                   \n" +
    "            +++++++++++++                  .,,,,,                                   \n" +
    "           ;++++++.    '+                  .,,,,,                                   \n" +
    "           ++++++                          .,,,,,                                   \n" +
    "           ++++++                          .,,,,,                                   \n" +
    "           +++++'                          .,,,,,                      (R)          \n" +
    "         ,,,,,,,,,,,,,,,,,,        ,,,,,,, .,,,,,        ;++++++++                  \n" +
    "         ,,,,,,,,,,,,,,,,,,       ,,,,,,,,,.,,,,,      `++++++++++++                \n" +
    "         ,,,,,,,,,,,,,,,,,,      ,,,,,,,,,,,,,,,,     .++++++++++++++               \n" +
    "         ,,,,,,,,,,,,,,,,,,     ,,,,,,,,,,,,,,,,,     +++++++++++++++;              \n" +
    "           +++++'     ,,,,,    `,,,,,,    ,,,,,,,    ++++++'   `++++++              \n" +
    "           +++++'     ,,,,,    ,,,,,,      ,,,,,,    ++++++     ;+++++:             \n" +
    "           +++++'     ,,,,,    ,,,,,,      ,,,,,,   .+++++:      ++++++             \n" +
    "           +++++'     ,,,,,    ,,,,,.      .,,,,,   '+++++       ++++++             \n" +
    "           +++++'     ,,,,,    ,,,,,`      .,,,,,   ++++++       ++++++             \n" +
    "           +++++'     ,,,,,    ,,,,,`      .,,,,,   ++++++       ++++++             \n" +
    "           +++++'     ,,,,,    ,,,,,.      .,,,,,   '+++++       ++++++             \n" +
    "           +++++'     ,,,,,    ,,,,,,      ,,,,,,   ,+++++:      ++++++             \n" +
    "           +++++'     ,,,,,    ,,,,,,`     ,,,,,,    ++++++     '+++++.             \n" +
    "           +++++'     ,,,,,    .,,,,,,.  `,,,,,,,    ++++++'   `++++++              \n" +
    "           +++++'     ,,,,,     ,,,,,,,,,,,,,,,,,     +++++++++++++++,              \n" +
    "           +++++'     ,,,,,     `,,,,,,,,,,,,,,,,     ,+++++++++++++'               \n" +
    "           +++++'     ,,,,,      `,,,,,,,,, ,,,,,      .+++++++++++;                \n" +
    "           +++++'     ,,,,,        ,,,,,,,  ,,,,,        '++++++++                  \n" +
    "                                                                                    \n" +
    "                     +     +    ,+                                                  \n" +
    "                     +     +                                                        \n" +
    "           '+++`     +     +     +     +++;     ++++`     '+++     +++`             \n" +
    "              `+     +     +     +        +     +` .+    :+  .    +   +             \n" +
    "            ++++     +     +     +     ++++     +   +    +.       +++++             \n" +
    "           +   +     +     +     +    +;  +     +   +    +.       +                 \n" +
    "           +  .+     +     +     +    +`  +     +   +    :+  .    +.  .             \n" +
    "           '++;+     +     +     +    `++++     +   +     ++++     ++++             \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    \n" +
    "                                                                                    ";
}