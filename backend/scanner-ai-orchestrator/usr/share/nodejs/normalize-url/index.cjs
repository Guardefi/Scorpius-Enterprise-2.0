"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = normalizeUrl;
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _wrapRegExp() { _wrapRegExp = function _wrapRegExp(re, groups) { return new BabelRegExp(re, void 0, groups); }; var _super = RegExp.prototype, _groups = new WeakMap(); function BabelRegExp(re, flags, groups) { var _this = new RegExp(re, flags); return _groups.set(_this, groups || _groups.get(re)), _setPrototypeOf(_this, BabelRegExp.prototype); } function buildGroups(result, re) { var g = _groups.get(re); return Object.keys(g).reduce(function (groups, name) { var i = g[name]; if ("number" == typeof i) groups[name] = result[i];else { for (var k = 0; void 0 === result[i[k]] && k + 1 < i.length;) k++; groups[name] = result[i[k]]; } return groups; }, Object.create(null)); } return _inherits(BabelRegExp, RegExp), BabelRegExp.prototype.exec = function (str) { var result = _super.exec.call(this, str); if (result) { result.groups = buildGroups(result, this); var indices = result.indices; indices && (indices.groups = buildGroups(indices, this)); } return result; }, BabelRegExp.prototype[Symbol.replace] = function (str, substitution) { if ("string" == typeof substitution) { var groups = _groups.get(this); return _super[Symbol.replace].call(this, str, substitution.replace(/\$<([^>]+)>/g, function (_, name) { var group = groups[name]; return "$" + (Array.isArray(group) ? group.join("$") : group); })); } if ("function" == typeof substitution) { var _this = this; return _super[Symbol.replace].call(this, str, function () { var args = arguments; return "object" != _typeof(args[args.length - 1]) && (args = [].slice.call(args)).push(buildGroups(args, _this)), substitution.apply(this, args); }); } return _super[Symbol.replace].call(this, str, substitution); }, _wrapRegExp.apply(this, arguments); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
var DATA_URL_DEFAULT_MIME_TYPE = 'text/plain';
var DATA_URL_DEFAULT_CHARSET = 'us-ascii';
var testParameter = function testParameter(name, filters) {
  return filters.some(function (filter) {
    return filter instanceof RegExp ? filter.test(name) : filter === name;
  });
};
var normalizeDataURL = function normalizeDataURL(urlString, _ref) {
  var stripHash = _ref.stripHash;
  var match = /*#__PURE__*/_wrapRegExp(/^data:([^,]*?),([^#]*?)(?:#(.*))?$/, {
    type: 1,
    data: 2,
    hash: 3
  }).exec(urlString);
  if (!match) {
    throw new Error("Invalid URL: ".concat(urlString));
  }
  var _match$groups = match.groups,
    type = _match$groups.type,
    data = _match$groups.data,
    hash = _match$groups.hash;
  var mediaType = type.split(';');
  hash = stripHash ? '' : hash;
  var isBase64 = false;
  if (mediaType[mediaType.length - 1] === 'base64') {
    mediaType.pop();
    isBase64 = true;
  }

  // Lowercase MIME type
  var mimeType = (mediaType.shift() || '').toLowerCase();
  var attributes = mediaType.map(function (attribute) {
    var _attribute$split$map = attribute.split('=').map(function (string) {
        return string.trim();
      }),
      _attribute$split$map2 = _slicedToArray(_attribute$split$map, 2),
      key = _attribute$split$map2[0],
      _attribute$split$map3 = _attribute$split$map2[1],
      value = _attribute$split$map3 === void 0 ? '' : _attribute$split$map3;

    // Lowercase `charset`
    if (key === 'charset') {
      value = value.toLowerCase();
      if (value === DATA_URL_DEFAULT_CHARSET) {
        return '';
      }
    }
    return "".concat(key).concat(value ? "=".concat(value) : '');
  }).filter(Boolean);
  var normalizedMediaType = _toConsumableArray(attributes);
  if (isBase64) {
    normalizedMediaType.push('base64');
  }
  if (normalizedMediaType.length > 0 || mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE) {
    normalizedMediaType.unshift(mimeType);
  }
  return "data:".concat(normalizedMediaType.join(';'), ",").concat(isBase64 ? data.trim() : data).concat(hash ? "#".concat(hash) : '');
};
function normalizeUrl(urlString, options) {
  options = _objectSpread({
    defaultProtocol: 'http:',
    normalizeProtocol: true,
    forceHttp: false,
    forceHttps: false,
    stripAuthentication: true,
    stripHash: false,
    stripTextFragment: true,
    stripWWW: true,
    removeQueryParameters: [/^utm_\w+/i],
    removeTrailingSlash: true,
    removeSingleSlash: true,
    removeDirectoryIndex: false,
    sortQueryParameters: true
  }, options);
  urlString = urlString.trim();

  // Data URL
  if (/^data:/i.test(urlString)) {
    return normalizeDataURL(urlString, options);
  }
  if (/^view-source:/i.test(urlString)) {
    throw new Error('`view-source:` is not supported as it is a non-standard protocol');
  }
  var hasRelativeProtocol = urlString.startsWith('//');
  var isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString);

  // Prepend protocol
  if (!isRelativeUrl) {
    urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol);
  }
  var urlObject = new URL(urlString);
  if (options.forceHttp && options.forceHttps) {
    throw new Error('The `forceHttp` and `forceHttps` options cannot be used together');
  }
  if (options.forceHttp && urlObject.protocol === 'https:') {
    urlObject.protocol = 'http:';
  }
  if (options.forceHttps && urlObject.protocol === 'http:') {
    urlObject.protocol = 'https:';
  }

  // Remove auth
  if (options.stripAuthentication) {
    urlObject.username = '';
    urlObject.password = '';
  }

  // Remove hash
  if (options.stripHash) {
    urlObject.hash = '';
  } else if (options.stripTextFragment) {
    urlObject.hash = urlObject.hash.replace(/#?:~:text.*?$/i, '');
  }

  // Remove duplicate slashes if not preceded by a protocol
  // NOTE: This could be implemented using a single negative lookbehind
  // regex, but we avoid that to maintain compatibility with older js engines
  // which do not have support for that feature.
  if (urlObject.pathname) {
    // TODO: Replace everything below with `urlObject.pathname = urlObject.pathname.replace(/(?<!\b[a-z][a-z\d+\-.]{1,50}:)\/{2,}/g, '/');` when Safari supports negative lookbehind.

    // Split the string by occurrences of this protocol regex, and perform
    // duplicate-slash replacement on the strings between those occurrences
    // (if any).
    var protocolRegex = /\b[a-z][a-z\d+\-.]{1,50}:\/\//g;
    var lastIndex = 0;
    var result = '';
    for (;;) {
      var match = protocolRegex.exec(urlObject.pathname);
      if (!match) {
        break;
      }
      var protocol = match[0];
      var protocolAtIndex = match.index;
      var intermediate = urlObject.pathname.slice(lastIndex, protocolAtIndex);
      result += intermediate.replace(/\/{2,}/g, '/');
      result += protocol;
      lastIndex = protocolAtIndex + protocol.length;
    }
    var remnant = urlObject.pathname.slice(lastIndex, urlObject.pathname.length);
    result += remnant.replace(/\/{2,}/g, '/');
    urlObject.pathname = result;
  }

  // Decode URI octets
  if (urlObject.pathname) {
    try {
      urlObject.pathname = decodeURI(urlObject.pathname);
    } catch (_unused) {}
  }

  // Remove directory index
  if (options.removeDirectoryIndex === true) {
    options.removeDirectoryIndex = [/^index\.[a-z]+$/];
  }
  if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
    var pathComponents = urlObject.pathname.split('/');
    var lastComponent = pathComponents[pathComponents.length - 1];
    if (testParameter(lastComponent, options.removeDirectoryIndex)) {
      pathComponents = pathComponents.slice(0, -1);
      urlObject.pathname = pathComponents.slice(1).join('/') + '/';
    }
  }
  if (urlObject.hostname) {
    // Remove trailing dot
    urlObject.hostname = urlObject.hostname.replace(/\.$/, '');

    // Remove `www.`
    if (options.stripWWW && /^www\.(?!www\.)[a-z\-\d]{1,63}\.[a-z.\-\d]{2,63}$/.test(urlObject.hostname)) {
      // Each label should be max 63 at length (min: 1).
      // Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
      // Each TLD should be up to 63 characters long (min: 2).
      // It is technically possible to have a single character TLD, but none currently exist.
      urlObject.hostname = urlObject.hostname.replace(/^www\./, '');
    }
  }

  // Remove query unwanted parameters
  if (Array.isArray(options.removeQueryParameters)) {
    // eslint-disable-next-line unicorn/no-useless-spread -- We are intentionally spreading to get a copy.
    for (var _i2 = 0, _arr2 = _toConsumableArray(urlObject.searchParams.keys()); _i2 < _arr2.length; _i2++) {
      var key = _arr2[_i2];
      if (testParameter(key, options.removeQueryParameters)) {
        urlObject.searchParams["delete"](key);
      }
    }
  }
  if (!Array.isArray(options.keepQueryParameters) && options.removeQueryParameters === true) {
    urlObject.search = '';
  }

  // Keep wanted query parameters
  if (Array.isArray(options.keepQueryParameters) && options.keepQueryParameters.length > 0) {
    // eslint-disable-next-line unicorn/no-useless-spread -- We are intentionally spreading to get a copy.
    for (var _i3 = 0, _arr3 = _toConsumableArray(urlObject.searchParams.keys()); _i3 < _arr3.length; _i3++) {
      var _key = _arr3[_i3];
      if (!testParameter(_key, options.keepQueryParameters)) {
        urlObject.searchParams["delete"](_key);
      }
    }
  }

  // Sort query parameters
  if (options.sortQueryParameters) {
    urlObject.searchParams.sort();

    // Calling `.sort()` encodes the search parameters, so we need to decode them again.
    try {
      urlObject.search = decodeURIComponent(urlObject.search);
    } catch (_unused2) {}
  }
  if (options.removeTrailingSlash) {
    urlObject.pathname = urlObject.pathname.replace(/\/$/, '');
  }
  var oldUrlString = urlString;

  // Take advantage of many of the Node `url` normalizations
  urlString = urlObject.toString();
  if (!options.removeSingleSlash && urlObject.pathname === '/' && !oldUrlString.endsWith('/') && urlObject.hash === '') {
    urlString = urlString.replace(/\/$/, '');
  }

  // Remove ending `/` unless removeSingleSlash is false
  if ((options.removeTrailingSlash || urlObject.pathname === '/') && urlObject.hash === '' && options.removeSingleSlash) {
    urlString = urlString.replace(/\/$/, '');
  }

  // Restore relative protocol, if applicable
  if (hasRelativeProtocol && !options.normalizeProtocol) {
    urlString = urlString.replace(/^http:\/\//, '//');
  }

  // Remove http/https
  if (options.stripProtocol) {
    urlString = urlString.replace(/^(?:https?:)?\/\//, '');
  }
  return urlString;
}
