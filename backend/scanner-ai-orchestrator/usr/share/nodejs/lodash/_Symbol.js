var root = require('./_root');

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;
