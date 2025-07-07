import { getType, typeEq } from "@webassemblyjs/validation";

var _require = require("../../partial-evaluation"),
    evaluate = _require.evaluate;

var _require2 = require("../../../errors"),
    CompileError = _require2.CompileError;

export function createInstance(allocator, node) {
  var value;
  var _node$globalType = node.globalType,
      valtype = _node$globalType.valtype,
      mutability = _node$globalType.mutability; // None or multiple constant expressions in the initializer seems not possible
  // TODO(sven): find a specification reference for that
  // FIXME(sven): +1 because of the implicit end, change the order of validations

  if (node.init.length > 2 || node.init.length === 1) {
    throw new CompileError("type mismatch");
  } // Validate the type


  var resultInferedType = getType(node.init);

  if (resultInferedType != null && typeEq([node.globalType.valtype], resultInferedType) === false) {
    throw new CompileError("type mismatch");
  }

  var res = evaluate(allocator, node.init);

  if (res != null) {
    value = res.value;
  }

  return {
    type: valtype,
    mutability: mutability,
    value: value
  };
}