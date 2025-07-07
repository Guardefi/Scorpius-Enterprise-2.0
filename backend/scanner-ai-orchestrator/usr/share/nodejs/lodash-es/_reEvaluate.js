/** Used to match template delimiters. */
var reEvaluate = /<%([\s\S]+?)%>/g;

/** Detect free variable `globalThis` */
const freeGlobalThis = typeof globalThis == 'object' && globalThis !== null && globalThis.Object == Object && globalThis;

export default reEvaluate;
