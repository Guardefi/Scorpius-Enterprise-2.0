#!/usr/bin/env node

var _require = require("fs"),
    readFileSync = _require.readFileSync;

var _require2 = require("@webassemblyjs/wasm-parser"),
    decode = _require2.decode;

var _require3 = require("@webassemblyjs/wast-printer"),
    print = _require3.print;

var decoderOpts = {}; // configure name resolution

if (process.argv.indexOf("--no-name-resolution") !== -1) {
  decoderOpts.ignoreCustomNameSection = true;
}

if (process.argv.indexOf("--ignore-code-section") !== -1) {
  decoderOpts.ignoreCodeSection = true;
}

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

var filename = process.argv[2];
var buff = toArrayBuffer(readFileSync(filename, null));
var ast = decode(buff, decoderOpts);
var wast = print(ast);
process.stdout.write(wast);