var root = require('./_root');

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;
