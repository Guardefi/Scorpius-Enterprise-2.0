import { traverse } from "@webassemblyjs/ast";

function duplicatedExports(name) {
  return "duplicate export name \"".concat(name, "\"");
}

export default function validate(ast) {
  var errors = [];
  var seenExports = {};
  traverse(ast, {
    ModuleExport: function (_ModuleExport) {
      function ModuleExport(_x) {
        return _ModuleExport.apply(this, arguments);
      }

      ModuleExport.toString = function () {
        return _ModuleExport.toString();
      };

      return ModuleExport;
    }(function (path) {
      var name = path.node.name;

      if (seenExports[name] !== undefined) {
        return errors.push(duplicatedExports(name));
      }

      seenExports[name] = true;
    })
  });
  return errors;
}