export var NULL = 0x0; // Allocates memory addresses within the store
// https://webassembly.github.io/spec/core/exec/modules.html#alloc

export function createAllocator() {
  // https://webassembly.github.io/spec/core/exec/runtime.html#store
  var store = [];
  var offset = 0;

  function malloc(size) {
    offset += size;
    return {
      index: offset,
      size: size
    };
  }

  function get(p) {
    return store[p.index];
  }

  function set(p, value) {
    store[p.index] = value;
  }

  function free(p) {
    store[p.index] = NULL;
  }

  return {
    malloc: malloc,
    free: free,
    get: get,
    set: set
  };
}