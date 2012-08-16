var Minimatch = require('minimatch').Minimatch;

var ignoreFiles = ['.npmignore', '.gitignore'];

// returns an object that has a isIgnored() function that returns true if the path is ignored.
function readIgnores(directory) {
  var matchOptions = { matchBase: true, dot: true, flipNegate: true };
  var all = [];


  if (path.existsSync(directory+'/'+ignoreFiles[0])) {
    var set = fs.readFileSync(directory+'/'+ignoreFiles[0])).toString().split(/\r?\n/);
    // filter comments and empty lines
    set = set.filter(function (s) {
      s = s.trim()
      return s && !s.match(/^#/)
    });

    var rules = set.map(function (s) {
      var m = new Minimatch(s, matchOptions);
      m.ignoreFile = e;
      return m;
    });

    all.push(rules);
  }

  return function match(dir) {
    var included = true;
    // ported from fstream-ignore
    all.forEach(function(rule) {
      // negation means inclusion
      if (rule.negate && included ||  !rule.negate && !included) {
        // unnecessary
        return;
      }

      // first, match against /foo/bar
      var match = rule.match("/" + entry);

      if (!match) {
        // try with the leading / trimmed off the test
        // eg: foo/bar instead of /foo/bar
        match = rule.match(entry);
      }

      // if the entry is a directory, then it will match
      // with a trailing slash. eg: /foo/bar/ or foo/bar/
      if (!match && partial) {
        match = rule.match("/" + entry + "/") ||
                rule.match(entry + "/");
      }

      // When including a file with a negated rule, it's
      // relevant if a directory partially matches, since
      // it may then match a file within it.
      // Eg, if you ignore /a, but !/a/b/c
      if (!match && rule.negate && partial) {
        match = rule.match("/" + entry, true) ||
                rule.match(entry, true);
      }

      if (match) {
        included = rule.negate;
      }
    });
    return included;
  };
}
