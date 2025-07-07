function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

import { getEndBlockByteOffset, getEndByteOffset, getFunctionBeginingByteOffset, getStartBlockByteOffset, getStartByteOffset, internalBrUnless, internalGoto, internalCallExtern, isBlock, isLoopInstruction, isCallInstruction, isFuncImportDescr, isIdentifier, isIfInstruction, isNumberLiteral, internalEndAndReturn, traverse } from "@webassemblyjs/ast"; // $FlowIgnore

export var kStart = Symbol("_start");

function createContext(ast) {
  var context = {
    funcs: []
  };
  traverse(ast, {
    ModuleImport: function (_ModuleImport) {
      function ModuleImport(_x) {
        return _ModuleImport.apply(this, arguments);
      }

      ModuleImport.toString = function () {
        return _ModuleImport.toString();
      };

      return ModuleImport;
    }(function (path) {
      if (isFuncImportDescr(path.node.descr)) {
        context.funcs.push({
          isImplemented: false
        });
      }
    }),
    Func: function (_Func) {
      function Func(_x2) {
        return _Func.apply(this, arguments);
      }

      Func.toString = function () {
        return _Func.toString();
      };

      return Func;
    }(function (path) {
      context.funcs.push({
        isImplemented: true,
        node: path.node
      });
    })
  });
  return context;
}

export var Module = /*#__PURE__*/function () {
  function Module(ast) {
    _classCallCheck(this, Module);

    this._labels = [];
    this._program = [];
    this._currentFunc = null;
    this._context = createContext(ast);
  }

  _createClass(Module, [{
    key: "_emit",
    value: function _emit(node) {
      var offset = getStartByteOffset(node);

      this._program.push({
        offset: offset,
        node: node
      });
    }
  }, {
    key: "beginFuncBody",
    value: function beginFuncBody(func) {
      this._labels = [];
      this._program = [];
      this._currentFunc = func;

      this._labels.push(func);
    }
  }, {
    key: "onFuncInstruction",
    value: function onFuncInstruction(node) {
      var _this = this;

      if (isCallInstruction(node)) {
        // $FlowIgnore: it's ensured by the node matcher
        if (!(node.numeric !== null)) {
          throw new Error('node.numeric !== null' + " error: " + (undefined || "unknown"));
        }

        var funcIndex = null; // $FlowIgnore: it's ensured by the node matcher

        if (isNumberLiteral(node.index)) {
          funcIndex = parseInt(node.index.value);
        } // $FlowIgnore: it's ensured by the node matcher


        if (isIdentifier(node.index)) {
          // $FlowIgnore: it's ensured by the node matcher
          funcIndex = parseInt(node.numeric.value);
        }

        if (!(funcIndex !== null)) {
          throw new Error('funcIndex !== null' + " error: " + (undefined || "unknown"));
        }

        // $FlowIgnore: ensured by the assertion
        var funcInContext = this._context.funcs[funcIndex];

        if (!(_typeof(funcInContext) === "object")) {
          throw new Error('typeof funcInContext === "object"' + " error: " + (undefined || "unknown"));
        }

        if (funcInContext.isImplemented === true) {
          var func = funcInContext.node; // transform module index into byte offset
          // $FlowIgnore

          node.index.value = getFunctionBeginingByteOffset(func);

          this._emit(node);
        } else {
          var internalCallExternNode = internalCallExtern(funcIndex);
          internalCallExternNode.loc = node.loc;

          this._emit(internalCallExternNode);
        }

        return;
      }

      if (isBlock(node)) {
        this._labels.push(node);
      }

      if (isLoopInstruction(node)) {
        this._labels.push(node);
      }

      if (node.id === "br" || node.id === "br_if") {
        // $FlowIgnore
        var depth = node.args[0].value; // $FlowIgnore

        var target = this._labels[this._labels.length - depth - 1];

        if (!(_typeof(target) === "object")) {
          throw new Error('typeof target === "object"' + " error: " + ("Label ".concat(String(depth), " not found") || "unknown"));
        }

        if (isLoopInstruction(target) && depth === 0) {
          // $FlowIgnore
          node.args[0].value = getStartBlockByteOffset(target);
        } else {
          // $FlowIgnore
          node.args[0].value = getEndBlockByteOffset(target);
        }
      }

      if (isIfInstruction(node)) {
        // $FlowIgnore
        var alternateOffset = getStartByteOffset(node.alternate[0]);
        var internalBrUnlessNode = internalBrUnless(alternateOffset);
        internalBrUnlessNode.loc = node.loc;

        this._emit(internalBrUnlessNode); // $FlowIgnore


        node.consequent.forEach(function (n) {
          return _this._emit(n);
        }); // Skipping the alternate once the consequent block has been executed.
        // We inject a goto at the offset of the else instruction
        //
        // TODO(sven): properly replace the else instruction instead, keep it in
        // the ast.

        var internalGotoNode = internalGoto( // $FlowIgnore
        getEndByteOffset(node.alternate[node.alternate.length - 1]));
        internalGotoNode.loc = {
          start: {
            line: -1,
            // $FlowIgnore
            column: node.alternate[0].loc.start.column - 1
          }
        };

        this._emit(internalGotoNode); // $FlowIgnore


        node.alternate.forEach(function (n) {
          return _this._emit(n);
        });
        return;
      }

      this._emit(node);
    }
  }, {
    key: "emitStartFunc",
    value: function emitStartFunc(index) {
      var funcInContext = this._context.funcs[index];

      if (!(_typeof(funcInContext) === "object")) {
        throw new Error('typeof funcInContext === "object"' + " error: " + (undefined || "unknown"));
      }

      if (!funcInContext.isImplemented) {
        throw new Error('funcInContext.isImplemented' + " error: " + (undefined || "unknown"));
      }

      var func = funcInContext.node;
      return {
        name: kStart,
        startAt: getFunctionBeginingByteOffset(func)
      };
    }
  }, {
    key: "finalizeFunc",
    value: function finalizeFunc(func) {
      this._labels.pop();

      // transform the function body `end` into a return
      var lastInstruction = this._program[this._program.length - 1];
      var internalEndAndReturnNode = internalEndAndReturn();
      internalEndAndReturnNode.loc = lastInstruction.node.loc; // will be emited at the same location, basically replacing the lastInstruction

      this._emit(internalEndAndReturnNode); // clear current function from context


      this._currentFunc = null;
      return {
        name: func.name ? func.name.value : null,
        startAt: getFunctionBeginingByteOffset(func),
        instructions: this._program
      };
    }
  }]);

  return Module;
}();