import getNative from './_getNative.js';
import root from './_root.js';

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

export default Set;
