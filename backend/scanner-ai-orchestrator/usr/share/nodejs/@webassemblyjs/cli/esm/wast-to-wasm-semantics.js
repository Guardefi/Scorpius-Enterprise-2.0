#!/usr/bin/env node

var wastIdentifierToIndex = require("@webassemblyjs/ast/lib/transform/wast-identifier-to-index");

var denormalizeTypeReferences = require("@webassemblyjs/ast/lib/transform/denormalize-type-references");

var _require = require("@webassemblyjs/wast-parser"),
    parse = _require.parse;

var _require2 = require("@webassemblyjs/wast-printer"),
    print = _require2.print;

var _require3 = require("fs"),
    readFileSync = _require3.readFileSync;

var filename = process.argv[2];

if (typeof filename === "undefined") {
  throw new Error("Missing file");
}

var content = readFileSync(filename, "utf8");
var ast = parse(content);
denormalizeTypeReferences.transform(ast);
wastIdentifierToIndex.transform(ast);
console.log(print(ast));