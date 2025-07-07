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

import Long from "@xtuc/long";
import { Float, typedArrayToArray } from "./number";
import { i64 } from "./i64";
var type = "f64";
export var f64 = /*#__PURE__*/function (_Float) {
  _inherits(f64, _Float);

  var _super = _createSuper(f64);

  function f64() {
    _classCallCheck(this, f64);

    return _super.apply(this, arguments);
  }

  _createClass(f64, [{
    key: "reinterpret",
    value: function reinterpret() {
      var floatArray = new Float64Array(1);
      floatArray[0] = this._value;
      var lowIntArray = new Int32Array(floatArray.buffer.slice(0, 4));
      var highIntArray = new Int32Array(floatArray.buffer.slice(4, 8));
      return new i64(Long.fromBits(lowIntArray[0], highIntArray[0]));
    }
  }, {
    key: "toByteArray",
    value: function toByteArray() {
      var floatArray = new Float64Array(1);
      floatArray[0] = this._value;
      return typedArrayToArray(new Int8Array(floatArray.buffer));
    }
  }], [{
    key: "fromArrayBuffer",
    value: function fromArrayBuffer(buffer, ptr) {
      var slice = buffer.slice(ptr, ptr + 8);
      var value = new Float64Array(slice);
      return new f64(value[0]);
    }
  }]);

  return f64;
}(Float);
export var f64inf = /*#__PURE__*/function (_f) {
  _inherits(f64inf, _f);

  var _super2 = _createSuper(f64inf);

  function f64inf() {
    _classCallCheck(this, f64inf);

    return _super2.apply(this, arguments);
  }

  _createClass(f64inf, [{
    key: "reinterpret",
    value: function reinterpret() {
      // Exponent is all 1's, mantissa is all zeros
      var upper = 0x7ff << 20;

      if (this._value < 0) {
        upper = upper | 0x80000000;
      }

      return new i64(Long.fromBits(0, upper).toSigned());
    }
  }]);

  return f64inf;
}(f64);
export var f64nan = /*#__PURE__*/function (_f2) {
  _inherits(f64nan, _f2);

  var _super3 = _createSuper(f64nan);

  function f64nan() {
    _classCallCheck(this, f64nan);

    return _super3.apply(this, arguments);
  }

  _createClass(f64nan, [{
    key: "reinterpret",
    value: function reinterpret() {
      var lower = 0;
      var upper = 0; // sign bit of _value shifted to position 0

      if (this._value <= 0) {
        upper = upper | 0x80000000;
      } // 11-bit exponent shifted to position 1 through 11


      upper = upper | 0x7ff << 20; // 52-bit mantissa which is obtained by disregarding the sign of _value

      var mantissa = this._value <= 0 ? -this._value : this._value;
      lower = lower | mantissa % Math.pow(2, 32);
      upper = upper | Math.floor(mantissa / Math.pow(2, 32));
      return new i64(Long.fromBits(lower, upper));
    }
  }]);

  return f64nan;
}(f64);
export function createInfFromAST(sign) {
  return {
    type: type,
    value: new f64inf(sign)
  };
}
export function createNanFromAST(payload) {
  return {
    type: type,
    value: new f64nan(payload)
  };
}
export function createValueFromAST(value) {
  return {
    type: type,
    value: new f64(value)
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
    value: f64.fromArrayBuffer(buffer, ptr)
  };
}