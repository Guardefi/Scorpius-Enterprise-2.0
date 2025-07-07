import WeakMap from './_WeakMap.js';

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Used to store function metadata. */
var metaMap = WeakMap && new WeakMap;

export default metaMap;
