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

exports['can resolve a directory from ./node_modules'] = function(done) {
  assert.equal(
    Resolver.resolve(__dirname+'/fixtures/singledir', 'bbb'),
    __dirname+'/fixtures/singledir/node_modules/bbb'
    );
  done();

};

exports['can resolve a directory from a subdirectory'] = function(done) {
  assert.equal(
    Resolver.resolve(__dirname+'/fixtures/singledir/sub', 'ccc'),
    __dirname+'/fixtures/singledir/node_modules/ccc'
    );
  done();
};

exports['can expand a single file package'] = function(done) {
  Resolver.expand(__dirname+'/fixtures/expandsingle/node_modules/foo.js', function(files) {
    assert.equal(files.length, 1);
    assert.equal(files[0], __dirname+'/fixtures/expandsingle/node_modules/foo.js');
    done();
  });
};

exports['can expand a directory with a index.js file'] = function(done) {
  Resolver.expand(__dirname+'/fixtures/expandindex/node_modules/foo', function(files) {
    assert.equal(files.length, 3);
    assert.equal(files[0], __dirname+'/fixtures/expandindex/node_modules/foo/index.js');
    assert.equal(files[1], __dirname+'/fixtures/expandindex/node_modules/foo/lib/sub.js');
    assert.equal(files[2], __dirname+'/fixtures/expandindex/node_modules/foo/other.js');
    done();
  });
};

exports['can expand a directory with a package.json file'] = function(done) {
  Resolver.expand(__dirname+'/fixtures/expandpackage/node_modules/foo', function(files) {
    assert.equal(files.length, 3);
    assert.equal(files[0], __dirname+'/fixtures/expandpackage/node_modules/foo/lib/sub.js');
    assert.equal(files[1], __dirname+'/fixtures/expandpackage/node_modules/foo/other.js');
    assert.equal(files[2], __dirname+'/fixtures/expandpackage/node_modules/foo/package.json');
    done();
  });
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
