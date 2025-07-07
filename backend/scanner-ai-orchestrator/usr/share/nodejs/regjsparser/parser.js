// regjsparser
//
// ==================================================================
//
// See ECMA-262 Standard: 15.10.1
//
// NOTE: The ECMA-262 standard uses the term "Assertion" for /^/. Here the
//   term "Anchor" is used.
//
// Pattern ::
//      Disjunction
//
// Disjunction ::
//      Alternative
//      Alternative | Disjunction
//
// Alternative ::
//      [empty]
//      Alternative Term
//
// Term ::
//      Anchor
//      Atom
//      Atom Quantifier
//
// Anchor ::
//      ^
//      $
//      \ b
//      \ B
//      ( ? = Disjunction )
//      ( ? ! Disjunction )
//      ( ? < = Disjunction )
//      ( ? < ! Disjunction )
//
// Quantifier ::
//      QuantifierPrefix
//      QuantifierPrefix ?
//
// QuantifierPrefix ::
//      *
//      +
//      ?
//      { DecimalDigits }
//      { DecimalDigits , }
//      { DecimalDigits , DecimalDigits }
//
// Atom ::
//      PatternCharacter
//      .
//      \ AtomEscape
//      CharacterClass
//      ( GroupSpecifier Disjunction )
//      ( ? : Disjunction )
//
// PatternCharacter ::
//      SourceCharacter but not any of: ^ $ \ . * + ? ( ) [ ] { } |
//
// AtomEscape ::
//      DecimalEscape
//      CharacterClassEscape
//      CharacterEscape
//      k GroupName
//
// CharacterEscape[U] ::
//      ControlEscape
//      c ControlLetter
//      HexEscapeSequence
//      RegExpUnicodeEscapeSequence[?U] (ES6)
//      IdentityEscape[?U]
//
// ControlEscape ::
//      one of f n r t v
// ControlLetter ::
//      one of
//          a b c d e f g h i j k l m n o p q r s t u v w x y z
//          A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
//
// IdentityEscape ::
//      SourceCharacter but not c
//
// DecimalEscape ::
//      DecimalIntegerLiteral [lookahead ∉ DecimalDigit]
//
// CharacterClassEscape ::
//      one of d D s S w W
//
// CharacterClass ::
//      [ [lookahead ∉ {^}] ClassRanges ]
//      [ ^ ClassRanges ]
//
// ClassRanges ::
//      [empty]
//      [~V] NonemptyClassRanges
//      [+V] ClassContents
//
// NonemptyClassRanges ::
//      ClassAtom
//      ClassAtom NonemptyClassRangesNoDash
//      ClassAtom - ClassAtom ClassRanges
//
// NonemptyClassRangesNoDash ::
//      ClassAtom
//      ClassAtomNoDash NonemptyClassRangesNoDash
//      ClassAtomNoDash - ClassAtom ClassRanges
//
// ClassAtom ::
//      -
//      ClassAtomNoDash
//
// ClassAtomNoDash ::
//      SourceCharacter but not one of \ or ] or -
//      \ ClassEscape
//
// ClassEscape ::
//      DecimalEscape
//      b
//      CharacterEscape
//      CharacterClassEscape
//
// GroupSpecifier ::
//      [empty]
//      ? GroupName
//
// GroupName ::
//      < RegExpIdentifierName >
//
// RegExpIdentifierName ::
//      RegExpIdentifierStart
//      RegExpIdentifierName RegExpIdentifierContinue
//
// RegExpIdentifierStart ::
//      UnicodeIDStart
//      $
//      _
//      \ RegExpUnicodeEscapeSequence
//
// RegExpIdentifierContinue ::
//      UnicodeIDContinue
//      $
//      _
//      \ RegExpUnicodeEscapeSequence
//      <ZWNJ>
//      <ZWJ>
//
// --------------------------------------------------------------
// NOTE: The following productions refer to the "set notation and
//       properties of strings" proposal.
//       https://github.com/tc39/proposal-regexp-set-notation
// --------------------------------------------------------------
//
// ClassContents ::
//      ClassUnion
//      ClassIntersection
//      ClassSubtraction
//
// ClassUnion ::
//      ClassRange ClassUnion?
//      ClassOperand ClassUnion?
//
// ClassIntersection ::
//      ClassOperand && [lookahead ≠ &] ClassOperand
//      ClassIntersection && [lookahead ≠ &] ClassOperand
//
// ClassSubtraction ::
//      ClassOperand -- ClassOperand
//      ClassSubtraction -- ClassOperand
//
// ClassOperand ::
//      ClassCharacter
//      ClassStrings
//      NestedClass
//
// NestedClass ::
//      [ [lookahead ≠ ^] ClassRanges[+U,+V] ]
//      [ ^ ClassRanges[+U,+V] ]
//      \ CharacterClassEscape[+U, +V]
//
// ClassRange ::
//      ClassCharacter - ClassCharacter
//
// ClassCharacter ::
//      [lookahead ∉ ClassReservedDouble] SourceCharacter but not ClassSyntaxCharacter
//      \ CharacterEscape[+U]
//      \ ClassHalfOfDouble
//      \ b
//
// ClassSyntaxCharacter ::
//      one of ( ) [ ] { } / - \ |
//
// ClassStrings ::
//      ( ClassString MoreClassStrings? )
//
// MoreClassStrings ::
//      | ClassString MoreClassStrings?
//
// ClassString ::
//      [empty]
//      NonEmptyClassString
//
// NonEmptyClassString ::
//      ClassCharacter NonEmptyClassString?
//
// ClassReservedDouble ::
//      one of && !! ## $$ %% ** ++ ,, .. :: ;; << == >> ?? @@ ^^ __ `` ~~
//
// ClassHalfOfDouble ::
//      one of & - ! # % , : ; < = > @ _ ` ~
//
// --------------------------------------------------------------
// NOTE: The following productions refer to the
//       "Regular Expression Pattern Modifiers for ECMAScript" proposal.
//       https://github.com/tc39/proposal-regexp-modifiers
// --------------------------------------------------------------
//
// Atom ::
//      ( ? RegularExpressionFlags : Disjunction )
//      ( ? RegularExpressionFlags - RegularExpressionFlags : Disjunction )
//

