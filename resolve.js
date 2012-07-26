var fs = require('fs'),
    path = require('path');

function Resolver() {

}

// generate a set of paths to check when looking for a package by name
Resolver.alternatives = function(basepath, name) {
  var result = [], current = basepath;

  // check ./node_modules
  while(current != '/') {
    result.push(current+'/node_modules/'+name);
    result.push(current+'/node_modules/'+name+'.js');
    result.push(current+'/node_modules/'+name+'.json');
    current = path.resolve(current, '..');
  }

  return result;
};

// given a base path and a package name, return the path to the package
Resolver.resolve = function(basepath, name) {
  var alt = Resolver.alternatives(basepath, name),
      match = '';

  alt.some(function(path, i) {
    var isMatch = fs.existsSync(path);
    if(isMatch) match = path;
    return isMatch;
  });

  return match;
};

// given a path to a package content, return:
// - the set of file paths in that package, applying .npmignore
// - the name of the main file
Resolver.expand = function(contentPath, done) {
  var stat = fs.statSync(contentPath),
      mainFile = contentPath,
      meta = {};

  // if it is a file, just return the file
  if (stat.isFile()) return done([contentPath]);

  // if it is a folder
  if (fs.existsSync(contentPath+'/package.json')) {
    // 1) check for a package.json
    meta = JSON.parse(fs.readFileSync(contentPath+'/package.json'));
    if(meta.main) {
      mainFile = meta.main;
    }
  } else if (fs.existsSync(contentPath+'/index.js')) {
    // 2) check for a index.js file
    mainFile = contentPath+'/index.js';
  } else {
    return done([]);
  }

  // if either one found:
  // 3) check for a .npmignore file and load it
  if (fs.existsSync(contentPath+'/.npmignore')) {

  }
  // 4) then iterate the whole directory - except ./node_modules which is handled elsewhere
  Resolver.iterate(contentPath, function(results) {
    // 5) then apply the npmignore on those file paths
    done(results.sort());
  });
};

Resolver.iterate = function(path, done) {
  var paths = (Array.isArray(path) ? path : [ path ]),
      result = [];

  paths.forEach(function(p) {
    var isDirectory = fs.statSync(p).isDirectory();

    if (isDirectory) {
      p += (p[p.length-1] !== '/' ? '/' : '');
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


// return the set of dependencies from package.json, given a path
Resolver.getDependencies = function(contentPath) {

};


module.exports = Resolver;
