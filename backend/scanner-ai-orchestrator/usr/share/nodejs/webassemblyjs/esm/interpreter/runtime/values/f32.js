function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

import { Float, typedArrayToArray } from "./number";
import { i32 } from "./i32";
var type = "f32";
var one = new i32(1);
var zero = new i32(0);
export var f32 = /*#__PURE__*/function (_Float) {
  _inherits(f32, _Float);

  var _super = _createSuper(f32);

  function f32() {
    _classCallCheck(this, f32);

    return _super.apply(this, arguments);
  }

  _createClass(f32, [{
    key: "reinterpret",
    value: function reinterpret() {
      var floatArray = new Float32Array(1);
      floatArray[0] = this._value;
      var intArray = new Int32Array(floatArray.buffer);
      return new i32(intArray[0]);
    }
  }, {
    key: "add",
    value: function add(operand) {
      // If the other operand is a nan we use its implementation, otherwise the Float one.
      return operand instanceof f32nan ? // $FlowIgnore
      operand.add(this) : // $FlowIgnore
      Float.prototype.add.call(this, operand);
    }
  }, {
    key: "sub",
    value: function sub(operand) {
      // If the other operand is a nan we use its implementation, otherwise the Float one.
      return operand instanceof f32nan ? // $FlowIgnore
      operand.sub(this) : // $FlowIgnore
      Float.prototype.sub.call(this, operand);
    }
  }, {
    key: "mul",
    value: function mul(operand) {
      // If the other operand is a nan we use its implementation, otherwise the Float one.
      return operand instanceof f32nan ? // $FlowIgnore
      operand.mul(this) : // $FlowIgnore
      Float.prototype.mul.call(this, operand);
    }
  }, {
    key: "div",
    value: function div(operand) {
      // If the other operand is a nan we use its implementation, otherwise the Float one.
      return operand instanceof f32nan ? // $FlowIgnore
      operand.div(this) : // $FlowIgnore
      Float.prototype.div.call(this, operand);
    }
  }, {
    key: "toByteArray",
    value: function toByteArray() {
      var floatArray = new Float32Array(1);
      floatArray[0] = this._value;
      return typedArrayToArray(new Int8Array(floatArray.buffer));
    }
  }, {
    key: "eq",
    value: function eq(operand) {
      if (operand instanceof f32nan) {
        return operand.eq();
      }

      if (this._value === operand._value) {
        return one;
      } else {
        return zero;
      }
    }
  }, {
    key: "gt",
    value: function gt(operand) {
      var z1 = this;
      var z2 = operand; // If either z1 or z2 is a NaN, then return 0.

      if (isNaN(z1._value) === true || isNaN(z2._value) === true) {
        return zero;
      } // Else if z1 and z2 are the same value, then return 0.


      if (z1.equals(z2) === true) {
        return zero;
      } // Else if z1 is positive infinity, then return 1.


      if (Math.sign(z1._value) === 1 && z1 instanceof f32inf) {
        return one;
      } // Else if z1 is negative infinity, then return 0.


      if (Math.sign(z1._value) === -1 && z1 instanceof f32inf) {
        return one;
      } // Else if z2 is positive infinity, then return 0.


      if (Math.sign(z2._value) === 1 && z2 instanceof f32inf) {
        return zero;
      } // Else if z2 is negative infinity, then return 1.


      if (Math.sign(z2._value) === -1 && z2 instanceof f32inf) {
        return one;
      } // Else if both z1 and z2 are zeroes, then return 0.


      if (z1._value === 0 && z2._value === 0) {
        return zero;
      } // Else if z1 is larger than z2, then return 1.


      if (z1._value > z2._value) {
        return one;
      } // Else return 0.


      return zero;
    }
  }], [{
    key: "fromArrayBuffer",
    value: function fromArrayBuffer(buffer, ptr) {
      var slice = buffer.slice(ptr, ptr + 4);
      var value = new Float32Array(slice);
      return new f32(value[0]);
    }
  }]);

  return f32;
}(Float);
export var f32nan = /*#__PURE__*/function (_f) {
  _inherits(f32nan, _f);

  var _super2 = _createSuper(f32nan);

  function f32nan() {
    _classCallCheck(this, f32nan);

    return _super2.apply(this, arguments);
  }

  _createClass(f32nan, [{
    key: "reinterpret",
    value:
    /**
     * Interprets the bit representation for this nan as an integer
     * https://webassembly.github.io/spec/core/syntax/values.html#floating-point
     *
     * A 32 bit nan looks like this
     *
     * ------------------------------
     * |s|1|1|1|1|1|1|1|1|m1|...|m23|
     * ------------------------------
     *
     * The exponent is all 1's and the mantissa [m1,...m23] is non-zero ().
     *
     * We store sign and mantissa both in the _value field,
     * which is reflected by the computation below.
     */
    function reinterpret() {
      var result = 0; // sign bit of _value shifted to position 0

      if (this._value <= 0) {
        result = result | 0x80000000;
      } // 8-bit exponent shifted to position 1 through 8


      result = result | 0xff << 23; // 23-bit mantissa which is obtained by disregarding the sign of _value

      var mantissa = this._value <= 0 ? -this._value : this._value;
      result = result | mantissa;
      return new i32(result);
    }
  }, {
    key: "add",
    value: function add() {
      // nan(z1) + x = nan(z1) a is valid execution.
      return this;
    }
  }, {
    key: "sub",
    value: function sub() {
      return this;
    }
  }, {
    key: "mul",
    value: function mul() {
      return this;
    }
  }, {
    key: "div",
    value: function div() {
      return this;
    }
  }, {
    key: "eq",
    value: function eq() {
      // If either z1 or z2 is a NaN, then return 0.
      return new i32(0);
    }
  }]);

  return f32nan;
}(f32);
export var f32inf = /*#__PURE__*/function (_f2) {
  _inherits(f32inf, _f2);

  var _super3 = _createSuper(f32inf);

  function f32inf() {
    _classCallCheck(this, f32inf);

    return _super3.apply(this, arguments);
  }

  _createClass(f32inf, [{
    key: "reinterpret",
    value: function reinterpret() {
      // Exponent is all 1's, mantissa is all zeros
      var result = 0xff << 23;

      if (this._value < 0) {
        result = result | 0x80000000;
      }

      return new i32(result);
    }
  }]);

  return f32inf;
}(f32);
export function createInfFromAST(sign) {
  return {
    type: type,
    value: new f32inf(sign)
  };
}
export function createNanFromAST(payload) {
  return {
    type: type,
    value: new f32nan(payload)
  };
}
export function createValueFromAST(value) {
  return {
    type: type,
    value: new f32(value)
  };
}
export function createValue(value) {
  return {
    type: type,
    value: value
  };
}
export function createValueFromArrayBuffer(buffer, ptr) {
  return {
    type: type,
    value: f32.fromArrayBuffer(buffer, ptr)
  };
}