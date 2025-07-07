function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import { traverse, isInstruction } from "@webassemblyjs/ast";
export function flatten(ast) {
  /**
   * Remove nested instructions
   *
   * For example:
   *
   * (call 0
   *   (i32.const 1)
   *   (i32.const 2)
   * )
   *
   * into:
   *
   * (i32.const 1)
   * (i32.const 2)
   * (call 0)
   *
   */
  function CallInstructionVisitor(path) {
    var instrArgs = path.node.instrArgs; // $FlowIgnore

    if (typeof instrArgs === "undefined" || instrArgs.length === 0) {
      // no nested instructions
      return;
    } // $FlowIgnore


    instrArgs.forEach(path.insertBefore);
    path.node.instrArgs = [];
    didFlatten = true;
  }

  function InstrVisitor(path) {
    if (path.node.args.length === 0) {
      // no nested instructions
      return;
    }

    path.node.args = path.node.args.reduce(function (acc, arg) {
      if (isInstruction(arg) === false) {
        return [].concat(_toConsumableArray(acc), [arg]);
      }

      path.insertBefore(arg);
      didFlatten = true;
      return acc;
    }, []);
  }

  var didFlatten = true;

  while (didFlatten) {
    didFlatten = false;
    traverse(ast, {
      CallInstruction: CallInstructionVisitor,
      Instr: InstrVisitor
    });
  }

  return ast;
}