import { parse } from "@webassemblyjs/wast-parser";
import { print } from "@webassemblyjs/wast-printer";
export default function (content) {
  var ast = parse(content);
  return print(ast);
}