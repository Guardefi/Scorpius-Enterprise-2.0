function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import Long from "@xtuc/long";

function eq(actual, expected) {
  // check type
  if (!(actual.type === expected.type)) {
    throw new Error('actual.type === expected.type' + " error: " + ("type mismatch; expected ".concat(expected.type, ", given ").concat(actual.type) || "unknown"));
  }

  // check value
  switch (expected.type) {
    case "i32":
      {
        var i32Value = Long.fromString(expected.value).toInt();

        if (!(actual.value.toString() === i32Value.toString())) {
          throw new Error('actual.value.toString() === i32Value.toString()' + " error: " + ("Expected value ".concat(i32Value, ", got ").concat(actual.value.toString()) || "unknown"));
        }

        break;
      }

    case "f32":
      {
        var actuali32 = actual.value.reinterpret();
        var expectedi32 = Long.fromString(expected.value).toInt();

        if (!(actuali32.toNumber() === expectedi32)) {
          throw new Error('actuali32.toNumber() === expectedi32' + " error: " + ("Expected value ".concat(expectedi32, ", got ").concat(actuali32.toString()) || "unknown"));
        }

        break;
      }

    case "f64":
      {
        var _actuali = actual.value.reinterpret();

        var _expectedi = Long.fromString(expected.value).toNumber();

        if (!(_actuali.toNumber() === _expectedi)) {
          throw new Error('_actuali.toNumber() === _expectedi' + " error: " + ("Expected value ".concat(_expectedi, ", got ").concat(_actuali.toString()) || "unknown"));
        }

        break;
      }

    case "i64":
      {
        console.warn("eq with i64 is unsupported"); // const actuali64 = actual.value.toString();
        // const expectedi64 = Long.fromString(expected.value)
        //   .toSigned()
        //   .toString();
        // FIXME(sven): fix this
        // assert(
        //   actuali64 === expectedi64,
        //   `Expected value ${expectedi64}, got ${actuali64}`
        // );

        break;
      }

    default:
      throw new Error("Unsupport eq with type: " + expected.type);
  }
} // assert action has expected results
// ( assert_return <action> <expr>* )
//


export function assert_return(element, action, expected) {
  var type = action.type,
      args = action.args;

  if (!(type === "invoke" || type === "get")) {
    throw new Error('type === "invoke" || type === "get"' + " error: " + ("unsupported type \"".concat(type, "\"") || "unknown"));
  }

  if (type === "get") {
    if (expected.length > 0) {
      eq(element, expected[0]);
    }
  }

  if (type === "invoke") {
    var compatibleArgs = args.map(function (x) {
      if (x.type === "i64") {
        return new Long.fromString(x.value);
      }

      return x.value;
    });
    var res = element.apply(void 0, _toConsumableArray(compatibleArgs));

    if (expected.length > 0) {
      eq(res, expected[0]);
    }
  }
} // ;; assert module cannot be decoded with given failure string
// ( assert_malformed <module> <failure> )
//

export function assert_malformed(getInstance, expected) {
  try {
    getInstance();

    if (!false) {
      throw new Error('false' + " error: " + ("did not throw any error" || "unknown"));
    }
  } catch (e) {
    if (!e.message.match(new RegExp(expected, "gm"))) {
      throw new Error('e.message.match(new RegExp(expected, "gm"))' + " error: " + ("Expected error \"".concat(expected, "\", got \"").concat(e.message, "\"") || "unknown"));
    }
  }
} // assert module is invalid with given failure string
// ( assert_invalid <module> <failure> )
//

export function assert_invalid(getInstance, expected) {
  if (expected === "type mismatch") {
    expected = "Expected type|Stack contains additional type";
  }

  try {
    getInstance();

    if (!false) {
      throw new Error('false' + " error: " + ("did not throw any error" || "unknown"));
    }
  } catch (e) {
    if (!e.message.match(new RegExp(expected, "gm"))) {
      throw new Error('e.message.match(new RegExp(expected, "gm"))' + " error: " + ("Expected error \"".concat(expected, "\", got \"").concat(e.message, "\"") || "unknown"));
    }
  }
} // assert module traps on instantiation
// ( assert_trap <module> <failure> )
//

export function assert_trap(element, action, expected) {
  var type = action.type,
      args = action.args;

  if (!(type === "invoke")) {
    throw new Error('type === "invoke"' + " error: " + ("unsupported type \"".concat(type, "\"") || "unknown"));
  }

  if (type === "invoke") {
    var compatibleArgs = args.map(function (x) {
      if (x.type === "i64") {
        return new Long.fromString(x.value);
      }

      return x.value;
    });

    try {
      element.apply(void 0, _toConsumableArray(compatibleArgs));
    } catch (e) {
      if (!e.message.match(new RegExp(expected, "gm"))) {
        throw new Error('e.message.match(new RegExp(expected, "gm"))' + " error: " + ("Expected error \"".concat(expected, "\", got \"").concat(e.message, "\"") || "unknown"));
      }
    }
  }
}