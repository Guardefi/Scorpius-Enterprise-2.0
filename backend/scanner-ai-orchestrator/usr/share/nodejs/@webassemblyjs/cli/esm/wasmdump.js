#!/usr/bin/env node

var _require = require("@webassemblyjs/wasm-parser"),
    decode = _require.decode;

var _require2 = require("fs"),
    readFileSync = _require2.readFileSync;

function toArrayBuffer(buf) {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

var filename = process.argv[2];

if (typeof filename === "undefined") {
  throw new Error("Missing file");
}

var decoderOpts = {
  dump: true
};

if (process.argv.indexOf("--ignore-code-section") !== -1) {
  decoderOpts.ignoreCodeSection = true;
}

if (process.argv.indexOf("--error-on-unknown-section") !== -1) {
  decoderOpts.errorOnUnknownSection = true;
} // $FlowIgnore: this is correct but not correctly documented


var buff = toArrayBuffer(readFileSync(filename, null));
decode(buff, decoderOpts);