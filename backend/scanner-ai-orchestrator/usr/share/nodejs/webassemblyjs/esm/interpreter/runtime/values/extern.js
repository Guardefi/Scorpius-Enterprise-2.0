export function createFuncInstance(func, params, results) {
  var type = [params, results];
  return {
    type: type,
    code: func,
    module: null,
    isExternal: true
  };
}
export function createGlobalInstance(value, type, mutability) {
  return {
    type: type,
    mutability: mutability,
    value: value
  };
}