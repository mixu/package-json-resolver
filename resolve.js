var fs = require('fs'),
    path = require('path');

// Node 0.8.x compatibility
var existsSync = (fs.existsSync ? fs.existsSync : path.existsSync);

function Resolver() {}

// generate a set of paths to check when looking for a package by name
Resolver.alternatives = function(basepath, name) {
  var result = [], current = basepath, prev;

  // check ./node_modules
  while(current != prev) {
    result.push(current + path.sep + 'node_modules' + path.sep + name);
    result.push(current + path.sep + 'node_modules' + path.sep + name+'.js');
    result.push(current + path.sep + 'node_modules' + path.sep + name+'.json');

    prev = current; // until we cannot go higher (e.g. cross platform root)
    current = path.resolve(current, '..');
  }

  return result;
};

// given a base path and a package name, return the path to the package
Resolver.resolve = function(basepath, name) {

  var alt = Resolver.alternatives(basepath, name),
      match = '';

  alt.some(function(fpath, i) {
    var isMatch = existsSync(fpath);
    if(isMatch) match = path.normalize(fpath);
    return isMatch;
  });

  return match;
};

// given a path to a package content, return:
// - the set of file paths in that package, applying .npmignore
// - the name of the main file
Resolver.expand = function(basePath, done) {
  var stat = fs.statSync(basePath),
      mainFile = basePath,
      dependencyNames = [],
      meta = {};

  // if it is a file, just return the file
  if (stat.isFile()) {
    // basepath is the directory the file is in
    return done(path.dirname(basePath), '/' + path.basename(mainFile), [ basePath ], dependencyNames);
  }

  // if it is a folder
  if (existsSync(basePath+ path.sep + 'package.json')) {
    // 1) check for a package.json
    meta = JSON.parse(fs.readFileSync(basePath+ path.sep +'package.json'));
    if(meta.main) {
      // replace "./foo" with "/foo" for compat
      mainFile = meta.main.replace(/^\./, '');
    } else {
      mainFile = '/index.js';
    }
    meta.dependencies && (dependencyNames = Object.keys(meta.dependencies));

  } else if (existsSync(basePath+ path.sep + 'index.js')) {
    // 2) check for a index.js file
    mainFile = '/index.js';
  } else {
    return done(undefined, []);
  }

  // if either one found:
  // 3) check for a .npmignore file and load it
  if (existsSync(basePath+ path.sep +'.npmignore')) {

  }

  // 4) then iterate the whole directory - except ./node_modules which is handled elsewhere
  Resolver.iterate(basePath, function(results) {
    // 5) then apply the npmignore on those file paths
    done(basePath, mainFile, results.sort(), dependencyNames);
  });
};

// from fstream-npm/fstream-npm.js:
function isIgnored(entry) {
  if (entry === ".git" ||
      entry === ".lock-wscript" ||
      entry.match(/^\.wafpickle-[0-9]+$/) ||
      entry === "CVS" ||
      entry === ".svn" ||
      entry === ".hg" ||
      entry.match(/^\..*\.swp$/) ||
      entry === ".DS_Store" ||
      entry.match(/^\._/) ||
      entry === "npm-debug.log" ||
      // we ignore this because node_modules are handled separately via the package.json
      entry.match(new RegExp('node_modules$'))
    ) {
    return true;
  }
  return false;
}

Resolver.iterate = function(filepath, done) {
  var paths = (Array.isArray(filepath) ? filepath : [ filepath ]),
      result = [];

  paths.forEach(function(p) {
    // skip anything that ends with node_modules/ - we should never iterate into those directories
    if(isIgnored(path.basename(p))) return;
    var isDirectory = fs.statSync(p).isDirectory();

    if (isDirectory) {
      p += (p[p.length-1] !== path.sep ? path.sep : '');
      return fs.readdirSync(p).forEach(function (f) {
        Resolver.iterate(p + f, function(subResult) {
          result = result.concat(subResult);
        });
      });
    } else {
      result.push(p);
    }
  });
  done(result);
};

module.exports = Resolver;
