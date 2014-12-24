(function ($) {

'use strict';

/* config */

var ELEMENT_INLINE = 'code';
var ELEMENT_BLOCK = 'pre';
var ELEMENT_BREAK = 'br';
var STRING_QUOTE = '"';
var STRING_NBSP = '\xa0';
var STRING_COMMA = ',';
var STRING_COLON = ':' + STRING_NBSP;
var STRING_ARRAY_BRACKET_OPEN = '[';
var STRING_ARRAY_BRACKET_CLOSE = ']';
var STRING_OBJECT_BRACKET_OPEN = '{';
var STRING_OBJECT_BRACKET_CLOSE = '}';
var STRING_NULL = String(null);
var STRING_UNDEFINED = String(undefined);
var TAB_SIZE = 4;
var CLASS_ELEMENT = 'json-view-el';
var CLASS_NUMBER = 'json-view-number';
var CLASS_STRING = 'json-view-string';
var CLASS_STRING_QUOTE = 'json-view-string-quote';
var CLASS_STRING_VALUE = 'json-view-string-value';
var CLASS_BOOLEAN = 'json-view-boolean';
var CLASS_NULL = 'json-view-null';
var CLASS_UNDEFINED = 'json-view-undefined';
var CLASS_COMMA = 'json-view-comma';
var CLASS_COLON = 'json-view-colon';
var CLASS_KEY = 'json-view-key';
var CLASS_KEY_QUOTE = 'json-view-key-quote';
var CLASS_KEY_NAME = 'json-view-key-name';
var CLASS_INDENTATION = 'json-view-indentation';
var CLASS_ARRAY = 'json-view-array';
var CLASS_ARRAY_BRACKET_OPEN = 'json-view-bracket';
var CLASS_ARRAY_BRACKET_CLOSE = 'json-view-bracket';
var CLASS_ARRAY_CONTENTS = 'json-view-contents';
var CLASS_ARRAY_ITEM = 'json-view-item';
var CLASS_OBJECT = 'json-view-object';
var CLASS_OBJECT_BRACKET_OPEN = 'json-view-bracket';
var CLASS_OBJECT_BRACKET_CLOSE = 'json-view-bracket';
var CLASS_OBJECT_CONTENTS = 'json-view-contents';
var CLASS_OBJECT_ITEM = 'json-view-item';
var CLASS_ROOT = 'json-view-root';

/* helpers */

var sanitizeString = function (str) {
	// ensure string
	str = String(str);
	// escape characters
	str = JSON.stringify(str);
	// strip quotes
	str = str.substring(1, str.length - 1);
	// done
	return str;
};

var sanitizeNumber = function (val) {
	// ensure number
	val = Number(val);
	// format JSON style
	val = JSON.stringify(val);
	// done
	return val;
};

/* jquery functions */

var $create = function (el) {
	return $(document.createElement(el)).addClass(CLASS_ELEMENT);
};

var $createInline = function () {
	return $create(ELEMENT_INLINE);
};

var $createBlock = function () {
	return $create(ELEMENT_INLINE);
};

var $buildBreak = function () {
	return $create(ELEMENT_BREAK);
};

var $buildNumber = function (val) {
	val = sanitizeNumber(val);
	return $createInline().addClass(CLASS_NUMBER).text(val);
};

var $buildString = function (str) {
	var value = sanitizeString(str);
	var $string = $createInline().addClass(CLASS_STRING);
	var $quote = $createInline().addClass(CLASS_STRING_QUOTE).text(STRING_QUOTE);
	var $value = $createInline().addClass(CLASS_STRING_VALUE).text(value);
	return $string.append($quote.clone(), $value, $quote);
};

var $buildBoolean = function (val) {
	return $createInline().addClass(CLASS_BOOLEAN).text(String(val));
};

var $buildNull = function () {
	return $createInline().addClass(CLASS_NULL).text(STRING_NULL);
};

var $buildUndefined = function () {
	return $createInline().addClass(CLASS_UNDEFINED).text(STRING_UNDEFINED);
};

var $buildCollapsible = function () {
	// will be collapsible in the future
	return $createBlock();
};

var $buildComma = function () {
	return $createInline().addClass(CLASS_COMMA).text(STRING_COMMA);
};

var $buildColon = function () {
	return $createInline().addClass(CLASS_COLON).text(STRING_COLON);
};

var $buildArrayBracketOpen = function () {
	return $createInline().addClass(CLASS_ARRAY_BRACKET_OPEN).text(STRING_ARRAY_BRACKET_OPEN);
};

var $buildArrayBracketClose = function () {
	return $createInline().addClass(CLASS_ARRAY_BRACKET_CLOSE).text(STRING_ARRAY_BRACKET_CLOSE);
};

var $buildObjectBracketOpen = function () {
	return $createInline().addClass(CLASS_OBJECT_BRACKET_OPEN).text(STRING_OBJECT_BRACKET_OPEN);
};

var $buildObjectBracketClose = function () {
	return $createInline().addClass(CLASS_OBJECT_BRACKET_CLOSE).text(STRING_OBJECT_BRACKET_CLOSE);
};

var $buildIndentation = function (indentation) {
	indentation = Math.max(indentation, 0) * TAB_SIZE;
	var tabs = new Array(indentation + 1).join(STRING_NBSP);
	return $createInline().addClass(CLASS_INDENTATION).text(tabs);
};

var $buildKey = function (key) {
	var value = sanitizeString(key);
	var $key = $createInline().addClass(CLASS_KEY);
	var $quote = $createInline().addClass(CLASS_KEY_QUOTE).text(STRING_QUOTE);
	var $name = $createInline().addClass(CLASS_KEY_NAME).text(value);
	return $key.append($quote.clone(), $name, $quote);
};

var $buildArray = function (arr, indentation) {
	var $el = $buildCollapsible().addClass(CLASS_ARRAY);
	var keys = Object.keys(arr);
	$buildArrayBracketOpen().appendTo($el);
	if (keys.length > 0) {
		var $children = keys.map(function (key, index) {
			var val = arr[key];
			var $item = $createBlock().addClass(CLASS_ARRAY_ITEM);
			$buildIndentation(indentation).appendTo($item);
			$buildItem(val, indentation + 1).appendTo($item);
			if (index < keys.length - 1) {
				$buildComma().appendTo($item);
			}
			$buildBreak().appendTo($item);
			return $item;
		});
		$buildBreak().appendTo($el);
		$createBlock().addClass(CLASS_ARRAY_CONTENTS).append($children).appendTo($el);
		$buildIndentation(indentation - 1).appendTo($el);
	}
	$buildArrayBracketClose().appendTo($el);
	return $el;
};

var $buildObject = function (arr, indentation) {
	var $el = $buildCollapsible().addClass(CLASS_OBJECT);
	var keys = Object.keys(arr);
	$buildObjectBracketOpen().appendTo($el);
	if (keys.length > 0) {
		var $children = keys.map(function (key, index) {
			var val = arr[key];
			var $item = $createBlock().addClass(CLASS_OBJECT_ITEM);
			$buildIndentation(indentation).appendTo($item);
			$buildKey(key).appendTo($item);
			$buildColon().appendTo($item);
			$buildItem(val, indentation + 1).appendTo($item);
			if (index < keys.length - 1) {
				$buildComma().appendTo($item);
			}
			$buildBreak().appendTo($item);
			return $item;
		});
		$buildBreak().appendTo($el);
		$createBlock().addClass(CLASS_OBJECT_CONTENTS).append($children).appendTo($el);
		$buildIndentation(indentation - 1).appendTo($el);
	}
	$buildObjectBracketClose().appendTo($el);
	return $el;
};

var $buildItem = function (item, indentation) {
	if (typeof item === 'string') {
		return $buildString(item);
	}
	if (typeof item === 'number') {
		return $buildNumber(item);
	}
	if (typeof item === 'boolean') {
		return $buildBoolean(item);
	}
	if (item === null) {
		return $buildNull();
	}
	if (item === undefined) {
		return $buildUndefined();
	}
	if (item instanceof Array) {
		return $buildArray(item, indentation);
	}
	return $buildObject(item, indentation);
};

var $buildRoot = function (item) {
	return $create(ELEMENT_BLOCK)
		.addClass(CLASS_ROOT)
		.append($buildItem(item, 1));
};

/* expose */

$.jsonView = $buildRoot;

})(jQuery);