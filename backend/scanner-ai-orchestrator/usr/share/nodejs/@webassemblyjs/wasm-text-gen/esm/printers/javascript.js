var _require = require("@webassemblyjs/ast"),
    traverse = _require.traverse;

var template = require("@babel/template")["default"];

var generate = require("@babel/generator")["default"];

var t = require("@babel/types");

var globalInstanceIdentifier = t.identifier("instance");
var globalMemoryIdentifier = t.identifier("_memory0");
var globalTableIdentifier = t.identifier("_table0");
var exportFuncTemplate = template.program("\n  export function NAME(ARGS) {\n    if (typeof INSTANCE === \"undefined\") {\n      throw new Error(\"Can not call function \" + NAME.name + \", module not initialized.\");\n    }\n\n    return INSTANCE.exports.NAME(ARGS);\n  }\n");
var headerTemplate = template.program("\n  if (typeof WebAssembly === \"undefined\") {\n    throw new Error(\"WebAssembly not supported\");\n  }\n\n  let INSTANCE;\n\n  const MEMORY = new WebAssembly.Memory({initial: 100, limit: 1000});\n  const TABLE = new WebAssembly.Table({initial: 0, element: 'anyfunc'});\n");
var initFuncTemplate = template.program("\n  export const memory = MEMORY;\n  export const table = TABLE;\n\n  export default function(opts = {env:{}}) {\n\n    if (typeof opts.env.memory === \"undefined\") {\n      opts.env.memory = MEMORY;\n    }\n\n    if (typeof opts.env.table === \"undefined\") {\n      opts.env.table = TABLE;\n    }\n\n    const importObject = opts;\n\n    const getArrayBuffer = response => response.arrayBuffer();\n    const instantiate = bytes => WebAssembly.instantiate(bytes, importObject);\n    const getInstance = results => (instance = results.instance);\n\n    return window.fetch(URL)\n      .then(getArrayBuffer)\n      .then(instantiate)\n      .then(getInstance);\n  }\n");

function genTemplate(fn, opts) {
  var ast = fn(opts);
  return generate(ast).code;
}

function printExport(moduleExport, funcsTable) {
  if (moduleExport.descr.exportType === "Func") {
    var funcNode = funcsTable[moduleExport.descr.id.value];
    var params = funcNode.params.map(function (x) {
      return x.valtype;
    }).map(function (x, k) {
      return t.identifier("p" + k + "_" + x);
    });
    return genTemplate(exportFuncTemplate, {
      NAME: t.identifier(moduleExport.name),
      ARGS: params,
      INSTANCE: globalInstanceIdentifier
    }) + "\n\n";
  }

  return "";
}

function print(ast, _ref) {
  var url = _ref.url;

  if (typeof url === "undefined") {
    throw new Error("You need to provide --url [url]");
  }

  var out = "";
  var state = {
    moduleExports: [],
    moduleImports: [],
    funcsTable: {}
  };
  traverse(ast, {
    Func: function Func(_ref2) {
      var node = _ref2.node;
      state.funcsTable[node.name.value] = node;
    },
    ModuleExport: function ModuleExport(_ref3) {
      var node = _ref3.node;
      state.moduleExports.push(node);
    },
    ModuleImport: function ModuleImport(_ref4) {
      var node = _ref4.node;
      state.moduleImports.push(node);
    }
  }); // Add comment

  out += "/**\n";
  out += " * Autogenered by wasmgen -o js.\n";
  out += " *\n";
  out += " * DO NOT EDIT.\n";
  out += " */\n";
  out += "\n";
  out += genTemplate(headerTemplate, {
    INSTANCE: globalInstanceIdentifier,
    MEMORY: globalMemoryIdentifier,
    TABLE: globalTableIdentifier
  });
  out += "\n\n";
  out += genTemplate(initFuncTemplate, {
    URL: t.StringLiteral(url),
    MEMORY: globalMemoryIdentifier,
    TABLE: globalTableIdentifier
  });
  out += "\n\n";

  if (state.moduleExports.length > 0) {
    out += state.moduleExports.reduce(function (acc, e) {
      return acc + printExport(e, state.funcsTable);
    }, "");
  }

  return out;
}

module.exports = print;