utfx
====
utfx is a minimalistic (about 3 KB) library to process, convert, encode and decode UTF8 / UTF16 in JavaScript using
arbitrary sources and destinations through the use of callbacks.

### Background

While there are already tons of UTF8 libraries around, most (if not all) of them are based on a specific data scheme
(e.g. binary strings) which are not appropriate in specific use cases. To work around that, utfx provides the developer
with the freedom to implement the low level operations (obtaining and outputting data) on their own.

**PLEASE NOTE:** Though utfx is the outsourced UTF8 component of [ByteBuffer.js](https://github.com/dcodeIO/ByteBuffer.js),
it is still in its early stages and hasn't been heavily tested yet.

API
---

### Class [TruncatedError](doco/TruncatedError.md)

An error indicating a truncated source.

### decodeUTF8(src, dst)

Decodes an arbitrary input source of UTF8 bytes to UTF8 code points.

| Parameter       | Type            | Description
|-----------------|-----------------|---------------
| src             | *function():(number &#124; null) &#124; !Array.&lt;number&gt; &#124; string* | Bytes source, either as a function returning the next byte respectively `null` if there are no more bytes left, an array of bytes or a binary string. 
| dst             | *function(number) &#124; Array.&lt;number&gt;* | Code points destination, either as a function successively called with each decoded code point or an array to be filled with the decoded code points. 
| **@throws**     | *TypeError*     | If arguments are invalid 
| **@throws**     | *RangeError*    | If a starting byte is invalid in UTF8 
| **@throws**     | *utfx.TruncatedError* | If the last sequence is truncated. Has a property `bytes` holding the remaining bytes. 

### encodeUTF8(src, dst)

Encodes UTF8 code points to an arbitrary output destination of UTF8 bytes.

| Parameter       | Type            | Description
|-----------------|-----------------|---------------
| src             | *function():(number &#124; null) &#124; !Array.&lt;number&gt;* | Code points source, either as a function returning the  next code point respectively `null` if there are no more code points left or an array of code points. 
| dst             | *function(number) &#124; Array.&lt;number&gt; &#124; undefined* | Bytes destination, either as a function successively called with the next byte, an array to be filled with the encoded bytes or omitted to make this function return a binary string. 
| **@returns**    | *undefined &#124; string* | A binary string if `dst` has been omitted, otherwise `undefined` 
| **@throws**     | *TypeError*     | If arguments are invalid 
| **@throws**     | *RangeError*    | If a code point is invalid in UTF8 

### calculateUTF8(src)

Calculates the number of UTF8 bytes required to store an arbitrary input source of UTF8 code points.

| Parameter       | Type            | Description
|-----------------|-----------------|---------------
| src             | *function():(number &#124; null) &#124; Array.&lt;number&gt;* | Code points source, either as a function returning the next code point respectively `null` if there are no more code points left or an array of code points. 
| **@returns**    | *number*        | Number of UTF8 bytes required 
| **@throws**     | *TypeError*     | If arguments are invalid 
| **@throws**     | *RangeError*    | If a code point is invalid in UTF8 

### calculateUTF16asUTF8(src)

Calculates the number of UTF8 bytes required to store an arbitrary input source of UTF16 characters when
converted to UTF8 code points.

| Parameter       | Type            | Description
|-----------------|-----------------|---------------
| src             | *function():(number &#124; null) &#124; !Array.&lt;number&gt; &#124; string* | Characters source, either as a function returning the next character respectively `null` if there are no more characters left, an array of characters or a standard JavaScript string. 
| **@returns**    | *number*        | Number of UTF8 bytes required 
| **@throws**     | *TypeError*     | If arguments are invalid 
| **@throws**     | *RangeError*    | If an intermediate code point is invalid in UTF8 

### UTF16toUTF8(src, dst)

Converts an arbitrary input source of UTF16 characters to an arbitrary output destination of UTF8 code points.

| Parameter       | Type            | Description
|-----------------|-----------------|---------------
| src             | *function():(number &#124; null) &#124; !Array.&lt;number&gt; &#124; string* | Characters source, either as a function returning the next character respectively `null` if there are no more characters left, an array of characters or a standard JavaScript string. 
| dst             | *function(number) &#124; Array.&lt;number&gt;* | Code points destination, either as a function successively called with the each converted code point or an array to be filled with the converted code points. 
| **@throws**     | *TypeError*     | If arguments are invalid 

### UTF8toUTF16(src, dst)

Converts an arbitrary input source of UTF8 code points to an arbitrary output destination of UTF16 characters.

| Parameter       | Type            | Description
|-----------------|-----------------|---------------
| src             | *function():(number &#124; null) &#124; !Array.&lt;number&gt;* | Code points source, either as a function returning the next code point respectively `null` if there are no more code points left or an array of code points. 
| dst             | *function(number) &#124; !Array.&lt;number&gt; &#124; undefined* | Characters destination, either as a function successively called with each converted character, an array to be filled with the converted characters or omitted to make this function return a standard JavaScript string. 
| **@returns**    | *undefined &#124; string* | A standard JavaScript string if `dst` has been omitted, otherwise `undefined` 
| **@throws**     | *TypeError*     | If arguments are invalid 
| **@throws**     | *RangeError*    | If a code point is invalid 

Downloads
---------
* [Distributions](https://github.com/dcodeIO/utfx/tree/master/dist)

License
-------
Apache License, Version 2.0
