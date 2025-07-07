import overArg from './_overArg.js';

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

export default getPrototype;
