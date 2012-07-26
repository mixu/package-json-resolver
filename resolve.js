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

// given a path to a package content, return the set of file paths in that package
// applying .npmignore
Resolver.expand = function(contentPath) {
  var stat = fs.stat(contentPath)

  // if it is a file, just return the file

  // if it is a folder
  // 1) check for a package.json
  // 2) check for a index.json file

  // if either one found:
  // 3) check for a .npmignore file and load it

  // 4) then iterate the whole directory - except ./node_modules which is handled elsewhere

};

// return the set of dependencies from package.json, given a path
Resolver.getDependencies = function(contentPath) {

};


module.exports = Resolver;
