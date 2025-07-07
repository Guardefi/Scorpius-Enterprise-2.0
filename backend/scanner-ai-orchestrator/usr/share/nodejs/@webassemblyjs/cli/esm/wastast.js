#!/usr/bin/env node

var _require = require("@webassemblyjs/wast-parser"),
    parse = _require.parse;

var _require2 = require("fs"),
    readFileSync = _require2.readFileSync;

var filename = process.argv[2];

if (typeof filename === "undefined") {
  throw new Error("Missing file");
}

var content = readFileSync(filename, "utf8");
var ast = parse(content);
console.log(JSON.stringify(ast, null, 2));