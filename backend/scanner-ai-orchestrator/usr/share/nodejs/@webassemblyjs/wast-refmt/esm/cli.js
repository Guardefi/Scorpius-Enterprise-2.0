#!/usr/bin/env node

var _require = require("fs"),
    readFileSync = _require.readFileSync,
    writeFileSync = _require.writeFileSync;

var refmt = require("./")["default"];

var filename = process.argv[2];
var isInplaceFix = process.argv.indexOf("--fix") !== -1;

if (typeof filename === "undefined") {
  throw new Error("Missing file");
}

var content = readFileSync(filename, "utf8");
var newContent = refmt(content);

if (isInplaceFix === true) {
  writeFileSync(filename, newContent);
} else {
  process.stdout.write(newContent);
}