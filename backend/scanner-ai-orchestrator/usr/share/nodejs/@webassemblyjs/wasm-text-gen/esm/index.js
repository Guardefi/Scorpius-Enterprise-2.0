var _require = require("@webassemblyjs/wasm-parser"),
    decode = _require.decode;

var printText = require("./printers/text");

var printMarkdown = require("./printers/markdown");

var printJavaScript = require("./printers/javascript");

module.exports = function (buff, _ref) {
  var out = _ref.out,
      url = _ref.url;
  var ast = decode(buff);

  switch (out) {
    case "text":
      return printText(ast);

    case "md":
    case "markdown":
      return printMarkdown(ast);

    case "js":
    case "javascript":
      return printJavaScript(ast, {
        url: url
      });

    default:
      throw new Error("Unsupported output: " + out);
  }
};