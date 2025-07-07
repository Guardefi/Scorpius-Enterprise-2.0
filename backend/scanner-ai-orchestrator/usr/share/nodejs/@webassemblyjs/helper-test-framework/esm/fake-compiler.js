import { instruction } from "@webassemblyjs/ast";
import { listOfInstructionsToIr } from "@webassemblyjs/helper-compiler";
export function addFakeLocsListOfInstructions(instrs) {
  var loc = function loc(x) {
    return {
      start: {
        column: x,
        line: -1
      },
      end: {
        column: x + 1,
        line: -1
      }
    };
  };

  instrs.forEach(function (instr, index) {
    instr.loc = loc(index);
  });
}
export function compileASTNodes(nodes) {
  nodes.push(instruction("end"));
  addFakeLocsListOfInstructions(nodes);
  return listOfInstructionsToIr(nodes);
}