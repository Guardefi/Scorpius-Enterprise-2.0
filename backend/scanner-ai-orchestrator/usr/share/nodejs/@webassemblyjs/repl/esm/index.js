function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _require = require("webassemblyjs/lib/compiler/compile/module"),
    createCompiledModule = _require.createCompiledModule;

var _require2 = require("webassemblyjs/lib/interpreter"),
    Instance = _require2.Instance;

var partialEvaluation = require("webassemblyjs/lib/interpreter/partial-evaluation");

var _require3 = require("@webassemblyjs/wast-parser"),
    parse = _require3.parse;

var _require4 = require("webassemblyjs/lib/interpreter/runtime/values/memory"),
    Memory = _require4.Memory;

var _require5 = require("webassemblyjs/lib/interpreter/kernel/memory"),
    createAllocator = _require5.createAllocator;

var _require6 = require("@webassemblyjs/wasm-parser"),
    decode = _require6.decode;

var t = require("@webassemblyjs/ast");

var _require7 = require("@webassemblyjs/validation"),
    getValidationErrors = _require7.getValidationErrors;

var denormalizeTypeReferences = require("@webassemblyjs/ast/lib/transform/denormalize-type-references").transform;

function addEndInstruction(body) {
  body.push(t.instruction("end"));
}

export function createRepl(_ref) {
  var isVerbose = _ref.isVerbose,
      onAssert = _ref.onAssert,
      onLog = _ref.onLog,
      onOk = _ref.onOk;

  function parseQuoteModule(node
  /*: QuoteModule */
  ) {
    var raw = node.string.join("");
    parse(raw);
  }

  function decodeBinaryModule(node
  /*: BinaryModule */
  ) {
    var raw = node.blob.join("");
    var chars = raw.split("");
    var out = [];

    for (var i = 0; i < chars.length; i++) {
      var e = chars[i];

      if (e === "\\") {
        // Start espace sequence
        var _byte = chars[i + 1] + chars[i + 2];

        var hexInNumber = parseInt(_byte, 16);
        out.push(hexInNumber);
        i = i + 2;
      } else {
        // ASCII
        var _hexInNumber = Number(chars[i].charCodeAt(0));

        out.push(_hexInNumber);
      }
    }

    decode(out);
  }
  /**
   * Assert helpers
   */
  // ;; assert module cannot be decoded with given failure string
  // ( assert_malformed <module> <failure> )


  function assert_malformed(node) {
    var _node$args = _slicedToArray(node.args, 2),
        module = _node$args[0],
        expected = _node$args[1];

    if (t.isBinaryModule(module) === true) {
      try {
        decodeBinaryModule(module);
        assert(false, "module is valid, expected malformed (".concat(expected.value, ")"));
      } catch (err) {
        assert(new RegExp(expected.value, "ig").test(err.message), "Expected failure of \"".concat(expected.value, "\", \"").concat(err.message, "\" given"));
      }
    } else if (t.isQuoteModule(module) === true) {
      try {
        parseQuoteModule(module);
        assert(false, "module is valid, expected malformed (".concat(expected.value, ")"));
      } catch (err) {
        assert(new RegExp(expected.value, "ig").test(err.message), "Expected failure of \"".concat(expected.value, "\", \"").concat(err.message, "\" given"));
      }
    } else {
      throw new Error("Unsupported module type: " + module.type);
    }
  } // assert module traps on instantiation
  // ( assert_trap <module> <failure> )


  function assert_trap(node) {
    var _node$args2 = _slicedToArray(node.args, 2),
        action = _node$args2[0],
        expected = _node$args2[1];

    if (action.type === "Instr" && action.id === "invoke") {
      try {
        invoke(action);
        assert(false, "invoke is valid, expected trapped (".concat(expected.value, ")"));
      } catch (err) {
        assert(err.message.toLowerCase() === expected.value.toLowerCase(), "Expected failure of ".concat(expected.value, ", ").concat(err.message, " given"));
      }
    } else {
      throw new Error("Unsupported action: " + action.id);
    }
  } // assert module is invalid with given failure string
  // ( assert_invalid <module> <failure> )


  function assert_invalid(node) {
    var _node$args3 = _slicedToArray(node.args, 2),
        module = _node$args3[0],
        expected = _node$args3[1];

    try {
      var enableTypeChecking = expected.value === "type mismatch" || expected.value === "global is immutable";
      createModuleInstanceFromAst(module, enableTypeChecking);
      assert(false, "module is valid, expected invalid (".concat(expected.value, ")"));
    } catch (err) {
      assert(new RegExp(expected.value, "ig").test(err.message), "Expected failure of \"".concat(expected.value, "\", \"").concat(err.message, "\" given"));
    }
  } // assert action has expected results
  // ( assert_return <action> <expr>* )
  // action:
  //   ( invoke <name>? <string> <expr>* )        ;; invoke function export
  //   ( get <name>? <string> )                   ;; get global export


  function assert_return(node) {
    var _node$args4 = _toArray(node.args),
        action = _node$args4[0],
        args = _node$args4.slice(1);

    addEndInstruction(args);
    var expectedRes = partialEvaluation.evaluate(allocator, args);

    if (action.type === "Instr" && action.id === "invoke") {
      var actualRes = invoke(action);
      assertSameStackLocal(actualRes, expectedRes);
    } else if (action.type === "Instr" && action.id === "get") {
      var id;

      if (action.args.length === 2) {
        id = action.args[1];
      } else {
        id = action.args[0];
      } // find export in instantiated module


      var module = instantiatedModules.find(function (_ref2) {
        var exports = _ref2.exports;
        return exports[id.value] !== undefined;
      });
      var _actualRes = module.exports[id.value];
      assertSameStackLocal(_actualRes, expectedRes);
    } else {
      throw new Error("Unsupported action in assert_return: " + action.id);
    }
  } // invoke function export
  // ( invoke <name>? <string> <expr>* )


  function invoke(node) {
    var _module$exports;

    var _node$args5 = _toArray(node.args),
        first = _node$args5[0],
        args = _node$args5.slice(1);

    var name = first;

    if (first.type === "Identifier") {
      // Module name
      // TODO(sven): ignore for now since we need to add an Identifier on the
      // module
      name = args.shift();
    } // find export in instantiated module


    var module = instantiatedModules.find(function (_ref3) {
      var exports = _ref3.exports;
      return exports[name.value] !== undefined;
    });
    assert(module !== undefined, "Module with export \"".concat(name.value, "\" not found"));
    var argValues = args.map(function (expr) {
      var code = [expr];
      addEndInstruction(code);
      var evaluation = partialEvaluation.evaluate(allocator, code);

      if (evaluation !== undefined) {
        // Pass the raw value here since we need the LongNumber representation
        // It's only meant for testing
        if (expr.object === "i64") {
          return evaluation.value._value;
        }

        return evaluation.value.toString();
      }
    });
    return (_module$exports = module.exports)[name.value].apply(_module$exports, _toConsumableArray(argValues));
  }
  /**
   * REPL
   */


  var memory = new Memory({
    initial: 100
  });
  var allocator = createAllocator(memory); // Cache instanced modules

  var instantiatedModules = [];

  function wrapInModule(node) {
    var name = "autogenerated";
    return t.module(name, [node]);
  }

  function assert(cond) {
    var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "unknown";

    if (cond === false) {
      error(new Error("assertion failure: " + msg));
      onAssert();
      return;
    }

    onOk();

    if (isVerbose === true) {
      onLog("Assertion OK");
    }
  }

  function assertSameStackLocal(actual, expected) {
    if (actual === undefined && expected === undefined) {
      return;
    }

    assert(typeof actual !== "undefined", "Actual value is undefined");
    var actualType = actual.type;
    var expectedType = expected.type;
    assert(actualType === expectedType, "Type expected \"".concat(expectedType, "\", \"").concat(actualType, "\" given"));
    var actualValue = actual.value.toString();
    var expectedValue = expected.value.toString();
    assert(actualValue === expectedValue, "Value expected \"".concat(expectedValue, "\", \"").concat(actualValue, "\" given"));
  }

  function countChar(_char) {
    return function (str) {
      return str.split("").reduce(function (acc, e) {
        if (e === _char) {
          acc++;
        }

        return acc;
      }, 0);
    };
  }

  var countOpeningParens = countChar("(");
  var countClosingParens = countChar(")"); // Buffer used to store incomplet user input

  var buffer = "";
  var openParens = 0;

  function error(_ref4) {
    var message = _ref4.message,
        stack = _ref4.stack;
    onLog("Error: " + message);

    if (isVerbose === true) {
      onLog(stack);
    }
  }

  function createModuleInstanceFromAst(moduleNode) {
    var enableTypeChecking = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var internalInstanceOptions = {
      checkForI64InSignature: false,
      returnStackLocal: true
    };
    var importObject = {
      _internalInstanceOptions: internalInstanceOptions
    };

    if (enableTypeChecking === true) {
      denormalizeTypeReferences(moduleNode);
      var typeErrors = getValidationErrors(t.program([moduleNode]));

      if (typeErrors.length > 0) {
        var containsImmutableGlobalViolation = typeErrors.some(function (x) {
          return x.match(/global is immutable/);
        });

        if (containsImmutableGlobalViolation) {
          throw new Error("global is immutable");
        }

        throw new Error("type mismatch");
      }
    }

    var compiledModule = createCompiledModule(moduleNode);
    return new Instance(compiledModule, importObject);
  }

  function replEval(input) {
    if (isVerbose === true) {
      onLog(input);
    }

    var ast = parse(input);

    var _ast$body = _slicedToArray(ast.body, 1),
        node = _ast$body[0]; // Empty input, skip this iteration


    if (node === undefined) {
      return;
    }

    if (node.type === "Instr") {
      if (node.id === "assert_invalid") {
        return assert_invalid(node);
      }

      if (node.id === "assert_return") {
        return assert_return(node);
      }

      if (node.id === "invoke") {
        return invoke(node);
      }

      if (node.id === "assert_return_canonical_nan") {
        throw new Error("assert_return_canonical_nan: not implemented yet");
      }

      if (node.id === "assert_return_arithmetic_nan") {
        throw new Error("assert_return_arithmetic_nan: not implemented yet");
      }

      if (node.id === "assert_trap") {
        return assert_trap(node);
      }

      if (node.id === "assert_malformed") {
        return assert_malformed(node);
      }

      if (node.id === "assert_unlinkable") {
        throw new Error("assert_unlinkable: not implemented yet");
      }
    } else if (node.type === "Module") {
      var instance = createModuleInstanceFromAst(node);
      instantiatedModules.unshift(instance);
    } else {
      // else wrap the instruction it into a module and interpret it
      createModuleInstanceFromAst(wrapInModule(node));
    }
  }

  function read(input) {
    openParens += countOpeningParens(input);
    openParens -= countClosingParens(input);
    buffer += input + "\n";

    if (openParens === 0) {
      try {
        replEval(buffer);
      } catch (err) {
        error(err);
      }

      buffer = "";
    }
  }

  return {
    read: read
  };
}