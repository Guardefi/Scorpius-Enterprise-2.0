const { globby, globbySync, globbyStream, generateGlobTasks,
        generateGlobTasksSync, ignoreFiles, isDynamicPattern,
        isGitIgnored, isGitIgnoredSync } = require("./globby.cjs");

const res = (...args) => {
  return globby(...args);
}

// old API
res.sync = globbySync;
res.stream = globbyStream;
res.hasMagic = isDynamicPattern;
res.gitignore = isGitIgnored;
res.gitignore.sync = isGitIgnoredSync;

// identical name
res.generateGlobTasks = generateGlobTasks;

// This is for package which sources are ECMA and build files are
// Commonjs
res.globby = globby;

// new API
res.globbySync = globbySync;
res.globbyStream = globbyStream;
res.generateGlobTasksSync = generateGlobTasksSync;
res.isDynamicPattern = isDynamicPattern;
res.ignoreFiles = ignoreFiles;
res.isGitIgnored = isGitIgnored;

module.exports = res;
