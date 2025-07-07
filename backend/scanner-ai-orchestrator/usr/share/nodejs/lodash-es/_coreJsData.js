import root from './_root.js';

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

export default coreJsData;
