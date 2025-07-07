#!/usr/bin/env node

var readline = require("readline");

var _require = require("fs"),
    createReadStream = _require.createReadStream;

var _require2 = require("./index"),
    createRepl = _require2.createRepl;

var filename = process.argv[2];
var isVerbose = process.argv.find(function (x) {
  return x === "--debug";
}) !== undefined;

function onAssert() {
  process.exit(1);
}

function onLog(txt) {
  console.log(txt);
}

function onOk() {}

var repl = createRepl({
  isVerbose: isVerbose,
  onAssert: onAssert,
  onOk: onOk,
  onLog: onLog
});

if (filename === undefined) {
  var rl = readline.createInterface({
    input: process.stdin
  });
  process.stdout.write("wasm 1.0 JavaScript interpreter\n");
  process.stdout.write("> ");
  rl.on("line", repl.read);
} else {
  var _rl = readline.createInterface({
    input: createReadStream(filename)
  });

  _rl.on("line", repl.read);
}