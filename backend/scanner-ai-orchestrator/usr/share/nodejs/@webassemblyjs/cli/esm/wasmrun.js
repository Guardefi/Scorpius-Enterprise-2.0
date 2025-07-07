#!/usr/bin/env node

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = require("webassemblyjs"),
    instantiate = _require.instantiate;

var fs = require("fs");

function debug(msg) {
  console.error(msg);
}

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

var filename = process.argv[2];
var entrypoint = process.argv[3];

if (typeof filename === "undefined") {
  throw new Error("Missing file");
}

debug("Compiling..."); // $FlowIgnore: this is correct but not correctly documented

var buff = toArrayBuffer(fs.readFileSync(filename, null));
var importObject = {
  env: {
    printf: function printf() {
      var _console;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      (_console = console).log.apply(_console, ["printf"].concat(args));
    }
  }
};
instantiate(buff, importObject).then(function (_ref) {
  var instance = _ref.instance;
  console.log("exports", Object.keys(instance.exports));

  if (typeof entrypoint !== "undefined") {
    var startfn = instance.exports[entrypoint];

    if (typeof startfn !== "function") {
      throw new Error("Entrypoint not found");
    }

    debug("Executing...");
    var exitCode = startfn.apply(void 0, _toConsumableArray(process.argv.slice(4)));
    console.log("exited with code", exitCode);
  }
})["catch"](function (err) {
  throw err;
});
process.on("unhandledRejection", function (error) {
  throw error;
});