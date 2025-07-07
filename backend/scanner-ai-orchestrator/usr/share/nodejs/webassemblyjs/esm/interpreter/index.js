function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

import { traverse } from "@webassemblyjs/ast";
import { Module as _Module } from "../compiler/compile/module";
import { RuntimeError } from "../errors";

var modulevalue = require("./runtime/values/module");

var _require = require("./kernel/memory"),
    createAllocator = _require.createAllocator;

var importObjectUtils = require("./import-object");

import { createHostfunc, executeStackFrameAndGetResult } from "./host-func";

var _require2 = require("./kernel/stackframe"),
    createStackFrame = _require2.createStackFrame;

import { kStart } from "@webassemblyjs/helper-compiler";
export var Instance = /*#__PURE__*/function () {
  /**
   * Map id to external elements or callable functions
   */
  function Instance(module, importObject) {
    var _this = this;

    _classCallCheck(this, Instance);

    if (module instanceof _Module === false) {
      throw new TypeError("module must be of type WebAssembly.Module, " + _typeof(module) + " given.");
    }

    this._externalElements = {};
    this.exports = {};
    /**
     * Create Module's default memory allocator
     */

    this._allocator = createAllocator();
    /**
     * Pass internal options
     */

    var internalInstanceOptions = {
      checkForI64InSignature: true,
      returnStackLocal: false
    };

    if (_typeof(importObject._internalInstanceOptions) === "object") {
      internalInstanceOptions = importObject._internalInstanceOptions;
    }
    /**
     * importObject.
     */


    if (_typeof(importObject) === "object") {
      importObjectUtils.walk(importObject, function (key, key2, value) {
        if (_typeof(_this._externalElements[key]) !== "object") {
          _this._externalElements[key] = {};
        }

        _this._externalElements[key][key2] = value;
      });
    }

    var moduleNode = getModuleFromProgram(module._ast);

    if (moduleNode === null) {
      throw new RuntimeError("Module not found");
    }

    var moduleInstance = modulevalue.createInstance(module._ir.funcTable, this._allocator, // $FlowIgnore: that's the correct type but Flow fails to get it
    moduleNode, this._externalElements);
    moduleInstance.exports.forEach(function (exportinst) {
      if (exportinst.value.type === "Func") {
        _this.exports[exportinst.name] = createHostfunc(module._ir, moduleInstance, exportinst, _this._allocator, internalInstanceOptions);
        return;
      }

      if (exportinst.value.type === "Global") {
        var globalinst = _this._allocator.get(exportinst.value.addr);

        if (globalinst == null) {
          throw new RuntimeError("Global instance has not been instantiated");
        }

        if (internalInstanceOptions.returnStackLocal === true) {
          _this.exports[exportinst.name] = globalinst;
        } else {
          _this.exports[exportinst.name] = globalinst.value.toNumber();
        }

        return;
      }

      if (exportinst.value.type === "Memory") {
        var memoryinst = _this._allocator.get(exportinst.value.addr);

        if (memoryinst == null) {
          throw new RuntimeError("Memory instance has not been instantiated");
        }

        _this.exports[exportinst.name] = memoryinst;
        return;
      }

      if (exportinst.value.type === "Table") {
        var tableinst = _this._allocator.get(exportinst.value.addr);

        if (tableinst == null) {
          throw new RuntimeError("Table instance has not been instantiated");
        }

        _this.exports[exportinst.name] = tableinst;
        return;
      }

      throw new Error("Unknown export type: " + exportinst.value.type);
    });
    this._moduleInstance = moduleInstance;

    var startFunc = module._ir.funcTable.find(function (x) {
      return x.name === kStart;
    });

    if (startFunc != null) {
      this.executeStartFunc(module._ir, startFunc.startAt);
    }
  }

  _createClass(Instance, [{
    key: "executeStartFunc",
    value: function executeStartFunc(ir, offset) {
      // FIXME(sven): func params? do we need this here? it's a validation.
      var params = [];
      var stackFrame = createStackFrame(params, this._moduleInstance, this._allocator); // Ignore the result

      executeStackFrameAndGetResult(ir, offset, stackFrame,
      /* returnStackLocal */
      true);
    }
  }]);

  return Instance;
}();

function getModuleFromProgram(ast) {
  var module = null;
  traverse(ast, {
    Module: function Module(_ref) {
      var node = _ref.node;
      module = node;
    }
  });
  return module;
}