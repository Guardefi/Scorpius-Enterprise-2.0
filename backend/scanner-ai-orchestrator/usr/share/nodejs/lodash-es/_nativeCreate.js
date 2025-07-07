import getNative from './_getNative.js';

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

export default nativeCreate;
