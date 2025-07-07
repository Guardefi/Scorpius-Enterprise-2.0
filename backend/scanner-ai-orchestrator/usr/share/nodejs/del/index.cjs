const { deleteAsync, deleteSync } = require('./dhnodejsBundle.cjs');

const res = (...args) => {
  return deleteAsync(...args);
}
// old API
res.sync = deleteSync
// new API
res.deleteAsync = deleteAsync;
res.deleteSync = deleteSync

module.exports = res
