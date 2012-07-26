var assert = require('assert'),
    Resolver = require('../resolve');

exports['can resolve single .js file npm modules from ./node_modules'] = function(done) {
  assert.equal(
    Resolver.resolve(__dirname+'/fixtures/singlefile', 'foo'),
    __dirname+'/fixtures/singlefile/node_modules/foo.js'
    );
  done();
};

exports['can resolve single .json file npm module from ./node_modules'] = function(done) {
  assert.equal(
    Resolver.resolve(__dirname+'/fixtures/singlefile', 'bar'),
    __dirname+'/fixtures/singlefile/node_modules/bar.json'
    );
  done();
};

exports['can resolve a single .js file from a subdirectory'] = function(done) {
  assert.equal(
    Resolver.resolve(__dirname+'/fixtures/singlefile/sub', 'foo'),
    __dirname+'/fixtures/singlefile/node_modules/foo.js'
    );
  done();
};


// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
