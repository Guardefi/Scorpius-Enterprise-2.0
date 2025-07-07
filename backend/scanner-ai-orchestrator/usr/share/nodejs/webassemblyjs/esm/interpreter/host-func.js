function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var t = require("@webassemblyjs/ast");

import { RuntimeError } from "../errors";

var _require = require("./runtime/castIntoStackLocalOfType"),
    castIntoStackLocalOfType = _require.castIntoStackLocalOfType;

var _require2 = require("./kernel/exec"),
    executeStackFrame = _require2.executeStackFrame;

var _require3 = require("./kernel/stackframe"),
    createStackFrame = _require3.createStackFrame;

var _require4 = require("./kernel/signals"),
    ExecutionHasBeenTrapped = _require4.ExecutionHasBeenTrapped;

export function createHostfunc(ir, moduleinst, exportinst, allocator, _ref) {
  var checkForI64InSignature = _ref.checkForI64InSignature,
      returnStackLocal = _ref.returnStackLocal;
  return function hostfunc() {
    var _stackFrame$locals;

    var exportinstAddr = exportinst.value.addr;
    /**
     * Find callable in instantiated function in the module funcaddrs
     */

    var hasModuleInstantiatedFunc = moduleinst.funcaddrs.indexOf(exportinstAddr);

    if (hasModuleInstantiatedFunc === -1) {
      throw new RuntimeError("Function at addr ".concat(exportinstAddr.index, " has not been initialized in the module.") + "Probably an internal failure");
    }

    var funcinst = allocator.get(exportinstAddr);

    if (funcinst === null) {
      throw new RuntimeError("Function was not found at addr ".concat(exportinstAddr.index));
    }

    var funcinstArgs = funcinst.type[0];

    if (checkForI64InSignature === true) {
      var funcinstResults = funcinst.type[1];
      /**
       * If the signature contains an i64 (as argument or result), the host
       * function immediately throws a TypeError when called.
       */

      var funcinstArgsHasi64 = funcinstArgs.indexOf("i64") !== -1;
      var funcinstResultsHasi64 = funcinstResults.indexOf("i64") !== -1;

      if (funcinstArgsHasi64 === true || funcinstResultsHasi64 === true) {
        throw new TypeError("Can not call this function from JavaScript: " + "i64 in signature.");
      }
    }
    /**
     * Check number of argument passed vs the function arity
     */


    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length !== funcinstArgs.length) {
      throw new RuntimeError("Function ".concat(exportinstAddr.index, " called with ").concat(args.length, " arguments but ") + funcinst.type[0].length + " expected");
    }

    var argsWithType = args.map(function (value, i) {
      return castIntoStackLocalOfType(funcinstArgs[i], value);
    });
    var stackFrame = createStackFrame(argsWithType, funcinst.module, allocator); // push func's params into stackFrame locals

    (_stackFrame$locals = stackFrame.locals).push.apply(_stackFrame$locals, _toConsumableArray(argsWithType)); // 2. Enter the block instr∗ with label
    // stackFrame.values.push(label.createValue(exportinst.name));


    stackFrame.labels.push({
      value: funcinst,
      arity: funcinstArgs.length,
      id: t.identifier(exportinst.name)
    });
    return executeStackFrameAndGetResult(ir, funcinst.atOffset, stackFrame, returnStackLocal);
  };
}
export function executeStackFrameAndGetResult(ir, offset, stackFrame, returnStackLocal) {
  try {
    var res = executeStackFrame(ir, offset, stackFrame);

    if (returnStackLocal === true) {
      return res;
    }

    if (res != null && res.value != null) {
      if (!(res.type !== "label")) {
        throw new Error('res.type !== "label"' + " error: " + (undefined || "unknown"));
      }

      return res.value.toNumber();
    }
  } catch (e) {
    if (e instanceof ExecutionHasBeenTrapped) {
      throw e;
    } else {
      var err = new RuntimeError(e.message);
      err.stack = e.stack;
      throw err;
    }
  }
}