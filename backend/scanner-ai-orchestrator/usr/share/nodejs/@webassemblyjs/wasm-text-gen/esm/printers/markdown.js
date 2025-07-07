var _require = require("@webassemblyjs/ast"),
    traverse = _require.traverse;

function printExport(moduleExport, funcsTable) {
  if (moduleExport.descr.exportType === "Func") {
    var funcNode = funcsTable[moduleExport.descr.id.value];
    var params = funcNode.params.map(function (x) {
      return x.valtype;
    }).join(", ");
    var results = funcNode.result.join(", ") || "void";
    return "- " + moduleExport.name + "(" + params + "): " + results;
  }

  return "- Unknown (type " + moduleExport.descr.exportType + ")";
}

function printImport(moduleImport) {
  if (moduleImport.descr.type === "FuncImportDescr") {
    var params = moduleImport.descr.params.map(function (x) {
      return x.valtype;
    }).join(", ");
    var results = moduleImport.descr.results.join(", ") || "void";
    return "- " + moduleImport.module + "." + moduleImport.name + "(" + params + "): " + results;
  }

  return "- Unknown (type " + moduleImport.descr.type + ")";
}

function print(ast) {
  var out = "";
  var state = {
    moduleExports: [],
    moduleImports: [],
    funcsTable: {}
  };
  traverse(ast, {
    Func: function Func(_ref) {
      var node = _ref.node;
      state.funcsTable[node.name.value] = node;
    },
    ModuleExport: function ModuleExport(_ref2) {
      var node = _ref2.node;
      state.moduleExports.push(node);
    },
    ModuleImport: function ModuleImport(_ref3) {
      var node = _ref3.node;
      state.moduleImports.push(node);
    }
  });
  out += "## Imports:";

  if (state.moduleImports.length > 0) {
    out += "\n";
    out += state.moduleImports.reduce(function (acc, e) {
      return acc + printImport(e) + "\n";
    }, "");
  } else {
    out += " None";
  }

  out += "\n";
  out += "## Exports:";

  if (state.moduleExports.length > 0) {
    out += "\n";
    out += state.moduleExports.reduce(function (acc, e) {
      return acc + printExport(e, state.funcsTable) + "\n";
    }, "");
  } else {
    out += " None";
  }

  return out;
}

module.exports = print;