import { execSync } from "child_process";
import { basename, join } from "path";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { decode } from "@webassemblyjs/wasm-parser";
import { parse } from "@webassemblyjs/wast-parser";
import { createCompiledModule } from "webassemblyjs/lib/compiler/compile/module";
import { Instance } from "webassemblyjs/lib/interpreter";
import { assert_return, assert_malformed, assert_invalid, assert_trap } from "./asserts";
var WASM_TEST_DIR = "./wasm_test_dir";

function getModuleName(command) {
  return command.name || "__default";
}

var decoderOpts = {};
var lastInstance;
var namedInstances = {};
export default function run(filename) {
  if (!(typeof filename === "string")) {
    throw new Error('typeof filename === "string"' + " error: " + ("please specify a filename" || "unknown"));
  }

  if (existsSync(WASM_TEST_DIR) === false) {
    mkdirSync(WASM_TEST_DIR);
  } // generate wasm files


  var out = basename(filename);
  var manifestOut = join(WASM_TEST_DIR, out + ".json");
  execSync("wast2json --debug-names ".concat(filename, " -o ").concat(manifestOut)); // run tests

  var manifest = JSON.parse(readFileSync(manifestOut, "utf8"));
  manifest.commands.forEach(function (command) {
    switch (command.type) {
      case "module":
        {
          // $FlowIgnore
          lastInstance = namedInstances[getModuleName(command)] = loadModule("binary", command.filename);
          break;
        }

      case "assert_return":
        {
          if (!(namedInstances[getModuleName(command)] !== undefined)) {
            throw new Error('namedInstances[getModuleName(command)] !== undefined' + " error: " + (undefined || "unknown"));
          }

          var fn = getExportedElement(command.action.field, command.action.module);
          assert_return(fn, command.action, command.expected);
          break;
        }

      case "assert_malformed":
        {
          assert_malformed(function () {
            return loadModule(command.module_type, command.filename);
          }, command.text);
          break;
        }

      case "assert_invalid":
        {
          assert_invalid(function () {
            return loadModule(command.module_type, command.filename);
          }, command.text);
          break;
        }

      case "assert_trap":
        {
          var _fn = getExportedElement(command.action.field, command.action.module);

          assert_trap(_fn, command.action, command.text);
          break;
        }

      default:
        throw new Error("unknown command: " + command.type);
    }

    console.log("PASS " + commandToString(command));
  });
}

function commandToString(command) {
  var out = "";
  out += command.type;

  if (command.text !== undefined) {
    out += " " + command.text;
  }

  out += " at line " + command.line;
  return out;
}

function getExportedElement(name, moduleName) {
  if (lastInstance.exports[name] !== undefined) {
    return lastInstance.exports[name];
  }

  if (!(moduleName !== undefined)) {
    throw new Error('moduleName !== undefined' + " error: " + ("no named module for " + name || "unknown"));
  }

  // $FlowIgnore: asserted above
  var instance = namedInstances[moduleName];

  if (!(instance !== undefined)) {
    throw new Error('instance !== undefined' + " error: " + ("module instance ".concat(String(moduleName), " not found") || "unknown"));
  }

  // $FlowIgnore: asserted above
  var fn = instance.exports[name];

  if (!(fn !== undefined)) {
    throw new Error('fn !== undefined' + " error: " + ("function ".concat(name, " not found in ").concat(String(moduleName)) || "unknown"));
  }

  return fn;
} // $FlowIgnore


function loadModule(type, filename) {
  var internalInstanceOptions = {
    checkForI64InSignature: false,
    returnStackLocal: true
  };
  var importObject = {
    _internalInstanceOptions: internalInstanceOptions
  };

  if (type === "text") {
    var content = readFileSync(join(WASM_TEST_DIR, filename), "utf8"); // we need a module in order to be compiled

    var ast = parse("(module " + content + ")"); // TODO(sven): pass fakeCompiler here?

    var module = createCompiledModule(ast);
    return new Instance(module, importObject);
  } else if (type === "binary") {
    // $FlowIgnore
    var buff = readFileSync(join(WASM_TEST_DIR, filename), null);

    var _ast = decode(buff, decoderOpts);

    var _module = createCompiledModule(_ast);

    return new Instance(_module, importObject);
  } else {
    throw new Error("unsupported module type: " + type);
  }
}