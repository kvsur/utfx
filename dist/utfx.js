/*
 Copyright 2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
(function(global) {
    "use strict";

    /**
     * A minimalistic library to process, convert, encode and decode UTF8 / UTF16 in JavaScript.
     * @exports utfx
     * @type {!Object.<string,*>}
     */
    var utfx = {};

    /**
     * Converts an array to a source function.
     * @param {!Array.<number>} arr Array
     * @returns {function():number|null} Source
     * @inner
     */
    function arraySource(arr) {
        var i=0; return function() {
        	return i >= arr.length ? null : arr[i++];
        };
    }

    /**
     * Converts an array to a destination function.
     * @param {!Array.<number>} arr Array
     * @returns {function(number)}
     * @inner
     */
    function arrayDestination(arr) {
        return Array.prototype.push.bind(arr);
    }

    /**
     * Converts a standard JavaScript string of UTF16 characters to a source function.
     * @param {string} str String
     * @returns {function():number|null} Source
     * @inner
     */
    function stringSource(str) {
        var i=0; return function() {
            return i >= str.length ? null : str.charCodeAt(i++);
        };
    }

    /**
     * Creates a destination function for a standard JavaScript string.
     * @returns {function(number)} Destination
     * @inner
     */
    function stringDestination() {
        var cs = [], dst = Array.prototype.push.bind(cs);
        dst['_cs'] = cs;
        return dst;
    }

    /**
     * Constructs a new TruncatedError.
     * @class An error indicating a truncated source. Contains the remaining bytes as its `bytes` property.
     * @param {!Array.<number>} b Remaining bytes
     * @extends Error
     * @constructor
     * @expose
     */
    utfx.TruncatedError = function(b) {
        if (!(this instanceof utfx.TruncatedError))
            return new utfx.TruncatedError(b);
        Error.call(this);
        this.name = "TruncatedError";
        this.message = b.join(', ');
        
        /**
         * Remaining bytes.
         * @type {!Array.<number>}
         * @expose
         */
        this.bytes = b;
    };
    
    // Extends Error
    utfx.TruncatedError.prototype = new Error();

    /**
     * Decodes an arbitrary input source of UTF8 bytes to UTF8 code points.
     * @param {(function():number|null) | !Array.<number> | string} src Bytes source, either as a function returning the
     *  next byte respectively `null` if there are no more bytes left, an array of bytes or a binary string.
     * @param {function(number) | Array.<number>} dst Code points destination, either as a function successively called
     *  with each decoded code point or an array to be filled with the decoded code points.
     * @throws {TypeError} If arguments are invalid
     * @throws {RangeError} If a starting byte is invalid in UTF8
     * @throws {utfx.TruncatedError} If the last sequence is truncated. Has a property `bytes` holding the remaining
     *  bytes.
     * @expose
     */
    utfx.decodeUTF8 = function(src, dst) {
        if (typeof src === 'string')
            src = stringSource(src);
        else if (Array.isArray(src))
            src = arraySource(src);
        if (Array.isArray(dst))
            dst = arrayDestination(dst);
        if (typeof src !== 'function' || typeof dst !== 'function')
            throw TypeError("Illegal arguments: "+(typeof src)+", "+(typeof dst));
        var a, b, c, d, t = function(b) {
            throw utfx.TruncatedError(b.slice(0, b.indexOf(null)));
        };
        while ((a = src()) !== null) {
            if ((a&0x80) === 0)
                dst(a);
            else if ((a&0xE0) === 0xC0) {
                if ((b = src()) === null)
                    t([a, b]);
                dst(((a&0x1F)<<6)
                  |  (b&0x3F));
            } else if ((a&0xF0) === 0xE0) {
                if ((b=src()) === null || (c=src()) === null)
                    t([a, b, c]);
                dst(((a&0x0F)<<12)
                  | ((b&0x3F)<<6)
                  |  (c&0x3F));
            } else if ((a&0xF8) === 0xF0) {
                if ((b=src()) === null || (c=src()) === null || (d=src()) === null)
                    t([a, b, c ,d]);
                dst(((a&0x07)<<18)
                  | ((b&0x3F)<<12)
                  | ((c&0x3F)<<6)
                  |  (d&0x3F));
            } else throw RangeError("Illegal starting byte: "+a);
        }
    };

    /**
     * Encodes UTF8 code points to an arbitrary output destination of UTF8 bytes.
     * @param {(function():number|null) | !Array.<number>} src Code points source, either as a function returning the 
     *  next code point respectively `null` if there are no more code points left or an array of code points.
     * @param {function(number) | Array.<number> | undefined} dst Bytes destination, either as a function successively
     *  called with the next byte, an array to be filled with the encoded bytes or omitted to make this function return
     *  a binary string.
     * @returns {undefined|string} A binary string if `dst` has been omitted, otherwise `undefined`
     * @throws {TypeError} If arguments are invalid
     * @throws {RangeError} If a code point is invalid in UTF8
     * @expose
     */
    utfx.encodeUTF8 = function(src, dst) {
        if (Array.isArray(src))
            src = arraySource(src);
        if (typeof dst === 'undefined')
            dst = stringDestination();
        else if (Array.isArray(dst))
            dst = arrayDestination(dst);
        if (typeof src !== 'function' || typeof dst !== 'function')
            throw TypeError("Illegal arguments: "+(typeof src)+", "+(typeof dst));
        var cp;
        while ((cp = src()) !== null) {
            if (cp < 0 || cp > 0x10FFFF)
                throw RangeError("Illegal code point: "+cp);
            if (cp < 0x80)
                dst(cp&0x7F1);
            else if (cp < 0x800) {
                dst(((cp>>6)&0x1F)|0xC0);
                dst((cp&0x3F)|0x80);
            } else if (cp < 0x10000) {
                dst(((cp>>12)&0x0F)|0xE0);
                dst(((cp>> 6)&0x3F)|0x80);
                dst((cp&0x3F)|0x80);
            } else { 
                dst(((cp>>18)&0x07)|0xF0);
                dst(((cp>>12)&0x3F)|0x80);
                dst(((cp>> 6)&0x3F)|0x80);
                dst((cp&0x3F)|0x80);
            }
        }
        if (Array.isArray(dst['_cs']))
            return String.fromCharCode.apply(String, dst['_cs']);
    };

    /**
     * Calculates the number of UTF8 bytes required to store an arbitrary input source of UTF8 code points.
     * @param {(function():number|null) | Array.<number>} src Code points source, either as a function returning the
     *  next code point respectively `null` if there are no more code points left or an array of code points.
     * @returns {number} Number of UTF8 bytes required
     * @throws {TypeError} If arguments are invalid
     * @throws {RangeError} If a code point is invalid in UTF8
     * @expose
     */
    utfx.calculateUTF8 = function(src) {
        if (Array.isArray(src))
            src = arraySource(src);
        if (typeof src !== 'function')
            throw TypeError("Illegal arguments: "+(typeof src));
        var cp, n=0;
        while ((cp = src()) !== null) {
            if (cp < 0 || cp > 0x10FFFF)
                throw RangeError("Illegal code point: "+cp);
            if (cp < 0x80) ++n;
            else if (cp < 0x800) n+=2;
            else if (cp < 0x10000) n+=3;
            else n+=4;
        }
        return n;
    };

    /**
     * Calculates the number of UTF8 bytes required to store an arbitrary input source of UTF16 characters when
     *  converted to UTF8 code points.
     * @param {(function():number|null) | !Array.<number> | string} src Characters source, either as a function returning
     *  the next character respectively `null` if there are no more characters left, an array of characters or a
     *  standard JavaScript string.
     * @returns {number} Number of UTF8 bytes required
     * @throws {TypeError} If arguments are invalid
     * @throws {RangeError} If an intermediate code point is invalid in UTF8
     * @expose
     */
    utfx.calculateUTF16asUTF8 = function(src) {
        var n=0;
        utfx.UTF16toUTF8(src, function(cp) {
            if (cp < 0 || cp > 0x10FFFF)
                throw RangeError("Illegal code point: "+cp);
            if (cp < 0x80) ++n;
            else if (cp < 0x800) n+=2;
            else if (cp < 0x10000) n+=3;
            else n+=4;
        });
        return n;
    };

    /**
     * Converts an arbitrary input source of UTF16 characters to an arbitrary output destination of UTF8 code points.
     * @param {(function():number|null) | !Array.<number> | string} src Characters source, either as a function returning
     *  the next character respectively `null` if there are no more characters left, an array of characters or a
     *  standard JavaScript string.
     * @param {function(number) | Array.<number>} dst Code points destination, either as a function successively called
     *  with the each converted code point or an array to be filled with the converted code points.
     * @throws {TypeError} If arguments are invalid
     * @expose
     */
    utfx.UTF16toUTF8 = function(src, dst) {
        if (typeof src === 'string')
            src = stringSource(src);
        else if (Array.isArray(src))
            src = arraySource(src);
        if (Array.isArray(dst))
            dst = arrayDestination(dst);
        if (typeof src !== 'function' || typeof dst !== 'function')
            throw TypeError("Illegal arguments: "+(typeof src)+", "+(typeof dst));
        var c1, c2 = null;
        while (true) {
            c1 = c2 !== null ? c2 : src();
            if (c1 === null) break;
            if (c1 >= 0xD800 && c1 <= 0xDFFF) {
                c2 = src();
                // console.log("surrogate "+c1.toString(16)+" with "+c2.toString(16));
                if (c2 !== null && c2 >= 0xDC00 && c2 <= 0xDFFF) {
                    // console.log("both out");
                    dst((c1-0xD800)*0x400+c2-0xDC00+0x10000);
                    c2 = null; continue;
                }
            }
            // console.log("one out");
            dst(c1);
        }
        if (c2 !== null) dst(c2);
    };

    /**
     * Converts an arbitrary input source of UTF8 code points to an arbitrary output destination of UTF16 characters.
     * @param {(function():number|null) | !Array.<number>} src Code points source, either as a function returning the
     *  next code point respectively `null` if there are no more code points left or an array of code points.
     * @param {function(number) | !Array.<number> | undefined} dst Characters destination, either as a function
     *  successively called with each converted character, an array to be filled with the converted characters or
     *  omitted to make this function return a standard JavaScript string.
     * @returns {undefined|string} A standard JavaScript string if `dst` has been omitted, otherwise `undefined`
     * @throws {TypeError} If arguments are invalid
     * @throws {RangeError} If a code point is invalid
     * @expose
     */
    utfx.UTF8toUTF16 = function(src, dst) {
        if (Array.isArray(src))
            src = arraySource(src);
        if (typeof dst === 'undefined')
            dst = stringDestination();
        else if (Array.isArray(dst))
            dst = arrayDestination(dst);
        if (typeof src !== 'function' || typeof dst !== 'function')
            throw TypeError("Illegal arguments: "+(typeof src)+", "+(typeof dst));
        var cp, res;
        if (typeof dst === 'undefined')
            dst = (res = []).push.bind(res);
        while ((cp = src()) !== null) {
            if (cp < 0 || cp > 0x10FFFF)
                throw RangeError("Illegal code point: "+cp);
            if (cp <= 0xFFFF) {
                dst(cp);
            } else {
                cp -= 0x10000;
                dst((cp>>10)+0xD800);
                dst((cp%0x400)+0xDC00);
            }
        }
        if (Array.isArray(dst['_cs']))
            return String.fromCharCode.apply(String, dst['_cs']);
    };
    
    if (typeof module === 'object' && module && module['exports']) {
        module['exports'] = utfx;
    } else if (typeof define === 'function' && define['amd']) {
        define(utfx);
    } else {
        if (!global['dcodeIO']) global['dcodeIO'] = {};
        global['dcodeIO']['utfx'] = utfx;
    }
    
})(this);
