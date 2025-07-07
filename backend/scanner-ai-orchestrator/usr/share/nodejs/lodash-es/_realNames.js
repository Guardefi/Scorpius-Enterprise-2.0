/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Used to lookup unminified function names. */
var realNames = {};

export default realNames;
