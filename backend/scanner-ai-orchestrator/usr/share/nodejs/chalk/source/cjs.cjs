const c = require('./index.js');

const m = c.default;
Object.keys(c).forEach(k => {
  if( k === '__proto___') {
    Object.setPrototypeOf(m, Object.getPrototypeOf(c));
  } else {
    m[k] = c[k];
  }
})
m.Instance = c.Chalk;
module.exports = m;
