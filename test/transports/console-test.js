/*
 * console-test.js: Tests for instances of the Console transport
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    winston = require('../../lib/winston'),
    helpers = require('../helpers'),
    stdMocks = require('std-mocks');

var npmTransport = new (winston.transports.Console)(),
    syslogTransport = new (winston.transports.Console)({ levels: winston.config.syslog.levels }),
    defaultTransport = new (winston.transports.Console)(),
    debugStdoutTransport = new (winston.transports.Console)({ debugStdout: true }),
    stderrLevelsTransport = new (winston.transports.Console)({ stderrLevels: ['info', 'warn'] }),
    customLevels = {
      alpha: 0,
      beta: 1,
      gamma: 2,
      delta: 3,
      epsilon: 4,
    },
    customLevelsAndStderrTransport = new (winston.transports.Console)({
      levels: customLevels,
      stderrLevels: ['delta', 'epsilon']
    }),
    noStderrTransport = new (winston.transports.Console)({ stderrLevels: [] });

vows.describe('winston/transports/console').addBatch({
  "An instance of the Console Transport": {
    "with showLevel on": {
      topic : function() {
        npmTransport.showLevel = true;
        stdMocks.use();
        npmTransport.log('info', '');
      },
      "should have level prepended": function () {
        stdMocks.restore();
        var output = stdMocks.flush(),
            line   = output.stdout[0];

        assert.equal(line, 'info: \n');
      }
    },
    "with showLevel off": {
      topic : function() {
        npmTransport.showLevel = false;
        stdMocks.use();
        npmTransport.log('info', '');
      },
      "should not have level prepended": function () {
        stdMocks.restore();
        var output = stdMocks.flush(),
            line   = output.stdout[0];

        assert.equal(line, undefined);
      }
    },
    "with npm levels": {
      "should have the proper methods defined": function () {
        helpers.assertConsole(npmTransport);
      },
      "the log() method": helpers.testNpmLevels(npmTransport, "should respond with true", function (ign, err, logged) {
        assert.isNull(err);
        assert.isTrue(logged);
      })
    },
    "with syslog levels": {
      "should have the proper methods defined": function () {
        helpers.assertConsole(syslogTransport);
      },
      "the log() method": helpers.testSyslogLevels(syslogTransport, "should respond with true", function (ign, err, logged) {
        assert.isNull(err);
        assert.isTrue(logged);
      })
    }
  }
}).addBatch({
  "An instance of the Console Transport with no options": {
    "should set stderrLevels to 'error' and 'debug' by default": helpers.assertStderrLevels(
      defaultTransport,
      ['error', 'debug']
    ),
    "should log only 'error' and 'debug' to stderr": helpers.testLoggingToStreams(
      winston.config.npm.levels, defaultTransport, ['debug', 'error'], stdMocks
    )
  }
}).addBatch({
  "An instance of the Console Transport with debugStdout set": {
    "should throw an Error if stderrLevels is set": helpers.assertOptionsThrow(
      { debugStdout: true, stderrLevels: ['debug'] },
      "Error: Cannot set debugStdout and stderrLevels together"
    ),
    "should set stderrLevels to 'error' by default": helpers.assertStderrLevels(
      debugStdoutTransport,
      ['error']
    ),
    "should log only the 'error' level to stderr": helpers.testLoggingToStreams(
      winston.config.npm.levels, debugStdoutTransport, ['error'], stdMocks
    )
  }
}).addBatch({
  "An instance of the Console Transport with stderrLevels set": {
    "should throw an Error if stderrLevels is set but not an Array": helpers.assertOptionsThrow(
      { debugStdout: false, stderrLevels: new String('Not an Array') },
      "Error: Cannot set stderrLevels to type other than Array"
    ),
    "should throw an Error if stderrLevels contains non-string elements": helpers.assertOptionsThrow(
      { debugStdout: false, stderrLevels: ["good", /^invalid$/, "valid"] },
      "Error: Cannot have non-string elements in stderrLevels Array"
    ),
    "should correctly set stderrLevels": helpers.assertStderrLevels(
      stderrLevelsTransport,
      ['info', 'warn']
    ),
    "should log only the levels in stderrLevels to stderr": helpers.testLoggingToStreams(
      winston.config.npm.levels, stderrLevelsTransport, ['info', 'warn'], stdMocks
    )
  }
}).addBatch({
  "An instance of the Console Transport with stderrLevels set to an empty array": {
    "should log only to stdout, and not to stderr": helpers.testLoggingToStreams(
      winston.config.npm.levels, noStderrTransport, [], stdMocks
    )
  }
}).addBatch({
  "An instance of the Console Transport with custom levels and stderrLevels set": {
    "should log only the levels in stderrLevels to stderr": helpers.testLoggingToStreams(
      customLevels, customLevelsAndStderrTransport, ['delta', 'epsilon'], stdMocks
    )
  }
}).export(module);
