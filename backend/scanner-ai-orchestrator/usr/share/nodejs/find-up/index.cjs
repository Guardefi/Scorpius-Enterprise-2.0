const { findUp, findUpSync, findUpMultiple, findUpMultipleSync, findUpStop, pathExists, pathExistsSync } = require("./findUp.cjs");

const res = (...args) => {
    return findUp(...args);
}
// old API
res.sync = findUpSync;
res.exists = pathExists;
res.sync.exists = pathExistsSync;
res.stop = findUpStop;

// This is for package which sources are ECMA and build files are
// Commonjs
res.findUp = findUp;

// new API
res.findUpSync = findUpSync;
res.findUpMultiple = findUpMultiple;
res.findUpMultipleSync = findUpMultipleSync;
res.pathExists = pathExists;
res.findUpStop = findUpStop;

module.exports = res;
