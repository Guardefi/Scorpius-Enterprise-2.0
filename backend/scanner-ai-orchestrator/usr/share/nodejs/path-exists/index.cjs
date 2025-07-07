const { pathExists, pathExistsSync } = require("./pathExists.cjs");
const res = (...args) => {
    return pathExists(...args);
}
// old API
res.sync = pathExistsSync;
// new API
res.pathExists = pathExists;
res.pathExistsSync = pathExistsSync;

module.exports = res;
