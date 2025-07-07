import { traverse } from "@webassemblyjs/ast";
/**
 * Determine if a sequence of instructions form a constant expression
 *
 * See https://webassembly.github.io/spec/core/multipage/valid/instructions.html#valid-constant
 */

export default function (ast) {
  var errors = [];
  traverse(ast, {
    ModuleImport: function ModuleImport(_ref) {
      var node = _ref.node;
      var mutability = node.descr.mutability;

      if (mutability === "var") {
        errors.push("mutable globals cannot be imported");
      }
    }
  });
  return errors;
}