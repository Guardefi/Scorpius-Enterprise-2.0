const fetch = require('./cjs/index.cjs');

const res = (url, args = {}) => {
  return fetch.default(url, args);
};

Object.keys(fetch).forEach(k => {
  res[k] = fetch[k];
});

module.exports = res;
