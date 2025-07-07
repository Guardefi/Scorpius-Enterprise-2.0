function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import importOrderValidate from "./import-order";
import isConst from "./is-const";
import typeChecker from "./type-checker";
import imports from "./imports";
import duplicatedExports from "./duplicated-exports";
import { moduleContextFromModuleAST } from "@webassemblyjs/ast";
export default function validateAST(ast) {
  var errors = getValidationErrors(ast);

  if (errors.length !== 0) {
    var errorMessage = "Validation errors:\n" + errors.join("\n");
    throw new Error(errorMessage);
  }
}
export function getValidationErrors(ast) {
  var errors = [];
  var modules = []; // $FlowIgnore

  if (ast.type === "Module") {
    modules = [ast];
  } // $FlowIgnore


  if (ast.type === "Program") {
    modules = ast.body.filter(function (_ref) {
      var type = _ref.type;
      return type === "Module";
    });
  }

  modules.forEach(function (m) {
    var moduleContext = moduleContextFromModuleAST(m); // $FlowIgnore

    errors.push.apply(errors, _toConsumableArray(imports(ast, moduleContext)));
    errors.push.apply(errors, _toConsumableArray(isConst(ast, moduleContext)));
    errors.push.apply(errors, _toConsumableArray(importOrderValidate(ast)));
    errors.push.apply(errors, _toConsumableArray(typeChecker(ast, moduleContext)));
    errors.push.apply(errors, _toConsumableArray(duplicatedExports(ast)));
  });
  return errors;
}
export { getType, typeEq } from "./type-inference";
export { isConst };
export var stack = typeChecker;