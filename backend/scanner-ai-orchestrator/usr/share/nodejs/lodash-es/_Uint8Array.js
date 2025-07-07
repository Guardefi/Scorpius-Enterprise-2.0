import root from './_root.js';

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

export default Uint8Array;
