var getNative = require('./_getNative'),
    root = require('./_root');

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;