"use strict";
(function() {

  const unicodeData = require("./unicode-data.js");

  var fromCodePoint = String.fromCodePoint || (function() {
    // Implementation taken from
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint

    var stringFromCharCode = String.fromCharCode;
    var floor = Math.floor;

    return function fromCodePoint() {
      var MAX_SIZE = 0x4000;
      var codeUnits = [];
      var highSurrogate;
      var lowSurrogate;
      var index = -1;
      var length = arguments.length;
      if (!length) {
        return '';
      }
      var result = '';
      while (++index < length) {
        var codePoint = Number(arguments[index]);
        if (
          !isFinite(codePoint) ||       // `NaN`, `+Infinity`, or `-Infinity`
          codePoint < 0 ||              // not a valid Unicode code point
          codePoint > 0x10FFFF ||       // not a valid Unicode code point
          floor(codePoint) != codePoint // not an integer
        ) {
          throw RangeError('Invalid code point: ' + codePoint);
        }
        if (codePoint <= 0xFFFF) { // BMP code point
          codeUnits.push(codePoint);
        } else { // Astral code point; split in surrogate halves
          // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
          codePoint -= 0x10000;
          highSurrogate = (codePoint >> 10) + 0xD800;
          lowSurrogate = (codePoint % 0x400) + 0xDC00;
          codeUnits.push(highSurrogate, lowSurrogate);
        }
        if (index + 1 == length || codeUnits.length > MAX_SIZE) {
          result += stringFromCharCode.apply(null, codeUnits);
          codeUnits.length = 0;
        }
      }
      return result;
    };
  }());

  function parse(str, flags, features) {
    if (!features) {
      features = {};
    }
    function addRaw(node) {
      node.raw = str.substring(node.range[0], node.range[1]);
      return node;
    }

    function updateRawStart(node, start) {
      node.range[0] = start;
      return addRaw(node);
    }

    function createAnchor(kind, rawLength) {
      return addRaw({
        type: 'anchor',
        kind: kind,
        range: [
          pos - rawLength,
          pos
        ]
      });
    }

    function createValue(kind, codePoint, from, to) {
      return addRaw({
        type: 'value',
        kind: kind,
        codePoint: codePoint,
        range: [from, to]
      });
    }

    function createEscaped(kind, codePoint, value, fromOffset) {
      fromOffset = fromOffset || 0;
      return createValue(kind, codePoint, pos - (value.length + fromOffset), pos);
    }

    function createCharacter(matches) {
      var _char = matches[0];
      var first = _char.charCodeAt(0);
      if (isUnicodeMode) {
        var second;
        if (_char.length === 1 && first >= 0xD800 && first <= 0xDBFF) {
          second = lookahead().charCodeAt(0);
          if (second >= 0xDC00 && second <= 0xDFFF) {
            // Unicode surrogate pair
            pos++;
            return createValue(
              'symbol',
              (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000,
              pos - 2, pos);
          }
        }
      }
      return createValue('symbol', first, pos - 1, pos);
    }

    function createDisjunction(alternatives, from, to) {
      return addRaw({
        type: 'disjunction',
        body: alternatives,
        range: [
          from,
          to
        ]
      });
    }

    function createDot() {
      return addRaw({
        type: 'dot',
        range: [
          pos - 1,
          pos
        ]
      });
    }

    function createCharacterClassEscape(value) {
      return addRaw({
        type: 'characterClassEscape',
        value: value,
        range: [
          pos - 2,
          pos
        ]
      });
    }

    function createReference(matchIndex) {
      return addRaw({
        type: 'reference',
        matchIndex: parseInt(matchIndex, 10),
        range: [
          pos - 1 - matchIndex.length,
          pos
        ]
      });
    }

    function createNamedReference(name) {
      return addRaw({
        type: 'reference',
        name: name,
        range: [
          name.range[0] - 3,
          pos
        ]
      });
    }

    function createGroup(behavior, disjunction, from, to) {
      return addRaw({
        type: 'group',
        behavior: behavior,
        body: disjunction,
        range: [
          from,
          to
        ]
      });
    }

    function createQuantifier(min, max, from, to, symbol) {
      if (to == null) {
        from = pos - 1;
        to = pos;
      }

      return addRaw({
        type: 'quantifier',
        min: min,
        max: max,
        greedy: true,
        body: null, // set later on
        symbol: symbol,
        range: [
          from,
          to
        ]
      });
    }

    function createAlternative(terms, from, to) {
      return addRaw({
        type: 'alternative',
        body: terms,
        range: [
          from,
          to
        ]
      });
    }

    function createCharacterClass(contents, negative, from, to) {
      return addRaw({
        type: 'characterClass',
        kind: contents.kind,
        body: contents.body,
        negative: negative,
        range: [
          from,
          to
        ]
      });
    }

    function createClassRange(min, max, from, to) {
      // See 15.10.2.15:
      if (min.codePoint > max.codePoint) {
        bail('invalid range in character class', min.raw + '-' + max.raw, from, to);
      }

      return addRaw({
        type: 'characterClassRange',
        min: min,
        max: max,
        range: [
          from,
          to
        ]
      });
    }

    function createClassStrings(strings, from, to) {
      return addRaw({
        type: 'classStrings',
        strings: strings,
        range: [from, to]
      });
    }

    function createClassString(characters, from, to) {
      return addRaw({
        type: 'classString',
        characters: characters,
        range: [from, to]
      });
    }

    function flattenBody(body) {
      if (body.type === 'alternative') {
        return body.body;
      } else {
        return [body];
      }
    }

    function incr(amount) {
      amount = (amount || 1);
      var res = str.substring(pos, pos + amount);
      pos += (amount || 1);
      return res;
    }

    function skip(value) {
      if (!match(value)) {
        bail('character', value);
      }
    }

    function match(value) {
      if (str.indexOf(value, pos) === pos) {
        return incr(value.length);
      }
    }

    function lookahead() {
      return str[pos];
    }

    function current(value) {
      return str.indexOf(value, pos) === pos;
    }

    function next(value) {
      return str[pos + 1] === value;
    }

    function matchReg(regExp) {
      var subStr = str.substring(pos);
      var res = subStr.match(regExp);
      if (res) {
        res.range = [];
        res.range[0] = pos;
        incr(res[0].length);
        res.range[1] = pos;
      }
      return res;
    }

    function parseDisjunction() {
      // Disjunction ::
      //      Alternative
      //      Alternative | Disjunction
      var res = [], from = pos;
      res.push(parseAlternative());

      while (match('|')) {
        res.push(parseAlternative());
      }

      if (res.length === 1) {
        return res[0];
      }

      return createDisjunction(res, from, pos);
    }

    function parseAlternative() {
      var res = [], from = pos;
      var term;

      // Alternative ::
      //      [empty]
      //      Alternative Term
      while (term = parseTerm()) {
        res.push(term);
      }

      if (res.length === 1) {
        return res[0];
      }

      return createAlternative(res, from, pos);
    }

    function parseTerm() {
      // Term ::
      //      Anchor
      //      Atom
      //      Atom Quantifier

      if (pos >= str.length || current('|') || current(')')) {
        return null; /* Means: The term is empty */
      }

      var anchor = parseAnchor();

      if (anchor) {
        return anchor;
      }

      var atom = parseAtomAndExtendedAtom();
      var quantifier;
      if (!atom) {
        // Check if a quantifier is following. A quantifier without an atom
        // is an error.
        var pos_backup = pos
        quantifier = parseQuantifier() || false;
        if (quantifier) {
          pos = pos_backup
          bail('Expected atom');
        }

        // If no unicode flag, then try to parse ExtendedAtom -> ExtendedPatternCharacter.
        //      ExtendedPatternCharacter
        var res;
        if (!isUnicodeMode && (res = matchReg(/^{/))) {
          atom = createCharacter(res);
        } else {
          bail('Expected atom');
        }
      }
      quantifier = parseQuantifier() || false;
      if (quantifier) {
        quantifier.body = flattenBody(atom);
        // The quantifier contains the atom. Therefore, the beginning of the
        // quantifier range is given by the beginning of the atom.
        updateRawStart(quantifier, atom.range[0]);
        return quantifier;
      }
      return atom;
    }

    function parseGroup(matchA, typeA, matchB, typeB) {
      var type = null, from = pos;

      if (match(matchA)) {
        type = typeA;
      } else if (match(matchB)) {
        type = typeB;
      } else {
        return false;
      }

      return finishGroup(type, from);
    }

    function finishGroup(type, from) {
      var body = parseDisjunction();
      if (!body) {
        bail('Expected disjunction');
      }
      skip(')');
      var group = createGroup(type, flattenBody(body), from, pos);

      if (type == 'normal') {
        // Keep track of the number of closed groups. This is required for
        // parseDecimalEscape(). In case the string is parsed a second time the
        // value already holds the total count and no incrementation is required.
        if (firstIteration) {
          closedCaptureCounter++;
        }
      }
      return group;
    }

    function parseAnchor() {
      // Anchor ::
      //      ^
      //      $
      //      \ b
      //      \ B
      //      ( ? = Disjunction )
      //      ( ? ! Disjunction )

      if (match('^')) {
        return createAnchor('start', 1 /* rawLength */);
      } else if (match('$')) {
        return createAnchor('end', 1 /* rawLength */);
      } else if (match('\\b')) {
        return createAnchor('boundary', 2 /* rawLength */);
      } else if (match('\\B')) {
        return createAnchor('not-boundary', 2 /* rawLength */);
      } else {
        return parseGroup('(?=', 'lookahead', '(?!', 'negativeLookahead');
      }
    }

    function parseQuantifier() {
      // Quantifier ::
      //      QuantifierPrefix
      //      QuantifierPrefix ?
      //
      // QuantifierPrefix ::
      //      *
      //      +
      //      ?
      //      { DecimalDigits }
      //      { DecimalDigits , }
      //      { DecimalDigits , DecimalDigits }

      var res, from = pos;
      var quantifier;
      var min, max;

      if (match('*')) {
        quantifier = createQuantifier(0, undefined, undefined, undefined, '*');
      }
      else if (match('+')) {
        quantifier = createQuantifier(1, undefined, undefined, undefined, "+");
      }
      else if (match('?')) {
        quantifier = createQuantifier(0, 1, undefined, undefined, "?");
      }
      else if (res = matchReg(/^\{([0-9]+)\}/)) {
        min = parseInt(res[1], 10);
        quantifier = createQuantifier(min, min, res.range[0], res.range[1]);
      }
      else if (res = matchReg(/^\{([0-9]+),\}/)) {
        min = parseInt(res[1], 10);
        quantifier = createQuantifier(min, undefined, res.range[0], res.range[1]);
      }
      else if (res = matchReg(/^\{([0-9]+),([0-9]+)\}/)) {
        min = parseInt(res[1], 10);
        max = parseInt(res[2], 10);
        if (min > max) {
          bail('numbers out of order in {} quantifier', '', from, pos);
        }
        quantifier = createQuantifier(min, max, res.range[0], res.range[1]);
      }

      if ((min && !Number.isSafeInteger(min)) || (max && !Number.isSafeInteger(max))) {
        bail("iterations outside JS safe integer range in quantifier", "", from, pos);
      }

      if (quantifier) {
        if (match('?')) {
          quantifier.greedy = false;
          quantifier.range[1] += 1;
        }
      }

      return quantifier;
    }

    function parseAtomAndExtendedAtom() {
      // Parsing Atom and ExtendedAtom together due to redundancy.
      // ExtendedAtom is defined in Apendix B of the ECMA-262 standard.
      //
      // SEE: https://www.ecma-international.org/ecma-262/10.0/index.html#prod-annexB-ExtendedPatternCharacter
      //
      // Atom ::
      //      PatternCharacter
      //      .
      //      \ AtomEscape
      //      CharacterClass
      //      ( GroupSpecifier Disjunction )
      //      ( ? RegularExpressionFlags : Disjunction )
      //      ( ? RegularExpressionFlags - RegularExpressionFlags : Disjunction )
      // ExtendedAtom ::
      //      ExtendedPatternCharacter
      // ExtendedPatternCharacter ::
      //      SourceCharacter but not one of ^$\.*+?()[|

      var res;

      // jviereck: allow ']', '}' here as well to be compatible with browser's
      //   implementations: ']'.match(/]/);
      if (res = matchReg(/^[^^$\\.*+?()[\]{}|]/)) {
        //      PatternCharacter
        return createCharacter(res);
      }
      else if (!isUnicodeMode && (res = matchReg(/^(?:]|})/))) {
        //      ExtendedPatternCharacter, first part. See parseTerm.
        return createCharacter(res);
      }
      else if (match('.')) {
        //      .
        return createDot();
      }
      else if (match('\\')) {
        //      \ AtomEscape
        res = parseAtomEscape();
        if (!res) {
          if (!isUnicodeMode && lookahead() == 'c') {
            // B.1.4 ExtendedAtom
            // \[lookahead = c]
            return createValue('symbol', 92, pos - 1, pos);
          }
          bail('atomEscape');
        }
        return res;
      }
      else if (res = parseCharacterClass()) {
        return res;
      }
      else if (features.lookbehind && (res = parseGroup('(?<=', 'lookbehind', '(?<!', 'negativeLookbehind'))) {
        return res;
      }
      else if (features.namedGroups && match("(?<")) {
        var name = parseIdentifier();
        skip(">");
        var group = finishGroup("normal", name.range[0] - 3);
        group.name = name;
        return group;
      }
      else if (features.modifiers && str.indexOf("(?") == pos && str[pos+2] != ":") {
        return parseModifiersGroup();
      }
      else {
        //      ( Disjunction )
        //      ( ? : Disjunction )
        return parseGroup('(?:', 'ignore', '(', 'normal');
      }
    }

    function parseModifiersGroup() {
      function hasDupChar(str) {
        var i = 0;
        while (i < str.length) {
          if (str.indexOf(str[i], i + 1) != -1) {
            return true;
          }
          i++;
        }
        return false;
      }

      var from = pos;
      incr(2);

      var enablingFlags = matchReg(/^[sim]+/);
      var disablingFlags;
      if(match("-")){
        disablingFlags = matchReg(/^[sim]+/);
        if (!disablingFlags) {
          bail('Invalid flags for modifiers group');
        }
      } else if(!enablingFlags){
        bail('Invalid flags for modifiers group');
      }

      enablingFlags = enablingFlags ? enablingFlags[0] : "";
      disablingFlags = disablingFlags ? disablingFlags[0] : "";

      var flags = enablingFlags + disablingFlags;
      if(flags.length > 3 || hasDupChar(flags)) {
        bail('flags cannot be duplicated for modifiers group');
      }

      skip(":");

      var modifiersGroup = finishGroup("ignore", from);

      modifiersGroup.modifierFlags = {
          enabling: enablingFlags,
          disabling: disablingFlags
        };

      return modifiersGroup;
    }

    function parseUnicodeSurrogatePairEscape(firstEscape) {
      if (isUnicodeMode) {
        var first, second;
        if (firstEscape.kind == 'unicodeEscape' &&
          (first = firstEscape.codePoint) >= 0xD800 && first <= 0xDBFF &&
          current('\\') && next('u') ) {
          var prevPos = pos;
          pos++;
          var secondEscape = parseClassEscape();
          if (secondEscape.kind == 'unicodeEscape' &&
            (second = secondEscape.codePoint) >= 0xDC00 && second <= 0xDFFF) {
            // Unicode surrogate pair
            firstEscape.range[1] = secondEscape.range[1];
            firstEscape.codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            firstEscape.type = 'value';
            firstEscape.kind = 'unicodeCodePointEscape';
            addRaw(firstEscape);
          }
          else {
            pos = prevPos;
          }
        }
      }
      return firstEscape;
    }

    function parseClassEscape() {
      return parseAtomEscape(true);
    }

    function parseAtomEscape(insideCharacterClass) {
      // AtomEscape ::
      //      DecimalEscape
      //      CharacterEscape
      //      CharacterClassEscape
      //      k GroupName

      var res, from = pos;

      res = parseDecimalEscape(insideCharacterClass) || parseNamedReference();
      if (res) {
        return res;
      }

      // For ClassEscape
      if (insideCharacterClass) {
        //     b
        if (match('b')) {
          // 15.10.2.19
          // The production ClassEscape :: b evaluates by returning the
          // CharSet containing the one character <BS> (Unicode value 0008).
          return createEscaped('singleEscape', 0x0008, '\\b');
        } else if (match('B')) {
          bail('\\B not possible inside of CharacterClass', '', from);
        } else if (!isUnicodeMode && (res = matchReg(/^c([0-9])/))) {
          // B.1.4
          // c ClassControlLetter, ClassControlLetter = DecimalDigit
          return createEscaped('controlLetter', res[1] + 16, res[1], 2);
        } else if (!isUnicodeMode && (res = matchReg(/^c_/))) {
          // B.1.4
          // c ClassControlLetter, ClassControlLetter = _
          return createEscaped('controlLetter', 31, '_', 2);
        }
        //     [+U] -
        if (isUnicodeMode && match('-')) {
          return createEscaped('singleEscape', 0x002d, '\\-');
        }
      }

      res = parseCharacterClassEscape() || parseCharacterEscape();

      return res;
    }


    function parseDecimalEscape(insideCharacterClass) {
      // DecimalEscape ::
      //      DecimalIntegerLiteral [lookahead ∉ DecimalDigit]

      var res, match, from = pos;

      if (res = matchReg(/^(?!0)\d+/)) {
        match = res[0];
        var refIdx = parseInt(res[0], 10);
        if (refIdx <= closedCaptureCounter && !insideCharacterClass) {
          // If the number is smaller than the normal-groups found so
          // far, then it is a reference...
          return createReference(res[0]);
        } else {
          // ... otherwise it needs to be interpreted as a octal (if the
          // number is in an octal format). If it is NOT octal format,
          // then the slash is ignored and the number is matched later
          // as normal characters.

          // Recall the negative decision to decide if the input must be parsed
          // a second time with the total normal-groups.
          backrefDenied.push(refIdx);

          // \1 octal escapes are disallowed in unicode mode, but they might
          // be references to groups which haven't been parsed yet.
          // We must parse a second time to determine if \1 is a reference
          // or an octal scape, and then we can report the error.
          if (firstIteration) {
            shouldReparse = true;
          } else {
            bailOctalEscapeIfUnicode(from, pos);
          }

          // Reset the position again, as maybe only parts of the previous
          // matched numbers are actual octal numbers. E.g. in '019' only
          // the '01' should be matched.
          incr(-res[0].length);
          if (res = matchReg(/^[0-7]{1,3}/)) {
            return createEscaped('octal', parseInt(res[0], 8), res[0], 1);
          } else {
            // If we end up here, we have a case like /\91/. Then the
            // first slash is to be ignored and the 9 & 1 to be treated
            // like ordinary characters. Create a character for the
            // first number only here - other number-characters
            // (if available) will be matched later.
            res = createCharacter(matchReg(/^[89]/));
            return updateRawStart(res, res.range[0] - 1);
          }
        }
      }
      // Only allow octal numbers in the following. All matched numbers start
      // with a zero (if the do not, the previous if-branch is executed).
      // If the number is not octal format and starts with zero (e.g. `091`)
      // then only the zeros `0` is treated here and the `91` are ordinary
      // characters.
      // Example:
      //   /\091/.exec('\091')[0].length === 3
      else if (res = matchReg(/^[0-7]{1,3}/)) {
        match = res[0];
        if (match !== '0') {
          bailOctalEscapeIfUnicode(from, pos);
        }
        if (/^0{1,3}$/.test(match)) {
          // If they are all zeros, then only take the first one.
          return createEscaped('null', 0x0000, '0', match.length);
        } else {
          return createEscaped('octal', parseInt(match, 8), match, 1);
        }
      }
      return false;
    }

    function bailOctalEscapeIfUnicode(from, pos) {
      if (isUnicodeMode) {
        bail("Invalid decimal escape in unicode mode", null, from, pos);
      }
    }

    function parseCharacterClassEscape() {
      // CharacterClassEscape :: one of d D s S w W
      var res;
      if (res = matchReg(/^[dDsSwW]/)) {
        return createCharacterClassEscape(res[0]);
      } else if (features.unicodePropertyEscape && isUnicodeMode && (res = matchReg(/^([pP])\{([^\}]+)\}/))) {
        // https://github.com/jviereck/regjsparser/issues/77
        return addRaw({
          type: 'unicodePropertyEscape',
          negative: res[1] === 'P',
          value: res[2],
          range: [res.range[0] - 1, res.range[1]],
          raw: res[0]
        });
      } else if (features.unicodeSet && hasUnicodeSetFlag && match('q{')) {
        return parseClassStrings();
      }
      return false;
    }

    function parseNamedReference() {
      if (features.namedGroups && matchReg(/^k<(?=.*?>)/)) {
        var name = parseIdentifier();
        skip('>');
        return createNamedReference(name);
      }
    }

    function parseRegExpUnicodeEscapeSequence() {
      var res;
      if (res = matchReg(/^u([0-9a-fA-F]{4})/)) {
        // UnicodeEscapeSequence
        return parseUnicodeSurrogatePairEscape(
          createEscaped('unicodeEscape', parseInt(res[1], 16), res[1], 2)
        );
      } else if (isUnicodeMode && (res = matchReg(/^u\{([0-9a-fA-F]+)\}/))) {
        // RegExpUnicodeEscapeSequence (ES6 Unicode code point escape)
        return createEscaped('unicodeCodePointEscape', parseInt(res[1], 16), res[1], 4);
      }
    }

    function parseCharacterEscape() {
      // CharacterEscape ::
      //      ControlEscape
      //      c ControlLetter
      //      HexEscapeSequence
      //      UnicodeEscapeSequence
      //      IdentityEscape

      var res;
      var from = pos;
      if (res = matchReg(/^[fnrtv]/)) {
        // ControlEscape
        var codePoint = 0;
        switch (res[0]) {
          case 't': codePoint = 0x009; break;
          case 'n': codePoint = 0x00A; break;
          case 'v': codePoint = 0x00B; break;
          case 'f': codePoint = 0x00C; break;
          case 'r': codePoint = 0x00D; break;
        }
        return createEscaped('singleEscape', codePoint, '\\' + res[0]);
      } else if (res = matchReg(/^c([a-zA-Z])/)) {
        // c ControlLetter
        return createEscaped('controlLetter', res[1].charCodeAt(0) % 32, res[1], 2);
      } else if (res = matchReg(/^x([0-9a-fA-F]{2})/)) {
        // HexEscapeSequence
        return createEscaped('hexadecimalEscape', parseInt(res[1], 16), res[1], 2);
      } else if (res = parseRegExpUnicodeEscapeSequence()) {
        if (!res || res.codePoint > 0x10FFFF) {
          bail('Invalid escape sequence', null, from, pos);
        }
        return res;
      } else {
        // IdentityEscape
        return parseIdentityEscape();
      }
    }

    function parseIdentifierAtom(check) {
      var ch = lookahead();
      var from = pos;
      if (ch === '\\') {
        incr();
        var esc = parseRegExpUnicodeEscapeSequence();
        if (!esc || !check(esc.codePoint)) {
          bail('Invalid escape sequence', null, from, pos);
        }
        return fromCodePoint(esc.codePoint);
      }
      var code = ch.charCodeAt(0);
      if (code >= 0xD800 && code <= 0xDBFF) {
        ch += str[pos + 1];
        var second = ch.charCodeAt(1);
        if (second >= 0xDC00 && second <= 0xDFFF) {
          // Unicode surrogate pair
          code = (code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }
      if (!check(code)) return;
      incr();
      if (code > 0xFFFF) incr();
      return ch;
    }

    function parseIdentifier() {
      // RegExpIdentifierName ::
      //      RegExpIdentifierStart
      //      RegExpIdentifierName RegExpIdentifierContinue
      //
      // RegExpIdentifierStart ::
      //      UnicodeIDStart
      //      $
      //      _
      //      \ RegExpUnicodeEscapeSequence
      //
      // RegExpIdentifierContinue ::
      //      UnicodeIDContinue
      //      $
      //      _
      //      \ RegExpUnicodeEscapeSequence
      //      <ZWNJ>
      //      <ZWJ>

      var start = pos;
      var res = parseIdentifierAtom(isIdentifierStart);
      if (!res) {
        bail('Invalid identifier');
      }

      var ch;
      while (ch = parseIdentifierAtom(isIdentifierPart)) {
        res += ch;
      }

      return addRaw({
        type: 'identifier',
        value: res,
        range: [start, pos]
      });
    }

    function isIdentifierStart(ch) {
      // Generated by `tools/generate-identifier-regex.js`.
      var NonAsciiIdentifierStart = unicodeData.NonAsciiIdentifierStart;

      return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
        (ch >= 65 && ch <= 90) ||         // A..Z
        (ch >= 97 && ch <= 122) ||        // a..z
        ((ch >= 0x80) && NonAsciiIdentifierStart.test(fromCodePoint(ch)));
    }

    // Taken from the Esprima parser.
    function isIdentifierPart(ch) {
      // Generated by `tools/generate-identifier-regex.js`.
      // eslint-disable-next-line no-misleading-character-class
      var NonAsciiIdentifierPartOnly = unicodeData.NonAsciiIdentifierPartOnly;

      return isIdentifierStart(ch) ||
        (ch >= 48 && ch <= 57) ||         // 0..9
        ((ch >= 0x80) && NonAsciiIdentifierPartOnly.test(fromCodePoint(ch)));
    }

    function parseIdentityEscape() {
      // IdentityEscape ::
      //      [+U] SyntaxCharacter
      //      [+U] /
      //      [~U] SourceCharacterIdentityEscape[?N]
      // SourceCharacterIdentityEscape[?N] ::
      //      [~N] SourceCharacter but not c
      //      [+N] SourceCharacter but not one of c or k


      var tmp;
      var l = lookahead();
      if (
        (isUnicodeMode && /[\^\$\.\*\+\?\(\)\\\[\]\{\}\|\/]/.test(l)) ||
        (!isUnicodeMode && l !== "c")
      ) {
        if (l === "k" && features.lookbehind) {
          return null;
        }
        tmp = incr();
        return createEscaped('identifier', tmp.charCodeAt(0), tmp, 1);
      }

      return null;
    }

    function parseCharacterClass() {
      // CharacterClass ::
      //      [ [lookahead ∉ {^}] ClassRanges ]
      //      [ ^ ClassRanges ]

      var res, from = pos;
      if (res = matchReg(/^\[\^/)) {
        res = parseClassRanges();
        skip(']');
        return createCharacterClass(res, true, from, pos);
      } else if (match('[')) {
        res = parseClassRanges();
        skip(']');
        return createCharacterClass(res, false, from, pos);
      }

      return null;
    }

    function parseClassRanges() {
      // ClassRanges ::
      //      [empty]
      //      [~V] NonemptyClassRanges
      //      [+V] ClassContents

      var res;
      if (current(']')) {
        // Empty array means nothing inside of the ClassRange.
        return { kind: 'union', body: [] };
      } else if (hasUnicodeSetFlag) {
        return parseClassContents();
      } else {
        res = parseNonemptyClassRanges();
        if (!res) {
          bail('nonEmptyClassRanges');
        }
        return { kind: 'union', body: res };
      }
    }

    function parseHelperClassRanges(atom) {
      var from, to, res, atomTo, dash;
      if (current('-') && !next(']')) {
        // ClassAtom - ClassAtom ClassRanges
        from = atom.range[0];
        dash = createCharacter(match('-'));

        atomTo = parseClassAtom();
        if (!atomTo) {
          bail('classAtom');
        }
        to = pos;

        // Parse the next class range if exists.
        var classRanges = parseClassRanges();
        if (!classRanges) {
          bail('classRanges');
        }

        // Check if both the from and atomTo have codePoints.
        if (!('codePoint' in atom) || !('codePoint' in atomTo)) {
          if (!isUnicodeMode) {
            // If not, don't create a range but treat them as
            // `atom` `-` `atom` instead.
            //
            // SEE: https://tc39.es/ecma262/#sec-regular-expression-patterns-semantics
            //   NonemptyClassRanges::ClassAtom-ClassAtomClassRanges
            //   CharacterRangeOrUnion
            res = [atom, dash, atomTo];
          } else {
            // With unicode flag, both sides must have codePoints if
            // one side has a codePoint.
            //
            // SEE: https://tc39.es/ecma262/#sec-patterns-static-semantics-early-errors
            //   NonemptyClassRanges :: ClassAtom - ClassAtom ClassRanges
            bail('invalid character class');
          }
        } else {
          res = [createClassRange(atom, atomTo, from, to)];
        }

        if (classRanges.type === 'empty') {
          return res;
        }
        return res.concat(classRanges.body);
      }

      res = parseNonemptyClassRangesNoDash();
      if (!res) {
        bail('nonEmptyClassRangesNoDash');
      }

      return [atom].concat(res);
    }

    function parseNonemptyClassRanges() {
      // NonemptyClassRanges ::
      //      ClassAtom
      //      ClassAtom NonemptyClassRangesNoDash
      //      ClassAtom - ClassAtom ClassRanges

      var atom = parseClassAtom();
      if (!atom) {
        bail('classAtom');
      }

      if (current(']')) {
        // ClassAtom
        return [atom];
      }

      // ClassAtom NonemptyClassRangesNoDash
      // ClassAtom - ClassAtom ClassRanges
      return parseHelperClassRanges(atom);
    }

    function parseNonemptyClassRangesNoDash() {
      // NonemptyClassRangesNoDash ::
      //      ClassAtom
      //      ClassAtomNoDash NonemptyClassRangesNoDash
      //      ClassAtomNoDash - ClassAtom ClassRanges

      var res = parseClassAtom();
      if (!res) {
        bail('classAtom');
      }
      if (current(']')) {
        //      ClassAtom
        return res;
      }

      // ClassAtomNoDash NonemptyClassRangesNoDash
      // ClassAtomNoDash - ClassAtom ClassRanges
      return parseHelperClassRanges(res);
    }

    function parseClassAtom() {
      // ClassAtom ::
      //      -
      //      ClassAtomNoDash
      if (match('-')) {
        return createCharacter('-');
      } else {
        return parseClassAtomNoDash();
      }
    }

    function parseClassAtomNoDash() {
      // ClassAtomNoDash ::
      //      SourceCharacter but not one of \ or ] or -
      //      \ ClassEscape

      var res;
      if (res = matchReg(/^[^\\\]-]/)) {
        return createCharacter(res[0]);
      } else if (match('\\')) {
        res = parseClassEscape();
        if (!res) {
          bail('classEscape');
        }

        return parseUnicodeSurrogatePairEscape(res);
      }
    }

    function parseClassContents() {
      // ClassContents ::
      //      ClassUnion
      //      ClassIntersection
      //      ClassSubtraction
      //
      // ClassUnion ::
      //      ClassRange ClassUnion?
      //      ClassOperand ClassUnion?
      //
      // ClassIntersection ::
      //      ClassOperand && [lookahead ≠ &] ClassOperand
      //      ClassIntersection && [lookahead ≠ &] ClassOperand
      //
      // ClassSubtraction ::
      //      ClassOperand -- ClassOperand
      //      ClassSubtraction -- ClassOperand

      var body = [];
      var kind;

      var operand = parseClassOperand(/* allowRanges*/ true);
      body.push(operand);

      if (operand.type === 'classRange') {
        kind = 'union';
      } else if (current('&')) {
        kind = 'intersection';
      } else if (current('-')) {
        kind = 'subtraction';
      } else {
        kind = 'union';
      }

      while (!current(']')) {
        if (kind === 'intersection') {
          skip('&');
          skip('&');
          if (current('&')) {
            bail('&& cannot be followed by &. Wrap it in brackets: &&[&].');
          }
        } else if (kind === 'subtraction') {
          skip('-');
          skip('-');
        }

        operand = parseClassOperand(/* allowRanges*/ kind === 'union');
        body.push(operand);
      }

      return { kind: kind, body: body };
    }

    function parseClassOperand(allowRanges) {
      // ClassOperand ::
      //      ClassCharacter
      //      ClassStrings
      //      NestedClass
      //
      // NestedClass ::
      //      [ [lookahead ≠ ^] ClassRanges[+U,+V] ]
      //      [ ^ ClassRanges[+U,+V] ]
      //      \ CharacterClassEscape[+U, +V]
      //
      // ClassRange ::
      //      ClassCharacter - ClassCharacter
      //
      // ClassCharacter ::
      //      [lookahead ∉ ClassReservedDouble] SourceCharacter but not ClassSyntaxCharacter
      //      \ CharacterEscape[+U]
      //      \ ClassHalfOfDouble
      //      \ b
      //
      // ClassSyntaxCharacter ::
      //      one of ( ) [ ] { } / - \ |

      var from = pos;
      var start, res;

      if (match('\\')) {
        // ClassOperand ::
        //      ...
        //      ClassStrings
        //      NestedClass
        //
        // NestedClass ::
        //      ...
        //      \ CharacterClassEscape[+U, +V]
        if (res = parseClassEscape()) {
          start = res;
        } else if (res = parseClassCharacterEscapedHelper()) {
          return res;
        } else {
          bail('Invalid escape', '\\' + lookahead(), from);
        }
      } else if (res = parseClassCharacterUnescapedHelper()) {
        start = res;
      } else if (res = parseCharacterClass()) {
        // ClassOperand ::
        //      ...
        //      NestedClass
        //
        // NestedClass ::
        //      [ [lookahead ≠ ^] ClassRanges[+U,+V] ]
        //      [ ^ ClassRanges[+U,+V] ]
        //      ...
        return res;
      } else {
        bail('Invalid character', lookahead());
      }

      if (allowRanges && current('-') && !next('-')) {
        skip('-');

        if (res = parseClassCharacter()) {
          // ClassRange ::
          //      ClassCharacter - ClassCharacter
          return createClassRange(start, res, from, pos);
        }

        bail('Invalid range end', lookahead());
      }

      // ClassOperand ::
      //      ClassCharacter
      //      ...
      return start;
    }

    function parseClassCharacter() {
      // ClassCharacter ::
      //      [lookahead ∉ ClassReservedDouble] SourceCharacter but not ClassSyntaxCharacter
      //      \ CharacterEscape[+U]
      //      \ ClassHalfOfDouble
      //      \ b

      if (match('\\')) {
        var res, from = pos;
        if (res = parseClassCharacterEscapedHelper()) {
          return res;
        } else {
          bail('Invalid escape', '\\' + lookahead(), from);
        }
      }

      return parseClassCharacterUnescapedHelper();
    }

    function parseClassCharacterUnescapedHelper() {
      // ClassCharacter ::
      //      [lookahead ∉ ClassReservedDouble] SourceCharacter but not ClassSyntaxCharacter
      //      ...

      var res;
      if (res = matchReg(/^[^()[\]{}/\-\\|]/)) {
        return createCharacter(res);
      }
    }

    function parseClassCharacterEscapedHelper() {
      // ClassCharacter ::
      //      ...
      //      \ CharacterEscape[+U]
      //      \ ClassHalfOfDouble
      //      \ b

      var res;
      if (match('b')) {
        return createEscaped('singleEscape', 0x0008, '\\b');
      } else if (match('B')) {
        bail('\\B not possible inside of ClassContents', '', pos - 2);
      } else if (res = matchReg(/^[&\-!#%,:;<=>@_`~]/)) {
        return createEscaped('identifier', res[0].codePointAt(0), res[0]);
      } else if (res = parseCharacterEscape()) {
        return res;
      } else {
        return null;
      }
    }

    function parseClassStrings() {
      // ClassStrings ::
      //      \q{ ClassString MoreClassStrings? }

      // When calling this function, \q{ has already been consumed.
      var from = pos - 3;

      var res = [];
      do {
        res.push(parseClassString());
      } while (match('|'));

      skip('}');

      return createClassStrings(res, from, pos);
    }

    function parseClassString() {
      // ClassString ::
      //      [empty]
      //      NonEmptyClassString
      //
      // NonEmptyClassString ::
      //      ClassCharacter NonEmptyClassString?

      var res = [], from = pos;
      var char;

      while (char = parseClassCharacter()) {
        res.push(char);
      }

      return createClassString(res, from, pos);
    }

    function bail(message, details, from, to) {
      from = from == null ? pos : from;
      to = to == null ? from : to;

      var contextStart = Math.max(0, from - 10);
      var contextEnd = Math.min(to + 10, str.length);

      // Output a bit of context and a line pointing to where our error is.
      //
      // We are assuming that there are no actual newlines in the content as this is a regular expression.
      var context = '    ' + str.substring(contextStart, contextEnd);
      var pointer = '    ' + new Array(from - contextStart + 1).join(' ') + '^';

      throw SyntaxError(message + ' at position ' + from + (details ? ': ' + details : '') + '\n' + context + '\n' + pointer);
    }

    var backrefDenied = [];
    var closedCaptureCounter = 0;
    var firstIteration = true;
    var shouldReparse = false;
    var hasUnicodeFlag = (flags || "").indexOf("u") !== -1;
    var hasUnicodeSetFlag = (flags || "").indexOf("v") !== -1;
    var isUnicodeMode = hasUnicodeFlag || hasUnicodeSetFlag;
    var pos = 0;

    if (hasUnicodeSetFlag && !features.unicodeSet) {
      throw new Error('The "v" flag is only supported when the .unicodeSet option is enabled.');
    }

    if (hasUnicodeFlag && hasUnicodeSetFlag) {
      throw new Error('The "u" and "v" flags are mutually exclusive.');
    }

    // Convert the input to a string and treat the empty string special.
    str = String(str);
    if (str === '') {
      str = '(?:)';
    }

    var result = parseDisjunction();

    if (result.range[1] !== str.length) {
      bail('Could not parse entire input - got stuck', '', result.range[1]);
    }

    // The spec requires to interpret the `\2` in `/\2()()/` as backreference.
    // As the parser collects the number of capture groups as the string is
    // parsed it is impossible to make these decisions at the point when the
    // `\2` is handled. In case the local decision turns out to be wrong after
    // the parsing has finished, the input string is parsed a second time with
    // the total number of capture groups set.
    //
    // SEE: https://github.com/jviereck/regjsparser/issues/70
    shouldReparse = shouldReparse || backrefDenied.some(function (ref) {
      return ref <= closedCaptureCounter;
    });
    if (shouldReparse) {
      // Parse the input a second time.
      pos = 0;
      firstIteration = false;
      return parseDisjunction();
    }

    return result;
  }

  var regjsparser = {
    parse: parse
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = regjsparser;
  } else {
    window.regjsparser = regjsparser;
  }

}());
