// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (vararg) return 8;
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    var i = 3;
    // params, etc.
    var basicTypes = {
      'v': 'void',
      'b': 'bool',
      'c': 'char',
      's': 'short',
      'i': 'int',
      'l': 'long',
      'f': 'float',
      'd': 'double',
      'w': 'wchar_t',
      'a': 'signed char',
      'h': 'unsigned char',
      't': 'unsigned short',
      'j': 'unsigned int',
      'm': 'unsigned long',
      'x': 'long long',
      'y': 'unsigned long long',
      'z': '...'
    };
    function dump(x) {
      //return;
      if (x) Module.print(x);
      Module.print(func);
      var pre = '';
      for (var a = 0; a < i; a++) pre += ' ';
      Module.print (pre + '^');
    }
    var subs = [];
    function parseNested() {
      i++;
      if (func[i] === 'K') i++; // ignore const
      var parts = [];
      while (func[i] !== 'E') {
        if (func[i] === 'S') { // substitution
          i++;
          var next = func.indexOf('_', i);
          var num = func.substring(i, next) || 0;
          parts.push(subs[num] || '?');
          i = next+1;
          continue;
        }
        if (func[i] === 'C') { // constructor
          parts.push(parts[parts.length-1]);
          i += 2;
          continue;
        }
        var size = parseInt(func.substr(i));
        var pre = size.toString().length;
        if (!size || !pre) { i--; break; } // counter i++ below us
        var curr = func.substr(i + pre, size);
        parts.push(curr);
        subs.push(curr);
        i += pre + size;
      }
      i++; // skip E
      return parts;
    }
    var first = true;
    function parse(rawList, limit, allowVoid) { // main parser
      limit = limit || Infinity;
      var ret = '', list = [];
      function flushList() {
        return '(' + list.join(', ') + ')';
      }
      var name;
      if (func[i] === 'N') {
        // namespaced N-E
        name = parseNested().join('::');
        limit--;
        if (limit === 0) return rawList ? [name] : name;
      } else {
        // not namespaced
        if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
        var size = parseInt(func.substr(i));
        if (size) {
          var pre = size.toString().length;
          name = func.substr(i + pre, size);
          i += pre + size;
        }
      }
      first = false;
      if (func[i] === 'I') {
        i++;
        var iList = parse(true);
        var iRet = parse(true, 1, true);
        ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
      } else {
        ret = name;
      }
      paramLoop: while (i < func.length && limit-- > 0) {
        //dump('paramLoop');
        var c = func[i++];
        if (c in basicTypes) {
          list.push(basicTypes[c]);
        } else {
          switch (c) {
            case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
            case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
            case 'L': { // literal
              i++; // skip basic type
              var end = func.indexOf('E', i);
              var size = end - i;
              list.push(func.substr(i, size));
              i += size + 2; // size + 'EE'
              break;
            }
            case 'A': { // array
              var size = parseInt(func.substr(i));
              i += size.toString().length;
              if (func[i] !== '_') throw '?';
              i++; // skip _
              list.push(parse(true, 1, true)[0] + ' [' + size + ']');
              break;
            }
            case 'E': break paramLoop;
            default: ret += '?' + c; break paramLoop;
          }
        }
      }
      if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
      return rawList ? list : ret + flushList();
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', or (2) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 47416;


/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });











var _stdout;
var _stdout=_stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;
var _stderr;
var _stderr=_stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);;



















































































































































































































































































































































































































































































































































/* memory initializer */ allocate([71,68,66,32,104,105,116,32,99,111,110,116,114,111,108,45,99,0,0,0,0,0,0,0,42,42,32,73,110,118,97,108,105,100,32,83,82,69,71,33,33,0,0,0,0,0,0,0,42,42,32,73,110,118,97,108,105,100,32,83,82,69,71,33,33,0,0,0,0,0,0,0,87,97,107,105,110,103,32,67,80,85,32,100,117,101,32,116,111,32,105,110,116,101,114,114,117,112,116,0,0,0,0,0,115,105,103,110,97,108,32,99,97,117,103,104,116,44,32,115,105,109,97,118,114,32,116,101,114,109,105,110,97,116,105,110,103,0,0,0,0,0,0,0,128,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,152,104,0,0,224,112,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,128,104,0,0,255,10,0,0,255,127,0,0,255,3,0,0,4,30,149,135,248,250,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([4,66,65,64,63,0,0,63,24,0,0,63,26,0,0,0,0,0,0,0,0,0,0,63,20,0,0,63,18,0,0,63,16,0,0,30,0,0,0,63,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,22,0,0,96,24,0,0,96,22,0,0,96,16,0,0,96,18,0,0,96,20,0,0,96,26,0,0,12,0,0,0,96,28,0,0,96,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,128,0,87,0,87,16,0,0,87,18,0,0,87,20,0,0,87,22,0,0,87,24,0,0,87,28,0,0,37,0,0,0,87,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,16,0,0,105,18,0,0,1,0,0,0,61,16,0,0,60,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,103,111,105,2,0,0,0,105,20,0,0,105,22,0,0,2,0,0,0,61,18,0,0,60,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,103,111,105,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,66,0,37,0,36,0,35,0,9,0,0,0,104,16,0,0,59,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,0,40,0,39,0,38,0,4,0,0,0,104,18,0,0,59,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,43,0,42,0,41,0,5,0,0,0,104,20,0,0,59,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,0,100,18,0,0,206,0,200,0,201,0,202,0,201,24,0,0,201,22,0,0,0,0,0,0,202,22,0,0,202,50,0,0,201,20,0,0,204,0,205,0,18,0,0,0,201,30,0,0,200,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,201,28,0,0,200,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,201,26,0,0,200,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,124,0,0,0,124,16,0,0,124,18,0,0,124,20,0,0,124,22,0,0,0,0,0,0,0,0,0,0,124,28,0,0,124,30,0,0,0,0,0,0,0,0,2,0,0,0,76,4,0,0,0,0,0,0,0,0,124,26,0,0,122,0,0,0,122,30,0,0,122,28,0,0,122,26,0,0,122,16,0,0,122,18,0,0,122,20,0,0,120,121,123,0,123,16,0,0,123,18,0,0,123,20,0,0,0,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,122,22,0,0,122,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,8,0,2,0,16,0,2,0,24,0,2,0,32,0,2,0,40,0,2,0,48,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,96,34,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,0,100,26,0,0,70,0,0,0,0,0,0,0,68,16,0,0,68,18,0,0,69,22,0,0,0,0,0,0,0,0,8,1,0,0,0,0,1,0,0,2,0,0,8,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,69,16,0,0,69,18,0,0,69,20,0,0,0,0,0,0,0,0,3,6,8,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,110,18,0,0,53,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,71,0,0,0,68,60,0,0,43,28,0,0,0,0,0,0,0,0,0,0,22,0,0,0,110,20,0,0,53,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,0,0,0,68,56,0,0,43,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,0,0,0,110,16,0,0,53,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,0,0,0,100,22,0,0,132,0,134,0,133,0,135,0,128,16,0,0,128,18,0,0,129,22,0,0,129,24,0,0,0,0,16,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,8,4,0,0,9,4,0,0,10,4,2,0,0,3,1,0,0,3,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,3,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,129,16,0,0,129,18,0,0,129,20,0,0,0,0,0,0,0,0,3,6,8,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,16,0,0,129,28,0,0,0,0,0,0,17,0,0,0,111,18,0,0,54,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,0,137,0,128,60,0,0,37,18,0,0,0,0,0,0,0,0,0,0,18,0,0,0,111,20,0,0,54,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,0,139,0,128,56,0,0,37,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,111,16,0,0,54,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,111,26,0,0,54,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,100,28,0,0,178,0,0,0,0,0,0,0,176,16,0,0,176,18,0,0,177,22,0,0,0,0,0,0,0,0,8,1,0,0,0,0,1,0,0,2,0,0,8,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,182,26,0,0,177,16,0,0,177,18,0,0,177,20,0,0,0,0,0,0,0,0,3,5,6,7,8,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,112,18,0,0,55,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,179,0,0,0,176,60,0,0,37,22,0,0,0,0,0,0,0,0,0,0,8,0,0,0,112,20,0,0,55,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,180,0,0,0,176,56,0,0,43,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,112,16,0,0,55,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,20,0,0,78,0,76,0,77,0,0,0,76,28,0,0,76,24,0,0,76,16,0,0,76,18,0,0,77,16,0,0,0,0,0,0,24,0,0,0,76,30,0,0,77,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,30,0,0,184,0,188,0,185,0,186,0,189,0,187,0,188,20,0,0,188,28,0,0,188,26,0,0,188,24,0,0,188,22,0,0,185,246,1,0,185,48,0,0,36,0,0,0,188,16,0,0,188,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,152,104,0,0,255,8,0,0,255,127,0,0,255,3,0,0,4,30,149,15,248,250,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,30], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+8221);
/* memory initializer */ allocate([4,66,65,64,63,0,0,63,24,0,0,63,26,0,0,0,0,0,0,0,0,0,0,63,20,0,0,63,18,0,0,63,16,0,0,22,0,0,0,63,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,84,22,0,0,96,24,0,0,96,22,0,0,96,16,0,0,96,18,0,0,96,20,0,0,96,26,0,0,6,0,0,0,96,28,0,0,96,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,128,0,87,0,87,16,0,0,87,18,0,0,87,20,0,0,87,22,0,0,87,24,0,0,87,28,0,0,25,0,0,0,87,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,105,16,0,0,105,18,0,0,1,0,0,0,61,16,0,0,60,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,103,111,105,2,0,0,0,105,20,0,0,105,22,0,0,2,0,0,0,61,18,0,0,60,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,103,111,105,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,66,0,37,0,36,0,35,0,3,0,0,0,104,16,0,0,59,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,107,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,0,40,0,39,0,38,0,4,0,0,0,104,18,0,0,59,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,43,0,42,0,41,0,5,0,0,0,104,20,0,0,59,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,0,100,18,0,0,198,0,192,0,193,0,194,0,193,24,0,0,193,22,0,0,0,0,0,0,194,22,0,0,194,50,0,0,193,20,0,0,196,0,197,0,18,0,0,0,193,30,0,0,192,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,193,28,0,0,192,28,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,193,26,0,0,192,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,124,0,0,0,124,16,0,0,124,18,0,0,124,20,0,0,124,22,0,0,0,0,0,0,0,0,0,0,124,28,0,0,124,30,0,0,0,0,0,0,0,0,2,0,0,0,76,4,0,0,0,0,0,0,0,0,124,26,0,0,122,0,0,0,122,30,0,0,122,28,0,0,122,26,0,0,122,16,0,0,122,18,0,0,122,20,0,0,120,121,123,0,123,16,0,0,123,18,0,0,123,20,0,0,0,0,0,0,1,0,0,0,2,0,0,0,6,0,0,0,7,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,122,22,0,0,122,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,2,0,8,0,2,0,16,0,2,0,24,0,2,0,32,0,2,0,40,0,2,0,48,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,96,34,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,0,0,0,100,26,0,0,70,0,0,0,0,0,0,0,68,16,0,0,68,18,0,0,69,22,0,0,0,0,0,0,0,0,8,1,0,0,0,0,1,0,0,2,0,0,8,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,69,16,0,0,69,18,0,0,69,20,0,0,0,0,0,0,0,0,3,6,8,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,110,18,0,0,53,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,71,0,0,0,68,60,0,0,43,28,0,0,0,0,0,0,0,0,0,0,15,0,0,0,110,20,0,0,53,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,0,0,0,68,56,0,0,43,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,110,16,0,0,53,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,0,0,0,100,22,0,0,132,0,134,0,133,0,135,0,128,16,0,0,128,18,0,0,129,22,0,0,129,24,0,0,0,0,16,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,0,0,8,4,0,0,9,4,0,0,10,4,2,0,0,3,1,0,0,3,0,0,0,0,0,0,0,0,2,0,0,2,0,0,0,0,2,0,0,3,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,129,16,0,0,129,18,0,0,129,20,0,0,0,0,0,0,0,0,3,6,8,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,16,0,0,129,28,0,0,0,0,0,0,11,0,0,0,111,18,0,0,54,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,0,137,0,128,60,0,0,37,18,0,0,0,0,0,0,0,0,0,0,12,0,0,0,111,20,0,0,54,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,138,0,139,0,128,56,0,0,37,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,111,16,0,0,54,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,111,26,0,0,54,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,0,0,0,100,28,0,0,178,0,0,0,0,0,0,0,176,16,0,0,176,18,0,0,177,22,0,0,0,0,0,0,0,0,8,1,0,0,0,0,1,0,0,2,0,0,8,4,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,182,26,0,0,177,16,0,0,177,18,0,0,177,20,0,0,0,0,0,0,0,0,3,5,6,7,8,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,112,18,0,0,55,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,179,0,0,0,176,60,0,0,37,22,0,0,0,0,0,0,0,0,0,0,8,0,0,0,112,20,0,0,55,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,180,0,0,0,176,56,0,0,43,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,112,16,0,0,55,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,20,0,0,78,0,76,0,77,0,0,0,76,28,0,0,76,24,0,0,76,16,0,0,76,18,0,0,77,16,0,0,0,0,0,0,17,0,0,0,76,30,0,0,77,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,30,0,0,184,0,188,0,185,0,186,0,189,0,187,0,188,20,0,0,188,28,0,0,188,26,0,0,188,24,0,0,188,22,0,0,185,246,1,0,185,48,0,0,24,0,0,0,188,16,0,0,188,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,224,98,0,0,192,97,0,0,224,96,0,0,96,95,0,0,160,110,0,0,0,110,0,0,184,109,0,0,0,0,0,0,232,96,0,0,128,95,0,0,200,94,0,0,248,93,0,0,16,115,0,0,0,0,0,0,200,106,0,0,16,102,0,0,216,113,0,0,200,107,0,0,64,102,0,0,48,99,0,0,216,97,0,0,240,96,0,0,136,95,0,0,208,94,0,0,0,94,0,0,24,115,0,0,112,114,0,0,72,113,0,0,232,113,0,0,240,107,0,0,152,102,0,0,96,99,0,0,8,98,0,0,248,96,0,0,144,95,0,0,216,94,0,0,192,104,0,0,184,104,0,0,144,104,0,0,176,103,0,0,48,103,0,0,0,103,0,0,224,101,0,0,48,101,0,0,192,104,0,0,40,101,0,0,168,100,0,0,72,100,0,0,248,99,0,0,216,99,0,0,200,99,0,0,168,99,0,0,160,99,0,0,32,99,0,0,120,98,0,0,0,0,0,0,0,0,0,0,176,104,0,0,240,112,0,0,32,106,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,8,0,0,0,9,0,0,0,24,0,0,0,26,0,0,0,28,0,0,0,0,0,0,0,152,0,0,0,176,0,0,0,0,0,0,0,0,0,0,0,104,99,0,0,16,98,0,0,0,97,0,0,152,95,0,0,224,94,0,0,8,94,0,0,32,115,0,0,160,114,0,0,80,113,0,0,80,112,0,0,136,111,0,0,24,111,0,0,168,110,0,0,16,110,0,0,200,109,0,0,144,109,0,0,32,109,0,0,0,0,0,0,103,100,98,95,110,101,116,119,111,114,107,95,104,97,110,100,108,101,114,32,97,99,99,101,112,116,0,0,0,0,0,0,73,50,67,32,108,97,116,99,104,32,105,115,32,110,111,116,32,114,101,97,100,121,44,32,100,111,32,110,111,116,104,105,110,103,10,0,0,0,0,0,62,99,111,109,112,98,0,0,56,61,97,108,108,0,0,0,97,110,97,108,111,103,95,99,111,109,112,97,114,97,116,111,114,95,51,0,0,0,0,0,37,115,32,97,99,116,105,118,97,116,105,110,103,32,117,97,114,116,32,108,111,99,97,108,32,101,99,104,111,32,73,82,81,32,115,114,99,32,37,112,32,100,115,116,32,37,112,10,0,0,0,0,0,0,0,0,76,111,97,100,101,100,32,37,100,32,115,101,99,116,105,111,110,32,111,102,32,105,104,101,120,10,0,0,0,0,0,0,97,118,114,95,103,100,98,95,105,110,105,116,32,108,105,115,116,101,110,105,110,103,32,111,110,32,112,111,114,116,32,37,100,10,0,0,0,0,0,0,97,118,114,46,105,111,46,37,115,0,0,0,0,0,0,0,73,50,67,32,115,108,97,118,101,32,87,82,73,84,69,32,98,121,116,101,10,0,0,0,62,99,111,109,112,97,0,0,61,112,105,110,55,0,0,0,60,105,110,116,55,0,0,0,97,110,97,108,111,103,95,99,111,109,112,97,114,97,116,111,114,95,50,0,0,0,0,0,37,115,32,37,48,50,120,10,0,0,0,0,0,0,0,0,85,110,97,98,108,101,32,116,111,32,108,111,97,100,32,73,72,69,88,32,102,105,108,101,10,0,0,0,0,0,0,0,79,58,37,115,10,0,0,0,108,105,115,116,101,110,0,0,56,61,97,118,114,46,105,111,37,48,52,120,46,97,108,108,0,0,0,0,0,0,0,0,119,97,116,99,104,100,111,103,0,0,0,0,0,0,0,0,62,120,111,102,102,0,0,0,73,50,67,32,115,108,97,118,101,32,82,69,65,68,32,98,121,116,101,10,0,0,0,0,56,62,112,119,109,49,0,0,61,112,105,110,54,0,0,0,60,105,110,116,54,0,0,0,97,110,97,108,111,103,95,99,111,109,112,97,114,97,116,111,114,95,49,0,0,0,0,0,37,115,32,99,97,108,108,105,110,103,32,37,100,10,0,0,84,37,48,50,120,50,48,58,37,48,50,120,59,50,49,58,37,48,50,120,37,48,50,120,59,50,50,58,37,48,50,120,37,48,50,120,37,48,50,120,48,48,59,37,115,58,37,48,54,120,59,0,0,0,0,0,115,105,109,47,114,117,110,95,97,118,114,46,99,0,0,0,83,116,97,114,116,105,110,103,32,37,115,32,45,32,102,108,97,115,104,101,110,100,32,37,48,52,120,32,114,97,109,101,110,100,32,37,48,52,120,32,101,50,101,110,100,32,37,48,52,120,10,0,0,0,0,0,71,68,66,58,32,67,97,110,32,110,111,116,32,98,105,110,100,32,115,111,99,107,101,116,58,32,37,115,0,0,0,0,67,89,67,76,69,58,32,37,115,58,32,112,111,111,108,32,105,115,32,102,117,108,108,32,40,37,100,41,33,10,0,0,37,115,58,32,104,117,104,32,39,37,99,39,32,40,37,115,41,10,0,0,0,0,0,0,61,97,118,114,46,105,111,37,48,52,120,46,37,100,0,0,87,65,84,67,72,68,79,71,58,32,116,105,109,101,114,32,102,105,114,101,100,32,119,105,116,104,111,117,116,32,105,110,116,101,114,114,117,112,116,46,32,82,101,115,101,116,116,105,110,103,10,0,0,0,0,0,62,120,111,110,0,0,0,0,56,62,112,119,109,48,0,0,61,112,105,110,53,0,0,0,60,105,110,116,53,0,0,0,97,110,97,108,111,103,95,99,111,109,112,97,114,97,116,111,114,95,48,0,0,0,0,0,37,115,32,99,108,101,97,114,101,100,32,37,100,10,0,0,98,105,110,97,114,121,91,108,105,110,101,67,117,114,115,111,114,43,43,93,32,61,61,32,39,58,39,0,0,0,0,0,71,68,66,58,32,67,97,110,39,116,32,99,114,101,97,116,101,32,115,111,99,107,101,116,58,32,37,115,0,0,0,0,73,79,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,105,111,95,119,114,105,116,101,40,41,58,32,84,111,111,32,109,97,110,121,32,99,97,108,108,98,97,99,107,115,32,111,110,32,37,48,52,120,46,10,0,0,0,0,0,0,0,87,65,84,67,72,68,79,71,58,32,116,105,109,101,114,32,102,105,114,101,100,46,10,0,56,62,111,117,116,0,0,0,82,69,0,0,0,0,0,0,116,105,109,101,114,0,0,0,61,112,105,110,52,0,0,0,70,76,65,83,72,58,32,87,114,105,116,105,110,103,32,116,101,109,112,112,97,103,101,32,37,48,56,120,32,40,37,48,52,120,41,10,0,0,0,0,60,105,110,116,52,0,0,0,102,114,101,101,95,114,117,110,110,105,110,103,0,0,0,0,37,115,58,32,65,86,82,32,39,37,115,39,32,110,111,116,32,107,110,111,119,110,10,0,115,105,109,97,118,114,58,32,115,108,101,101,112,105,110,103,32,119,105,116,104,32,105,110,116,101,114,114,117,112,116,115,32,111,102,102,44,32,113,117,105,116,116,105,110,103,32,103,114,97,99,101,102,117,108,108,121,10,0,0,0,0,0,0,62,116,114,105,103,103,101,114,95,111,117,116,0,0,0,0,73,79,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,105,111,95,119,114,105,116,101,40,37,48,52,120,41,58,32,73,110,115,116,97,108,108,105,110,103,32,109,117,120,101,114,32,111,110,32,114,101,103,105,115,116,101,114,46,10,0,87,65,84,67,72,68,79,71,58,32,100,105,115,97,98,108,101,100,10,0,0,0,0,0,56,60,105,110,0,0,0,0,62,62,62,62,62,32,73,50,67,32,37,115,115,116,97,114,116,10,0,0,0,0,0,0,84,73,77,69,82,58,32,37,115,45,37,99,32,99,108,111,99,107,32,116,117,114,110,101,100,32,111,102,102,10,0,0,60,116,114,105,103,103,101,114,95,105,110,0,0,0,0,0,61,112,105,110,51,0,0,0,70,76,65,83,72,58,32,83,101,116,116,105,110,103,32,108,111,99,107,32,98,105,116,115,32,40,105,103,110,111,114,101,100,41,10,0,0,0,0,0,60,105,110,116,51,0,0,0,110,111,110,101,0,0,0,0,37,115,32,116,114,121,105,110,103,32,116,111,32,100,111,117,98,108,101,32,114,97,105,115,101,32,37,100,32,40,101,110,97,98,108,101,100,32,37,100,41,10,0,0,0,0,0,0,49,54,60,116,101,109,112,0,49,54,60,97,100,99,49,53,0,0,0,0,0,0,0,0,37,115,32,105,110,105,116,10,0,0,0,0,0,0,0,0,49,54,60,97,100,99,49,52,0,0,0,0,0,0,0,0,49,54,60,97,100,99,49,51,0,0,0,0,0,0,0,0,35,37,48,50,120,0,0,0,114,119,97,116,99,104,0,0,49,54,60,97,100,99,49,50,0,0,0,0,0,0,0,0,84,37,48,50,120,50,48,58,37,48,50,120,59,50,49,58,37,48,50,120,37,48,50,120,59,50,50,58,37,48,50,120,37,48,50,120,37,48,50,120,48,48,59,0,0,0,0,0,37,48,50,120,37,48,50,120,37,48,50,120,48,48,0,0,49,54,60,97,100,99,49,49,0,0,0,0,0,0,0,0,97,118,114,95,108,111,97,100,99,111,100,101,40,41,58,32,65,116,116,101,109,112,116,101,100,32,116,111,32,108,111,97,100,32,99,111,100,101,32,111,102,32,115,105,122,101,32,37,100,32,98,117,116,32,102,108,97,115,104,32,115,105,122,101,32,105,115,32,111,110,108,121,32,37,100,46,10,0,0,0,49,54,60,97,100,99,49,48,0,0,0,0,0,0,0,0,37,48,50,120,37,48,50,120,0,0,0,0,0,0,0,0,27,91,51,49,109,67,79,82,69,58,32,42,42,42,32,73,110,118,97,108,105,100,32,114,101,97,100,32,97,100,100,114,101,115,115,32,80,67,61,37,48,52,120,32,83,80,61,37,48,52,120,32,79,61,37,48,52,120,32,65,100,100,114,101,115,115,32,37,48,52,120,32,111,117,116,32,111,102,32,114,97,109,32,40,37,48,52,120,41,10,27,91,48,109,0,0,49,54,60,97,100,99,57,0,49,54,60,97,100,99,55,0,37,100,44,37,120,44,37,120,0,0,0,0,0,0,0,0,73,79,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,105,111,95,119,114,105,116,101,40,41,58,32,84,111,111,32,109,97,110,121,32,115,104,97,114,101,100,32,73,79,32,114,101,103,105,115,116,101,114,115,46,10,0,0,0,0,0,87,65,84,67,72,68,79,71,58,32,37,115,32,116,111,32,37,100,32,99,121,99,108,101,115,32,64,32,49,50,56,107,122,32,40,42,32,37,100,41,32,61,32,37,100,32,67,80,85,32,99,121,99,108,101,115,46,10,0,0,0,0,0,0,117,97,114,116,0,0,0,0,60,60,60,60,60,32,73,50,67,32,115,116,111,112,10,0,49,54,60,97,100,99,54,0,84,73,77,69,82,58,32,37,115,45,37,99,32,37,99,32,37,46,50,102,72,122,32,61,32,37,100,32,99,121,99,108,101,115,10,0,0,0,0,0,56,60,111,117,116,0,0,0,71,68,66,58,32,119,114,105,116,101,32,109,101,109,111,114,121,32,101,114,114,111,114,32,37,48,56,120,44,32,37,48,56,120,10,0,0,0,0,0,61,112,105,110,50,0,0,0,70,76,65,83,72,58,32,87,114,105,116,105,110,103,32,112,97,103,101,32,37,48,52,120,32,40,37,100,41,10,0,0,87,65,82,78,73,78,71,32,37,115,40,41,32,119,105,116,104,32,78,85,76,76,32,110,97,109,101,32,102,111,114,32,105,114,113,32,37,100,46,10,0,0,0,0,0,0,0,0,60,105,110,116,50,0,0,0,69,69,80,82,79,77,58,32,37,115,58,32,65,86,82,95,73,79,67,84,76,95,69,69,80,82,79,77,95,71,69,84,32,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,10,0,0,0,0,0,0,65,68,67,58,32,99,104,97,110,110,101,108,32,37,100,32,99,108,105,112,112,101,100,32,37,117,47,37,117,32,86,82,69,70,32,37,100,10,0,0,49,54,60,97,100,99,53,0,37,115,32,114,97,105,115,105,110,103,32,37,100,32,40,101,110,97,98,108,101,100,32,37,100,41,10,0,0,0,0,0,37,48,50,120,0,0,0,0,49,54,60,97,100,99,52,0,71,68,66,58,32,114,101,97,100,32,109,101,109,111,114,121,32,101,114,114,111,114,32,37,48,56,120,44,32,37,48,56,120,32,40,114,97,109,101,110,100,32,37,48,52,120,41,10,0,0,0,0,0,0,0,0,73,78,84,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,118,101,99,116,111,114,58,32,78,111,32,39,101,110,97,98,108,101,39,32,98,105,116,32,111,110,32,118,101,99,116,111,114,32,37,100,32,33,10,0,0,0,0,0,0,0,49,54,60,97,100,99,51,0,73,79,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,105,111,95,114,101,97,100,40,41,58,32,65,108,114,101,97,100,121,32,114,101,103,105,115,116,101,114,101,100,44,32,114,101,102,117,115,105,110,103,32,116,111,32,111,118,101,114,114,105,100,101,46,10,0,0,27,91,51,49,109,67,79,82,69,58,32,42,42,42,32,37,48,52,120,58,32,73,110,118,97,108,105,100,32,79,112,99,111,100,101,32,83,80,61,37,48,52,120,32,79,61,37,48,52,120,32,10,27,91,48,109,0,0,0,0,0,0,0,0,71,68,66,58,32,114,101,97,100,32,106,117,115,116,32,112,97,115,116,32,101,110,100,32,111,102,32,115,116,97,99,107,32,37,48,56,120,44,32,37,48,56,120,59,32,114,101,116,117,114,110,105,110,103,32,122,101,114,111,10,0,0,0,0,97,116,109,101,103,97,51,50,117,52,0,0,0,0,0,0,49,54,60,97,100,99,50,0,97,116,109,101,103,97,51,50,56,0,0,0,0,0,0,0,119,97,116,99,104,0,0,0,114,101,115,101,116,0,0,0,49,54,60,97,100,99,49,0,49,54,60,97,100,99,48,0,37,120,44,37,120,0,0,0,37,120,0,0,0,0,0,0,97,100,99,0,0,0,0,0,37,115,10,0,0,0,0,0,85,65,82,84,58,32,37,99,32,99,111,110,102,105,103,117,114,101,100,32,116,111,32,37,48,52,120,32,61,32,37,100,32,98,112,115,32,40,120,37,100,41,44,32,37,100,32,100,97,116,97,32,37,100,32,115,116,111,112,10,0,0,0,0,67,79,82,69,58,32,42,42,42,32,73,110,118,97,108,105,100,32,119,114,105,116,101,32,97,100,100,114,101,115,115,32,80,67,61,37,48,52,120,32,83,80,61,37,48,52,120,32,79,61,37,48,52,120,32,65,100,100,114,101,115,115,32,37,48,52,120,61,37,48,50,120,32,108,111,119,32,114,101,103,105,115,116,101,114,115,10,0,65,68,67,58,32,115,116,97,114,116,105,110,103,32,97,116,32,37,117,75,72,122,10,0,73,50,67,32,114,101,99,101,105,118,101,100,32,37,48,50,120,10,0,0,0,0,0,0,65,68,67,58,32,83,116,97,114,116,32,65,82,69,70,32,37,100,32,65,86,67,67,32,37,100,10,0,0,0,0,0,73,79,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,105,111,95,119,114,105,116,101,40,41,58,32,73,79,32,97,100,100,114,101,115,115,32,48,120,37,48,52,120,32,111,117,116,32,111,102,32,114,97,110,103,101,32,40,109,97,120,32,48,120,37,48,52,120,41,46,10,0,0,0,0,0,0,101,110,97,98,108,101,100,32,97,110,100,32,115,101,116,0,27,91,51,50,109,37,115,10,27,91,48,109,0,0,0,0,73,50,67,32,114,101,99,101,105,118,101,100,32,65,67,75,58,37,100,10,0,0,0,0,84,87,69,78,32,83,108,97,118,101,58,32,37,48,50,120,38,37,48,50,120,10,0,0,65,68,67,58,32,97,117,116,111,32,116,114,105,103,103,101,114,32,99,111,110,102,105,103,117,114,101,100,58,32,37,115,10,0,0,0,0,0,0,0,84,73,77,69,82,58,32,37,115,45,37,99,32,84,79,80,32,37,46,50,102,72,122,32,61,32,37,100,32,99,121,99,108,101,115,32,61,32,37,100,117,115,101,99,10,0,0,0,56,60,105,110,0,0,0,0,108,60,109,101,109,111,114,121,45,109,97,112,62,10,32,60,109,101,109,111,114,121,32,116,121,112,101,61,39,114,97,109,39,32,115,116,97,114,116,61,39,48,120,56,48,48,48,48,48,39,32,108,101,110,103,116,104,61,39,37,35,120,39,47,62,10,32,60,109,101,109,111,114,121,32,116,121,112,101,61,39,102,108,97,115,104,39,32,115,116,97,114,116,61,39,48,39,32,108,101,110,103,116,104,61,39,37,35,120,39,62,10,32,32,60,112,114,111,112,101,114,116,121,32,110,97,109,101,61,39,98,108,111,99,107,115,105,122,101,39,62,48,120,56,48,60,47,112,114,111,112,101,114,116,121,62,10,32,60,47,109,101,109,111,114,121,62,10,60,47,109,101,109,111,114,121,45,109,97,112,62,0,0,0,37,115,32,37,48,50,120,32,83,84,65,82,84,58,37,100,32,83,84,79,80,58,37,100,32,65,67,75,58,37,100,32,73,78,84,58,37,100,32,84,87,83,82,58,37,48,50,120,32,40,115,116,97,116,101,32,37,48,50,120,41,10,0,0,61,112,105,110,49,0,0,0,70,76,65,83,72,58,32,69,114,97,115,105,110,103,32,112,97,103,101,32,37,48,52,120,32,40,37,100,41,10,0,0,60,105,110,116,49,0,0,0,69,69,80,82,79,77,58,32,37,115,58,32,65,86,82,95,73,79,67,84,76,95,69,69,80,82,79,77,95,83,69,84,32,76,111,97,100,101,100,32,37,100,32,97,116,32,111,102,102,115,101,116,32,37,100,10,0,0,0,0,0,0,0,0,73,50,67,32,115,108,97,118,101,32,115,116,97,114,116,32,119,105,116,104,111,117,116,32,97,100,100,114,101,115,115,63,10,0,0,0,0,0,0,0,65,68,67,58,32,109,105,115,115,105,110,103,32,65,86,67,67,32,97,110,97,108,111,103,32,118,111,108,116,97,103,101,10,0,0,0,0,0,0,0,65,68,67,58,32,117,110,105,109,112,108,101,109,101,110,116,101,100,32,97,117,116,111,32,116,114,105,103,103,101,114,32,109,111,100,101,58,32,37,115,10,0,0,0,0,0,0,0,88,102,101,114,58,109,101,109,111,114,121,45,109,97,112,58,114,101,97,100,0,0,0,0,84,73,77,69,82,58,32,37,115,45,37,99,32,109,111,100,101,32,37,100,32,85,78,83,85,80,80,79,82,84,69,68,10,0,0,0,0,0,0,0,73,50,67,32,115,108,97,118,101,32,115,116,97,114,116,32,37,50,120,32,40,119,97,110,116,32,37,48,50,120,38,37,48,50,120,41,10,0,0,0,112,115,99,95,109,111,100,117,108,101,95,50,95,115,121,110,99,95,115,105,103,110,97,108,0,0,0,0,0,0,0,0,119,114,105,116,101,83,80,73,40,37,105,41,0,0,0,0,37,115,32,114,101,103,105,115,116,101,114,32,118,101,99,116,111,114,32,37,100,32,40,101,110,97,98,108,101,100,32,37,48,52,120,58,37,100,41,10,0,0,0,0,0,0,0,0,37,115,32,37,48,56,120,10,0,0,0,0,0,0,0,0,112,115,99,95,109,111,100,117,108,101,95,49,95,115,121,110,99,95,115,105,103,110,97,108,0,0,0,0,0,0,0,0,79,102,102,115,101,116,115,0,56,62,115,116,97,116,117,115,0,0,0,0,0,0,0,0,112,115,99,95,109,111,100,117,108,101,95,48,95,115,121,110,99,95,115,105,103,110,97,108,0,0,0,0,0,0,0,0,65,116,116,97,99,104,101,100,0,0,0,0,0,0,0,0,112,111,114,116,0,0,0,0,51,50,62,111,117,116,112,117,116,0,0,0,0,0,0,0,112,105,110,95,99,104,97,110,103,101,95,105,110,116,101,114,114,117,112,116,0,0,0,0,97,119,97,116,99,104,0,0,37,115,46,37,100,0,0,0,70,76,65,83,72,58,32,97,118,114,95,112,114,111,103,101,110,95,99,108,101,97,114,32,45,32,83,80,77,32,110,111,116,32,114,101,99,101,105,118,101,100,44,32,99,108,101,97,114,105,110,103,32,80,82,71,69,78,32,98,105,116,10,0,67,89,67,76,69,58,32,37,115,58,32,114,97,110,32,111,117,116,32,111,102,32,116,105,109,101,114,115,32,40,37,100,41,33,10,0,0,0,0,0,56,60,105,110,112,117,116,0,116,105,109,101,114,95,49,95,99,97,112,116,117,114,101,95,101,118,101,110,116,0,0,0,69,76,70,58,32,37,115,58,32,117,110,97,98,108,101,32,116,111,32,97,116,116,97,99,104,32,116,114,97,99,101,32,116,111,32,97,100,100,114,101,115,115,32,37,48,52,120,10,0,0,0,0,0,0,0,0,83,117,112,112,111,114,116,101,100,0,0,0,0,0,0,0,101,120,116,105,110,116,0,0,116,119,105,0,0,0,0,0,116,105,109,101,114,95,49,95,111,118,101,114,102,108,111,119,0,0,0,0,0,0,0,0,67,114,101,97,116,105,110,103,32,86,67,68,32,116,114,97,99,101,32,102,105,108,101,32,39,37,115,39,10,0,0,0,101,101,112,114,111,109,0,0,43,0,0,0,0,0,0,0,37,115,32,37,48,50,120,10,0,0,0,0,0,0,0,0,119,114,105,116,101,80,111,114,116,40,37,105,44,32,37,105,41,0,0,0,0,0,0,0,116,105,109,101,114,95,49,95,99,111,109,112,97,114,101,95,109,97,116,99,104,95,98,0,67,79,82,69,58,32,42,42,42,32,73,110,118,97,108,105,100,32,119,114,105,116,101,32,97,100,100,114,101,115,115,32,80,67,61,37,48,52,120,32,83,80,61,37,48,52,120,32,79,61,37,48,52,120,32,65,100,100,114,101,115,115,32,37,48,52,120,61,37,48,50,120,32,111,117,116,32,111,102,32,114,97,109,10,0,0,0,0,34,114,101,102,114,101,115,104,85,73,40,41,34,0,0,0,73,50,67,32,77,97,115,116,101,114,32,97,100,100,114,101,115,115,32,37,48,50,120,10,0,0,0,0,0,0,0,0,66,67,68,69,70,0,0,0,101,114,114,111,114,58,32,37,115,32,105,110,118,97,108,105,100,32,105,114,113,32,37,112,47,37,112,0,0,0,0,0,116,105,109,101,114,95,48,95,111,118,101,114,102,108,111,119,0,0,0,0,0,0,0,0,65,116,116,101,109,112,116,101,100,32,116,111,32,108,111,97,100,32,97,32,98,111,111,116,108,111,97,100,101,114,32,97,116,32,37,48,52,120,10,0,73,79,58,32,97,118,114,95,114,101,103,105,115,116,101,114,95,105,111,95,114,101,97,100,40,37,48,52,120,32,58,32,37,112,47,37,112,41,58,32,37,112,47,37,112,10,0,0,103,100,98,95,110,101,116,119,111,114,107,95,104,97,110,100,108,101,114,32,114,101,99,118,0,0,0,0,0,0,0,0,97,116,109,101,103,97,51,50,56,112,0,0,0,0,0,0,101,110,97,98,108,101,100,0,85,65,82,84,58,32,82,111,117,103,104,108,121,32,37,100,32,117,115,101,99,32,112,101,114,32,98,121,116,101,115,10,0,0,0,0,0,0,0,0,115,116,97,116,101,32,37,48,50,120,32,119,97,110,116,32,37,48,50,120,10,0,0,0,84,87,69,78,58,32,37,100,10,0,0,0,0,0,0,0,56,62,112,105,110,0,0,0,116,105,109,101,114,95,48,95,99,111,109,112,97,114,101,95,109,97,116,99,104,95,98,0,84,73,77,69,82,58,32,37,115,45,37,99,32,117,110,115,117,112,112,111,114,116,101,100,32,116,105,109,101,114,32,109,111,100,101,32,119,103,109,61,37,100,32,40,37,100,41,10,0,0,0,0,0,0,0,0,115,112,105,0,0,0,0,0,65,86,82,32,39,37,115,39,32,110,111,116,32,107,110,111,119,110,10,0,0,0,0,0,37,115,32,99,111,110,110,101,99,116,105,111,110,32,99,108,111,115,101,100,10,0,0,0,61,112,105,110,48,0,0,0,102,108,97,115,104,0,0,0,60,105,110,116,48,0,0,0,69,69,80,82,79,77,58,32,37,115,58,32,65,86,82,95,73,79,67,84,76,95,69,69,80,82,79,77,95,83,69,84,32,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,10,0,0,0,0,0,0,65,68,67,58,32,109,105,115,115,105,110,103,32,86,67,67,32,97,110,97,108,111,103,32,118,111,108,116,97,103,101,10,0,0,0,0,0,0,0,0,73,50,67,32,87,82,73,84,69,32,98,121,116,101,32,37,48,50,120,32,116,111,32,37,48,50,120,10,0,0,0,0,56,62,112,111,114,116,0,0,65,68,67,58,32,109,105,115,115,105,110,103,32,65,82,69,70,32,97,110,97,108,111,103,32,118,111,108,116,97,103,101,10,0,0,0,0,0,0,0,116,105,109,101,114,95,48,95,99,111,109,112,97,114,101,95,109,97,116,99,104,95,97,0,76,111,97,100,32,72,69,88,32,101,101,112,114,111,109,32,37,48,56,120,44,32,37,100,10,0,0,0,0,0,0,0,37,115,32,99,111,110,110,101,99,116,105,111,110,32,111,112,101,110,101,100,10,0,0,0,73,50,67,32,82,69,65,68,32,98,121,116,101,32,102,114,111,109,32,37,48,50,120,10,0,0,0,0,0,0,0,0,62,99,111,109,112,99,0,0,56,62,100,100,114,0,0,0,101,120,116,101,114,110,97,108,95,105,110,116,101,114,114,117,112,116,95,48,0,0,0,0,76,111,97,100,32,72,69,88,32,102,108,97,115,104,32,37,48,56,120,44,32,37,100,10,0,0,0,0,0,0,0,0,37,115,32,114,101,115,101,116,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,95,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,101,0,0,56,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,111,0,0,72,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,97,0,0,88,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,34,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,113,0,0,112,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,109,0,0,120,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,113,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,18,0,0,0,26,0,0,0,0,0,0,0,0,0,0,0,8,111,0,0,168,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,111,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,216,104,0,0,200,92,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,108,111,97,100,80,97,114,116,105,97,108,80,114,111,103,114,97,109,0,0,0,0,0,0,97,118,114,95,116,119,105,95,119,114,105,116,101,0,0,0,97,118,114,95,116,119,105,95,105,114,113,95,105,110,112,117,116,0,0,0,0,0,0,0,97,118,114,95,105,110,116,101,114,114,117,112,116,95,114,101,115,101,116,0,0,0,0,0,97,118,114,95,105,110,105,116,95,105,114,113,0,0,0,0,97,118,114,95,99,121,99,108,101,95,116,105,109,101,114,95,114,101,103,105,115,116,101,114,0,0,0,0,0,0,0,0,97,118,114,95,99,121,99,108,101,95,116,105,109,101,114,95,105,110,115,101,114,116,0,0,95,97,118,114,95,116,119,105,95,115,116,97,116,117,115,95,115,101,116,0,0,0,0,0,114,101,97,100,95,104,101,120,95,115,116,114,105,110,103,0,103,100,98,95,110,101,116,119,111,114,107,95,104,97,110,100,108,101,114], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+19925);
/* memory initializer */ allocate([97,118,114,95,116,105,109,101,114,95,119,114,105,116,101,95,111,99,114,0,0,0,0,0,97,118,114,95,116,105,109,101,114,95,119,114,105,116,101,0,97,118,114,95,116,105,109,101,114,95,114,101,99,111,110,102,105,103,117,114,101,0,0,0,97,118,114,95,116,105,109,101,114,95,99,111,110,102,105,103,117,114,101,0,0,0,0,0,97,118,114,95,115,101,114,118,105,99,101,95,105,110,116,101,114,114,117,112,116,115,0,0,97,118,114,95,115,97,100,108,121,95,99,114,97,115,104,101,100,0,0,0,0,0,0,0,97,118,114,95,114,101,103,105,115,116,101,114,95,118,101,99,116,111,114,0,0,0,0,0,97,118,114,95,114,97,105,115,101,95,105,110,116,101,114,114,117,112,116,0,0,0,0,0,97,118,114,95,109,97,107,101,95,109,99,117,95,98,121,95,110,97,109,101,0,0,0,0,97,118,114,95,108,111,97,100,95,102,105,114,109,119,97,114,101,0,0,0,0,0,0,0,97,118,114,95,101,101,112,114,111,109,95,105,111,99,116,108,0,0,0,0,0,0,0,0,97,118,114,95,99,111,110,110,101,99,116,95,105,114,113,0,97,118,114,95,99,108,101,97,114,95,105,110,116,101,114,114,117,112,116,0,0,0,0,0,95,97,118,114,95,105,111,95,99,111,109,109,97,110,100,95,119,114,105,116,101,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+30168);



var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
  
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
  
        if (!total) {
          // early out
          return callback(null);
        }
  
        var completed = 0;
        function done(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function transaction_onerror() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
  
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
  
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
  
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function req_onsuccess() { done(null); };
            req.onerror = function req_onerror() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat, node;
  
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
  
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
  
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function req_onupgradeneeded() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function req_onsuccess() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function req_onerror() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function transaction_onerror() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function store_openCursor_onsuccess(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
  
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || { recurse_count: 0 };
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            current = current.mount.root;
          }
  
          // follow symlinks
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.parent = null;
            this.mount = null;
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            FS.hashAddNode(this);
          };
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          FS.FSNode.prototype = {};
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
        return new FS.FSNode(parent, name, mode, rdev);
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 1;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var completed = 0;
        var total = FS.mounts.length;
        function done(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
  
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
        // create a root node for the fs
        var root = type.mount(mount);
        root.mount = mount;
        mount.root = root;
        // assign the mount info to the mountpoint's node
        if (lookup) {
          lookup.node.mount = mount;
          lookup.node.mounted = true;
          // compatibility update FS.root if we mount to /
          if (mountpoint === '/') {
            FS.root = mount.root;
          }
        }
        // add to our cached list of mounts
        FS.mounts.push(mount);
        return root;
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path, { follow: false });
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 0666 : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  var _mkport=undefined;var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 0777, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision === -1) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  function ___assert_fail(condition, filename, line, func) {
      ABORT = true;
      throw 'Assertion failed: ' + Pointer_stringify(condition) + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + stackTrace();
    }

  
   
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;

  
   
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

   
  Module["_strcpy"] = _strcpy;


  function _signal(sig, func) {
      // TODO
      return 0;
    }

  function _emscripten_asm_const(code) {
      Runtime.getAsmConst(code, 0)();
    }

  
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var ret = _write(stream, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }


  var _llvm_va_start=undefined;

  function _llvm_va_end() {}

  function _abort() {
      Module['abort']();
    }

  function _usleep(useconds) {
      // int usleep(useconds_t useconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/usleep.html
      // We're single-threaded, so use a busy loop. Super-ugly.
      var msec = useconds / 1000;
      if (ENVIRONMENT_IS_WEB && window['performance'] && window['performance']['now']) {
        var start = window['performance']['now']();
        while (window['performance']['now']() - start < msec) {
          // Do nothing.
        }
      } else {
        var start = Date.now();
        while (Date.now() - start < msec) {
          // Do nothing.
        }
      }
      return 0;
    }

  
  function _strncmp(px, py, n) {
      var i = 0;
      while (i < n) {
        var x = HEAPU8[(((px)+(i))|0)];
        var y = HEAPU8[(((py)+(i))|0)];
        if (x == y && x == 0) return 0;
        if (x == 0) return -1;
        if (y == 0) return 1;
        if (x == y) {
          i ++;
          continue;
        } else {
          return x > y ? 1 : -1;
        }
      }
      return 0;
    }function _strcmp(px, py) {
      return _strncmp(px, py, TOTAL_MEMORY);
    }

  function _vfprintf(s, f, va_arg) {
      return _fprintf(s, f, HEAP32[((va_arg)>>2)]);
    }

  
  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  
  function ___errno_location() {
      return ___errno_state;
    }function _perror(s) {
      // void perror(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/perror.html
      var stdout = HEAP32[((_stdout)>>2)];
      if (s) {
        _fputs(s, stdout);
        _fputc(58, stdout);
        _fputc(32, stdout);
      }
      var errnum = HEAP32[((___errno_location())>>2)];
      _puts(_strerror(errnum));
    }


  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }

  function _socket(family, type, protocol) {
      var sock = SOCKFS.createSocket(family, type, protocol);
      assert(sock.stream.fd < 64); // select() assumes socket fd values are in 0..63
      return sock.stream.fd;
    }



  function _setsockopt(fd, level, optname, optval, optlen) {
      console.log('ignoring setsockopt command');
      return 0;
    }

  function _htons(value) {
      return ((value & 0xff) << 8) + ((value & 0xff00) >> 8);
    }

  
  
  function __inet_pton4_raw(str) {
      var b = str.split('.');
      for (var i = 0; i < 4; i++) {
        var tmp = Number(b[i]);
        if (isNaN(tmp)) return null;
        b[i] = tmp;
      }
      return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
    }
  
  function __inet_pton6_raw(str) {
      var words;
      var w, offset, z, i;
      /* http://home.deds.nl/~aeron/regex/ */
      var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
      var parts = [];
      if (!valid6regx.test(str)) {
        return null;
      }
      if (str === "::") {
        return [0, 0, 0, 0, 0, 0, 0, 0];
      }
      // Z placeholder to keep track of zeros when splitting the string on ":"
      if (str.indexOf("::") === 0) {
        str = str.replace("::", "Z:"); // leading zeros case
      } else {
        str = str.replace("::", ":Z:");
      }
  
      if (str.indexOf(".") > 0) {
        // parse IPv4 embedded stress
        str = str.replace(new RegExp('[.]', 'g'), ":");
        words = str.split(":");
        words[words.length-4] = parseInt(words[words.length-4]) + parseInt(words[words.length-3])*256;
        words[words.length-3] = parseInt(words[words.length-2]) + parseInt(words[words.length-1])*256;
        words = words.slice(0, words.length-2);
      } else {
        words = str.split(":");
      }
  
      offset = 0; z = 0;
      for (w=0; w < words.length; w++) {
        if (typeof words[w] === 'string') {
          if (words[w] === 'Z') {
            // compressed zeros - write appropriate number of zero words
            for (z = 0; z < (8 - words.length+1); z++) {
              parts[w+z] = 0;
            }
            offset = z-1;
          } else {
            // parse hex to field to 16-bit value and write it in network byte-order
            parts[w+offset] = _htons(parseInt(words[w],16));
          }
        } else {
          // parsed IPv4 words
          parts[w+offset] = words[w];
        }
      }
      return [
        (parts[1] << 16) | parts[0],
        (parts[3] << 16) | parts[2],
        (parts[5] << 16) | parts[4],
        (parts[7] << 16) | parts[6]
      ];
    }var DNS={address_map:{id:1,addrs:{},names:{}},lookup_name:function (name) {
        // If the name is already a valid ipv4 / ipv6 address, don't generate a fake one.
        var res = __inet_pton4_raw(name);
        if (res) {
          return name;
        }
        res = __inet_pton6_raw(name);
        if (res) {
          return name;
        }
  
        // See if this name is already mapped.
        var addr;
  
        if (DNS.address_map.addrs[name]) {
          addr = DNS.address_map.addrs[name];
        } else {
          var id = DNS.address_map.id++;
          assert(id < 65535, 'exceeded max address mappings of 65535');
  
          addr = '172.29.' + (id & 0xff) + '.' + (id & 0xff00);
  
          DNS.address_map.names[addr] = name;
          DNS.address_map.addrs[name] = addr;
        }
  
        return addr;
      },lookup_addr:function (addr) {
        if (DNS.address_map.names[addr]) {
          return DNS.address_map.names[addr];
        }
  
        return null;
      }};
  
  
  var Sockets={BUFFER_SIZE:10240,MAX_BUFFER_SIZE:10485760,nextFd:1,fds:{},nextport:1,maxport:65535,peer:null,connections:{},portmap:{},localAddr:4261412874,addrPool:[33554442,50331658,67108874,83886090,100663306,117440522,134217738,150994954,167772170,184549386,201326602,218103818,234881034]};
  
  function __inet_ntop4_raw(addr) {
      return (addr & 0xff) + '.' + ((addr >> 8) & 0xff) + '.' + ((addr >> 16) & 0xff) + '.' + ((addr >> 24) & 0xff)
    }
  
  
  var _ntohs=_htons;function __inet_ntop6_raw(ints) {
      //  ref:  http://www.ietf.org/rfc/rfc2373.txt - section 2.5.4
      //  Format for IPv4 compatible and mapped  128-bit IPv6 Addresses
      //  128-bits are split into eight 16-bit words
      //  stored in network byte order (big-endian)
      //  |                80 bits               | 16 |      32 bits        |
      //  +-----------------------------------------------------------------+
      //  |               10 bytes               |  2 |      4 bytes        |
      //  +--------------------------------------+--------------------------+
      //  +               5 words                |  1 |      2 words        |
      //  +--------------------------------------+--------------------------+
      //  |0000..............................0000|0000|    IPv4 ADDRESS     | (compatible)
      //  +--------------------------------------+----+---------------------+
      //  |0000..............................0000|FFFF|    IPv4 ADDRESS     | (mapped)
      //  +--------------------------------------+----+---------------------+
      var str = "";
      var word = 0;
      var longest = 0;
      var lastzero = 0;
      var zstart = 0;
      var len = 0;
      var i = 0;
      var parts = [
        ints[0] & 0xffff,
        (ints[0] >> 16),
        ints[1] & 0xffff,
        (ints[1] >> 16),
        ints[2] & 0xffff,
        (ints[2] >> 16),
        ints[3] & 0xffff,
        (ints[3] >> 16)
      ];
  
      // Handle IPv4-compatible, IPv4-mapped, loopback and any/unspecified addresses
  
      var hasipv4 = true;
      var v4part = "";
      // check if the 10 high-order bytes are all zeros (first 5 words)
      for (i = 0; i < 5; i++) {
        if (parts[i] !== 0) { hasipv4 = false; break; }
      }
  
      if (hasipv4) {
        // low-order 32-bits store an IPv4 address (bytes 13 to 16) (last 2 words)
        v4part = __inet_ntop4_raw(parts[6] | (parts[7] << 16));
        // IPv4-mapped IPv6 address if 16-bit value (bytes 11 and 12) == 0xFFFF (6th word)
        if (parts[5] === -1) {
          str = "::ffff:";
          str += v4part;
          return str;
        }
        // IPv4-compatible IPv6 address if 16-bit value (bytes 11 and 12) == 0x0000 (6th word)
        if (parts[5] === 0) {
          str = "::";
          //special case IPv6 addresses
          if(v4part === "0.0.0.0") v4part = ""; // any/unspecified address
          if(v4part === "0.0.0.1") v4part = "1";// loopback address
          str += v4part;
          return str;
        }
      }
  
      // Handle all other IPv6 addresses
  
      // first run to find the longest contiguous zero words
      for (word = 0; word < 8; word++) {
        if (parts[word] === 0) {
          if (word - lastzero > 1) {
            len = 0;
          }
          lastzero = word;
          len++;
        }
        if (len > longest) {
          longest = len;
          zstart = word - longest + 1;
        }
      }
  
      for (word = 0; word < 8; word++) {
        if (longest > 1) {
          // compress contiguous zeros - to produce "::"
          if (parts[word] === 0 && word >= zstart && word < (zstart + longest) ) {
            if (word === zstart) {
              str += ":";
              if (zstart === 0) str += ":"; //leading zeros case
            }
            continue;
          }
        }
        // converts 16-bit words from big-endian to little-endian before converting to hex string
        str += Number(_ntohs(parts[word] & 0xffff)).toString(16);
        str += word < 7 ? ":" : "";
      }
      return str;
    }function __read_sockaddr(sa, salen) {
      // family / port offsets are common to both sockaddr_in and sockaddr_in6
      var family = HEAP16[((sa)>>1)];
      var port = _ntohs(HEAP16[(((sa)+(2))>>1)]);
      var addr;
  
      switch (family) {
        case 2:
          if (salen !== 16) {
            return { errno: ERRNO_CODES.EINVAL };
          }
          addr = HEAP32[(((sa)+(4))>>2)];
          addr = __inet_ntop4_raw(addr);
          break;
        case 10:
          if (salen !== 28) {
            return { errno: ERRNO_CODES.EINVAL };
          }
          addr = [
            HEAP32[(((sa)+(8))>>2)],
            HEAP32[(((sa)+(12))>>2)],
            HEAP32[(((sa)+(16))>>2)],
            HEAP32[(((sa)+(20))>>2)]
          ];
          addr = __inet_ntop6_raw(addr);
          break;
        default:
          return { errno: ERRNO_CODES.EAFNOSUPPORT };
      }
  
      return { family: family, addr: addr, port: port };
    }function _bind(fd, addrp, addrlen) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
      var info = __read_sockaddr(addrp, addrlen);
      if (info.errno) {
        ___setErrNo(info.errno);
        return -1;
      }
      var port = info.port;
      var addr = DNS.lookup_addr(info.addr) || info.addr;
  
      try {
        sock.sock_ops.bind(sock, addr, port);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function _listen(fd, backlog) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        sock.sock_ops.listen(sock, backlog);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  
  var ___DEFAULT_POLLMASK=5;function _select(nfds, readfds, writefds, exceptfds, timeout) {
      // readfds are supported,
      // writefds checks socket open status
      // exceptfds not supported
      // timeout is always 0 - fully async
      assert(nfds <= 64, 'nfds must be less than or equal to 64');  // fd sets have 64 bits
      assert(!exceptfds, 'exceptfds not supported');
  
      var total = 0;
      
      var srcReadLow = (readfds ? HEAP32[((readfds)>>2)] : 0),
          srcReadHigh = (readfds ? HEAP32[(((readfds)+(4))>>2)] : 0);
      var srcWriteLow = (writefds ? HEAP32[((writefds)>>2)] : 0),
          srcWriteHigh = (writefds ? HEAP32[(((writefds)+(4))>>2)] : 0);
      var srcExceptLow = (exceptfds ? HEAP32[((exceptfds)>>2)] : 0),
          srcExceptHigh = (exceptfds ? HEAP32[(((exceptfds)+(4))>>2)] : 0);
  
      var dstReadLow = 0,
          dstReadHigh = 0;
      var dstWriteLow = 0,
          dstWriteHigh = 0;
      var dstExceptLow = 0,
          dstExceptHigh = 0;
  
      var allLow = (readfds ? HEAP32[((readfds)>>2)] : 0) |
                   (writefds ? HEAP32[((writefds)>>2)] : 0) |
                   (exceptfds ? HEAP32[((exceptfds)>>2)] : 0);
      var allHigh = (readfds ? HEAP32[(((readfds)+(4))>>2)] : 0) |
                    (writefds ? HEAP32[(((writefds)+(4))>>2)] : 0) |
                    (exceptfds ? HEAP32[(((exceptfds)+(4))>>2)] : 0);
  
      function get(fd, low, high, val) {
        return (fd < 32 ? (low & val) : (high & val));
      }
  
      for (var fd = 0; fd < nfds; fd++) {
        var mask = 1 << (fd % 32);
        if (!(get(fd, allLow, allHigh, mask))) {
          continue;  // index isn't in the set
        }
  
        var stream = FS.getStream(fd);
        if (!stream) {
          ___setErrNo(ERRNO_CODES.EBADF);
          return -1;
        }
  
        var flags = ___DEFAULT_POLLMASK;
  
        if (stream.stream_ops.poll) {
          flags = stream.stream_ops.poll(stream);
        }
  
        if ((flags & 1) && get(fd, srcReadLow, srcReadHigh, mask)) {
          fd < 32 ? (dstReadLow = dstReadLow | mask) : (dstReadHigh = dstReadHigh | mask);
          total++;
        }
        if ((flags & 4) && get(fd, srcWriteLow, srcWriteHigh, mask)) {
          fd < 32 ? (dstWriteLow = dstWriteLow | mask) : (dstWriteHigh = dstWriteHigh | mask);
          total++;
        }
        if ((flags & 2) && get(fd, srcExceptLow, srcExceptHigh, mask)) {
          fd < 32 ? (dstExceptLow = dstExceptLow | mask) : (dstExceptHigh = dstExceptHigh | mask);
          total++;
        }
      }
  
      if (readfds) {
        HEAP32[((readfds)>>2)]=dstReadLow;
        HEAP32[(((readfds)+(4))>>2)]=dstReadHigh;
      }
      if (writefds) {
        HEAP32[((writefds)>>2)]=dstWriteLow;
        HEAP32[(((writefds)+(4))>>2)]=dstWriteHigh;
      }
      if (exceptfds) {
        HEAP32[((exceptfds)>>2)]=dstExceptLow;
        HEAP32[(((exceptfds)+(4))>>2)]=dstExceptHigh;
      }
      
      return total;
    }

  
  function __write_sockaddr(sa, family, addr, port) {
      switch (family) {
        case 2:
          addr = __inet_pton4_raw(addr);
          HEAP16[((sa)>>1)]=family;
          HEAP32[(((sa)+(4))>>2)]=addr;
          HEAP16[(((sa)+(2))>>1)]=_htons(port);
          break;
        case 10:
          addr = __inet_pton6_raw(addr);
          HEAP32[((sa)>>2)]=family;
          HEAP32[(((sa)+(8))>>2)]=addr[0];
          HEAP32[(((sa)+(12))>>2)]=addr[1];
          HEAP32[(((sa)+(16))>>2)]=addr[2];
          HEAP32[(((sa)+(20))>>2)]=addr[3];
          HEAP16[(((sa)+(2))>>1)]=_htons(port);
          break;
        default:
          return { errno: ERRNO_CODES.EAFNOSUPPORT };
      }
      // kind of lame, but let's match _read_sockaddr's interface
      return {};
    }function _accept(fd, addr, addrlen) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var newsock = sock.sock_ops.accept(sock);
        if (addr) {
          var res = __write_sockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport);
          assert(!res.errno);
        }
        return newsock.stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function _sleep(seconds) {
      // unsigned sleep(unsigned seconds);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/sleep.html
      return _usleep(seconds * 1e6);
    }

  
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }




  
  
  function __getFloat(text) {
      return /^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/.exec(text);
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function get() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function unget() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
  
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
  
        if (format[formatIndex] === '%') {
          var nextC = format.indexOf('c', formatIndex+1);
          if (nextC > 0) {
            var maxx = 1;
            if (nextC > formatIndex+1) {
              var sub = format.substring(formatIndex+1, nextC);
              maxx = parseInt(sub);
              if (maxx != sub) maxx = 0;
            }
            if (maxx) {
              var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
              argIndex += Runtime.getAlignSize('void*', null, true);
              fields++;
              for (var i = 0; i < maxx; i++) {
                next = get();
                HEAP8[((argPtr++)|0)]=next;
              }
              formatIndex += nextC - formatIndex + 1;
              continue;
            }
          }
        }
  
        // handle %[...]
        if (format[formatIndex] === '%' && format.indexOf('[', formatIndex+1) > 0) {
          var match = /\%([0-9]*)\[(\^)?(\]?[^\]]*)\]/.exec(format.substring(formatIndex));
          if (match) {
            var maxNumCharacters = parseInt(match[1]) || Infinity;
            var negateScanList = (match[2] === '^');
            var scanList = match[3];
  
            // expand "middle" dashs into character sets
            var middleDashMatch;
            while ((middleDashMatch = /([^\-])\-([^\-])/.exec(scanList))) {
              var rangeStartCharCode = middleDashMatch[1].charCodeAt(0);
              var rangeEndCharCode = middleDashMatch[2].charCodeAt(0);
              for (var expanded = ''; rangeStartCharCode <= rangeEndCharCode; expanded += String.fromCharCode(rangeStartCharCode++));
              scanList = scanList.replace(middleDashMatch[1] + '-' + middleDashMatch[2], expanded);
            }
  
            var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
            argIndex += Runtime.getAlignSize('void*', null, true);
            fields++;
  
            for (var i = 0; i < maxNumCharacters; i++) {
              next = get();
              if (negateScanList) {
                if (scanList.indexOf(String.fromCharCode(next)) < 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              } else {
                if (scanList.indexOf(String.fromCharCode(next)) >= 0) {
                  HEAP8[((argPtr++)|0)]=next;
                } else {
                  unget();
                  break;
                }
              }
            }
  
            // write out null-terminating character
            HEAP8[((argPtr++)|0)]=0;
            formatIndex += match[0].length;
            
            continue;
          }
        }      
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
  
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            next = get();
            while (next > 0 && (!(next in __scanString.whiteSpace)))  {
              buffer.push(String.fromCharCode(next));
              next = get();
            }
            var m = __getFloat(buffer.join(''));
            var last = m ? m[0].length : 0;
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            
            // Strip the optional 0x prefix for %x.
            if ((type == 'x' || type == 'X') && (next == 48)) {
              var peek = get();
              if (peek == 120 || peek == 88) {
                next = get();
              } else {
                unget();
              }
            }
            
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
  
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16);
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text);
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text);
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j];
              }
              break;
          }
          fields++;
        } else if (format[formatIndex].charCodeAt(0) in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      function get() { return HEAP8[(((s)+(index++))|0)]; };
      function unget() { index--; };
      return __scanString(format, get, unget, varargs);
    }

  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }

  function _llvm_lifetime_start() {}

  function _llvm_lifetime_end() {}

  var _llvm_memset_p0i8_i64=_memset;

  function _emscripten_run_script(ptr) {
      eval(Pointer_stringify(ptr));
    }

  function _memchr(ptr, chr, num) {
      chr = unSign(chr);
      for (var i = 0; i < num; i++) {
        if (HEAP8[(ptr)] == chr) return ptr;
        ptr++;
      }
      return 0;
    }

  function _llvm_stacksave() {
      var self = _llvm_stacksave;
      if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = [];
      }
      self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());
      return self.LLVM_SAVEDSTACKS.length-1;
    }

  function _llvm_stackrestore(p) {
      var self = _llvm_stacksave;
      var ret = self.LLVM_SAVEDSTACKS[p];
      self.LLVM_SAVEDSTACKS.splice(p, 1);
      Runtime.stackRestore(ret);
    }

  function _isalpha(chr) {
      return (chr >= 97 && chr <= 122) ||
             (chr >= 65 && chr <= 90);
    }

   
  Module["_tolower"] = _tolower;

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }






  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            var errorInfo = '?';
            function onContextCreationError(event) {
              errorInfo = event.statusMessage || errorInfo;
            }
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
  
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var ctlz_i8 = allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_DYNAMIC);
 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);

var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  try {
    return Module["dynCall_iiiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env.cttz_i8|0;var n=env.ctlz_i8|0;var o=env._stdout|0;var p=env._stderr|0;var q=+env.NaN;var r=+env.Infinity;var s=0;var t=0;var u=0;var v=0;var w=0,x=0,y=0,z=0,A=0.0,B=0,C=0,D=0,E=0.0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=0;var O=0;var P=global.Math.floor;var Q=global.Math.abs;var R=global.Math.sqrt;var S=global.Math.pow;var T=global.Math.cos;var U=global.Math.sin;var V=global.Math.tan;var W=global.Math.acos;var X=global.Math.asin;var Y=global.Math.atan;var Z=global.Math.atan2;var _=global.Math.exp;var $=global.Math.log;var aa=global.Math.ceil;var ba=global.Math.imul;var ca=env.abort;var da=env.assert;var ea=env.asmPrintInt;var fa=env.asmPrintFloat;var ga=env.min;var ha=env.invoke_ii;var ia=env.invoke_i;var ja=env.invoke_vi;var ka=env.invoke_vii;var la=env.invoke_iiii;var ma=env.invoke_viii;var na=env.invoke_v;var oa=env.invoke_iiiii;var pa=env.invoke_iii;var qa=env.invoke_viiii;var ra=env._llvm_va_end;var sa=env._strncmp;var ta=env._pread;var ua=env._sscanf;var va=env.___assert_fail;var wa=env.__scanString;var xa=env.__inet_pton4_raw;var ya=env._accept;var za=env.__getFloat;var Aa=env._abort;var Ba=env._fprintf;var Ca=env._printf;var Da=env._close;var Ea=env.__read_sockaddr;var Fa=env._fflush;var Ga=env._htons;var Ha=env.__reallyNegative;var Ia=env.__write_sockaddr;var Ja=env._select;var Ka=env._usleep;var La=env._fputc;var Ma=env._emscripten_asm_const;var Na=env._snprintf;var Oa=env._puts;var Pa=env.___setErrNo;var Qa=env._fwrite;var Ra=env._send;var Sa=env._write;var Ta=env._fputs;var Ua=env.__inet_pton6_raw;var Va=env._exit;var Wa=env._sprintf;var Xa=env._llvm_lifetime_end;var Ya=env._time;var Za=env._strdup;var _a=env._listen;var $a=env._strchr;var ab=env._isalpha;var bb=env.__inet_ntop4_raw;var cb=env._read;var db=env.__inet_ntop6_raw;var eb=env.__formatString;var fb=env._vfprintf;var gb=env._recv;var hb=env._llvm_stackrestore;var ib=env._setsockopt;var jb=env._pwrite;var kb=env._perror;var lb=env._socket;var mb=env._sbrk;var nb=env._llvm_stacksave;var ob=env._strerror_r;var pb=env._bind;var qb=env._signal;var rb=env.___errno_location;var sb=env._strerror;var tb=env._llvm_lifetime_start;var ub=env._sysconf;var vb=env._sleep;var wb=env.__exit;var xb=env._emscripten_run_script;var yb=env._strcmp;var zb=env._memchr;var Ab=0.0;
// EMSCRIPTEN_START_FUNCS
function Lb(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Mb(){return i|0}function Nb(a){a=a|0;i=a}function Ob(a,b){a=a|0;b=b|0;if((s|0)==0){s=a;t=b}}function Pb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function Qb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function Rb(a){a=a|0;F=a}function Sb(a){a=a|0;G=a}function Tb(a){a=a|0;H=a}function Ub(a){a=a|0;I=a}function Vb(a){a=a|0;J=a}function Wb(a){a=a|0;K=a}function Xb(a){a=a|0;L=a}function Yb(a){a=a|0;M=a}function Zb(a){a=a|0;N=a}function _b(a){a=a|0;O=a}function $b(){}function ac(a){a=a|0;Oa(112)|0;a=c[11728]|0;if((a|0)==0){Va(0)}lc(a);Va(0)}function bc(b){b=b|0;var d=0,e=0,f=0,g=0;if((a[b]|0)==58){d=a[b+1|0]|0;e=a[b+2|0]|0;e=((e&255)>>>0<58>>>0?-48:-55)+(e&255)+(((d&255)>>>0<58>>>0?268435408:268435401)+(d&255)<<4)<<1;g=e+12|0;d=Ve(g)|0;f=c[7624]|0;c[30528+(f<<2)>>2]=d;$e(d|0,0,g|0)|0;c[7624]=f+1;af(d|0,b|0,e+11|0)|0;return}else{va(24872,24568,103,29952)}}function cc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,s=0;d=i;i=i+2480|0;f=d|0;h=d+2472|0;e=f|0;$e(e|0,0,2456)|0;g=d+2456|0;bf(g|0,b|0)|0;c[h>>2]=0;l=zc(h)|0;if((l|0)<1){Qa(24328,25,1,c[p>>2]|0)|0;Va(1)}Ca(24152,(j=i,i=i+8|0,c[j>>2]=l,j)|0)|0;i=j;j=f+2424|0;b=f+2428|0;k=f+2420|0;m=f+2440|0;n=f+2444|0;o=0;do{r=c[h>>2]|0;q=r+(o*12|0)|0;s=c[q>>2]|0;do{if(s>>>0<1048576>>>0){c[j>>2]=c[r+(o*12|0)+4>>2];r=c[r+(o*12|0)+8>>2]|0;c[b>>2]=r;q=c[q>>2]|0;c[k>>2]=q;Ca(29496,(s=i,i=i+16|0,c[s>>2]=q,c[s+8>>2]=r,s)|0)|0;i=s}else{if(s>>>0<=8454143>>>0){break}c[m>>2]=c[r+(o*12|0)+4>>2];r=c[r+(o*12|0)+8>>2]|0;c[n>>2]=r;Ca(29368,(s=i,i=i+16|0,c[s>>2]=c[q>>2],c[s+8>>2]=r,s)|0)|0;i=s}}while(0);o=o+1|0;}while((o|0)<(l|0));if((a[g]|0)!=0){bf(e|0,g|0)|0}c[f+64>>2]=16e6;g=uc(e)|0;c[11728]=g;if((g|0)==0){Ba(c[p>>2]|0,29096,(s=i,i=i+8|0,c[s>>2]=e,s)|0)|0;i=s;Va(1)}hc(g)|0;dc(c[11728]|0,f);f=f+2420|0;e=c[f>>2]|0;if((e|0)==0){s=c[11728]|0;s=s+7960|0;r=a[s]|0;r=r&-7;r=r|2;a[s]=r;qb(2,22)|0;qb(15,22)|0;i=d;return}Ca(28776,(s=i,i=i+8|0,c[s>>2]=e,s)|0)|0;i=s;c[(c[11728]|0)+132>>2]=c[f>>2];s=c[11728]|0;s=s+7960|0;r=a[s]|0;r=r&-7;r=r|2;a[s]=r;qb(2,22)|0;qb(15,22)|0;i=d;return}function dc(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;i=i+152|0;l=h|0;j=h+16|0;k=h+24|0;m=c[g+64>>2]|0;if((m|0)!=0){c[f+40>>2]=m}m=c[g+68>>2]|0;if((m|0)!=0){c[f+44>>2]=m}m=c[g+72>>2]|0;if((m|0)!=0){c[f+48>>2]=m}m=c[g+76>>2]|0;if((m|0)!=0){c[f+52>>2]=m}n=g+2428|0;q=g+2420|0;pc(f,c[g+2424>>2]|0,c[n>>2]|0,c[q>>2]|0);c[f+32>>2]=(c[q>>2]|0)+(c[n>>2]|0)-(c[g+2432>>2]|0);n=c[g+2440>>2]|0;do{if((n|0)!=0){m=c[g+2444>>2]|0;if((m|0)==0){break}c[l>>2]=n;b[l+4>>1]=0;c[l+8>>2]=m;Ge(f,1701147504,l)|0}}while(0);m=j;l=0;do{n=a[g+2392+(l*3|0)|0]|0;if(n<<24>>24==0){break}q=n&255;c[j>>2]=c[j>>2]&-8388608|q&127|(d[g+2392+(l*3|0)+1|0]|0)<<7|(d[g+2392+(l*3|0)+2|0]|0)<<15;Ge(f,q&127|1768910848,m)|0;l=l+1|0;}while((l|0)<8);nc(f,b[g+2416>>1]|0);oc(f,b[g+2418>>1]|0);j=g+212|0;if((c[j>>2]|0)==0){i=h;return}p=Ve(2168)|0;c[f+7968>>2]=p;$e(p|0,0,2168)|0;gc(f,3,28464,(q=i,i=i+8|0,c[q>>2]=p+4,q)|0);i=q;if((c[j>>2]|0)<=0){i=h;return}l=k|0;k=0;do{m=g+216+(k*68|0)|0;p=a[m]|0;a:do{if((p<<24>>24|0)==(-1|0)|(p<<24>>24|0)==0){m=g+216+(k*68|0)+2|0;if((Le(f,b[m>>1]|0,g+216+(k*68|0)+4|0,8)|0)!=0){break}p=e[m>>1]|0;gc(f,1,28352,(q=i,i=i+16|0,c[q>>2]=30384,c[q+8>>2]=p,q)|0);i=q}else{q=p&255;n=g+216+(k*68|0)+2|0;o=g+216+(k*68|0)+4|0;b:do{if(((q>>>7)+((q>>>6&1)+((q>>>5&1)+((q>>>4&1)+((q>>>3&1)+((q>>>2&1)+((q>>>1&1)+(q&1)))))))|0)==1){q=0;while(1){if((p&255&1<<q|0)!=0){break}q=q+1|0;if((q|0)>=8){break a}p=a[m]|0}if((Le(f,b[n>>1]|0,o,q)|0)!=0){break a}}else{q=0;while(1){if((p&255&1<<q|0)!=0){if((Le(f,b[n>>1]|0,o,q)|0)==0){break b}Wa(l|0,28208,(p=i,i=i+16|0,c[p>>2]=o,c[p+8>>2]=q,p)|0)|0;i=p}q=q+1|0;if((q|0)>=8){break a}p=a[m]|0}}}while(0);p=e[n>>1]|0;gc(f,1,28352,(q=i,i=i+16|0,c[q>>2]=30384,c[q+8>>2]=p,q)|0);i=q}}while(0);k=k+1|0;}while((k|0)<(c[j>>2]|0));i=h;return}function ec(a){a=a|0;var b=0,d=0;a:do{if((a|0)>0){d=0;while(1){b=sc(c[11728]|0)|0;d=d+1|0;if((b&-2|0)==6){break}if((d|0)>=(a|0)){break a}}lc(c[11728]|0)}else{b=0}}while(0);a=Bc(c[11728]|0,73)|0;Ac(c[11728]|0,73,(a&2)!=0?a|1:a&-2);Ma(28664);return b|0}function fc(a,b){a=a|0;b=b|0;Ac(c[11728]|0,a&65535,b&255);return}function gc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;i=i+16|0;g=f|0;h=g;c[h>>2]=e;c[h+4>>2]=0;e=c[7486]|0;if((e|0)==0){i=f;return}Kb[e&63](a,b,d,g|0);i=f;return}function hc(d){d=d|0;var f=0,g=0,h=0,j=0;f=i;g=c[d+8>>2]|0;h=g+1|0;j=Ve(h)|0;c[d+5884>>2]=j;$e(j|0,-1|0,h|0)|0;c[d+32>>2]=g;g=(e[d+4>>1]|0)+1|0;h=Ve(g)|0;c[d+5888>>2]=h;$e(h|0,0,g|0)|0;gc(d,3,25528,(g=i,i=i+8|0,c[g>>2]=c[d>>2],g)|0);i=g;c[d+36>>2]=0;c[d+40>>2]=1e6;Uc(d);g=c[d+88>>2]|0;if((g|0)!=0){Eb[g&1](d,c[d+96>>2]|0)}g=c[d+84>>2]|0;if((g|0)!=0){Db[g&63](d)}c[d+104>>2]=28;c[d+108>>2]=12;a[d+28|0]=(b[d+26>>1]|0)!=0?3:2;j=d+7960|0;a[j]=a[j]&-7|2;kc(d);i=f;return 0}function ic(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;f=b+132|0;j=c[f>>2]|0;e=b+36|0;if((c[e>>2]|0)==2){j=Ec(b)|0}h=Mc(b)|0;g=F;c[f>>2]=j;f=c[e>>2]|0;do{if((f|0)==3){if((a[b+127|0]|0)!=0){Gb[c[b+108>>2]&31](b,h,g);j=df(h,g,1,0)|0;f=b+56|0;j=df(j,F,c[f>>2]|0,c[f+4>>2]|0)|0;c[f>>2]=j;c[f+4>>2]=F;f=c[e>>2]|0;break}if((a[b+7960|0]&6)!=0){gc(b,3,25144,(j=i,i=i+1|0,i=i+7&-8,c[j>>2]=0,j)|0);i=j}c[e>>2]=6;i=d;return}}while(0);if((f&-2|0)!=2){i=d;return}if((a[b+128|0]|0)==0){i=d;return}$c(b);i=d;return}function jc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[a+40>>2]|0;b=of(b,d,1e6,0)|0;b=pf(b,F,e,0)|0;d=a+80|0;a=(c[d>>2]|0)+b|0;b=a>>>0>200>>>0;c[d>>2]=b?0:a;a=b?a:0;if((a|0)==0){return}Ka(a|0)|0;return}function kc(d){d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=d+4|0;j=b[f>>1]|0;g=j&65535;gc(d,3,29528,(h=i,i=i+8|0,c[h>>2]=c[d>>2],h)|0);i=h;c[d+36>>2]=2;if((j&65535)>>>0>32>>>0){h=d+5888|0;j=32;do{a[(c[h>>2]|0)+j|0]=0;j=j+1|0;}while((j|0)<(g|0))}Cc(d,b[f>>1]|0);c[d+132>>2]=0;f=d+120|0;j=f|0;x=0;a[j]=x;x=x>>8;a[j+1|0]=x;x=x>>8;a[j+2|0]=x;x=x>>8;a[j+3|0]=x;f=f+4|0;x=0;a[f]=x;x=x>>8;a[f+1|0]=x;x=x>>8;a[f+2|0]=x;x=x>>8;a[f+3|0]=x;Vc(d);Hc(d);f=c[d+100>>2]|0;if((f|0)!=0){Db[f&63](d)}d=c[d+5892>>2]|0;if((d|0)==0){i=e;return}do{f=c[d+28>>2]|0;if((f|0)!=0){Db[f&63](d)}d=c[d>>2]|0;}while((d|0)!=0);i=e;return}function lc(a){a=a|0;var b=0,d=0;b=c[a+92>>2]|0;if((b|0)!=0){Eb[b&1](a,c[a+96>>2]|0)}b=a+7972|0;if((c[b>>2]|0)!=0){Qc(a);c[b>>2]=0}b=a+7968|0;if((c[b>>2]|0)!=0){c[b>>2]=0}Ne(a);b=a+5884|0;d=c[b>>2]|0;if((d|0)!=0){We(d)}a=a+5888|0;d=c[a>>2]|0;if((d|0)==0){c[a>>2]=0;c[b>>2]=0;return}We(d);c[a>>2]=0;c[b>>2]=0;return}function mc(a,b){a=a|0;b=b|0;var d=0,e=0;b=i;gc(a,1,26848,(d=i,i=i+8|0,c[d>>2]=30288,d)|0);i=d;d=a+36|0;c[d>>2]=1;e=a+7972|0;do{if((c[a+7976>>2]|0)!=0){if((c[e>>2]|0)!=0){break}Pc(a)|0}}while(0);if((c[e>>2]|0)!=0){i=b;return}c[d>>2]=7;i=b;return}function nc(a,b){a=a|0;b=b|0;if(b<<16>>16==0){return}Je(a,b,28,0);return}function oc(a,b){a=a|0;b=b|0;if(b<<16>>16==0){return}Je(a,b,6,0);return}function pc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;f=(c[a+8>>2]|0)+1|0;if((e+d|0)>>>0>f>>>0){gc(a,1,25688,(b=i,i=i+16|0,c[b>>2]=d,c[b+8>>2]=f,b)|0);i=b;Aa()}else{af((c[a+5884>>2]|0)+e|0,b|0,d)|0;i=g;return}}function qc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;e=c[a+40>>2]|0;d=of(b,d,1e6,0)|0;d=pf(d,F,e,0)|0;b=a+80|0;d=(c[b>>2]|0)+d|0;e=d>>>0>200>>>0;c[b>>2]=e?0:d;d=e?d:0;do{}while((Oc(a,d)|0)!=0);return}function rc(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0;f=i;d=b+36|0;Oc(b,(c[d>>2]|0)==1|0)|0;g=c[d>>2]|0;if((g|0)==1){i=f;return}e=(g|0)==4;if(e){c[d>>2]=2;k=b+132|0;h=5}else{k=b+132|0;if((g|0)==2){h=5}else{g=c[k>>2]|0}}if((h|0)==5){g=Ec(b)|0}h=Mc(b)|0;j=F;c[k>>2]=g;g=c[d>>2]|0;do{if((g|0)==3){if((a[b+127|0]|0)!=0){Gb[c[b+108>>2]&31](b,h,j);k=df(h,j,1,0)|0;g=b+56|0;k=df(k,F,c[g>>2]|0,c[g+4>>2]|0)|0;c[g>>2]=k;c[g+4>>2]=F;g=c[d>>2]|0;break}if((a[b+7960|0]&6)!=0){gc(b,3,25144,(k=i,i=i+1|0,i=i+7&-8,c[k>>2]=0,k)|0);i=k}c[d>>2]=6;i=f;return}}while(0);if((g&-2|0)==2){$c(b)}if(!e){i=f;return}c[d>>2]=5;i=f;return}function sc(a){a=a|0;Db[c[a+104>>2]&63](a);return c[a+36>>2]|0}function tc(a,b){a=a|0;b=b|0;var c=0;c=Ve(b)|0;af(c|0,a|0,b)|0;return c|0}function uc(a){a=a|0;var b=0,d=0,f=0,g=0,h=0;d=i;f=c[5974]|0;do{if((f|0)!=0){b=0;do{h=c[f>>2]|0;a:do{if((h|0)==0){h=0}else{g=0;while(1){g=g+1|0;if((yb(h|0,a|0)|0)==0){h=f;break a}h=c[f+(g<<2)>>2]|0;if((h|0)==0){h=0;break}}}}while(0);b=b+1|0;f=c[23896+(b<<2)>>2]|0;g=(h|0)==0;}while((f|0)!=0&g);if(g){break}h=Cb[c[h+16>>2]&7]()|0;a=c[h+8>>2]|0;b=e[h+4>>1]|0;f=c[h+12>>2]|0;gc(h,3,24584,(g=i,i=i+32|0,c[g>>2]=c[h>>2],c[g+8>>2]=a,c[g+16>>2]=b,c[g+24>>2]=f,g)|0);i=g;i=d;return h|0}}while(0);gc(0,1,25120,(h=i,i=i+16|0,c[h>>2]=30360,c[h+8>>2]=a,h)|0);i=h;h=0;i=d;return h|0}function vc(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;do{if((a|0)!=0){if(((d[a+7960|0]|0)>>>1&3|0)>=(b|0)){break}return}}while(0);fb(((b|0)>1?c[o>>2]|0:c[p>>2]|0)|0,e|0,f|0)|0;return}function wc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b=i;gc(a,3,24312,(e=i,i=i+16|0,c[e>>2]=30472,c[e+8>>2]=d&255,e)|0);i=e;if(d<<24>>24!=3){i=b;return}d=Ke(a,1969320496,1)|0;e=Ke(a,1969320496,0)|0;if(!((d|0)!=0&(e|0)!=0)){i=b;return}gc(a,3,24096,(a=i,i=i+24|0,c[a>>2]=30472,c[a+8>>2]=d,c[a+16>>2]=e,a)|0);i=a;Ue(d,e);i=b;return}function xc(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0;d=i;g=c[11854]|0;f=c[11852]|0;if(e<<24>>24==13&(g|0)!=0){a[g+f|0]=0;gc(b,0,24360,(g=i,i=i+8|0,c[g>>2]=c[11854],g)|0);i=g;c[11852]=0;i=d;return}b=c[11850]|0;if((f+1|0)>=(b|0)){f=b+128|0;c[11850]=f;g=Xe(g,f)|0;c[11854]=g}if((e&255)>>>0<=31>>>0){i=d;return}f=c[11852]|0;c[11852]=f+1;a[g+f|0]=e;i=d;return}function yc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;j=0;g=0;h=d;a:while(1){if((e|0)==0){m=13;break}b:while(1){l=a[b]|0;k=l<<24>>24;if(l<<24>>24==0){m=13;break a}b=b+1|0;switch(k|0){case 97:case 98:case 99:case 100:case 101:case 102:{m=6;break b};case 65:case 66:case 67:case 68:case 69:case 70:{m=7;break b};case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:{m=8;break b};default:{}}if(l<<24>>24>32){m=9;break a}}if((m|0)==6){j=l-87&255|j<<4}else if((m|0)==7){j=l-55&255|j<<4}else if((m|0)==8){j=l-48&255|j<<4}if((g&1|0)!=0){a[h]=j;j=0;h=h+1|0;e=e-1|0}g=g+1|0}if((m|0)==9){Ba(c[p>>2]|0,24704,(m=i,i=i+24|0,c[m>>2]=30136,c[m+8>>2]=k,c[m+16>>2]=b,m)|0)|0;i=m;m=-1;i=f;return m|0}else if((m|0)==13){m=h-d|0;i=f;return m|0}return 0}function zc(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;e=i;i=i+192|0;h=e|0;g=e+128|0;if((b|0)==0){D=-1;i=e;return D|0}c[b>>2]=0;if((c[7624]|0)<=0){D=0;i=e;return D|0}f=h|0;m=h+1|0;n=g|0;j=c[p>>2]|0;q=g;o=g+3|0;l=g+1|0;h=g+2|0;k=g+4|0;r=g+5|0;s=0;u=0;t=0;v=0;a:while(1){b:while(1){c:while(1){D=c[30528+(v<<2)>>2]|0;af(f|0,D|0,(_e(D|0)|0)+1|0)|0;v=v+1|0;if((a[f]|0)==58){z=m;x=64;y=n;w=0;B=0}else{A=32;break a}d:while(1){e:while(1){C=a[z]|0;D=C<<24>>24;if(C<<24>>24==0){A=18;break d}z=z+1|0;switch(D|0){case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:{A=13;break e};case 65:case 66:case 67:case 68:case 69:case 70:{A=12;break e};case 97:case 98:case 99:case 100:case 101:case 102:{A=11;break e};default:{}}if(C<<24>>24>32){A=14;break d}}if((A|0)==11){B=C-87&255|B<<4}else if((A|0)==12){B=C-55&255|B<<4}else if((A|0)==13){B=C-48&255|B<<4}if((w&1|0)!=0){a[y]=B;B=0;y=y+1|0;x=x-1|0}if((x|0)==0){A=18;break}else{w=w+1|0}}do{if((A|0)==14){Ba(j|0,24704,(C=i,i=i+24|0,c[C>>2]=30136,c[C+8>>2]=D,c[C+16>>2]=z,C)|0)|0;i=C}else if((A|0)==18){w=y-q|0;if((w|0)<1){break}w=w-1|0;if((w|0)==0){y=0}else{y=0;x=n;z=w;while(1){z=z-1|0;y=(d[x]|0)+y&255;if((z|0)==0){break}else{x=x+1|0}}}if((a[g+w|0]|0)!=(-y&255)<<24>>24){A=32;break a}w=d[o]|0;if((w|0)==0){break c}else if((w|0)==2){A=25;break b}else if((w|0)==4){A=27;break b}}}while(0);if((v|0)>=(c[7624]|0)){A=32;break a}}w=d[l]<<8|s|d[h];if((u|0)<(t|0)){C=c[b>>2]|0;D=c[C+(u*12|0)+8>>2]|0;u=(((w|0)==(D+(c[C+(u*12|0)>>2]|0)|0)|(D|0)==0)&1^1)+u|0}if((u|0)>=(t|0)){t=t+1|0;D=Xe(c[b>>2]|0,t*12|0)|0;c[b>>2]=D;$e(D+(u*12|0)|0,0,(t-u|0)*12|0|0)|0;c[D+(u*12|0)>>2]=w}D=c[b>>2]|0;D=Xe(c[D+(u*12|0)+4>>2]|0,(d[n]|0)+(c[D+(u*12|0)+8>>2]|0)|0)|0;c[(c[b>>2]|0)+(u*12|0)+4>>2]=D;D=c[b>>2]|0;af((c[D+(u*12|0)+4>>2]|0)+(c[D+(u*12|0)+8>>2]|0)|0,k|0,d[n]|0)|0;D=(c[b>>2]|0)+(u*12|0)+8|0;c[D>>2]=(c[D>>2]|0)+(d[n]|0);if((v|0)>=(c[7624]|0)){A=32;break a}}if((A|0)==25){s=(d[k]<<8|d[r])<<4}else if((A|0)==27){s=(d[k]<<8|d[r])<<16}if((v|0)>=(c[7624]|0)){A=32;break}}if((A|0)==32){i=e;return t|0}return 0}function Ac(b,f,g){b=b|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0;j=i;h=f&65535;if((e[b+4>>1]|0)>>>0<(f&65535)>>>0){n=c[b+132>>2]|0;m=c[b+5888>>2]|0;m=((d[m+94|0]|0)<<8|(d[m+93|0]|0))&65535;l=c[b+5884>>2]|0;l=(d[l+n|0]|0)<<8|(d[l+(n+1)|0]|0);gc(b,1,28576,(k=i,i=i+40|0,c[k>>2]=n,c[k+8>>2]=m,c[k+16>>2]=l,c[k+24>>2]=h,c[k+32>>2]=g&255,k)|0);i=k;mc(b,0)}if((f&65535)>>>0<32>>>0){k=c[b+132>>2]|0;l=c[b+5888>>2]|0;l=((d[l+94|0]|0)<<8|(d[l+93|0]|0))&65535;m=c[b+5884>>2]|0;m=(d[m+k|0]|0)<<8|(d[m+(k+1)|0]|0);gc(b,1,26920,(n=i,i=i+40|0,c[n>>2]=k,c[n+8>>2]=l,c[n+16>>2]=m,c[n+24>>2]=h,c[n+32>>2]=g&255,n)|0);i=n;mc(b,0)}if((c[b+7972>>2]|0)==0){n=b+5888|0;n=c[n>>2]|0;n=n+h|0;a[n]=g;i=j;return}Nc(b,f,4);n=b+5888|0;n=c[n>>2]|0;n=n+h|0;a[n]=g;i=j;return}function Bc(e,f){e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;h=i;g=f&65535;j=b[e+4>>1]|0;if((j&65535)>>>0<(f&65535)>>>0){n=c[e+132>>2]|0;m=c[e+5888>>2]|0;m=((d[m+94|0]|0)<<8|(d[m+93|0]|0))&65535;l=c[e+5884>>2]|0;l=(d[l+n|0]|0)<<8|(d[l+(n+1)|0]|0);gc(e,1,25800,(k=i,i=i+40|0,c[k>>2]=n,c[k+8>>2]=m,c[k+16>>2]=l,c[k+24>>2]=g,c[k+32>>2]=j&65535,k)|0);i=k;mc(e,0)}if((c[e+7972>>2]|0)==0){n=e+5888|0;n=c[n>>2]|0;n=n+g|0;n=a[n]|0;i=h;return n|0}Nc(e,f,8);n=e+5888|0;n=c[n>>2]|0;n=n+g|0;n=a[n]|0;i=h;return n|0}function Cc(a,b){a=a|0;b=b|0;Fc(a,93,b&255);Fc(a,94,(b&65535)>>>8&255);return}function Dc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,i=0;g=c[b+5888>>2]|0;h=a[g+93|0]|0;g=a[g+94|0]|0;f=b+28|0;if((a[f]|0)==0){i=g;Fc(b,93,h);Fc(b,94,i);i=a[f]|0;i=i&255;return i|0}e=e>>>1;g=(g&255)<<8|h&255;h=0;while(1){i=e&255;if((g&65535)>>>0<311>>>0){Fc(b,g,i)}else{Ac(b,g,i)}h=h+1|0;g=g-1&65535;if((h|0)<(d[f]|0)){e=e>>>8}else{break}}i=(g&65535)>>>8&255;h=g&255;Fc(b,93,h);Fc(b,94,i);i=a[f]|0;i=i&255;return i|0}function Ec(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0;g=i;z=f+132|0;I=c[z>>2]|0;A=f+8|0;a:do{if(I>>>0<(c[A>>2]|0)>>>0){x=f+5884|0;l=f+5888|0;j=f+56|0;k=f+36|0;v=f+64|0;h=f+128|0;q=f+120|0;n=f+121|0;r=f+125|0;m=f+123|0;o=f+122|0;p=f+124|0;s=f+127|0;w=f+24|0;t=f+7972|0;u=f+26|0;B=f+28|0;y=f+126|0;while(1){K=c[x>>2]|0;J=a[K+(I+1)|0]|0;L=J&255;H=L<<8;G=a[K+I|0]|0;E=G&255;D=H|E;C=I+2|0;M=H&61440;b:do{if((M|0)==8192){G=H&64512;if((G|0)==8192){M=D>>>4&31;D=c[l>>2]|0;D=a[D+(L<<3&16|E&15)|0]&a[D+(M&255)|0];Fc(f,M&255,D);a[m]=0;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=D;D=C;E=1;break}else if((G|0)==9216){K=D>>>4&31;D=c[l>>2]|0;M=a[D+(K&255)|0]|0;E=a[D+(L<<3&16|E&15)|0]|0;D=E^M;Fc(f,K&255,D);a[m]=0;a[n]=M<<24>>24==E<<24>>24|0;D=(D&255)>>>7;a[o]=D;a[p]=D;D=C;E=1;break}else if((G|0)==10240){M=D>>>4&31;D=c[l>>2]|0;D=a[D+(L<<3&16|E&15)|0]|a[D+(M&255)|0];Fc(f,M&255,D);a[m]=0;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=D;D=C;E=1;break}else if((G|0)==11264){Fc(f,D>>>4&255&31,a[(c[l>>2]|0)+(L<<3&16|E&15)|0]|0);D=C;E=1;break}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break}}else if((M|0)==0){if((D|0)==0){D=C;E=1;break}J=H&64512;if((J|0)==1024){H=c[l>>2]|0;J=a[H+(D>>>4&31)|0]|0;H=a[H+(L<<3&16|E&15)|0]|0;L=J-H&255;M=a[q]|0;D=L-M&255;J=J&255;G=~J;I=H&255;E=I&G;K=D&255;H=K&G|E|D&H&255;a[r]=H>>>3&1;a[q]=H>>>7;E=((I^128)&J&(K^128)|K&E)>>>7&255;a[m]=E;if(L<<24>>24!=M<<24>>24){a[n]=0}D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break}else if((J|0)==3072){M=D>>>4&31;J=c[l>>2]|0;K=a[J+(M&255)|0]|0;J=a[J+(L<<3&16|E&15)|0]|0;D=J+K&255;Fc(f,M&255,D);M=J&K&255;L=D&255;E=~L;K=(J|K)&255;J=K&E|M;a[r]=J>>>3&1;a[q]=J>>>7;E=((K^128)&L|M&E)>>>7&255;a[m]=E;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break}else if((J|0)==2048){G=D>>>4&31;H=c[l>>2]|0;J=a[H+(G&255)|0]|0;H=a[H+(L<<3&16|E&15)|0]|0;L=J-H&255;M=a[q]|0;D=L-M&255;Fc(f,G&255,D);J=J&255;G=~J;I=H&255;E=I&G;K=D&255;H=K&G|E|D&H&255;a[r]=H>>>3&1;a[q]=H>>>7;E=((I^128)&J&(K^128)|K&E)>>>7&255;a[m]=E;if(L<<24>>24!=M<<24>>24){a[n]=0}D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break}else{if((H|0)==256){E=(G&255)>>>4<<1&255;D=G<<1&30;Fc(f,E,a[(c[l>>2]|0)+D|0]|0);Fc(f,E|1,a[(c[l>>2]|0)+(D|1)|0]|0);D=C;E=1;break}else if((H|0)==512){E=c[l>>2]|0;D=ba(a[E+(((G&255)>>>4|16)&255)|0]|0,a[E+((G&15|16)&255)|0]|0)|0;a[E]=D;E=D<<16>>16;a[(c[l>>2]|0)+1|0]=E>>>8;a[q]=E>>>15&1;a[n]=D<<16>>16==0|0;D=C;E=2;break}else if((H|0)==768){D=G&7|16;G=(G&255)>>>4&7|16;E=E&136;if((E|0)==8){M=c[l>>2]|0;E=ba(d[M+(G&255)|0]|0,d[M+(D&255)|0]|0)|0;D=E<<1;E=(E&65535)>>>15&255;G=M}else if((E|0)==128){M=c[l>>2]|0;E=ba(a[M+(G&255)|0]|0,a[M+(D&255)|0]|0)|0;D=E<<1;E=(E&65535)>>>15&255;G=M}else if((E|0)==136){M=c[l>>2]|0;E=ba(a[M+(G&255)|0]|0,d[M+(D&255)|0]|0)|0;D=E<<1;E=(E&65535)>>>15&255;G=M}else if((E|0)==0){M=c[l>>2]|0;E=ba(a[M+(G&255)|0]|0,d[M+(D&255)|0]|0)|0;D=E;E=(E&65535)>>>15&255;G=M}else{D=0;E=0;G=c[l>>2]|0}a[G]=D;a[(c[l>>2]|0)+1|0]=(D&65535)>>>8;a[q]=E;a[n]=D<<16>>16==0|0;D=C;E=2;break}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break}}}else if((M|0)==4096){G=H&64512;if((G|0)==6144){J=D>>>4&31;M=c[l>>2]|0;K=a[M+(J&255)|0]|0;M=a[M+(L<<3&16|E&15)|0]|0;D=K-M&255;Fc(f,J&255,D);J=K&255;H=~J;I=M&255;L=I&H;E=D&255;H=E&H|L|D&M&255;a[r]=H>>>3&1;a[q]=H>>>7;E=((I^128)&J&(E^128)|L&E)>>>7&255;a[m]=E;a[n]=K<<24>>24==M<<24>>24|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break}else if((G|0)==4096){M=c[l>>2]|0;if((a[M+(D>>>4&31)|0]|0)!=(a[M+(L<<3&16|E&15)|0]|0)){D=C;E=1;break}switch(((d[K+(I+3)|0]<<8|d[K+C|0])&-1009)<<16>>16){case-28672:case-27636:case-27635:case-27634:case-27633:{D=I+6|0;E=3;break b};default:{D=I+4|0;E=2;break b}}}else if((G|0)==5120){M=c[l>>2]|0;K=a[M+(D>>>4&31)|0]|0;M=a[M+(L<<3&16|E&15)|0]|0;D=K-M&255;J=K&255;H=~J;I=M&255;L=I&H;E=D&255;H=E&H|L|D&M&255;a[r]=H>>>3&1;a[q]=H>>>7;E=((I^128)&J&(E^128)|L&E)>>>7&255;a[m]=E;a[n]=K<<24>>24==M<<24>>24|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break}else if((G|0)==7168){M=D>>>4&31;J=c[l>>2]|0;K=a[J+(M&255)|0]|0;J=a[J+(L<<3&16|E&15)|0]|0;D=(J+K&255)+(a[q]|0)&255;Fc(f,M&255,D);M=J&K&255;L=D&255;E=~L;K=(J|K)&255;J=K&E|M;a[r]=J>>>3&1;a[q]=J>>>7;E=((K^128)&L|M&E)>>>7&255;a[m]=E;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break}}else if((M|0)==12288){L=E&15|L<<4;K=d[(c[l>>2]|0)+(((G&255)>>>4|16)&255)|0]|0;M=K-L|0;D=M&255;J=~K;L=L&255;E=L&J;J=J&255&M|E|L&M;a[r]=J>>>3&1;a[q]=J>>>7;E=(K&(L^128)&(M^128)|M&E)>>>7&255;a[m]=E;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1}else if((M|0)==16384){J=(G&255)>>>4|16;L=E&15|L<<4;K=d[(c[l>>2]|0)+(J&255)|0]|0;M=K-L-(d[q]|0)|0;D=M&255;Fc(f,J&255,D);J=~K;L=L&255;E=L&J;J=J&255&M|E|L&M;a[r]=J>>>3&1;a[q]=J>>>7;E=(K&(L^128)&(M^128)|M&E)>>>7&255;a[m]=E;if(D<<24>>24!=0){a[n]=0}D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1}else if((M|0)==20480){J=(G&255)>>>4|16;L=E&15|L<<4;K=d[(c[l>>2]|0)+(J&255)|0]|0;M=K-L|0;D=M&255;Fc(f,J&255,D);J=~K;L=L&255;E=L&J;J=J&255&M|E|L&M;a[r]=J>>>3&1;a[q]=J>>>7;E=(K&(L^128)&(M^128)|M&E)>>>7&255;a[m]=E;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1}else if((M|0)==24576){E=(G&255)>>>4|16;D=G&15|J<<4|a[(c[l>>2]|0)+(E&255)|0];Fc(f,E&255,D);a[m]=0;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=D;D=C;E=1}else if((M|0)==28672){E=(G&255)>>>4|16;D=a[(c[l>>2]|0)+(E&255)|0]&(G&15|J<<4);Fc(f,E&255,D);a[m]=0;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=D;D=C;E=1}else if((M|0)==40960|(M|0)==32768){E=D&53256;if((E|0)==32768){E=c[l>>2]|0;I=d[E+31|0]<<8|d[E+30|0];D=D>>>4&31;G=J<<1&24|J&32|G&7;if((H&512|0)==0){Fc(f,D&255,Gc(f,I+(G&255)&65535)|0);D=C;E=2;break}G=I+(G&255)&65535;D=a[E+(D&255)|0]|0;if((G&65535)>>>0<311>>>0){Fc(f,G,D);D=C;E=2;break}else{Ac(f,G,D);D=C;E=2;break}}else if((E|0)==32776){E=c[l>>2]|0;I=d[E+29|0]<<8|d[E+28|0];D=D>>>4&31;G=J<<1&24|J&32|G&7;if((H&512|0)==0){Fc(f,D&255,Gc(f,I+(G&255)&65535)|0);D=C;E=2;break}G=I+(G&255)&65535;D=a[E+(D&255)|0]|0;if((G&65535)>>>0<311>>>0){Fc(f,G,D);D=C;E=2;break}else{Ac(f,G,D);D=C;E=2;break}}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break}}else if((M|0)==36864){if((D&65295|0)==37896){M=(G&255)>>>4&7;E=(G&255)>>>7;D=E^1;G=M&255;do{if(M<<24>>24==7){if(E<<24>>24==1){a[h]=0;break}if((a[s]|0)!=0){break}a[h]=-2}}while(0);a[f+120+G|0]=D;D=C;E=1;break}switch(D|0){case 38280:{if((Xc(f)|0)!=0){if((a[s]|0)!=0){D=C;E=1;break b}}c[k>>2]=3;D=C;E=1;break b};case 38296:{if((c[t>>2]|0)==0){D=C;E=1;break b}c[k>>2]=5;D=I;E=0;break b};case 38312:{Ge(f,2003072114,0)|0;D=C;E=1;break b};case 38376:{Ge(f,1718841453,0)|0;D=C;E=1;break b};case 37897:case 37913:case 38153:case 38169:{G=H&256;E=(E&16|0)!=0;do{if(E){if((b[u>>1]|0)!=0){break}L=c[l>>2]|0;L=(d[L+94|0]<<8|d[L+93|0])&65535;gc(f,1,26624,(M=i,i=i+24|0,c[M>>2]=I,c[M+8>>2]=L,c[M+16>>2]=D,M)|0);i=M}}while(0);H=c[l>>2]|0;D=d[H+31|0]<<8|d[H+30|0];if(E){D=d[H+(e[u>>1]|0)|0]<<16|D}if((G|0)==0){E=2}else{E=(Dc(f,C)|0)+1|0}D=D<<1;break b};case 38168:case 38152:{G=c[l>>2]|0;D=a[G+93|0]|0;G=a[G+94|0]|0;if((a[B]|0)==0){H=D;D=0}else{C=0;H=0;D=(G&255)<<8|D&255;do{D=D+1&65535;C=(Gc(f,D)|0)&255|C<<8;H=H+1|0;}while((H|0)<(d[B]|0));G=(D&65535)>>>8&255;H=D&255;D=C<<1}Fc(f,93,H);Fc(f,94,G);C=(d[B]|0)+2|0;if((E&16|0)==0){E=C;break b}if((a[s]|0)==0){a[h]=-2}a[s]=1;E=C;break b};case 38344:{D=c[l>>2]|0;a[D]=a[K+((d[D+31|0]<<8|d[D+30|0])&65535)|0]|0;D=C;E=3;break b};default:{switch(D&65039|0){case 36864:{Fc(f,D>>>4&255&31,Gc(f,d[K+(I+3)|0]<<8|d[K+C|0])|0);D=I+4|0;E=2;break b};case 36869:case 36868:{G=c[l>>2]|0;G=d[G+31|0]<<8|d[G+30|0];Fc(f,D>>>4&255&31,a[K+(G&65535)|0]|0);if((E&1|0)==0){D=C;E=3;break b}D=G+1&65535;a[(c[l>>2]|0)+31|0]=(D&65535)>>>8;a[(c[l>>2]|0)+30|0]=D;D=C;E=3;break b};case 36870:case 36871:{G=b[w>>1]|0;if(G<<16>>16==0){K=c[l>>2]|0;K=(d[K+94|0]<<8|d[K+93|0])&65535;gc(f,1,26624,(G=i,i=i+24|0,c[G>>2]=I,c[G+8>>2]=K,c[G+16>>2]=D,G)|0);i=G;G=b[w>>1]|0;K=c[x>>2]|0}M=c[l>>2]|0;G=d[M+31|0]<<8|d[M+30|0]|d[M+(G&65535)|0]<<16;Fc(f,D>>>4&255&31,a[K+G|0]|0);if((E&1|0)==0){D=C;E=3;break b}D=G+1|0;Fc(f,b[w>>1]|0,D>>>16&255);a[(c[l>>2]|0)+31|0]=D>>>8;a[(c[l>>2]|0)+30|0]=D;D=C;E=3;break b};case 36876:case 36877:case 36878:{H=c[l>>2]|0;M=E&3;H=(d[H+27|0]<<8|d[H+26|0])+(((M|0)==2)<<31>>31)&65535;G=Gc(f,H)|0;if((M|0)==1){H=H+1&65535;E=(H&65535)>>>8&255;H=H&255}else{E=(H&65535)>>>8&255;H=H&255}a[(c[l>>2]|0)+27|0]=E;a[(c[l>>2]|0)+26|0]=H;Fc(f,D>>>4&255&31,G);D=C;E=2;break b};case 37388:case 37389:case 37390:{M=c[l>>2]|0;E=E&3;G=a[M+(D>>>4&31)|0]|0;D=(d[M+27|0]<<8|d[M+26|0])+(((E|0)==2)<<31>>31)&65535;if((D&65535)>>>0<311>>>0){Fc(f,D,G)}else{Ac(f,D,G)}if((E|0)==1){D=D+1&65535;E=(D&65535)>>>8&255;D=D&255}else{E=(D&65535)>>>8&255;D=D&255}a[(c[l>>2]|0)+27|0]=E;a[(c[l>>2]|0)+26|0]=D;D=C;E=2;break b};case 36873:case 36874:{H=c[l>>2]|0;M=E&3;H=(d[H+29|0]<<8|d[H+28|0])+(((M|0)==2)<<31>>31)&65535;G=Gc(f,H)|0;if((M|0)==1){H=H+1&65535;E=(H&65535)>>>8&255;H=H&255}else{E=(H&65535)>>>8&255;H=H&255}a[(c[l>>2]|0)+29|0]=E;a[(c[l>>2]|0)+28|0]=H;Fc(f,D>>>4&255&31,G);D=C;E=2;break b};case 37385:case 37386:{M=c[l>>2]|0;E=E&3;G=a[M+(D>>>4&31)|0]|0;D=(d[M+29|0]<<8|d[M+28|0])+(((E|0)==2)<<31>>31)&65535;if((D&65535)>>>0<311>>>0){Fc(f,D,G)}else{Ac(f,D,G)}if((E|0)==1){D=D+1&65535;E=(D&65535)>>>8&255;D=D&255}else{E=(D&65535)>>>8&255;D=D&255}a[(c[l>>2]|0)+29|0]=E;a[(c[l>>2]|0)+28|0]=D;D=C;E=2;break b};case 37376:{E=a[(c[l>>2]|0)+(D>>>4&31)|0]|0;C=d[K+(I+3)|0]<<8|d[K+C|0];D=I+4|0;if((C&65535)>>>0<311>>>0){Fc(f,C,E);E=2;break b}else{Ac(f,C,E);E=2;break b}break};case 36865:case 36866:{H=c[l>>2]|0;M=E&3;H=(d[H+31|0]<<8|d[H+30|0])+(((M|0)==2)<<31>>31)&65535;G=Gc(f,H)|0;if((M|0)==1){H=H+1&65535;E=(H&65535)>>>8&255;H=H&255}else{E=(H&65535)>>>8&255;H=H&255}a[(c[l>>2]|0)+31|0]=E;a[(c[l>>2]|0)+30|0]=H;Fc(f,D>>>4&255&31,G);D=C;E=2;break b};case 37377:case 37378:{M=c[l>>2]|0;E=E&3;G=a[M+(D>>>4&31)|0]|0;D=(d[M+31|0]<<8|d[M+30|0])+(((E|0)==2)<<31>>31)&65535;if((D&65535)>>>0<311>>>0){Fc(f,D,G)}else{Ac(f,D,G)}if((E|0)==1){D=D+1&65535;E=(D&65535)>>>8&255;D=D&255}else{E=(D&65535)>>>8&255;D=D&255}a[(c[l>>2]|0)+31|0]=E;a[(c[l>>2]|0)+30|0]=D;D=C;E=2;break b};case 36879:{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])+1&65535;E=Gc(f,M)|0;Fc(f,93,M&255);Fc(f,94,(M&65535)>>>8&255);Fc(f,D>>>4&255&31,E);D=C;E=2;break b};case 37391:{E=c[l>>2]|0;D=a[E+(D>>>4&31)|0]|0;E=d[E+94|0]<<8|d[E+93|0];if((E&65535)>>>0<311>>>0){Fc(f,E,D)}else{Ac(f,E,D)}D=E-1&65535;Fc(f,93,D&255);Fc(f,94,(D&65535)>>>8&255);D=C;E=2;break b};case 37888:{M=D>>>4&31;E=a[(c[l>>2]|0)+(M&255)|0]|0;D=~E;Fc(f,M&255,D);a[m]=0;a[n]=E<<24>>24==-1|0;D=(D&255)>>>7;a[o]=D;a[p]=D;a[q]=1;D=C;E=1;break b};case 37889:{E=D>>>4&31;M=a[(c[l>>2]|0)+(E&255)|0]|0;D=-M&255;Fc(f,E&255,D);a[r]=((M|D)&255)>>>3&1;E=D<<24>>24==-128|0;a[m]=E;a[q]=M<<24>>24!=0|0;a[n]=M<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break b};case 37890:{E=D>>>4&31;D=a[(c[l>>2]|0)+(E&255)|0]|0;Fc(f,E&255,(D&255)>>>4|D<<4);D=C;E=1;break b};case 37891:{E=D>>>4&31;D=(a[(c[l>>2]|0)+(E&255)|0]|0)+1&255;Fc(f,E&255,D);E=D<<24>>24==-128|0;a[m]=E;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break b};case 37893:{M=D>>>4&31;E=a[(c[l>>2]|0)+(M&255)|0]|0;D=(E&255)>>>1|E&-128;Fc(f,M&255,D);a[n]=D<<24>>24==0|0;D=E&1;a[q]=D;E=(E&255)>>>7;a[o]=E;a[m]=D^E;a[p]=D;D=C;E=1;break b};case 37894:{M=D>>>4&31;D=a[(c[l>>2]|0)+(M&255)|0]|0;E=(D&255)>>>1;Fc(f,M&255,E);a[o]=0;a[n]=E<<24>>24==0|0;D=D&1;a[q]=D;a[m]=D;a[p]=D;D=C;E=1;break b};case 37895:{D=D>>>4&31;E=a[(c[l>>2]|0)+(D&255)|0]|0;M=(a[q]|0)!=0?-128:0;L=M|(E&255)>>>1;Fc(f,D&255,L);a[n]=L<<24>>24==0|0;D=E&1;a[q]=D;E=(M&255)>>>7;a[o]=E;a[m]=E^D;a[p]=D;D=C;E=1;break b};case 37898:{E=D>>>4&31;D=(a[(c[l>>2]|0)+(E&255)|0]|0)-1&255;Fc(f,E&255,D);E=D<<24>>24==127|0;a[m]=E;a[n]=D<<24>>24==0|0;D=(D&255)>>>7;a[o]=D;a[p]=E^D;D=C;E=1;break b};case 37900:case 37901:{D=((d[K+(I+3)|0]<<8|d[K+C|0])&65535|(D>>>3&62|E&1)<<16)<<1;E=3;break b};case 37902:case 37903:{D=((d[K+(I+3)|0]<<8|d[K+C|0])&65535|(D>>>3&62|E&1)<<16)<<1;E=(Dc(f,I+4|0)|0)+2|0;break b};default:{switch(H|0){case 38400:{D=(G&255)>>>3&6|24;E=D&255;M=c[l>>2]|0;K=E|1;E=d[M+K|0]<<8|d[M+E|0];M=E&65535;E=E+(((G&255)>>>2&48|G&15)&255)&65535;L=E&65535;Fc(f,K&65535,(E&65535)>>>8&255);Fc(f,D&255,E&255);D=(L&(M^32768))>>>15&255;a[m]=D;a[q]=((L^32768)&M)>>>15;a[n]=E<<16>>16==0|0;E=(E&65535)>>>15&255;a[o]=E;a[p]=E^D;D=C;E=2;break b};case 38656:{D=(G&255)>>>3&6|24;L=D&255;K=c[l>>2]|0;I=L|1;L=d[K+I|0]<<8|d[K+L|0];K=L&65535;M=((G&255)>>>2&48|G&15)&255;E=L-M&65535;J=E&65535;Fc(f,I&65535,(E&65535)>>>8&255);Fc(f,D&255,E&255);D=((J^32768)&K)>>>15&255;a[m]=D;a[q]=(J&(K^32768))>>>15;a[n]=L<<16>>16==M<<16>>16|0;E=(E&65535)>>>15&255;a[o]=E;a[p]=E^D;D=C;E=2;break b};case 38912:{D=((G&255)>>>3|32)&255;Fc(f,D,(Gc(f,D)|0)&255&(1<<(E&7)^255)&255);D=C;E=2;break b};case 39168:{if(((Gc(f,((G&255)>>>3|32)&255)|0)&255&1<<(E&7)|0)!=0){D=C;E=1;break b}M=c[x>>2]|0;switch(((d[M+(I+3)|0]<<8|d[M+C|0])&-1009)<<16>>16){case-28672:case-27636:case-27635:case-27634:case-27633:{D=I+6|0;E=3;break b};default:{D=I+4|0;E=2;break b}}break};case 39424:{D=((G&255)>>>3|32)&255;Fc(f,D,((Gc(f,D)|0)&255|1<<(E&7))&255);D=C;E=2;break b};case 39680:{if(((Gc(f,((G&255)>>>3|32)&255)|0)&255&1<<(E&7)|0)==0){D=C;E=1;break b}M=c[x>>2]|0;switch(((d[M+(I+3)|0]<<8|d[M+C|0])&-1009)<<16>>16){case-28672:case-27636:case-27635:case-27634:case-27633:{D=I+6|0;E=3;break b};default:{D=I+4|0;E=2;break b}}break};default:{if((H&64512|0)==39936){M=c[l>>2]|0;D=ba(d[M+(L<<3&16|E&15)|0]|0,d[M+(D>>>4&31)|0]|0)|0;a[M]=D;a[(c[l>>2]|0)+1|0]=(D&65535)>>>8;a[n]=D<<16>>16==0|0;a[q]=(D&65535)>>>15;D=C;E=2;break b}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break b}}}}}}}}else if((M|0)==45056){E=H&63488;if((E|0)==47104){Fc(f,(J<<3&48|G&15)+32&255,a[(c[l>>2]|0)+(D>>>4&31)|0]|0);D=C;E=1;break}else if((E|0)==45056){Fc(f,D>>>4&255&31,Gc(f,(J<<3&48|G&15)+32&255)|0);D=C;E=1;break}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break}}else if((M|0)==49152){D=(D<<20>>19)+C|0;E=2}else if((M|0)==53248){D=(D<<20>>19)+C|0;E=(Dc(f,C)|0)+1|0}else if((M|0)==57344){Fc(f,((G&255)>>>4|16)&255,G&15|J<<4);D=C;E=1}else if((M|0)==61440){switch(H&65024|0){case 61440:case 61952:case 62464:case 62976:{D=D<<22;E=(H&1024|0)==0;G=a[(G&7)+(f+120)|0]|0;if(!(G<<24>>24!=0&E)){if(!(G<<24>>24==0&(E^1))){D=C;E=1;break b}}D=(D>>25<<1)+C|0;E=2;break b};case 63488:{D=D>>>4&31;E=1<<(G&7);Fc(f,D&255,(((a[y]|0)==0?0:E)|d[(c[l>>2]|0)+(D&255)|0]&(E^255))&255);D=C;E=1;break b};case 64e3:{a[y]=(d[(c[l>>2]|0)+(D>>>4&31)|0]|0)>>>((G&7)>>>0)&1;D=C;E=1;break b};case 65024:case 64512:{M=H&512;L=1<<(G&7)&d[(c[l>>2]|0)+(D>>>4&31)|0];if(!((L|0)!=0&(M|0)!=0|(L|M|0)==0)){D=C;E=1;break b}switch(((d[K+(I+3)|0]<<8|d[K+C|0])&-1009)<<16>>16){case-28672:case-27636:case-27635:case-27634:case-27633:{D=I+6|0;E=3;break b};default:{D=I+4|0;E=2;break b}}break};default:{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1;break b}}}else{M=c[l>>2]|0;M=(d[M+94|0]<<8|d[M+93|0])&65535;gc(f,1,26624,(E=i,i=i+24|0,c[E>>2]=I,c[E+8>>2]=M,c[E+16>>2]=D,E)|0);i=E;D=C;E=1}}while(0);C=E;G=(E|0)<0|0?-1:0;M=df(c[j>>2]|0,c[j+4>>2]|0,C,G)|0;c[j>>2]=M;c[j+4>>2]=F;if((c[k>>2]|0)!=2){h=183;break}E=c[v>>2]|0;H=c[v+4>>2]|0;if(!(H>>>0>G>>>0|H>>>0==G>>>0&E>>>0>C>>>0)){h=183;break}if((a[h]|0)!=0){h=183;break}M=ef(E,H,C,G)|0;c[v>>2]=M;c[v+4>>2]=F;c[z>>2]=D;if(D>>>0<(c[A>>2]|0)>>>0){I=D}else{break a}}if((h|0)==183){i=g;return D|0}}}while(0);mc(f,0);M=0;i=g;return M|0}function Fc(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0;f=d&65535;if(d<<16>>16==95){a[(c[b+5888>>2]|0)+95|0]=e;i=e&255;h=b+127|0;g=b+128|0;j=0;do{l=(1<<j&i|0)!=0;k=l&1;do{if((j&255)<<24>>24==7){if(!l){a[g]=0;break}if((a[h]|0)!=0){break}a[g]=-2}}while(0);a[b+120+j|0]=k;j=j+1|0;}while((j|0)<8)}if((d&65535)>>>0<=31>>>0){a[(c[b+5888>>2]|0)+f|0]=e;return}g=d-32&65535;h=c[b+136+(g*20|0)+16>>2]|0;if((h|0)==0){a[(c[b+5888>>2]|0)+f|0]=e}else{Kb[h&63](b,d,e,c[b+136+(g*20|0)+12>>2]|0)}b=b+136+(g*20|0)|0;d=c[b>>2]|0;if((d|0)==0){return}l=e&255;Te(d+192|0,l);Te(c[b>>2]|0,l&1);Te((c[b>>2]|0)+24|0,l>>>1&1);Te((c[b>>2]|0)+48|0,l>>>2&1);Te((c[b>>2]|0)+72|0,l>>>3&1);Te((c[b>>2]|0)+96|0,l>>>4&1);Te((c[b>>2]|0)+120|0,l>>>5&1);Te((c[b>>2]|0)+144|0,l>>>6&1);Te((c[b>>2]|0)+168|0,l>>>7);return}function Gc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0;f=e&65535;if(e<<16>>16==95){f=b+5888|0;a[(c[f>>2]|0)+95|0]=0;g=0;do{h=a[b+120+g|0]|0;do{if((h&255)>>>0>1>>>0){Oa(32)|0}else{if(h<<24>>24==0){break}h=(c[f>>2]|0)+95|0;a[h]=d[h]|0|1<<g}}while(0);g=g+1|0;}while((g|0)<8);h=Bc(b,e)|0;return h|0}g=e-32&65535;if((g&65535)>>>0>=279>>>0){h=Bc(b,e)|0;return h|0}g=g&65535;h=c[b+136+(g*20|0)+8>>2]|0;if((h|0)!=0){h=Fb[h&31](b,e,c[b+136+(g*20|0)+4>>2]|0)|0;a[(c[b+5888>>2]|0)+f|0]=h}g=b+136+(g*20|0)|0;h=c[g>>2]|0;if((h|0)==0){h=Bc(b,e)|0;return h|0}f=d[(c[b+5888>>2]|0)+f|0]|0;Te(h+192|0,f);Te(c[g>>2]|0,f&1);Te((c[g>>2]|0)+24|0,f>>>1&1);Te((c[g>>2]|0)+48|0,f>>>2&1);Te((c[g>>2]|0)+72|0,f>>>3&1);Te((c[g>>2]|0)+96|0,f>>>4&1);Te((c[g>>2]|0)+120|0,f>>>5&1);Te((c[g>>2]|0)+144|0,f>>>6&1);Te((c[g>>2]|0)+168|0,f>>>7);h=Bc(b,e)|0;return h|0}function Hc(a){a=a|0;var b=0,d=0,e=0,f=0;$e(a+5896|0,0,1544)|0;b=a+7432|0;e=0;f=0;while(1){d=a+5896+(e*24|0)|0;c[d>>2]=f;c[b>>2]=d;e=e+1|0;if((e|0)<64){f=d}else{break}}f=a+64|0;c[f>>2]=1;c[f+4>>2]=0;f=a+72|0;c[f>>2]=1;c[f+4>>2]=0;return}function Ic(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=i;j=a+7436|0;m=c[j>>2]|0;do{if((m|0)==0){k=0;p=1e3}else{l=0;k=m;while(1){if((c[k+16>>2]|0)==(e|0)){if((c[k+20>>2]|0)==(f|0)){h=4;break}}n=c[k>>2]|0;if((n|0)==0){break}else{l=k;k=n}}if((h|0)==4){n=k|0;m=c[n>>2]|0;if((l|0)==0){c[j>>2]=m}else{c[l>>2]=m}m=a+7432|0;c[n>>2]=c[m>>2];c[m>>2]=k;m=c[j>>2]|0}if((m|0)==0){k=0;p=1e3;break}o=m+8|0;n=c[o>>2]|0;o=c[o+4>>2]|0;l=a+56|0;p=c[l>>2]|0;l=c[l+4>>2]|0;m=o>>>0>l>>>0|o>>>0==l>>>0&n>>>0>p>>>0;l=ef(n,o,p,l)|0;k=m?F:0;p=m?l:0}}while(0);l=a+72|0;m=c[l>>2]|0;n=c[l+4>>2]|0;o=n>>>0<k>>>0|n>>>0==k>>>0&m>>>0<p>>>0;m=o?m:p;o=o?n:k;n=(m|0)!=0|(o|0)!=0;k=a+64|0;c[k>>2]=n?m:1;c[k+4>>2]=n?o:0;o=a+7432|0;m=c[o>>2]|0;if((m|0)==0){gc(a,1,24672,(p=i,i=i+16|0,c[p>>2]=30056,c[p+8>>2]=64,p)|0);i=p;i=g;return}a=a+56|0;d=df(c[a>>2]|0,c[a+4>>2]|0,b,d)|0;n=F;b=m|0;c[o>>2]=c[b>>2];c[b>>2]=0;c[m+16>>2]=e;c[m+20>>2]=f;e=m+8|0;c[e>>2]=d;c[e+4>>2]=n;e=c[j>>2]|0;do{if((e|0)==0){h=18}else{f=0;o=e;while(1){p=o+8|0;q=c[p+4>>2]|0;if(q>>>0>n>>>0|q>>>0==n>>>0&(c[p>>2]|0)>>>0>d>>>0){break}p=c[o>>2]|0;if((p|0)==0){f=o;break}else{f=o;o=p}}if((f|0)==0){h=18;break}q=f|0;c[b>>2]=c[q>>2];c[q>>2]=m;m=c[j>>2]|0}}while(0);if((h|0)==18){c[b>>2]=e;c[j>>2]=m}if((m|0)==0){h=0;e=1e3}else{p=m+8|0;o=c[p>>2]|0;p=c[p+4>>2]|0;q=c[a>>2]|0;e=c[a+4>>2]|0;j=p>>>0>e>>>0|p>>>0==e>>>0&o>>>0>q>>>0;e=ef(o,p,q,e)|0;h=j?F:0;e=j?e:0}f=c[l>>2]|0;j=c[l+4>>2]|0;b=j>>>0<h>>>0|j>>>0==h>>>0&f>>>0<e>>>0;l=b?f:e;h=b?j:h;j=(l|0)!=0|(h|0)!=0;c[k>>2]=j?l:1;c[k+4>>2]=j?h:0;i=g;return}function Jc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;g=a+7436|0;j=c[g>>2]|0;do{if((j|0)==0){e=0;f=1e3}else{f=0;e=j;while(1){if((c[e+16>>2]|0)==(b|0)){if((c[e+20>>2]|0)==(d|0)){h=4;break}}i=c[e>>2]|0;if((i|0)==0){break}else{f=e;e=i}}if((h|0)==4){h=e|0;d=c[h>>2]|0;if((f|0)==0){c[g>>2]=d}else{c[f>>2]=d}j=a+7432|0;c[h>>2]=c[j>>2];c[j>>2]=e;j=c[g>>2]|0}if((j|0)==0){e=0;f=1e3;break}b=j+8|0;i=c[b>>2]|0;b=c[b+4>>2]|0;g=a+56|0;j=c[g>>2]|0;g=c[g+4>>2]|0;f=b>>>0>g>>>0|b>>>0==g>>>0&i>>>0>j>>>0;g=ef(i,b,j,g)|0;e=f?F:0;f=f?g:0}}while(0);g=a+72|0;d=c[g>>2]|0;g=c[g+4>>2]|0;h=g>>>0<e>>>0|g>>>0==e>>>0&d>>>0<f>>>0;f=h?d:f;e=h?g:e;g=(f|0)!=0|(e|0)!=0;a=a+64|0;c[a>>2]=g?f:1;c[a+4>>2]=g?e:0;return}function Kc(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;b=of(c[a+40>>2]|0,0,b,0)|0;b=pf(b,F,1e6,0)|0;Ic(a,b,F,d,e);return}function Lc(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;f=c[a+7436>>2]|0;if((f|0)==0){b=0;f=0;return(F=b,f)|0}while(1){if((c[f+16>>2]|0)==(b|0)){if((c[f+20>>2]|0)==(d|0)){break}}f=c[f>>2]|0;if((f|0)==0){d=0;a=0;e=6;break}}if((e|0)==6){return(F=d,a)|0}d=f+8|0;f=a+56|0;b=c[f>>2]|0;f=c[f+4>>2]|0;d=df(c[d>>2]|0,c[d+4>>2]|0,1,0)|0;f=ef(d,F,b,f)|0;b=F;return(F=b,f)|0}function Mc(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;b=i;d=a+7436|0;h=c[d>>2]|0;a:do{if((h|0)!=0){g=a+56|0;f=a+7432|0;while(1){o=h+8|0;k=c[o>>2]|0;o=c[o+4>>2]|0;l=c[g>>2]|0;j=c[g+4>>2]|0;if(o>>>0>j>>>0|o>>>0==j>>>0&k>>>0>l>>>0){break}j=h|0;c[d>>2]=c[j>>2];c[j>>2]=0;m=h+16|0;l=h+20|0;while(1){p=Ib[c[m>>2]&31](a,k,o,c[l>>2]|0)|0;n=F;o=n>>>0>o>>>0|n>>>0==o>>>0&p>>>0>k>>>0;k=o?p:0;o=o?n:0;if((k|0)==0&(o|0)==0){break}r=c[g+4>>2]|0;if(o>>>0>r>>>0|o>>>0==r>>>0&k>>>0>(c[g>>2]|0)>>>0){e=8;break}}b:do{if((e|0)==8){e=0;n=c[f>>2]|0;if((n|0)==0){gc(a,1,28280,(r=i,i=i+16|0,c[r>>2]=30088,c[r+8>>2]=64,r)|0);i=r;break}r=c[l>>2]|0;m=c[m>>2]|0;l=n|0;c[f>>2]=c[l>>2];c[l>>2]=0;c[n+16>>2]=m;c[n+20>>2]=r;m=n+8|0;c[m>>2]=k;c[m+4>>2]=o;m=c[d>>2]|0;do{if((m|0)!=0){r=0;q=m;while(1){p=q+8|0;s=c[p+4>>2]|0;if(s>>>0>o>>>0|s>>>0==o>>>0&(c[p>>2]|0)>>>0>k>>>0){q=r;break}p=c[q>>2]|0;if((p|0)==0){break}else{r=q;q=p}}if((q|0)==0){break}s=q|0;c[l>>2]=c[s>>2];c[s>>2]=n;break b}}while(0);c[l>>2]=m;c[d>>2]=n}}while(0);c[j>>2]=c[f>>2];c[f>>2]=h;h=c[d>>2]|0;if((h|0)==0){break a}}e=ef(k,o,l,j)|0;d=F;g=a+72|0;f=c[g>>2]|0;g=c[g+4>>2]|0;h=g>>>0<d>>>0|g>>>0==d>>>0&f>>>0<e>>>0;f=h?f:e;h=h?g:d;g=(f|0)!=0|(h|0)!=0;a=a+64|0;c[a>>2]=g?f:1;c[a+4>>2]=g?h:0;r=d;s=e;i=b;return(F=r,s)|0}}while(0);e=a+72|0;d=c[e>>2]|0;e=c[e+4>>2]|0;f=0;f=e>>>0<f>>>0|e>>>0==f>>>0&d>>>0<1e3>>>0;d=f?d:1e3;e=f?e:0;f=(d|0)!=0|(e|0)!=0;a=a+64|0;c[a>>2]=f?d:1;c[a+4>>2]=f?e:0;r=0;s=1e3;i=b;return(F=r,s)|0}function Nc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;j=i;i=i+1104|0;g=j|0;k=j+1024|0;h=c[b+7972>>2]|0;e=e&65535;n=c[h+400>>2]|0;if((n|0)==0){i=j;return}else{l=0}while(1){o=c[h+404+(l*12|0)>>2]|0;if(o>>>0>e>>>0){m=12;break}m=l+1|0;if(((c[h+404+(l*12|0)+4>>2]|0)+o|0)>>>0>e>>>0){m=5;break}if(m>>>0<n>>>0){l=m}else{m=12;break}}if((m|0)==5){if((l|0)==-1){i=j;return}l=c[h+404+(l*12|0)+8>>2]|0;if((l&f|0)==0){i=j;return}f=k|0;n=c[h>>2]|0;m=c[n+5888>>2]|0;k=d[m+95|0]|0;o=d[m+93|0]|0;m=d[m+94|0]|0;n=c[n+132>>2]|0;if((l&12|0)==0){l=(l&4|0)!=0?26792:25584}else{l=28200}Wa(f|0,24512,(p=i,i=i+72|0,c[p>>2]=5,c[p+8>>2]=k,c[p+16>>2]=o,c[p+24>>2]=m,c[p+32>>2]=n&255,c[p+40>>2]=n>>>8&255,c[p+48>>2]=n>>>16&255,c[p+56>>2]=l,c[p+64>>2]=e|8388608,p)|0)|0;i=p;e=g|0;k=g+1|0;a[e]=36;n=a[f]|0;if(n<<24>>24==0){m=0}else{m=0;while(1){f=f+1|0;l=k+1|0;a[k]=n;m=(n&255)+m&255;n=a[f]|0;if(n<<24>>24==0){k=l;break}else{k=l}}}Wa(k|0,25576,(p=i,i=i+8|0,c[p>>2]=m,p)|0)|0;i=p;Ra(c[h+8>>2]|0,e|0,3-g+k|0,0)|0;c[b+36>>2]=1;i=j;return}else if((m|0)==12){i=j;return}}function Oc(f,g){f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0;h=i;i=i+3320|0;j=h|0;v=h+1024|0;A=h+2048|0;w=h+2056|0;z=h+2064|0;l=h+2072|0;q=h+2080|0;t=h+2096|0;u=h+2104|0;s=h+2112|0;y=h+2128|0;r=h+2136|0;p=h+2144|0;B=h+2152|0;D=h+2280|0;C=h+2288|0;n=h+2296|0;if((f|0)==0){I=0;i=h;return I|0}o=c[f+7972>>2]|0;if((o|0)==0){I=0;i=h;return I|0}E=f+36|0;k=c[E>>2]|0;a:do{if((k|0)==2){H=c[f+132>>2]|0;I=c[o+12>>2]|0;if((I|0)==0){break}else{G=0}while(1){f=c[o+16+(G*12|0)>>2]|0;if(f>>>0>H>>>0){break}F=G+1|0;if((f|0)==(H|0)){m=8;break}if(F>>>0<I>>>0){G=F}else{break}}do{if((m|0)==8){if((G|0)==-1){break}Rc(o);c[E>>2]=1;break a}}while(0);if((k|0)==5){m=11}}else if((k|0)==5){m=11}}while(0);if((m|0)==11){Rc(o);c[E>>2]=1}f=C;E=n|0;$e(B|0,0,128)|0;k=o+8|0;F=c[k>>2]|0;if((F|0)==-1){F=c[o+4>>2]|0;I=B+(F>>>5<<2)|0;c[I>>2]=1<<(F&31)|c[I>>2]}else{I=B+(F>>>5<<2)|0;c[I>>2]=c[I>>2]|1<<(F&31)}c[D>>2]=0;c[D+4>>2]=g;if((Ja(F+1|0,B|0,0,0,D|0)|0)==0){I=0;i=h;return I|0}g=c[o+4>>2]|0;do{if((1<<(g&31)&c[B+(g>>>5<<2)>>2]|0)!=0){g=ya(g|0,0,0)|0;c[k>>2]=g;if((g|0)!=-1){c[C>>2]=1;ib(g|0,6,1,f|0,4)|0;c[(c[o>>2]|0)+36>>2]=1;Ca(29400,(I=i,i=i+8|0,c[I>>2]=30152,I)|0)|0;i=I;break}kb(23984);vb(5)|0;I=1;i=h;return I|0}}while(0);C=c[k>>2]|0;if((C|0)==-1){I=1;i=h;return I|0}if((c[B+(C>>>5<<2)>>2]&1<<(C&31)|0)==0){I=1;i=h;return I|0}B=gb(C|0,E|0,1023,0)|0;if((B|0)==0){Ca(29120,(I=i,i=i+8|0,c[I>>2]=30152,I)|0)|0;i=I;Da(c[k>>2]|0)|0;c[o+12>>2]=0;c[o+400>>2]=0;c[(c[o>>2]|0)+36>>2]=2;c[k>>2]=-1;I=1;i=h;return I|0}else if((B|0)==(-1|0)){kb(28864);vb(1)|0;I=1;i=h;return I|0}else{a[n+B|0]=0;g=E;while(1){C=a[g]|0;if((C<<24>>24|0)==3){m=28;break}else if(!((C<<24>>24|0)==45|(C<<24>>24|0)==43)){break}g=g+1|0}if((m|0)==28){C=g+1|0;c[(c[o>>2]|0)+36>>2]=5;Oa(8)|0;g=C;C=a[C]|0}if(C<<24>>24!=36){I=1;i=h;return I|0}n=n+(B-1)|0;b:do{if(n>>>0>g>>>0){while(1){if((a[n]|0)==35){break b}B=n-1|0;a[n]=0;if(B>>>0>g>>>0){n=B}else{n=B;break}}}}while(0);a[n]=0;Ra(c[k>>2]|0,28504,1,0)|0;n=v|0;D=q;E=s;C=o|0;B=c[C>>2]|0;f=g+2|0;g=a[g+1|0]|0;switch(g&255|0){case 99:{c[B+36>>2]=2;I=1;i=h;return I|0};case 115:{c[B+36>>2]=4;I=1;i=h;return I|0};case 114:{c[B+36>>2]=5;kc(B);I=1;i=h;return I|0};case 90:case 122:{l=g<<24>>24==90|0;ua(f|0,25912,(m=i,i=i+24|0,c[m>>2]=y,c[m+8>>2]=r,c[m+16>>2]=p,m)|0)|0;i=m;m=c[y>>2]|0;switch(m|0){case 0:case 1:{n=c[r>>2]|0;do{if(n>>>0<=(c[B+8>>2]|0)>>>0){if((Tc(o+12|0,l,1<<m,n,c[p>>2]|0)|0)==-1){break}H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}while(0);H=j|0;a[H]=36;a[j+1|0]=69;a[j+2|0]=48;a[j+3|0]=49;I=j+4|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=166,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0};case 2:case 3:case 4:{n=c[r>>2]&-8388609;c[r>>2]=n;do{if(n>>>0<=(e[B+4>>1]|0)>>>0){if((Tc(o+400|0,l,1<<m,n,c[p>>2]|0)|0)==-1){break}H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}while(0);H=j|0;a[H]=36;a[j+1|0]=69;a[j+2|0]=48;a[j+3|0]=49;I=j+4|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=166,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0};default:{H=j|0;I=j+1|0;a[H]=36;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=0,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}break};case 113:{if((sa(f|0,28408,9)|0)==0){H=j|0;a[H]=36;a[j+1|0]=113;a[j+2|0]=88;a[j+3|0]=102;a[j+4|0]=101;a[j+5|0]=114;a[j+6|0]=58;a[j+7|0]=109;a[j+8|0]=101;a[j+9|0]=109;a[j+10|0]=111;a[j+11|0]=114;a[j+12|0]=121;a[j+13|0]=45;a[j+14|0]=109;a[j+15|0]=97;a[j+16|0]=112;a[j+17|0]=58;a[j+18|0]=114;a[j+19|0]=101;a[j+20|0]=97;a[j+21|0]=100;a[j+22|0]=43;I=j+23|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=69,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}if((sa(f|0,28136,8)|0)==0){H=j|0;a[H]=36;a[j+1|0]=49;I=j+2|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=49,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}if((sa(f|0,28080,7)|0)==0){H=j|0;a[H]=36;a[j+1|0]=84;a[j+2|0]=101;a[j+3|0]=120;a[j+4|0]=116;a[j+5|0]=61;a[j+6|0]=48;a[j+7|0]=59;a[j+8|0]=68;a[j+9|0]=97;a[j+10|0]=116;a[j+11|0]=97;a[j+12|0]=61;a[j+13|0]=56;$e(j+14|0,48,5)|0;a[j+19|0]=59;a[j+20|0]=66;a[j+21|0]=115;a[j+22|0]=115;a[j+23|0]=61;a[j+24|0]=56;I=j+30|0;$e(j+25|0,48,5)|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=244,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}if((sa(f|0,27832,20)|0)!=0){H=j|0;I=j+1|0;a[H]=36;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=0,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}m=(c[B+8>>2]|0)+1|0;Na(n|0,1024,27344,(l=i,i=i+16|0,c[l>>2]=(e[B+4>>1]|0)+1,c[l+8>>2]=m,l)|0)|0;i=l;l=j|0;m=j+1|0;a[l]=36;q=a[n]|0;if(q<<24>>24==0){o=0}else{o=0;while(1){n=n+1|0;p=m+1|0;a[m]=q;o=(q&255)+o&255;q=a[n]|0;if(q<<24>>24==0){m=p;break}else{m=p}}}Wa(m|0,25576,(I=i,i=i+8|0,c[I>>2]=o,I)|0)|0;i=I;Ra(c[k>>2]|0,l|0,3-j+m|0,0)|0;I=1;i=h;return I|0};case 63:{Rc(o);I=1;i=h;return I|0};case 71:{yc(f,n,_e(f|0)|0)|0;l=0;c:while(1){switch(l|0){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 29:case 30:case 31:{a[(c[(c[C>>2]|0)+5888>>2]|0)+l|0]=a[n]|0;break};case 32:{a[(c[(c[C>>2]|0)+5888>>2]|0)+95|0]=a[n]|0;q=0;do{o=c[C>>2]|0;p=(d[n]&1<<q|0)!=0;r=p&1;do{if((q&255)<<24>>24==7){if(!p){a[o+128|0]=0;break}if((a[o+127|0]|0)!=0){break}a[o+128|0]=-2}}while(0);a[o+120+q|0]=r;q=q+1|0;}while((q|0)<8);break};case 33:{a[(c[(c[C>>2]|0)+5888>>2]|0)+93|0]=a[n]|0;a[(c[(c[C>>2]|0)+5888>>2]|0)+94|0]=a[n+1|0]|0;l=34;n=n+2|0;continue c};case 34:{m=57;break c};default:{}}l=l+1|0;if((l|0)<35){n=n+1|0}else{break}}if((m|0)==57){c[(c[C>>2]|0)+132>>2]=d[n+1|0]<<8|d[n]|d[n+2|0]<<16|d[n+3|0]<<24}H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0};case 103:{l=n;m=0;do{l=l+(Sc(o,m,l)|0)|0;m=m+1|0;}while((m|0)<35);l=j|0;m=j+1|0;a[l]=36;q=a[n]|0;if(q<<24>>24==0){p=0}else{p=0;while(1){n=n+1|0;o=m+1|0;a[m]=q;p=(q&255)+p&255;q=a[n]|0;if(q<<24>>24==0){m=o;break}else{m=o}}}Wa(m|0,25576,(I=i,i=i+8|0,c[I>>2]=p,I)|0)|0;i=I;Ra(c[k>>2]|0,l|0,3-j+m|0,0)|0;I=1;i=h;return I|0};case 112:{c[A>>2]=0;ua(f|0,26832,(l=i,i=i+8|0,c[l>>2]=A,l)|0)|0;i=l;Sc(o,c[A>>2]|0,n)|0;l=j|0;m=j+1|0;a[l]=36;q=a[n]|0;if(q<<24>>24==0){o=0}else{o=0;while(1){n=n+1|0;p=m+1|0;a[m]=q;o=(q&255)+o&255;q=a[n]|0;if(q<<24>>24==0){m=p;break}else{m=p}}}Wa(m|0,25576,(I=i,i=i+8|0,c[I>>2]=o,I)|0)|0;i=I;Ra(c[k>>2]|0,l|0,3-j+m|0,0)|0;I=1;i=h;return I|0};case 80:{c[w>>2]=0;l=$a(f|0,61)|0;if((l|0)==0){I=1;i=h;return I|0}I=l+1|0;a[l]=0;ua(f|0,26832,(l=i,i=i+8|0,c[l>>2]=w,l)|0)|0;i=l;yc(I,n,_e(I|0)|0)|0;l=c[w>>2]|0;switch(l|0){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 29:case 30:case 31:{a[(c[(c[C>>2]|0)+5888>>2]|0)+l|0]=a[n]|0;break};case 32:{a[(c[(c[C>>2]|0)+5888>>2]|0)+95|0]=a[n]|0;l=0;do{o=c[C>>2]|0;p=(d[n]&1<<l|0)!=0;m=p&1;do{if((l&255)<<24>>24==7){if(!p){a[o+128|0]=0;break}if((a[o+127|0]|0)!=0){break}a[o+128|0]=-2}}while(0);a[o+120+l|0]=m;l=l+1|0;}while((l|0)<8);break};case 33:{a[(c[(c[C>>2]|0)+5888>>2]|0)+93|0]=a[n]|0;a[(c[(c[C>>2]|0)+5888>>2]|0)+94|0]=a[v+1|0]|0;break};case 34:{c[(c[C>>2]|0)+132>>2]=d[v+1|0]<<8|d[n]|d[v+2|0]<<16|d[v+3|0]<<24;break};default:{}}H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0};case 109:{ua(f|0,26824,(m=i,i=i+16|0,c[m>>2]=z,c[m+8>>2]=l,m)|0)|0;i=m;m=c[z>>2]|0;d:do{if(m>>>0<(c[B+8>>2]|0)>>>0){m=(c[B+5884>>2]|0)+m|0}else{do{if(m>>>0>8388607>>>0){p=m-8388608|0;o=b[B+4>>1]|0;r=o&65535;if(p>>>0<=r>>>0){m=(c[B+5888>>2]|0)+p|0;break d}do{if(m>>>0>8454143>>>0){if((m-8454144|0)>>>0>(c[B+12>>2]|0)>>>0){break}I=q|0;c[I>>2]=0;b[q+4>>1]=m;c[q+8>>2]=0;Ge(B,1701144432,D)|0;m=c[I>>2]|0;if((m|0)!=0){break d}H=j|0;a[H]=36;a[j+1|0]=69;a[j+2|0]=48;a[j+3|0]=49;I=j+4|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=166,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}while(0);l=c[l>>2]|0;if(!((p|0)==(r+1|0)&(l|0)==2)){break}gc(B,3,26688,(H=i,i=i+16|0,c[H>>2]=m,c[H+8>>2]=2,H)|0);i=H;H=j|0;a[H]=36;I=j+5|0;G=j+1|0;x=808464432;a[G]=x;x=x>>8;a[G+1|0]=x;x=x>>8;a[G+2|0]=x;x=x>>8;a[G+3|0]=x;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=192,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}else{l=c[l>>2]|0;o=b[B+4>>1]|0}}while(0);gc(B,1,26424,(H=i,i=i+24|0,c[H>>2]=m,c[H+8>>2]=l,c[H+16>>2]=(o&65535)+1,H)|0);i=H;H=j|0;a[H]=36;a[j+1|0]=69;a[j+2|0]=48;a[j+3|0]=49;I=j+4|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=166,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}while(0);I=c[l>>2]|0;c[l>>2]=I-1;if((I|0)==0){o=n}else{o=n;while(1){Wa(o|0,26408,(I=i,i=i+8|0,c[I>>2]=d[m]|0,I)|0)|0;i=I;o=o+2|0;I=c[l>>2]|0;c[l>>2]=I-1;if((I|0)==0){break}else{m=m+1|0}}}a[o]=0;l=j|0;m=j+1|0;a[l]=36;q=a[n]|0;if(q<<24>>24==0){p=0}else{p=0;while(1){n=n+1|0;o=m+1|0;a[m]=q;p=(q&255)+p&255;q=a[n]|0;if(q<<24>>24==0){m=o;break}else{m=o}}}Wa(m|0,25576,(I=i,i=i+8|0,c[I>>2]=p,I)|0)|0;i=I;Ra(c[k>>2]|0,l|0,3-j+m|0,0)|0;I=1;i=h;return I|0};case 77:{ua(f|0,26824,(l=i,i=i+16|0,c[l>>2]=t,c[l+8>>2]=u,l)|0)|0;i=l;l=$a(f|0,58)|0;if((l|0)==0){H=j|0;a[H]=36;a[j+1|0]=69;a[j+2|0]=48;a[j+3|0]=49;I=j+4|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=166,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}m=c[t>>2]|0;if(m>>>0<65535>>>0){H=l+1|0;I=(c[B+5884>>2]|0)+m|0;yc(H,I,_e(H|0)|0)|0;H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}do{if(m>>>0>8388607>>>0){o=m-8388608|0;if(o>>>0<=(e[B+4>>1]|0)>>>0){H=l+1|0;I=(c[B+5888>>2]|0)+o|0;yc(H,I,_e(H|0)|0)|0;H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}if(m>>>0<=8454143>>>0){break}if((m-8454144|0)>>>0>(c[B+12>>2]|0)>>>0){break}H=l+1|0;yc(H,n,_e(H|0)|0)|0;c[s>>2]=n;b[s+4>>1]=c[t>>2];c[s+8>>2]=c[u>>2];Ge(B,1701147504,E)|0;H=j|0;a[H]=36;a[j+1|0]=79;a[j+2|0]=75;I=j+3|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=154,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}while(0);I=c[u>>2]|0;gc(B,1,26136,(H=i,i=i+16|0,c[H>>2]=m,c[H+8>>2]=I,H)|0);i=H;H=j|0;a[H]=36;a[j+1|0]=69;a[j+2|0]=48;a[j+3|0]=49;I=j+4|0;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=166,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0};default:{H=j|0;I=j+1|0;a[H]=36;Wa(I|0,25576,(G=i,i=i+8|0,c[G>>2]=0,G)|0)|0;i=G;Ra(c[k>>2]|0,H|0,3-j+I|0,0)|0;I=1;i=h;return I|0}}}return 0}function Pc(a){a=a|0;var d=0,e=0,f=0,g=0,h=0,j=0;d=i;i=i+24|0;j=d|0;h=d+8|0;e=Ve(788)|0;$e(e|0,0,788)|0;f=a+7972|0;c[f>>2]=0;g=lb(2,1,0)|0;c[e+4>>2]=g;if((g|0)<0){h=sb(c[(rb()|0)>>2]|0)|0;gc(a,1,24904,(j=i,i=i+8|0,c[j>>2]=h,j)|0);i=j;j=-1;i=d;return j|0}c[j>>2]=1;ib(g|0,1,2,j|0,4)|0;$e(h|0,0,16)|0;b[h>>1]=2;j=a+7976|0;b[h+2>>1]=Ga(c[j>>2]&65535|0)|0;if((pb(g|0,h|0,16)|0)!=0){h=sb(c[(rb()|0)>>2]|0)|0;gc(a,1,24640,(j=i,i=i+8|0,c[j>>2]=h,j)|0);i=j;j=-1;i=d;return j|0}if((_a(g|0,1)|0)==0){Ca(24184,(h=i,i=i+8|0,c[h>>2]=c[j>>2],h)|0)|0;i=h;c[e>>2]=a;c[e+8>>2]=-1;c[f>>2]=e;c[a+104>>2]=10;c[a+108>>2]=14;j=0;i=d;return j|0}else{kb(24368);j=-1;i=d;return j|0}return 0}function Qc(a){a=a|0;var b=0,d=0;a=a+7972|0;b=c[a>>2]|0;d=c[b+4>>2]|0;if((d|0)!=-1){Da(d|0)|0;b=c[a>>2]|0}d=c[b+8>>2]|0;if((d|0)==-1){d=b;We(d);return}Da(d|0)|0;d=c[a>>2]|0;We(d);return}function Rc(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+1088|0;e=g|0;h=g+1024|0;j=c[b>>2]|0;m=c[j+5888>>2]|0;k=d[m+95|0]|0;l=d[m+93|0]|0;m=d[m+94|0]|0;j=c[j+132>>2]|0;Wa(h|0,25608,(f=i,i=i+56|0,c[f>>2]=5,c[f+8>>2]=k,c[f+16>>2]=l,c[f+24>>2]=m,c[f+32>>2]=j&255,c[f+40>>2]=j>>>8&255,c[f+48>>2]=j>>>16&255,f)|0)|0;i=f;f=e|0;j=e+1|0;a[f]=36;m=a[h]|0;if(m<<24>>24==0){l=0}else{l=0;while(1){h=h+1|0;k=j+1|0;a[j]=m;l=(m&255)+l&255;m=a[h]|0;if(m<<24>>24==0){j=k;break}else{j=k}}}Wa(j|0,25576,(m=i,i=i+8|0,c[m>>2]=l,m)|0)|0;i=m;Ra(c[b+8>>2]|0,f|0,3-e+j|0,0)|0;i=g;return}function Sc(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;switch(e|0){case 32:{b=b|0;e=c[b>>2]|0;h=a[e+120|0]|0;if((h&255)>>>0>1>>>0){Oa(56)|0;h=0;e=c[b>>2]|0}else{h=h<<24>>24!=0|0}j=a[e+121|0]|0;if((j&255)>>>0>1>>>0){Oa(56)|0;e=c[b>>2]|0}else{h=j<<24>>24==0?h:h|2}j=a[e+122|0]|0;if((j&255)>>>0>1>>>0){Oa(56)|0;e=c[b>>2]|0}else{h=j<<24>>24==0?h:h|4}j=a[e+123|0]|0;if((j&255)>>>0>1>>>0){Oa(56)|0;e=c[b>>2]|0}else{h=j<<24>>24==0?h:h|8}j=a[e+124|0]|0;if((j&255)>>>0>1>>>0){Oa(56)|0;e=c[b>>2]|0}else{h=j<<24>>24==0?h:h|16}j=a[e+125|0]|0;if((j&255)>>>0>1>>>0){Oa(56)|0;e=c[b>>2]|0}else{h=j<<24>>24==0?h:h|32}j=a[e+126|0]|0;if((j&255)>>>0>1>>>0){Oa(56)|0;e=c[b>>2]|0}else{h=j<<24>>24==0?h:h|64}b=a[e+127|0]|0;if((b&255)>>>0>1>>>0){Oa(56)|0}else{h=b<<24>>24==0?h:h|-128}Wa(f|0,26408,(j=i,i=i+8|0,c[j>>2]=h&255,j)|0)|0;i=j;j=_e(f|0)|0;i=g;return j|0};case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 23:case 24:case 25:case 26:case 27:case 28:case 29:case 30:case 31:{Wa(f|0,26408,(j=i,i=i+8|0,c[j>>2]=d[(c[(c[b>>2]|0)+5888>>2]|0)+e|0]|0,j)|0)|0;i=j;j=_e(f|0)|0;i=g;return j|0};case 33:{e=c[(c[b>>2]|0)+5888>>2]|0;h=d[e+94|0]|0;Wa(f|0,25784,(j=i,i=i+16|0,c[j>>2]=d[e+93|0]|0,c[j+8>>2]=h,j)|0)|0;i=j;j=_e(f|0)|0;i=g;return j|0};case 34:{h=c[(c[b>>2]|0)+132>>2]|0;Wa(f|0,25656,(j=i,i=i+24|0,c[j>>2]=h&255,c[j+8>>2]=h>>>8&255,c[j+16>>2]=h>>>16&255,j)|0)|0;i=j;j=_e(f|0)|0;i=g;return j|0};default:{j=_e(f|0)|0;i=g;return j|0}}return 0}function Tc(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=a|0;i=c[g>>2]|0;j=(i|0)==0;if((b|0)==0){if(j){k=-1;return k|0}else{b=0}while(1){h=c[a+4+(b*12|0)>>2]|0;if(h>>>0>e>>>0){a=-1;h=25;break}f=b+1|0;if((h|0)==(e|0)){h=20;break}if(f>>>0<i>>>0){b=f}else{a=-1;h=25;break}}if((h|0)==20){if((b|0)==-1){k=-1;return k|0}j=a+4+(b*12|0)+8|0;k=c[j>>2]&~d;c[j>>2]=k;if((k|0)!=0){k=0;return k|0}d=c[g>>2]|0;if(f>>>0<d>>>0){while(1){e=a+4+(b*12|0)|0;d=a+4+(f*12|0)|0;c[e>>2]=c[d>>2];c[e+4>>2]=c[d+4>>2];c[e+8>>2]=c[d+8>>2];e=f+1|0;d=c[g>>2]|0;if(e>>>0<d>>>0){b=f;f=e}else{break}}}c[g>>2]=d-1;k=0;return k|0}else if((h|0)==25){return a|0}}do{if(j){h=11}else{b=0;while(1){k=c[a+4+(b*12|0)>>2]|0;if(k>>>0>e>>>0){break}j=b+1|0;if((k|0)==(e|0)){h=6;break}if(j>>>0<i>>>0){b=j}else{break}}do{if((h|0)==6){if((b|0)==-1){break}c[a+4+(b*12|0)+4>>2]=f;k=a+4+(b*12|0)+8|0;c[k>>2]=c[k>>2]|d;k=0;return k|0}}while(0);if((i|0)==0){h=11;break}else if((i|0)==32){k=-1;return k|0}else{b=0}while(1){j=b+1|0;if((c[a+4+(b*12|0)>>2]|0)>>>0>e>>>0){break}if(j>>>0<i>>>0){b=j}else{b=j;break}}i=i+1|0;c[g>>2]=i;if((i|0)>(b|0)){h=13}}}while(0);if((h|0)==11){c[g>>2]=1;i=1;b=0;h=13}if((h|0)==13){while(1){g=i-1|0;k=a+4+(i*12|0)|0;j=a+4+(g*12|0)|0;c[k>>2]=c[j>>2];c[k+4>>2]=c[j+4>>2];c[k+8>>2]=c[j+8>>2];if((g|0)>(b|0)){i=g}else{break}}}c[a+4+(b*12|0)+8>>2]=d;c[a+4+(b*12|0)>>2]=e;c[a+4+(b*12|0)+4>>2]=f;k=0;return k|0}function Uc(a){a=a|0;$e(a+7440|0,0,520)|0;return}function Vc(b){b=b|0;var e=0,f=0,g=0;Oa(30016)|0;a[b+7956|0]=0;a[b+7957|0]=0;a[b+128|0]=0;e=b+7696|0;if((a[e]|0)==0){return}else{f=0}do{g=(c[b+7440+(f<<2)>>2]|0)+36|0;a[g]=a[g]&-2;f=f+1|0;}while((f|0)<(d[e]|0));return}function Wc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0;f=i;g=e|0;h=a[g]|0;if(h<<24>>24==0){i=f;return}c[e+20>>2]=h&255;j=b+7696|0;h=a[j]|0;a[j]=h+1;c[b+7440+((h&255)<<2)>>2]=e;if((a[e+36|0]&2)==0){e=e+4|0}else{k=d[g]|0;e=e+4|0;h=c[e>>2]|0;Ca(27984,(j=i,i=i+32|0,c[j>>2]=30312,c[j+8>>2]=k,c[j+16>>2]=h&511,c[j+24>>2]=h>>>9&7,j)|0)|0;i=j}if((c[e>>2]&511|0)!=0){i=f;return}gc(b,2,26480,(k=i,i=i+8|0,c[k>>2]=d[g]|0,k)|0);i=k;i=f;return}function Xc(b){b=b|0;return(a[b+7957|0]|0)!=(a[b+7956|0]|0)|0}function Yc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;f=i;if((e|0)==0){l=0;i=f;return l|0}h=e|0;j=a[h]|0;if(j<<24>>24==0){l=0;i=f;return l|0}g=e+36|0;k=a[g]|0;if((k&2)!=0){k=c[e+4>>2]|0;l=k&511;if(l<<16>>16==0){k=0}else{k=k>>>12&255&(d[(c[b+5888>>2]|0)+(l&65535)|0]|0)>>>((k>>>9&7)>>>0)}Ca(26376,(l=i,i=i+24|0,c[l>>2]=30336,c[l+8>>2]=j&255,c[l+16>>2]=k,l)|0)|0;i=l;k=a[g]|0}if((k&1)!=0){if((k&2)==0){l=0;i=f;return l|0}g=d[h]|0;e=c[e+4>>2]|0;h=e&511;if(h<<16>>16==0){b=0}else{b=e>>>12&255&(d[(c[b+5888>>2]|0)+(h&65535)|0]|0)>>>((e>>>9&7)>>>0)}Ca(25456,(l=i,i=i+24|0,c[l>>2]=30336,c[l+8>>2]=g,c[l+16>>2]=b,l)|0)|0;i=l;l=0;i=f;return l|0}h=c[e+8>>2]|0;do{if((h&511|0)!=0){j=h&511;if(j<<16>>16==0){break}Ac(b,j,(d[(c[b+5888>>2]|0)+(j&65535)|0]|(h>>>12&255)<<(h>>>9&7))&255)}}while(0);Te(e+12|0,1);j=c[e+4>>2]|0;h=j&511;if(h<<16>>16==0){l=1;i=f;return l|0}if(((d[(c[b+5888>>2]|0)+(h&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255)<<24>>24==0){l=1;i=f;return l|0}a[g]=a[g]|1;l=b+7956|0;k=a[l]|0;a[l]=k+1;c[b+7700+((k&255)<<2)>>2]=e;a[l]=a[l]&63;do{if((a[b+127|0]|0)!=0){e=b+128|0;if((a[e]|0)!=0){break}a[e]=1}}while(0);b=b+36|0;if((c[b>>2]|0)!=3){l=1;i=f;return l|0}if((a[g]&2)!=0){Oa(80)|0}c[b>>2]=2;l=1;i=f;return l|0}function Zc(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;if((e|0)==0){i=f;return}g=e+36|0;h=a[g]|0;if((h&2)!=0){j=d[e|0]|0;Ca(24856,(h=i,i=i+16|0,c[h>>2]=30448,c[h+8>>2]=j,h)|0)|0;i=h;h=a[g]|0}a[g]=h&-2;Te(e+12|0,0);e=c[e+8>>2]|0;if((e&511|0)==0){i=f;return}if((a[g]&4)!=0){i=f;return}j=e&511;Ac(b,j,((e>>>12&255)<<(e>>>9&7)^255)&(d[(c[b+5888>>2]|0)+(j&65535)|0]|0)&255);i=f;return}function _c(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;f=c[b+8>>2]|0;g=f&511;if(g<<16>>16==0){b=0;return b|0}if(((d[(c[a+5888>>2]|0)+(g&65535)|0]|0)>>>((f>>>9&7)>>>0)&f>>>12&255)<<24>>24==0){h=f>>>12;b=f>>>9&7;Ac(a,g,((d[(c[a+5888>>2]|0)+(g&65535)|0]|0)&((h&255)<<b^255)|(h&(e&255))<<b)&255);b=0;return b|0}else{Zc(a,b);h=1;return h|0}return 0}function $c(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0;e=i;g=b+127|0;if((a[g]|0)==0){i=e;return}f=b+128|0;h=a[f]|0;if(h<<24>>24==0){i=e;return}if(h<<24>>24<0){s=h+1&255;a[f]=s;if(s<<24>>24!=0){i=e;return}a[f]=(a[b+7957|0]|0)!=(a[b+7956|0]|0)|0;i=e;return}h=b+7956|0;s=a[h]|0;m=s&255;j=b+7957|0;l=a[j]|0;k=l&255;o=((s&255)>>>0>(l&255)>>>0?m:m+64|0)-k|0;if((o|0)>0){q=0;r=0;p=255;while(1){s=k+q&63;n=d[c[b+7700+(s<<2)>>2]|0]|0;m=(n|0)<(p|0);r=m?s:r;q=q+1|0;if((q|0)<(o|0)){p=m?n:p}else{break}}}else{r=0}s=b+7700+(r<<2)|0;m=c[s>>2]|0;a[j]=l+1;c[s>>2]=c[b+7700+(k<<2)>>2];a[j]=a[j]&63;k=c[m+4>>2]|0;l=k&511;do{if(l<<16>>16!=0){if(((d[(c[b+5888>>2]|0)+(l&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24==0){break}k=a[m+36|0]|0;if((k&1)==0){break}h=m|0;if(!((m|0)==0|(k&2)==0)){r=d[h]|0;Ca(24496,(s=i,i=i+16|0,c[s>>2]=30264,c[s+8>>2]=r,s)|0)|0;i=s}s=b+132|0;Dc(b,c[s>>2]|0)|0;a[f]=0;a[g]=0;c[s>>2]=ba(d[b+16|0]|0,d[h]|0)|0;Zc(b,m);i=e;return}}while(0);s=m+36|0;a[s]=a[s]&-2;a[f]=(a[j]|0)!=(a[h]|0)|0;i=e;return}function ad(b,c){b=b|0;c=c|0;var e=0,f=0;f=c|0;e=c;af(e|0,29904,40)|0;He(b,f);Wc(b,c+224|0);Me(f,1633968928,19,0)|0;Je(b,d[c+100|0]|0,8,e);f=a[c+130|0]|0;if(f<<24>>24!=0){Je(b,f&255,10,e)}Ie(b,d[c+128|0]|0,10,e);Ie(b,d[c+129|0]|0,14,e);return}function bd(a){a=a|0;var b=0,e=0,f=0,g=0;f=a+4|0;b=a;Jc(c[f>>2]|0,2,b);f=c[f>>2]|0;g=a+108|0;g=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;e=g&511;Ac(f,e,((g>>>12&255)<<(g>>>9&7)^255)&(d[(c[f+5888>>2]|0)+(e&65535)|0]|0)&255);a=a+24|0;e=0;do{Se((c[a>>2]|0)+(e*24|0)|0,8,b);e=e+1|0;}while((e|0)<19);return}function cd(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;id(b,g);k=g+108|0;n=c[k>>2]|0;j=n&511;if(j<<16>>16==0){o=0}else{o=(d[(c[b+5888>>2]|0)+(j&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255}m=g+104|0;l=c[m>>2]|0;j=l&511;if(j<<16>>16==0){l=0;p=c[b+5888>>2]|0}else{p=c[b+5888>>2]|0;l=(d[p+(j&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255}j=b+5888|0;a[p+(n&511)|0]=f;n=o<<24>>24==0;do{if(!n){p=c[k>>2]|0;o=p&511;if(o<<16>>16!=0){if(((d[(c[j>>2]|0)+(o&65535)|0]|0)>>>((p>>>9&7)>>>0)&p>>>12&255)<<24>>24!=0){break}Ac(b,o,(d[(c[j>>2]|0)+(o&65535)|0]|(p>>>12&255)<<(p>>>9&7))&255);p=c[k>>2]|0}f=a[(c[j>>2]|0)+(p&511)|0]|0}}while(0);p=c[m>>2]|0;o=p&511;m=o<<16>>16==0;do{if(l<<24>>24==0){if(m){break}if(((d[(c[j>>2]|0)+(o&65535)|0]|0)>>>((p>>>9&7)>>>0)&p>>>12&255)<<24>>24==0){break}a[g+538|0]=1;o=c[b+48>>2]|0;gc(b,3,27056,(p=i,i=i+16|0,c[p>>2]=c[b+52>>2],c[p+8>>2]=o,p)|0);i=p}else{if(!m){if(((d[(c[j>>2]|0)+(o&65535)|0]|0)>>>((p>>>9&7)>>>0)&p>>>12&255)<<24>>24!=0){break}}Jc(b,2,g);p=d[k]|d[k+1|0]<<8|d[k+2|0]<<16|d[k+3|0]<<24|0;f=p&511;Ac(b,f,((p>>>12&255)<<(p>>>9&7)^255)&d[(c[j>>2]|0)+(f&65535)|0]&255);f=a[(c[j>>2]|0)+(c[k>>2]&511)|0]|0}}while(0);if(!n){Ac(b,e,f);i=h;return}m=c[k>>2]|0;l=m&511;if(l<<16>>16==0){Ac(b,e,f);i=h;return}k=c[j>>2]|0;if(((d[k+(l&65535)|0]|0)>>>((m>>>9&7)>>>0)&m>>>12&255)<<24>>24==0){Ac(b,e,f);i=h;return}m=c[g+44>>2]|0;l=m&511;if((l|0)==0){m=0}else{m=m>>>12&(d[k+l|0]|0)>>>((m>>>9&7)>>>0)&255}l=c[g+48>>2]|0;n=l&511;if((n|0)!=0){m=((l>>>12&(d[k+n|0]|0)>>>((l>>>9&7)>>>0))<<1|m&255)&255}l=c[g+52>>2]|0;n=l&511;if((n|0)!=0){m=((l>>>12&(d[k+n|0]|0)>>>((l>>>9&7)>>>0))<<2|m&255)&255}l=c[g+56>>2]|0;n=l&511;if((n|0)!=0){m=((l>>>12&(d[k+n|0]|0)>>>((l>>>9&7)>>>0))<<3|m&255)&255}l=c[g+60>>2]|0;n=l&511;if((n|0)!=0){m=((l>>>12&(d[k+n|0]|0)>>>((l>>>9&7)>>>0))<<4|m&255)&255}n=c[g+64>>2]|0;l=n&511;if((l|0)!=0){m=((n>>>12&(d[k+l|0]|0)>>>((n>>>9&7)>>>0))<<5|m&255)&255}Te((c[g+24>>2]|0)+432|0,c[g+264+((m&255)<<2)>>2]|0);l=c[g+116>>2]|0;k=l&511;if((k|0)==0){k=0}else{k=l>>>12&(d[(c[j>>2]|0)+k|0]|0)>>>((l>>>9&7)>>>0)&255}l=c[g+120>>2]|0;m=l&511;if((m|0)==0){l=k}else{l=((l>>>12&(d[(c[j>>2]|0)+m|0]|0)>>>((l>>>9&7)>>>0))<<1|k&255)&255}k=c[g+124>>2]|0;m=k&511;if((m|0)!=0){l=((k>>>12&(d[(c[j>>2]|0)+m|0]|0)>>>((k>>>9&7)>>>0))<<2|l&255)&255}j=b+40|0;k=c[j>>2]|0;l=k>>>(((l<<24>>24==0)+(l&255)|0)>>>0);m=g+538|0;if((a[m]|0)==0){m=13}else{gc(b,3,27008,(p=i,i=i+8|0,c[p>>2]=(l>>>0)/1300|0,p)|0);i=p;m=(a[m]|0)!=0?25:13;k=c[j>>2]|0}Ic(b,(k>>>0)/(((l>>>0)/(m>>>0)|0)>>>0)|0,0,2,g);Ac(b,e,f);i=h;return}function dd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;id(a,d);return}function ed(f,g,h){f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;k=i;l=h+539|0;if((a[l]|0)!=0){p=Bc(f,g)|0;i=k;return p|0}j=f+5888|0;m=c[h+68>>2]|0;n=m&511;if((n|0)==0){m=0}else{m=m>>>12&(d[(c[j>>2]|0)+n|0]|0)>>>((m>>>9&7)>>>0)&255}o=c[h+72>>2]|0;n=o&511;if((n|0)!=0){m=((o>>>12&(d[(c[j>>2]|0)+n|0]|0)>>>((o>>>9&7)>>>0))<<1|m&255)&255}o=c[h+76>>2]|0;n=o&511;if((n|0)!=0){m=((o>>>12&(d[(c[j>>2]|0)+n|0]|0)>>>((o>>>9&7)>>>0))<<2|m&255)&255}m=b[h+80+((m&255)<<1)>>1]|0;n=c[h+44>>2]|0;o=n&511;if((o|0)==0){n=0}else{n=n>>>12&(d[(c[j>>2]|0)+o|0]|0)>>>((n>>>9&7)>>>0)&255}o=c[h+48>>2]|0;p=o&511;if((p|0)!=0){n=((o>>>12&(d[(c[j>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0))<<1|n&255)&255}o=c[h+52>>2]|0;p=o&511;if((p|0)!=0){n=((o>>>12&(d[(c[j>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0))<<2|n&255)&255}o=c[h+56>>2]|0;p=o&511;if((p|0)!=0){n=((o>>>12&(d[(c[j>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0))<<3|n&255)&255}o=c[h+60>>2]|0;p=o&511;if((p|0)!=0){n=((o>>>12&(d[(c[j>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0))<<4|n&255)&255}o=c[h+64>>2]|0;p=o&511;if((p|0)!=0){n=((o>>>12&(d[(c[j>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0))<<5|n&255)&255}p=c[h+264+((n&255)<<2)>>2]|0;o=c[h+96>>2]|0;n=o&511;if(n<<16>>16==0){n=0}else{n=((d[(c[j>>2]|0)+(n&65535)|0]|0)>>>((o>>>9&7)>>>0)&o>>>12&255)<<24>>24!=0?6:0}a:do{switch(p&7|0){case 5:{o=p>>>19;break};case 2:{o=e[h+520+(p>>>19<<1)>>1]|0;break};case 6:{o=c[f+44>>2]|0;if((o|0)==0){gc(f,2,29224,(o=i,i=i+1|0,i=i+7&-8,c[o>>2]=0,o)|0);i=o;o=0;break a}else{o=o>>>2;break a}break};case 3:{if((p&2040|0)==0){p=p&-2041|8}o=h+520|0;o=ba((e[o+(p>>>19<<1)>>1]|0)-(e[o+((p>>>11&255)<<1)>>1]|0)|0,p>>>3&255)|0;break};case 4:{o=e[h+536>>1]|0;break};default:{o=0}}}while(0);m=m&65535;do{if((m|0)==0){m=c[f+52>>2]|0;if((m|0)!=0){break}gc(f,2,29304,(m=i,i=i+1|0,i=i+7&-8,c[m>>2]=0,m)|0);i=m;m=3300}else if((m|0)==1){m=c[f+44>>2]|0;if((m|0)!=0){break}gc(f,2,29224,(m=i,i=i+1|0,i=i+7&-8,c[m>>2]=0,m)|0);i=m;m=3300}else if((m|0)==2){m=c[f+48>>2]|0;if((m|0)!=0){break}gc(f,2,27744,(m=i,i=i+1|0,i=i+7&-8,c[m>>2]=0,m)|0);i=m;m=3300}}while(0);o=((o*1023|0)>>>0)/(m>>>0)|0;if(o>>>0>1023>>>0){gc(f,2,26328,(q=i,i=i+32|0,c[q>>2]=p&7,c[q+8>>2]=o,c[q+16>>2]=1023,c[q+24>>2]=m,q)|0);i=q;o=1023}q=o<<n;a[(c[j>>2]|0)+(d[h+128|0]|0)|0]=q;a[(c[j>>2]|0)+(d[h+129|0]|0)|0]=q>>>8;a[l]=1;q=Bc(f,g)|0;i=k;return q|0}function fd(b,c,e){b=b|0;c=c|0;e=e|0;var f=0,g=0,h=0;f=e+539|0;g=d[f]|0;if((g|0)==0){ed(b,d[e+128|0]|0,e)|0;h=3}else if((g|0)==1){h=3}if((h|0)==3){a[f]=2}return Bc(b,c)|0}function gd(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0;f=c[g+104>>2]|0;e=f&511;if(e<<16>>16==0){h=0;f=0;return(F=f,h)|0}h=b+5888|0;if(((d[(c[h>>2]|0)+(e&65535)|0]|0)>>>((f>>>9&7)>>>0)&f>>>12&255)<<24>>24==0){h=0;f=0;return(F=f,h)|0}Yc(b,g+224|0)|0;e=g+108|0;e=d[e]|d[e+1|0]<<8|d[e+2|0]<<16|d[e+3|0]<<24|0;f=e&511;Ac(b,f,((e>>>12&255)<<(e>>>9&7)^255)&d[(c[h>>2]|0)+(f&65535)|0]&255);a[g+538|0]=0;a[g+539|0]=0;if((a[g+212|0]|0)!=1){h=0;f=0;return(F=f,h)|0}Te((c[g+24>>2]|0)+408|0,1);h=0;f=0;return(F=f,h)|0}function hd(a,e,f){a=a|0;e=e|0;f=f|0;var g=0,h=0,i=0;g=c[f+4>>2]|0;a=c[a+8>>2]|0;switch(a|0){case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:{b[f+520+(a<<1)>>1]=e;return};case 16:{b[f+536>>1]=e;return};case 17:{a=c[f+112>>2]|0;h=a&511;if(h<<16>>16==0){return}e=c[g+5888>>2]|0;if(((d[e+(h&65535)|0]|0)>>>((a>>>9&7)>>>0)&a>>>12&255)<<24>>24==0){return}h=c[f+108>>2]|0;i=h&65535;a=i&511;do{if(a<<16>>16==0){if((h&255)<<24>>24!=0){break}return}else{if(!(((d[e+(a&65535)|0]|0)>>>((h>>>9&7)>>>0)&h>>>12&255)<<24>>24!=0|(h&255)<<24>>24==0)){break}return}}while(0);cd(g,i&255,(d[e+(h&255)|0]|0|1<<(h>>>9&7))&255,f);return};default:{return}}}function id(b,e){b=b|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;f=i;m=c[e+112>>2]|0;l=m&511;do{if(l<<16>>16==0){h=e+212|0;j=h;h=a[h]|0;g=8}else{k=c[b+5888>>2]|0;j=e+212|0;h=a[j]|0;if(((d[k+(l&65535)|0]|0)>>>((m>>>9&7)>>>0)&m>>>12&255)<<24>>24==0){g=8;break}l=c[e+132>>2]|0;m=l&511;if((m|0)==0){l=0}else{l=l>>>12&(d[k+m|0]|0)>>>((l>>>9&7)>>>0)&255}m=c[e+136>>2]|0;n=m&511;if((n|0)==0){m=l}else{m=((m>>>12&(d[k+n|0]|0)>>>((m>>>9&7)>>>0))<<1|l&255)&255}n=c[e+140>>2]|0;l=n&511;if((l|0)==0){l=m}else{l=((n>>>12&(d[k+l|0]|0)>>>((n>>>9&7)>>>0))<<2|m&255)&255}m=c[e+144>>2]|0;n=m&511;if((n|0)!=0){l=((m>>>12&(d[k+n|0]|0)>>>((m>>>9&7)>>>0))<<3|l&255)&255}k=c[e+148+((l&255)<<2)>>2]|0;e=k&255;a[j]=e;k=k&255;if((k|0)==1){break}gc(b,2,27784,(e=i,i=i+8|0,c[e>>2]=c[23912+(k<<2)>>2],e)|0);i=e;a[j]=0;e=0}}while(0);if((g|0)==8){a[j]=0;e=0}if(h<<24>>24==e<<24>>24){i=f;return}gc(b,3,27248,(n=i,i=i+8|0,c[n>>2]=c[23912+((e&255)<<2)>>2],n)|0);i=n;i=f;return}function jd(a,b){a=a|0;b=b|0;var f=0,g=0,h=0;f=b;af(f|0,29864,40)|0;g=e[b+44>>1]|0;h=Ve(g)|0;c[b+40>>2]=h;$e(h|0,-1|0,g|0)|0;He(a,b|0);Wc(a,b+80|0);Je(a,d[b+49|0]|0,34,f);return}function kd(a,b,d){a=a|0;b=b|0;d=d|0;var f=0,g=0,h=0,j=0;f=i;if((b|0)==1701144432){do{if((d|0)!=0){h=e[d+4>>1]|0;b=c[d+8>>2]|0;if((h+b|0)>>>0>(e[a+44>>1]|0)>>>0){break}g=c[d>>2]|0;a=(c[a+40>>2]|0)+h|0;if((g|0)==0){c[d>>2]=a;j=-1;i=f;return j|0}else{af(g|0,a|0,b)|0;j=-1;i=f;return j|0}}}while(0);gc(c[a+4>>2]|0,2,26272,(j=i,i=i+8|0,c[j>>2]=30408,j)|0);i=j;j=-2;i=f;return j|0}else if((b|0)==1701147504){do{if((d|0)!=0){g=d+8|0;b=c[g>>2]|0;if((b|0)==0){break}h=c[d>>2]|0;if((h|0)==0){break}j=d+4|0;d=e[j>>1]|0;if((d+b|0)>>>0>(e[a+44>>1]|0)>>>0){break}af((c[a+40>>2]|0)+d|0,h|0,b)|0;g=c[g>>2]|0;h=e[j>>1]|0;gc(c[a+4>>2]|0,3,27640,(j=i,i=i+24|0,c[j>>2]=30408,c[j+8>>2]=g,c[j+16>>2]=h,j)|0);i=j;j=-1;i=f;return j|0}}while(0);gc(c[a+4>>2]|0,2,29168,(j=i,i=i+8|0,c[j>>2]=30408,j)|0);i=j;j=-2;i=f;return j|0}else{j=-1;i=f;return j|0}return 0}function ld(a){a=a|0;var b=0;a=a+40|0;b=c[a>>2]|0;if((b|0)!=0){We(b)}c[a>>2]=0;return}function md(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;h=g+68|0;k=c[h>>2]|0;l=k&511;do{if(l<<16>>16==0){Ac(b,e,f);i=4}else{j=b+5888|0;l=(d[(c[j>>2]|0)+(l&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255;Ac(b,e,f);if(l<<24>>24==0){i=4;break}e=c[g+72>>2]|0;k=e&511;if(k<<16>>16==0){break}f=c[j>>2]|0;if(((d[f+(k&65535)|0]|0)>>>((e>>>9&7)>>>0)&e>>>12&255)<<24>>24==0){break}k=a[g+46|0]|0;e=d[f+(d[g+47|0]|0)|0]|0;if(k<<24>>24!=0){e=(d[f+(k&255)|0]|0)<<8|e}a[(c[g+40>>2]|0)+(e&65535)|0]=a[f+(d[g+48|0]|0)|0]|0;e=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;l=e&511;Ac(b,l,((e>>>12&255)<<(e>>>9&7)^255)&(d[(c[j>>2]|0)+(l&65535)|0]|0)&255);Kc(b,3400,4,g)}}while(0);do{if((i|0)==4){i=c[h>>2]|0;h=i&511;if(h<<16>>16==0){break}if(((d[(c[b+5888>>2]|0)+(h&65535)|0]|0)>>>((i>>>9&7)>>>0)&i>>>12&255)<<24>>24==0){break}Ic(b,4,0,22,g)}}while(0);h=g+76|0;k=c[h>>2]|0;f=k&511;do{if(f<<16>>16==0){j=b+5888|0}else{j=b+5888|0;i=c[j>>2]|0;if(((d[i+(f&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24==0){break}k=a[g+46|0]|0;f=d[i+(d[g+47|0]|0)|0]|0;if(k<<24>>24!=0){f=(d[i+(k&255)|0]|0)<<8|f}a[i+(d[g+48|0]|0)|0]=a[(c[g+40>>2]|0)+(f&65535)|0]|0}}while(0);l=g+72|0;l=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;e=l&511;Ac(b,e,((l>>>12&255)<<(l>>>9&7)^255)&(d[(c[j>>2]|0)+(e&65535)|0]|0)&255);e=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;l=e&511;Ac(b,l,((e>>>12&255)<<(e>>>9&7)^255)&(d[(c[j>>2]|0)+(l&65535)|0]|0)&255);return}function nd(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;b=c[f+4>>2]|0;a=f+68|0;a=d[a]|d[a+1|0]<<8|d[a+2|0]<<16|d[a+3|0]<<24|0;e=a&511;Ac(b,e,((a>>>12&255)<<(a>>>9&7)^255)&(d[(c[b+5888>>2]|0)+(e&65535)|0]|0)&255);return(F=0,0)|0}function od(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;Yc(c[e+4>>2]|0,e+80|0)|0;return(F=0,0)|0}function pd(a,b){a=a|0;b=b|0;var c=0;c=b|0;af(b|0,29824,40)|0;He(a,c);Wc(a,b+48|0);Wc(a,b+104|0);Wc(a,b+160|0);Wc(a,b+216|0);Wc(a,b+272|0);Wc(a,b+328|0);Wc(a,b+384|0);Wc(a,b+440|0);Me(c,1768846368,8,0)|0;return}function qd(a){a=a|0;var b=0,e=0,f=0,g=0,h=0;e=a+24|0;f=a;b=a+40|0;a=a+4|0;h=0;do{Se((c[e>>2]|0)+(h*24|0)|0,2,f);g=c[b+(h*56|0)+48>>2]|0;if((g|0)!=0){g=Ke(c[a>>2]|0,g,d[b+(h*56|0)+52|0]|0)|0;Ue(g,(c[e>>2]|0)+(h*24|0)|0)}h=h+1|0;}while((h|0)<8);return}function rd(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=c[e+4>>2]|0;h=(c[a+12>>2]|0)==0;f=h&(b|0)!=0;h=h^1;a=c[a+8>>2]|0;e=e+40|0;i=(c[e+((a+1|0)*56|0)>>2]&511|0)!=0;l=i?2:1;k=g+5888|0;n=0;m=0;j=e+(a*56|0)|0;while(1){o=c[j>>2]|0;p=o&511;if((p|0)!=0){n=((o>>>12&255&(d[(c[k>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0))<<m|n&255)&255}m=m+1|0;if((m|0)<(l|0)){j=j+4|0}else{break}}b=(b|0)==0&h;h=(i?n:n+2&255)&255;if((h|0)==1){if(!(f|b)){return}Yc(g,e+(a*56|0)+8|0)|0;return}else if((h|0)==2){if(!b){return}Yc(g,e+(a*56|0)+8|0)|0;return}else if((h|0)==3){if(!f){return}Yc(g,e+(a*56|0)+8|0)|0;return}else{return}}function sd(a,b){a=a|0;b=b|0;var f=0,g=0;f=b;af(f|0,29784,40)|0;g=b+44|0;if((c[g>>2]|0)==0){c[g>>2]=Ve(e[b+52>>1]|0)|0}g=b+48|0;if((c[g>>2]|0)==0){c[g>>2]=Ve((e[b+52>>1]|0)>>>1&65535)|0}He(a,b|0);Wc(a,b+80|0);Je(a,d[b+54|0]|0,32,f);return}function td(d){d=d|0;var f=0,g=0,h=0;f=d+52|0;if((e[f>>1]|0)>>>0<=1>>>0){return}g=d+44|0;d=d+48|0;h=0;do{b[(c[g>>2]|0)+(h<<1)>>1]=255;a[(c[d>>2]|0)+h|0]=0;h=h+1|0;}while((h|0)<((e[f>>1]|0)>>>1&65535|0));return}function ud(f,g,h){f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;h=i;if((g|0)!=1718841453){q=-1;i=h;return q|0}j=c[f+4>>2]|0;g=j+5888|0;n=c[g>>2]|0;m=d[n+31|0]<<8|d[n+30|0];k=b[j+24>>1]|0;if(k<<16>>16!=0){m=d[n+(k&65535)|0]<<16|m}l=d[n+1|0]<<8|d[n];k=f+56|0;p=c[k>>2]|0;o=p&511;a:do{if(o<<16>>16!=0){if(((d[n+(o&65535)|0]|0)>>>((p>>>9&7)>>>0)&p>>>12&255)<<24>>24==0){break}Jc(j,10,f);o=c[f+60>>2]|0;n=o&511;do{if(n<<16>>16!=0){if(((d[(c[g>>2]|0)+(n&65535)|0]|0)>>>((o>>>9&7)>>>0)&o>>>12&255)<<24>>24==0){break}m=m&-2;l=f+52|0;p=e[l>>1]|0;gc(j,3,27600,(q=i,i=i+16|0,c[q>>2]=(m>>>0)/(p>>>0)|0,c[q+8>>2]=p,q)|0);i=q;if((b[l>>1]|0)==0){break a}f=j+5884|0;n=0;while(1){a[(c[f>>2]|0)+m|0]=-1;n=n+1|0;if((n|0)<(e[l>>1]|0)){m=m+1|0}else{break a}}}}while(0);n=c[f+64>>2]|0;o=n&511;do{if(o<<16>>16!=0){if(((d[(c[g>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255)<<24>>24==0){break}l=f+52|0;p=e[l>>1]|0;o=m&-p;gc(j,3,26184,(q=i,i=i+16|0,c[q>>2]=(o>>>0)/(p>>>0)|0,c[q+8>>2]=p,q)|0);i=q;if((e[l>>1]|0)>>>0<=1>>>0){break a}m=f+44|0;n=j+5884|0;p=0;while(1){a[(c[n>>2]|0)+o|0]=b[(c[m>>2]|0)+(p<<1)>>1];a[(c[n>>2]|0)+(o+1)|0]=(e[(c[m>>2]|0)+(p<<1)>>1]|0)>>>8;p=p+1|0;q=b[l>>1]|0;if((p|0)<((q&65535)>>>1&65535|0)){o=o+2|0}else{break}}if((q&65535)>>>0<=1>>>0){break a}m=f+44|0;n=f+48|0;f=0;while(1){b[(c[m>>2]|0)+(f<<1)>>1]=255;a[(c[n>>2]|0)+f|0]=0;f=f+1|0;if((f|0)>=((e[l>>1]|0)>>>1&65535|0)){break a}}}}while(0);n=c[f+68>>2]|0;o=n&511;do{if(o<<16>>16!=0){if(((d[(c[g>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255)<<24>>24==0){break}gc(j,3,25400,(q=i,i=i+1|0,i=i+7&-8,c[q>>2]=0,q)|0);i=q;break a}}while(0);do{if((b[f+40>>1]&1)!=0){n=c[f+72>>2]|0;o=n&511;if(o<<16>>16==0){break}if(((d[(c[g>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255)<<24>>24==0){break}m=f+52|0;if((e[m>>1]|0)>>>0<=1>>>0){break a}l=f+44|0;n=f+48|0;f=0;while(1){b[(c[l>>2]|0)+(f<<1)>>1]=255;a[(c[n>>2]|0)+f|0]=0;f=f+1|0;if((f|0)>=((e[m>>1]|0)>>>1&65535|0)){break a}}}}while(0);gc(j,3,25056,(o=i,i=i+16|0,c[o>>2]=m,c[o+8>>2]=l&65535,o)|0);i=o;o=m>>>1;p=f+52|0;m=(o>>>0)%(((e[p>>1]|0)>>>1&65535)>>>0)|0;n=f+48|0;if((a[(c[n>>2]|0)+m|0]|0)!=0){break}b[(c[f+44>>2]|0)+(m<<1)>>1]=l;a[(c[n>>2]|0)+((o>>>0)%(((e[p>>1]|0)>>>1&65535)>>>0)|0)|0]=1}}while(0);p=d[k]|d[k+1|0]<<8|d[k+2|0]<<16|d[k+3|0]<<24|0;q=p&511;Ac(j,q,((p>>>12&255)<<(p>>>9&7)^255)&d[(c[g>>2]|0)+(q&65535)|0]&255);q=0;i=h;return q|0}function vd(a){a=a|0;var b=0;b=c[a+44>>2]|0;if((b|0)!=0){We(b)}a=c[a+48>>2]|0;if((a|0)==0){return}We(a);return}function wd(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;Ac(a,b,e);b=c[f+56>>2]|0;e=b&511;if(e<<16>>16==0){return}if(((d[(c[a+5888>>2]|0)+(e&65535)|0]|0)>>>((b>>>9&7)>>>0)&b>>>12&255)<<24>>24==0){return}Ic(a,4,0,10,f);return}function xd(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0;e=i;g=c[f+4>>2]|0;f=f+56|0;f=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;b=f&511;Ac(g,b,((f>>>12&255)<<(f>>>9&7)^255)&(d[(c[g+5888>>2]|0)+(b&65535)|0]|0)&255);gc(a,2,28216,(b=i,i=i+1|0,i=i+7&-8,c[b>>2]=0,b)|0);i=b;i=e;return(F=0,0)|0}function yd(f,g,h){f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0,m=0;i=c[h+4>>2]|0;f=1<<c[f+8>>2];k=(f|-256)^255;m=h+46|0;j=i+5888|0;l=(c[j>>2]|0)+(e[m>>1]|0)|0;a[l]=(d[l]|0)&k;l=(g&255|0)!=0;if(l){m=(c[j>>2]|0)+(e[m>>1]|0)|0;a[m]=d[m]|0|f}if((g&256|0)!=0){m=b[h+42>>1]|0;Cd(i,m,((d[(c[j>>2]|0)+(m&65535)|0]|0)&k|(l?f:0))&255,h)}g=b[h+88>>1]|0;if(g<<16>>16==0){return}if((f&(d[(c[j>>2]|0)+(g&65535)|0]|0)|0)==0){return}Yc(i,h+48|0)|0;return}function zd(d,e){d=d|0;e=e|0;var f=0,g=0,h=0;g=e|0;f=e;af(f|0,29744,40)|0;He(d,g);Wc(d,e+48|0);Me(g,a[e+40|0]|1768908544,12,0)|0;g=e+24|0;h=(c[g>>2]|0)+16|0;a[h]=a[h]|2;h=(c[g>>2]|0)+40|0;a[h]=a[h]|2;h=(c[g>>2]|0)+64|0;a[h]=a[h]|2;h=(c[g>>2]|0)+88|0;a[h]=a[h]|2;h=(c[g>>2]|0)+112|0;a[h]=a[h]|2;h=(c[g>>2]|0)+136|0;a[h]=a[h]|2;h=(c[g>>2]|0)+160|0;a[h]=a[h]|2;h=(c[g>>2]|0)+184|0;a[h]=a[h]|2;h=(c[g>>2]|0)+208|0;a[h]=a[h]|2;h=(c[g>>2]|0)+232|0;a[h]=a[h]|2;h=(c[g>>2]|0)+256|0;a[h]=a[h]|2;g=(c[g>>2]|0)+280|0;a[g]=a[g]|2;Je(d,b[e+42>>1]|0,16,f);g=e+46|0;Ie(d,b[g>>1]|0,24,f);Je(d,b[g>>1]|0,36,f);Je(d,b[e+44>>1]|0,20,f);return}function Ad(a){a=a|0;var b=0;b=a+24|0;Se(c[b>>2]|0,6,a);Se((c[b>>2]|0)+24|0,6,a);Se((c[b>>2]|0)+48|0,6,a);Se((c[b>>2]|0)+72|0,6,a);Se((c[b>>2]|0)+96|0,6,a);Se((c[b>>2]|0)+120|0,6,a);Se((c[b>>2]|0)+144|0,6,a);Se((c[b>>2]|0)+168|0,6,a);return}function Bd(b,f,g){b=b|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;h=b;k=c[b+4>>2]|0;if((g|0)==0){l=-1;return l|0}if((f|0)!=1768908658){j=b+40|0;i=a[j]|0;l=i<<24>>24;if((l|1768911616|0)==(f|0)){i=c[k+5888>>2]|0;c[g>>2]=(d[i+(e[h+42>>1]|0)|0]|0)<<7|l&127|(d[i+(e[b+44>>1]|0)|0]|0)<<15|(d[i+(e[h+46>>1]|0)|0]|0)<<23;b=0;i=a[j]|0}else{b=-1}if((i<<24>>24|1768910848|0)!=(f|0)){l=b;return l|0}l=g;a[h+90|0]=(c[l>>2]|0)>>>7;a[h+91|0]=(c[l>>2]|0)>>>15;l=0;return l|0}f=g;i=c[f>>2]|0;j=i&511;do{if((j|0)!=(e[h+42>>1]|0|0)){if((j|0)==(e[h+46>>1]|0|0)){break}if((j|0)==(e[b+44>>1]|0|0)){break}else{b=-1}return b|0}}while(0);h=b+24|0;do{if((i&1044480|0)==1044480){g=g+4|0;c[g>>2]=(c[h>>2]|0)+192;b=1}else{g=g+4|0;b=0;j=0;while(1){if((1<<j&255&i>>>12|0)!=0){c[g+(b<<2)>>2]=(c[h>>2]|0)+(((i>>>9&7)+j|0)*24|0);b=b+1|0}j=j+1|0;if((j|0)>=8){break}i=c[f>>2]|0}if((b|0)<8){break}return b|0}}while(0);c[g+(b<<2)>>2]=0;l=b;return l|0}function Cd(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+64|0;h=e&255;if((a[(c[b+5888>>2]|0)+(d&65535)|0]|0)!=e<<24>>24){j=g|0;l=(zb(28712,a[f+40|0]|0,6)|0)-28712|0;Wa(j|0,28528,(k=i,i=i+16|0,c[k>>2]=l,c[k+8>>2]=h,k)|0)|0;i=k;xb(j|0)}Ac(b,d,e);Te((c[f+24>>2]|0)+240|0,h);Gd(f);i=g;return}function Dd(b,d,f){b=b|0;d=d|0;f=f|0;var g=0,h=0;g=c[b+5888>>2]|0;h=a[g+(e[f+44>>1]|0)|0]|0;a[g+(d&65535)|0]=a[g+(e[f+42>>1]|0)|0]&h|a[g+(e[f+46>>1]|0)|0]&~h;b=Bc(b,d)|0;Te((c[f+24>>2]|0)+264|0,b&255);return b|0}function Ed(d,e,f,g){d=d|0;e=e|0;f=f|0;g=g|0;e=b[g+42>>1]|0;Cd(d,e,a[(c[d+5888>>2]|0)+(e&65535)|0]^f,g);return}function Fd(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;Te((c[e+24>>2]|0)+216|0,d&255);Ac(a,b,d);Gd(e);return}function Gd(b){b=b|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0;f=(c[b+4>>2]|0)+5888|0;i=a[(c[f>>2]|0)+(e[b+44>>1]|0)|0]|0;l=i&255;j=b+90|0;h=b+42|0;g=b+24|0;k=b+91|0;m=0;do{n=1<<m;do{if((n&l|0)==0){if(((d[j]|0)&n|0)!=0){Te((c[g>>2]|0)+(m*24|0)|0,(d[k]|0)>>>(m>>>0)&1);break}if(((d[(c[f>>2]|0)+(e[h>>1]|0)|0]|0)&n|0)==0){break}Te((c[g>>2]|0)+(m*24|0)|0,1)}else{Te((c[g>>2]|0)+(m*24|0)|0,(d[(c[f>>2]|0)+(e[h>>1]|0)|0]|0)>>>(m>>>0)&1)}}while(0);m=m+1|0;}while((m|0)<8);n=c[f>>2]|0;Te((c[g>>2]|0)+192|0,((a[n+(e[h>>1]|0)|0]&i|a[n+(e[b+46>>1]|0)|0]&~i)&~a[j]|a[k])&255);return}function Hd(a){a=a|0;Se(c[a+24>>2]|0,16,a);return}function Id(c,d){c=c|0;d=d|0;var e=0,f=0;f=d|0;e=d;af(e|0,29704,40)|0;He(c,f);Wc(c,d+80|0);Me(f,a[d+40|0]|1936746752,2,0)|0;d=d+48|0;Je(c,b[d>>1]|0,22,e);Ie(c,b[d>>1]|0,20,e);return}function Jd(b,f,g){b=b|0;f=f|0;g=g|0;var h=0,i=0,j=0;j=c[g+4>>2]|0;i=c[g+56>>2]|0;h=i&511;if(h<<16>>16==0){return}b=j+5888|0;if(((d[(c[b>>2]|0)+(h&65535)|0]|0)>>>((i>>>9&7)>>>0)&i>>>12&255)<<24>>24==0){return}a[g+120|0]=f;Yc(j,g+80|0)|0;f=c[g+60>>2]|0;h=f&511;do{if(h<<16>>16==0){b=c[b>>2]|0}else{b=c[b>>2]|0;if(((d[b+(h&65535)|0]|0)>>>((f>>>9&7)>>>0)&f>>>12&255)<<24>>24==0){break}return}}while(0);Te((c[g+24>>2]|0)+24|0,d[b+(e[g+48>>1]|0)|0]|0);return}function Kd(a,e,f,g){a=a|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;h=i;i=i+64|0;if((b[g+48>>1]|0)!=e<<16>>16){i=h;return}k=g+88|0;k=d[k]|d[k+1|0]<<8|d[k+2|0]<<16|d[k+3|0]<<24|0;j=k&511;Ac(a,j,((k>>>12&255)<<(k>>>9&7)^255)&d[(c[a+5888>>2]|0)+(j&65535)|0]&255);j=h|0;Wa(j|0,27968,(k=i,i=i+8|0,c[k>>2]=f&255,k)|0)|0;i=k;xb(j|0);Ac(a,e,f);Kc(a,100,12,g);i=h;return}function Ld(b,e,f){b=b|0;e=e|0;f=f|0;var g=0;g=f+120|0;e=a[g]|0;a[g]=0;g=f+88|0;g=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;f=g&511;Ac(b,f,((g>>>12&255)<<(g>>>9&7)^255)&(d[(c[b+5888>>2]|0)+(f&65535)|0]|0)&255);return e|0}function Md(a,b,f,g){a=a|0;b=b|0;f=f|0;g=g|0;var h=0,i=0;h=c[g+56>>2]|0;i=h&511;do{if(i<<16>>16!=0){b=a+5888|0;f=c[b>>2]|0;if(((d[f+(i&65535)|0]|0)>>>((h>>>9&7)>>>0)&h>>>12&255)<<24>>24==0){break}i=c[g+60>>2]|0;h=i&511;if(h<<16>>16==0){break}if(((d[f+(h&65535)|0]|0)>>>((i>>>9&7)>>>0)&i>>>12&255)<<24>>24==0){break}Yc(a,g+80|0)|0;Te((c[g+24>>2]|0)+24|0,d[(c[b>>2]|0)+(e[g+48>>1]|0)|0]|0)}}while(0);return(F=0,0)|0}function Nd(d,e){d=d|0;e=e|0;var f=0,g=0,h=0,i=0,j=0;g=e|0;f=e;af(f|0,29664,40)|0;He(d,g);Wc(d,e+392|0);Wc(d,e+432|0);Me(g,a[e+40|0]|1953329664,5,0)|0;g=e+24|0;h=(c[g>>2]|0)+16|0;a[h]=a[h]|2;g=(c[g>>2]|0)+40|0;a[g]=a[g]|2;g=e+56|0;h=c[g>>2]&511;if((h|0)!=0){Je(d,h&65535,30,f)}h=e+60|0;i=c[h>>2]&511;do{if((i|0)!=0){if((i|0)==(c[g>>2]&511|0)){break}Je(d,i&65535,30,f)}}while(0);i=e+64|0;j=c[i>>2]&511;do{if((j|0)!=0){if((j|0)==(c[g>>2]&511|0)){break}if((j|0)==(c[h>>2]&511|0)){break}Je(d,j&65535,30,f)}}while(0);j=c[e+68>>2]&511;do{if((j|0)!=0){if((j|0)==(c[g>>2]&511|0)){break}if((j|0)==(c[h>>2]&511|0)){break}if((j|0)==(c[i>>2]&511|0)){break}Je(d,j&65535,30,f)}}while(0);g=e+152|0;Je(d,c[g>>2]&511,30,f);h=e+156|0;i=c[h>>2]&511;do{if((i|0)!=0){if((i|0)==(c[g>>2]&511|0)){break}Je(d,i&65535,30,f)}}while(0);i=e+160|0;j=c[i>>2]&511;do{if((j|0)!=0){if((j|0)==(c[g>>2]&511|0)){break}if((j|0)==(c[h>>2]&511|0)){break}Je(d,j&65535,30,f)}}while(0);j=c[e+164>>2]&511;do{if((j|0)!=0){if((j|0)==(c[g>>2]&511|0)){break}if((j|0)==(c[h>>2]&511|0)){break}if((j|0)==(c[i>>2]&511|0)){break}Je(d,j&65535,30,f)}}while(0);g=c[e+148>>2]&511;if((g|0)!=0){Je(d,g&65535,30,f)}Je(d,c[e+400>>2]&511,14,f);g=e+200|0;c[e+240>>2]=e;Wc(d,g|0);h=b[e+244>>1]|0;if(h<<16>>16!=0){Je(d,h,26,g|0)}g=e+264|0;c[e+304>>2]=e;Wc(d,g|0);h=b[e+308>>1]|0;if(h<<16>>16!=0){Je(d,h,26,g|0)}h=e+328|0;c[e+368>>2]=e;Wc(d,h|0);g=b[e+372>>1]|0;if(g<<16>>16==0){j=e+48|0;i=b[j>>1]|0;Je(d,i,2,f);j=b[j>>1]|0;Ie(d,j,22,f);return}Je(d,g,26,h|0);j=e+48|0;i=b[j>>1]|0;Je(d,i,2,f);j=b[j>>1]|0;Ie(d,j,22,f);return}function Od(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;b=i;i=i+80|0;h=b|0;d=b+40|0;f=a+4|0;j=c[f>>2]|0;e=a;Jc(j,18,e);Jc(j,24,e);Jc(j,26,e);Jc(j,28,e);j=h|0;k=h;g=a+24|0;h=h+4|0;l=a+256|0;c[l>>2]=0;c[l+4>>2]=0;$e(j|0,0,36)|0;c[k>>2]=c[a+252>>2];if((Ge(c[f>>2]|0,1768908658,j)|0)>0){Ue((c[g>>2]|0)+48|0,c[h>>2]|0)}l=a+320|0;c[l>>2]=0;c[l+4>>2]=0;$e(j|0,0,36)|0;c[k>>2]=c[a+316>>2];if((Ge(c[f>>2]|0,1768908658,j)|0)>0){Ue((c[g>>2]|0)+72|0,c[h>>2]|0)}l=a+384|0;c[l>>2]=0;c[l+4>>2]=0;$e(j|0,0,36)|0;c[k>>2]=c[a+380>>2];if((Ge(c[f>>2]|0,1768908658,j)|0)>0){Ue((c[g>>2]|0)+96|0,c[h>>2]|0)}l=d|0;$e(l|0,0,36)|0;c[d>>2]=c[a+188>>2];if((Ge(c[f>>2]|0,1768908658,l)|0)<=0){i=b;return}Se(c[d+4>>2]|0,10,e);i=b;return}function Pd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=Zd(d,b,c,0)|0;return(F=F,a)|0}function Qd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=Zd(d,b,c,1)|0;return(F=F,a)|0}function Rd(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=Zd(d,b,c,2)|0;return(F=F,a)|0}function Sd(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;h=i;v=g+148|0;k=c[v>>2]|0;j=k&511;if(j<<16>>16==0){j=0;k=b+5888|0}else{x=b+5888|0;j=(d[(c[x>>2]|0)+(j&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255;k=x}u=g+152|0;l=c[u>>2]|0;m=l&511;if((m|0)==0){l=0}else{l=(d[(c[k>>2]|0)+m|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255}r=g+156|0;n=c[r>>2]|0;m=n&511;if((m|0)!=0){l=(((d[(c[k>>2]|0)+m|0]|0)>>>((n>>>9&7)>>>0)&n>>>12)<<1|l&255)&255}t=g+160|0;n=c[t>>2]|0;m=n&511;if((m|0)!=0){l=(((d[(c[k>>2]|0)+m|0]|0)>>>((n>>>9&7)>>>0)&n>>>12)<<2|l&255)&255}s=g+164|0;n=c[s>>2]|0;m=n&511;if((m|0)!=0){l=(((d[(c[k>>2]|0)+m|0]|0)>>>((n>>>9&7)>>>0)&n>>>12)<<3|l&255)&255}q=g+56|0;n=c[q>>2]|0;m=n&511;if((m|0)==0){n=0}else{n=(d[(c[k>>2]|0)+m|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255}o=g+60|0;m=c[o>>2]|0;p=m&511;if((p|0)!=0){n=(((d[(c[k>>2]|0)+p|0]|0)>>>((m>>>9&7)>>>0)&m>>>12)<<1|n&255)&255}p=g+64|0;m=c[p>>2]|0;w=m&511;if((w|0)!=0){n=(((d[(c[k>>2]|0)+w|0]|0)>>>((m>>>9&7)>>>0)&m>>>12)<<2|n&255)&255}m=g+68|0;w=c[m>>2]|0;x=w&511;if((x|0)!=0){n=(((d[(c[k>>2]|0)+x|0]|0)>>>((w>>>9&7)>>>0)&w>>>12)<<3|n&255)&255}Ac(b,e,f);v=c[v>>2]|0;f=v&511;if(f<<16>>16==0){f=0}else{f=(d[(c[k>>2]|0)+(f&65535)|0]|0)>>>((v>>>9&7)>>>0)&v>>>12&255}v=c[u>>2]|0;u=v&511;if((u|0)==0){u=0}else{u=(d[(c[k>>2]|0)+u|0]|0)>>>((v>>>9&7)>>>0)&v>>>12&255}r=c[r>>2]|0;v=r&511;if((v|0)==0){r=u}else{r=(((d[(c[k>>2]|0)+v|0]|0)>>>((r>>>9&7)>>>0)&r>>>12)<<1|u&255)&255}t=c[t>>2]|0;u=t&511;if((u|0)!=0){r=(((d[(c[k>>2]|0)+u|0]|0)>>>((t>>>9&7)>>>0)&t>>>12)<<2|r&255)&255}s=c[s>>2]|0;t=s&511;if((t|0)!=0){r=(((d[(c[k>>2]|0)+t|0]|0)>>>((s>>>9&7)>>>0)&s>>>12)<<3|r&255)&255}q=c[q>>2]|0;s=q&511;if((s|0)==0){q=0}else{q=(d[(c[k>>2]|0)+s|0]|0)>>>((q>>>9&7)>>>0)&q>>>12&255}o=c[o>>2]|0;s=o&511;if((s|0)!=0){q=(((d[(c[k>>2]|0)+s|0]|0)>>>((o>>>9&7)>>>0)&o>>>12)<<1|q&255)&255}o=c[p>>2]|0;p=o&511;if((p|0)!=0){q=(((d[(c[k>>2]|0)+p|0]|0)>>>((o>>>9&7)>>>0)&o>>>12)<<2|q&255)&255}m=c[m>>2]|0;o=m&511;if((o|0)!=0){q=(((d[(c[k>>2]|0)+o|0]|0)>>>((m>>>9&7)>>>0)&m>>>12)<<3|q&255)&255}if(r<<24>>24==l<<24>>24&q<<24>>24==n<<24>>24&f<<24>>24==j<<24>>24){i=h;return}if(f<<24>>24==0){j=c[b+40>>2]|0}else{j=32768}if(r<<24>>24==0){w=g+256|0;c[w>>2]=0;c[w+4>>2]=0;w=g+320|0;c[w>>2]=0;c[w+4>>2]=0;w=g+384|0;c[w>>2]=0;c[w+4>>2]=0;w=g+472|0;c[w>>2]=0;c[w+4>>2]=0;Jc(b,18,g);Jc(b,24,g);Jc(b,26,g);Jc(b,28,g);w=a[g+40|0]|0;gc(b,3,25344,(x=i,i=i+16|0,c[x>>2]=30200,c[x+8>>2]=w,x)|0);i=x;i=h;return}else{c[g+184>>2]=j>>d[g+((r&255)+168)|0];x=c[g+72+((q&255)<<2)>>2]|0;c[g+136>>2]=x;c[g+140>>2]=x>>>24;c[g+144>>2]=(1<<(x>>>16&255))-1;_d(g);i=h;return}}function Td(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=f+392|0;h=c[f+400>>2]|0;i=h&511;if(i<<16>>16==0){h=0}else{h=(d[(c[a+5888>>2]|0)+(i&65535)|0]|0)>>>((h>>>9&7)>>>0)&h>>>12&255}i=f+432|0;j=c[f+440>>2]|0;k=j&511;if(k<<16>>16==0){j=0;l=a+5888|0}else{l=a+5888|0;j=(d[(c[l>>2]|0)+(k&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255}k=f+200|0;m=c[f+208>>2]|0;n=m&511;if(n<<16>>16==0){m=0}else{m=(d[(c[l>>2]|0)+(n&65535)|0]|0)>>>((m>>>9&7)>>>0)&m>>>12&255}n=c[f+272>>2]|0;o=n&511;if(o<<16>>16==0){p=0}else{p=(d[(c[l>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255}n=c[f+336>>2]|0;o=n&511;if(o<<16>>16==0){o=0;Ac(a,b,e);_c(a,g,h)|0;_c(a,i,j)|0;n=k;_c(a,n,m)|0;n=f+264|0;_c(a,n,p)|0;p=f+328|0;_c(a,p,o)|0;return}o=(d[(c[l>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255;Ac(a,b,e);_c(a,g,h)|0;_c(a,i,j)|0;n=k;_c(a,n,m)|0;n=f+264|0;_c(a,n,p)|0;p=f+328|0;_c(a,p,o)|0;return}function Ud(f,g,h,j){f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0;l=i;k=c[j+40>>2]|0;n=f+5888|0;o=c[n>>2]|0;m=j+44|0;j=j+46|0;p=b[j>>1]|0;if(p<<16>>16==0){p=0}else{p=d[o+(p&65535)|0]<<8}o=p|d[o+(e[m>>1]|0)|0];Ac(f,g,h);switch(c[k+140>>2]|0){case 2:{_d(k);i=l;return};case 3:{if((c[k+136>>2]&255|0)==1){_d(k);n=k+24|0;m=k+4|0}else{n=k+24|0;m=k+4|0;j=c[(c[m>>2]|0)+5888>>2]|0;h=b[k+246>>1]|0;if(h<<16>>16==0){h=0}else{h=d[j+(h&65535)|0]<<8}Te(c[n>>2]|0,(h|d[j+(e[k+244>>1]|0)|0])&65535)}m=c[(c[m>>2]|0)+5888>>2]|0;j=b[k+310>>1]|0;if(j<<16>>16==0){j=0}else{j=d[m+(j&65535)|0]<<8}Te((c[n>>2]|0)+24|0,(j|d[m+(e[k+308>>1]|0)|0])&65535);i=l;return};case 1:{_d(k);i=l;return};case 4:{n=c[n>>2]|0;j=b[j>>1]|0;if(j<<16>>16==0){j=0}else{j=d[n+(j&65535)|0]<<8}if(o<<16>>16!=(j|d[n+(e[m>>1]|0)|0])<<16>>16){_d(k)}m=k+24|0;j=k+4|0;n=c[(c[j>>2]|0)+5888>>2]|0;h=b[k+246>>1]|0;if(h<<16>>16==0){h=0}else{h=d[n+(h&65535)|0]<<8}Te(c[m>>2]|0,(h|d[n+(e[k+244>>1]|0)|0])&65535);n=c[(c[j>>2]|0)+5888>>2]|0;j=b[k+310>>1]|0;if(j<<16>>16==0){j=0}else{j=d[n+(j&65535)|0]<<8}Te((c[m>>2]|0)+24|0,(j|d[n+(e[k+308>>1]|0)|0])&65535);i=l;return};case 5:{_d(k);i=l;return};default:{g=a[k+40|0]|0;o=(c[k+136>>2]|0)>>>24;gc(f,2,27856,(p=i,i=i+24|0,c[p>>2]=30176,c[p+8>>2]=g,c[p+16>>2]=o,p)|0);i=p;_d(k);i=l;return}}}function Vd(a,f,g,h){a=a|0;f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0;Ac(a,f,g);g=b[h+52>>1]|0;f=c[(c[h+4>>2]|0)+5888>>2]|0;if(g<<16>>16==0){g=0}else{g=(d[f+(g&65535)|0]|0)<<8}j=g|(d[f+(e[h+48>>1]|0)|0]|0);i=h+488|0;f=b[i>>1]|0;if(f<<16>>16==0){return}k=(j&65535)>>>0<(f&65535)>>>0;Jc(a,18,h);Jc(a,24,h);Jc(a,26,h);Jc(a,28,h);f=h+472|0;g=c[f>>2]|0;f=c[f+4>>2]|0;j=of(g,f,k?j&65535:0,k?0:0)|0;i=pf(j,F,e[i>>1]|0,0)|0;j=F;k=0;if(!(f>>>0>k>>>0|f>>>0==k>>>0&g>>>0>1>>>0)){return}k=ef(g,f,i,j)|0;Ic(a,k,F,18,h);k=h+480|0;c[k>>2]=0;c[k+4>>2]=0;k=a+56|0;k=ef(c[k>>2]|0,c[k+4>>2]|0,i,j)|0;Xd(a,k,F,h)|0;return}function Wd(d,f,g){d=d|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;h=g+472|0;i=c[h>>2]|0;h=c[h+4>>2]|0;if((i|0)==0&(h|0)==0){h=0;j=0}else{k=(c[g+4>>2]|0)+56|0;j=g+480|0;j=ef(c[k>>2]|0,c[k+4>>2]|0,c[j>>2]|0,c[j+4>>2]|0)|0;j=of((e[g+488>>1]|0)+1|0,0,j,F)|0;j=pf(j,F,i,h)|0;h=(j&65535)>>>8&255;j=j&255}i=d+5888|0;a[(c[i>>2]|0)+(e[g+48>>1]|0)|0]=j;g=b[g+52>>1]|0;if(g<<16>>16==0){k=Bc(d,f)|0;return k|0}a[(c[i>>2]|0)+(g&65535)|0]=h;k=Bc(d,f)|0;return k|0}function Xd(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;g=f;h=f+480|0;if((c[h>>2]|0)==0&(c[h+4>>2]|0)==0){c[h>>2]=b;c[h+4>>2]=e;i=f+200|0;j=f+472|0;k=f+4|0;h=f+24|0;m=0;do{l=i+(m<<6)+56|0;n=c[l>>2]|0;o=c[l+4>>2]|0;do{if(!((n|0)==0&(o|0)==0)){q=c[j+4>>2]|0;if(!(o>>>0<q>>>0|o>>>0==q>>>0&n>>>0<(c[j>>2]|0)>>>0)){break}n=c[g+200+(m<<6)+48>>2]|0;o=n&511;do{if(o<<16>>16!=0){o=n>>>12&255&(d[(c[(c[k>>2]|0)+5888>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0);n=(c[h>>2]|0)+((m+2|0)*24|0)|0;if((o|0)==2){Te(n,1);break}else if((o|0)==3){Te(n,0);break}else{break}}}while(0);Ic(a,c[l>>2]|0,c[l+4>>2]|0,c[23880+(m<<2)>>2]|0,f)}}while(0);m=m+1|0;}while((m|0)<3);p=j|0;p=c[p>>2]|0;q=j+4|0;q=c[q>>2]|0;q=df(p,q,b,e)|0;p=F;return(F=p,q)|0}Yc(a,f+392|0)|0;c[h>>2]=b;c[h+4>>2]=e;i=f+200|0;j=f+472|0;h=f+4|0;k=f+24|0;m=0;do{l=i+(m<<6)+56|0;n=c[l>>2]|0;o=c[l+4>>2]|0;do{if(!((n|0)==0&(o|0)==0)){p=c[j>>2]|0;q=c[j+4>>2]|0;if(!(o>>>0<q>>>0|o>>>0==q>>>0&n>>>0<p>>>0)){if(!((p|0)==(n|0)&(q|0)==(o|0))){break}Ib[c[23880+(m<<2)>>2]&31](a,b,e,f)|0;break}o=c[g+200+(m<<6)+48>>2]|0;n=o&511;do{if(n<<16>>16!=0){o=o>>>12&255&(d[(c[(c[h>>2]|0)+5888>>2]|0)+(n&65535)|0]|0)>>>((o>>>9&7)>>>0);n=(c[k>>2]|0)+((m+2|0)*24|0)|0;if((o|0)==3){Te(n,0);break}else if((o|0)==2){Te(n,1);break}else{break}}}while(0);Ic(a,c[l>>2]|0,c[l+4>>2]|0,c[23880+(m<<2)>>2]|0,f)}}while(0);m=m+1|0;}while((m|0)<3);p=j|0;p=c[p>>2]|0;q=j+4|0;q=c[q>>2]|0;q=df(p,q,b,e)|0;p=F;return(F=p,q)|0}function Yd(f,g,h){f=f|0;g=g|0;h=h|0;var i=0,j=0,k=0,l=0;i=c[h+4>>2]|0;if((c[h+136>>2]&255|0)==2){return}k=c[h+192>>2]|0;l=k&511;do{if(l<<16>>16==0){f=(c[f+12>>2]|0)==0;g=(g|0)!=0;j=6}else{f=(c[f+12>>2]|0)==0;g=(g|0)!=0;if(((d[(c[i+5888>>2]|0)+(l&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24==0){j=6;break}if(f&g){break}return}}while(0);do{if((j|0)==6){if(!(f|g)){break}return}}while(0);j=h+472|0;g=c[j>>2]|0;j=c[j+4>>2]|0;if((g|0)==0&(j|0)==0){j=0;k=0}else{f=i+56|0;k=h+480|0;k=ef(c[f>>2]|0,c[f+4>>2]|0,c[k>>2]|0,c[k+4>>2]|0)|0;k=of((e[h+488>>1]|0)+1|0,0,k,F)|0;k=pf(k,F,g,j)|0;j=(k&65535)>>>8&255;k=k&255}g=i+5888|0;a[(c[g>>2]|0)+(e[h+50>>1]|0)|0]=k;k=b[h+54>>1]|0;if(k<<16>>16!=0){a[(c[g>>2]|0)+(k&65535)|0]=j}Yc(i,h+432|0)|0;return}function Zd(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0;g=c[a+4>>2]|0;f=f&255;Yc(g,a+200+(f<<6)|0)|0;i=c[a+200+(f<<6)+48>>2]|0;h=i&511;do{if(h<<16>>16!=0){k=i>>>12&255&(d[(c[g+5888>>2]|0)+(h&65535)|0]|0)>>>((i>>>9&7)>>>0);j=f+2|0;i=c[a+24>>2]|0;h=i+(j*24|0)|0;if((k|0)==3){Te(h,1);break}else if((k|0)==1){k=c[a+200+(f<<6)+52>>2]|0;if((k&511|0)==0){Te(h,(c[i+(j*24|0)+12>>2]|0)==0|0);break}i=k&511;if(i<<16>>16==0){g=257}else{g=((d[(c[g+5888>>2]|0)+(i&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24==0|256}Te(h,g);break}else if((k|0)==2){Te(h,0);break}else{break}}}while(0);k=a+472|0;if((c[k>>2]|0)==0&(c[k+4>>2]|0)==0){k=a+200+(f<<6)+56|0;j=c[k>>2]|0;k=c[k+4>>2]|0;a=(j|0)==0&(k|0)==0;e=df(j,k,b,e)|0;return(F=a?0:F,a?0:e)|0}else{return(F=0,0)|0}return 0}function _d(f){f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;j=f+4|0;h=c[j>>2]|0;m=f+256|0;c[m>>2]=0;c[m+4>>2]=0;m=f+320|0;c[m>>2]=0;c[m+4>>2]=0;m=f+384|0;c[m>>2]=0;c[m+4>>2]=0;m=f+472|0;c[m>>2]=0;c[m+4>>2]=0;m=f;Jc(h,18,m);Jc(h,24,m);Jc(h,26,m);Jc(h,28,m);switch(c[f+140>>2]|0){case 5:{$d(f,c[f+184>>2]|0,c[f+144>>2]|0);i=g;return};case 3:{if((c[f+136>>2]&255|0)==1){h=c[(c[j>>2]|0)+5888>>2]|0;j=b[f+246>>1]|0;if(j<<16>>16==0){j=0}else{j=d[h+(j&65535)|0]<<8}h=j|d[h+(e[f+244>>1]|0)|0]}else{h=c[(c[j>>2]|0)+5888>>2]|0;if((b[f+52>>1]|0)==0){j=0}else{j=d[h+(e[f+54>>1]|0)|0]<<8}h=j|d[h+(e[f+50>>1]|0)|0]}$d(f,c[f+184>>2]|0,h&65535);i=g;return};case 1:{$d(f,c[f+184>>2]|0,c[f+144>>2]|0);i=g;return};case 4:{$d(f,c[f+184>>2]|0,c[f+144>>2]|0);i=g;return};case 2:{h=c[(c[j>>2]|0)+5888>>2]|0;j=b[f+246>>1]|0;if(j<<16>>16==0){j=0}else{j=d[h+(j&65535)|0]<<8}$d(f,c[f+184>>2]|0,(j|d[h+(e[f+244>>1]|0)|0])&65535);i=g;return};default:{j=h+5888|0;l=c[f+56>>2]|0;k=l&511;if((k|0)==0){k=0}else{k=(d[(c[j>>2]|0)+k|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255}l=c[f+60>>2]|0;m=l&511;if((m|0)!=0){k=(((d[(c[j>>2]|0)+m|0]|0)>>>((l>>>9&7)>>>0)&l>>>12)<<1|k&255)&255}m=c[f+64>>2]|0;l=m&511;if((l|0)!=0){k=(((d[(c[j>>2]|0)+l|0]|0)>>>((m>>>9&7)>>>0)&m>>>12)<<2|k&255)&255}l=c[f+68>>2]|0;m=l&511;if((m|0)!=0){k=(((d[(c[j>>2]|0)+m|0]|0)>>>((l>>>9&7)>>>0)&l>>>12)<<3|k&255)&255}j=a[f+40|0]|0;l=(c[f+136>>2]|0)>>>24;gc(h,2,29032,(m=i,i=i+32|0,c[m>>2]=30216,c[m+8>>2]=j,c[m+16>>2]=k&255,c[m+24>>2]=l,m)|0);i=m;i=g;return}}}function $d(e,f,g){e=e|0;f=f|0;g=g|0;var j=0,k=0,l=0.0,m=0.0,n=0,o=0,p=0,q=0,r=0.0,s=0,t=0.0,u=0;j=i;l=+(f>>>0>>>0);r=l/+((g+1|0)>>>0>>>0);f=e+4|0;q=c[f>>2]|0;p=q+40|0;m=+((c[p>>2]|0)>>>0>>>0);k=e+472|0;b[e+488>>1]=g;t=m/r;o=~~+t>>>0;s=(E=+t,+Q(E)>=1.0?E>0.0?(ga(+P(E/4294967296.0),4294967295.0)|0)>>>0:~~+aa((E- +(~~E>>>0))/4294967296.0)>>>0:0);c[k>>2]=o;c[k+4>>2]=s;n=e+40|0;u=a[n]|0;p=c[p>>2]|0;s=of(o,s,1e6,0)|0;p=pf(s,F,p,0)|0;gc(q,3,27288,(s=i,i=i+40|0,c[s>>2]=30240,c[s+8>>2]=u,h[s+16>>3]=r,c[s+24>>2]=o,c[s+32>>2]=p,s)|0);i=s;o=0;do{p=b[e+200+(o<<6)+44>>1]|0;do{if(p<<16>>16!=0){q=c[(c[f>>2]|0)+5888>>2]|0;s=b[e+200+(o<<6)+46>>1]|0;if(s<<16>>16==0){s=0}else{s=d[q+(s&65535)|0]<<8}s=s|d[q+(p&65535)|0];u=s&65535;r=l/+((u+1|0)>>>0>>>0);p=e+200+(o<<6)+56|0;c[p>>2]=0;c[p+4>>2]=0;if(s<<16>>16==0|u>>>0>g>>>0){break}t=m/r;q=~~+t>>>0;s=(E=+t,+Q(E)>=1.0?E>0.0?(ga(+P(E/4294967296.0),4294967295.0)|0)>>>0:~~+aa((E- +(~~E>>>0))/4294967296.0)>>>0:0);c[p>>2]=q;c[p+4>>2]=s;s=a[n]|0;gc(c[f>>2]|0,3,26088,(u=i,i=i+40|0,c[u>>2]=30240,c[u+8>>2]=s,c[u+16>>2]=o+65,h[u+24>>3]=r,c[u+32>>2]=q,u)|0);i=u}}while(0);o=o+1|0;}while((o|0)<3);g=c[k>>2]|0;k=c[k+4>>2]|0;u=0;if(!(k>>>0>u>>>0|k>>>0==u>>>0&g>>>0>1>>>0)){i=j;return}u=e;Ic(c[f>>2]|0,g,k,18,u);q=e+480|0;c[q>>2]=0;c[q+4>>2]=0;q=c[f>>2]|0;s=q+56|0;Xd(q,c[s>>2]|0,c[s+4>>2]|0,u)|0;i=j;return}function ae(b){b=b|0;Se(c[b+24>>2]|0,20,b);a[b+129|0]=0;a[b+128|0]=0;return}function be(d,e){d=d|0;e=e|0;var f=0,g=0;g=e|0;f=e;af(f|0,29624,40)|0;He(d,g);Wc(d,e+88|0);Me(g,a[e+40|0]|1953982720,3,0)|0;Je(d,c[e+60>>2]&511,44,f);g=e+58|0;Je(d,b[g>>1]|0,46,f);Ie(d,b[g>>1]|0,26,f);Je(d,c[e+80>>2]&511,38,f);return}function ce(b,f,g){b=b|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;j=i;h=g+4|0;b=c[h>>2]|0;m=c[g+60>>2]|0;l=m&511;if(l<<16>>16==0){i=j;return}k=b+5888|0;if(((d[(c[k>>2]|0)+(l&65535)|0]|0)>>>((m>>>9&7)>>>0)&m>>>12&255)<<24>>24==0){i=j;return}gc(b,3,28032,(l=i,i=i+16|0,c[l>>2]=29992,c[l+8>>2]=f,l)|0);i=l;l=f>>>8;do{if((l&1|0)!=0){o=g+128|0;a[o]=0;m=g+129|0;a[m]=0;if((l&4|0)==0){gc(b,3,27704,(o=i,i=i+1|0,i=i+7&-8,c[o>>2]=0,o)|0);i=o;break}t=c[k>>2]|0;p=(d[t+(e[g+56>>1]|0)|0]|0)^510;n=p>>>1;r=f>>>16;q=g+54|0;t=(d[t+(e[q>>1]|0)|0]|0)>>>1;gc(b,3,27896,(s=i,i=i+24|0,c[s>>2]=r&255,c[s+8>>2]=t,c[s+16>>2]=n,s)|0);i=s;r=n&r;n=r&255;a[m]=n;if((r|0)!=(((d[(c[k>>2]|0)+(e[q>>1]|0)|0]|0)&p)>>>1|0)){break}a[o]=64;o=(l&16|0)!=0;if(!o){a[m]=n|1}a[g+130|0]=o?96:-88;Kc(c[h>>2]|0,9,8,g)}}while(0);if((l&2|0)!=0){a[g+130|0]=(l&16|0)!=0?96:-88;Kc(c[h>>2]|0,9,8,g)}do{if((l&8|0)==0){m=a[g+128|0]|0}else{t=f>>>24&1;gc(b,3,27200,(n=i,i=i+8|0,c[n>>2]=t,n)|0);i=n;n=g+128|0;m=a[n]|0;if((t|0)==0){m=m&-9;a[n]=m;break}else{m=m|8;a[n]=m;break}}}while(0);if((m&64)==0){if((l&32|0)==0){i=j;return}t=f>>>24;gc(b,3,27032,(s=i,i=i+8|0,c[s>>2]=t,s)|0);i=s;a[(c[k>>2]|0)+(e[g+58>>1]|0)|0]=t;i=j;return}else{if((l&16|0)==0){i=j;return}a[(c[k>>2]|0)+(e[g+58>>1]|0)|0]=f>>>24;a[g+130|0]=-128;Kc(c[h>>2]|0,9,8,g);i=j;return}}function de(f,g,h,j){f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;k=i;u=j+60|0;l=c[u>>2]|0;m=l&511;if(m<<16>>16==0){t=0}else{t=(d[(c[f+5888>>2]|0)+(m&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255}l=j+68|0;n=c[l>>2]|0;m=n&511;if(m<<16>>16==0){o=0}else{o=(d[(c[f+5888>>2]|0)+(m&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255}m=j+72|0;n=c[m>>2]|0;p=n&511;if(p<<16>>16==0){q=0}else{q=(d[(c[f+5888>>2]|0)+(p&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255}p=j+88|0;s=j+96|0;r=c[s>>2]|0;n=r&511;if(n<<16>>16==0){r=0}else{r=(d[(c[f+5888>>2]|0)+(n&65535)|0]|0)>>>((r>>>9&7)>>>0)&r>>>12&255}Ac(f,g,h);g=c[l>>2]|0;n=g&511;if(n<<16>>16==0){w=0}else{w=g>>>12&255&(d[(c[f+5888>>2]|0)+(n&65535)|0]|0)>>>((g>>>9&7)>>>0)}g=c[m>>2]|0;n=g&511;if(n<<16>>16==0){x=0}else{x=g>>>12&255&(d[(c[f+5888>>2]|0)+(n&65535)|0]|0)>>>((g>>>9&7)>>>0)}n=j+64|0;v=c[n>>2]|0;g=v&511;if(g<<16>>16==0){y=0}else{y=v>>>12&255&(d[(c[f+5888>>2]|0)+(g&65535)|0]|0)>>>((v>>>9&7)>>>0)}g=c[s>>2]|0;v=g&511;if(v<<16>>16==0){z=0}else{z=g>>>12&255&(d[(c[f+5888>>2]|0)+(v&65535)|0]|0)>>>((g>>>9&7)>>>0)}v=j+80|0;A=c[v>>2]|0;g=A&511;if(g<<16>>16==0){A=0}else{A=(d[(c[(c[j+4>>2]|0)+5888>>2]|0)+(g&65535)|0]|0)&(A>>>12&255)<<(A>>>9&7)}g=j+128|0;C=d[g]|0;gc(f,3,27528,(B=i,i=i+64|0,c[B>>2]=29976,c[B+8>>2]=h&255,c[B+16>>2]=w,c[B+24>>2]=x,c[B+32>>2]=y,c[B+40>>2]=z,c[B+48>>2]=A,c[B+56>>2]=C,B)|0);i=B;h=c[u>>2]|0;u=h&511;if(u<<16>>16==0){u=0}else{u=(d[(c[f+5888>>2]|0)+(u&65535)|0]|0)>>>((h>>>9&7)>>>0)&h>>>12&255}do{if(t<<24>>24!=u<<24>>24){u=t<<24>>24==0;t=u&1;if(u){h=f+5888|0}else{w=d[n]|d[n+1|0]<<8|d[n+2|0]<<16|d[n+3|0]<<24|0;x=w&511;h=f+5888|0;Ac(f,x,((w>>>12&255)<<(w>>>9&7)^255)&(d[(c[h>>2]|0)+(x&65535)|0]|0)&255);x=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;w=x&511;Ac(f,w,((x>>>12&255)<<(x>>>9&7)^255)&(d[(c[h>>2]|0)+(w&65535)|0]|0)&255);w=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;x=w&511;Ac(f,x,((w>>>12&255)<<(w>>>9&7)^255)&(d[(c[h>>2]|0)+(x&65535)|0]|0)&255);Zc(f,p);Ac(f,b[j+58>>1]|0,-1);x=j+4|0;w=c[x>>2]|0;y=d[v]|d[v+1|0]<<8|d[v+2|0]<<16|d[v+3|0]<<24|0;v=y&511;if(v<<16>>16!=0){C=(y>>>12&255)<<(y>>>9&7);Ac(w,v,((d[(c[w+5888>>2]|0)+(v&65535)|0]|0)&(C^255)|C&248)&255);w=c[x>>2]|0}gc(w,3,28512,(C=i,i=i+16|0,c[C>>2]=30112,c[C+8>>2]=248,C)|0);i=C;Te((c[j+24>>2]|0)+48|0,248);a[g]=0;a[j+129|0]=0}gc(f,3,28984,(C=i,i=i+8|0,c[C>>2]=u&1,C)|0);i=C;u=c[h>>2]|0;h=a[u+(e[j+54>>1]|0)|0]|0;if(h<<24>>24==0){break}B=(d[u+(e[j+56>>1]|0)|0]|0)>>>1;gc(f,3,27224,(C=i,i=i+16|0,c[C>>2]=(h&255)>>>1,c[C+8>>2]=B,C)|0);i=C;a[g]=a[g]|64}}while(0);if(t<<24>>24==0){i=k;return}t=c[s>>2]|0;s=t&511;if(s<<16>>16==0){s=0}else{s=(d[(c[f+5888>>2]|0)+(s&65535)|0]|0)>>>((t>>>9&7)>>>0)&t>>>12&255}_c(f,p,r)|0;do{if(q<<24>>24==0){q=c[m>>2]|0;p=q&511;if(p<<16>>16==0){break}r=f+5888|0;if(((d[(c[r>>2]|0)+(p&65535)|0]|0)>>>((q>>>9&7)>>>0)&q>>>12&255)<<24>>24==0){break}gc(f,3,26064,(C=i,i=i+1|0,i=i+7&-8,c[C>>2]=0,C)|0);i=C;if((a[g]&1)!=0){Te((c[j+24>>2]|0)+24|0,(d[j+129|0]|0)<<16|16777728);B=d[m]|d[m+1|0]<<8|d[m+2|0]<<16|d[m+3|0]<<24|0;C=B&511;Ac(f,C,((B>>>12&255)<<(B>>>9&7)^255)&(d[(c[r>>2]|0)+(C&65535)|0]|0)&255)}a[g]=0}}while(0);do{if(o<<24>>24==0){o=c[l>>2]|0;p=o&511;if(p<<16>>16==0){break}if(((d[(c[f+5888>>2]|0)+(p&65535)|0]|0)>>>((o>>>9&7)>>>0)&o>>>12&255)<<24>>24==0){break}gc(f,3,25320,(o=i,i=i+8|0,c[o>>2]=(a[g]&1)!=0?25032:46920,o)|0);i=o;o=j+130|0;if((a[g]&1)==0){a[o]=8;Kc(c[j+4>>2]|0,3,8,j)}else{a[o]=16;Kc(c[j+4>>2]|0,3,8,j)}a[j+129|0]=0;a[g]=1}}while(0);if(s<<24>>24==0){i=k;return}l=c[l>>2]|0;o=l&511;do{if(o<<16>>16!=0){if(((d[(c[f+5888>>2]|0)+(o&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255)<<24>>24==0){break}i=k;return}}while(0);l=c[m>>2]|0;m=l&511;do{if(m<<16>>16!=0){if(((d[(c[f+5888>>2]|0)+(m&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255)<<24>>24==0){break}i=k;return}}while(0);l=j+129|0;o=d[l]|0;m=o&1;n=c[n>>2]|0;p=n&511;if(p<<16>>16==0){n=0}else{n=((d[(c[f+5888>>2]|0)+(p&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255)<<24>>24!=0}q=a[g]|0;C=q&255;p=(C&4|0)!=0;if((C&64|0)!=0){if(!p){a[g]=q|4;Te((c[j+24>>2]|0)+24|0,o<<16|((q<<1&32|(n?12:4))&255)<<8|(d[(c[f+5888>>2]|0)+(e[j+58>>1]|0)|0]|0)<<24);i=k;return}do{if((m|0)==0){gc(f,3,24240,(g=i,i=i+1|0,i=i+7&-8,c[g>>2]=0,g)|0);i=g;g=j+24|0;Te((c[g>>2]|0)+24|0,(d[l]|0)<<16|2048)}else{gc(f,3,24424,(C=i,i=i+1|0,i=i+7&-8,c[C>>2]=0,C)|0);i=C;if((a[g]&16)==0){gc(f,3,24016,(g=i,i=i+1|0,i=i+7&-8,c[g>>2]=0,g)|0);i=g;g=j+24|0;break}else{g=j+24|0;Te((c[g>>2]|0)+24|0,(d[l]|0)<<16|(d[(c[f+5888>>2]|0)+(e[j+58>>1]|0)|0]|0)<<24|10240);break}}}while(0);Te((c[g>>2]|0)+24|0,(d[l]|0)<<16|(n?3072:1024)|(d[(c[f+5888>>2]|0)+(e[j+58>>1]|0)|0]|0)<<24);i=k;return}do{if(p){p=(m|0)!=0;if(p){gc(f,3,29424,(C=i,i=i+8|0,c[C>>2]=o,C)|0);i=C}else{gc(f,3,29264,(C=i,i=i+16|0,c[C>>2]=d[(c[f+5888>>2]|0)+(e[j+58>>1]|0)|0]|0,c[C+8>>2]=o,C)|0);i=C}m=(m<<4)+16|0;if(n){n=(m|8)&255}else{n=m&255}B=a[g]&-9;a[g]=B;m=n&255;gc(f,3,28960,(C=i,i=i+16|0,c[C>>2]=B&255,c[C+8>>2]=m,C)|0);i=C;if((a[g]&n)<<24>>24==0){gc(f,3,24016,(C=i,i=i+1|0,i=i+7&-8,c[C>>2]=0,C)|0);i=C;break}Te((c[j+24>>2]|0)+24|0,(d[l]|0)<<16|m<<8|(d[(c[f+5888>>2]|0)+(e[j+58>>1]|0)|0]|0)<<24);if(p){a[j+130|0]=n&8^88;Kc(c[j+4>>2]|0,9,8,j);break}else{a[j+130|0]=(a[g]&8^8)+40;Kc(c[j+4>>2]|0,9,8,j);break}}else{B=j+58|0;A=f+5888|0;gc(f,3,28680,(C=i,i=i+8|0,c[C>>2]=d[(c[A>>2]|0)+(e[B>>1]|0)|0]|0,C)|0);i=C;C=a[g]|4;a[g]=C;f=a[(c[A>>2]|0)+(e[B>>1]|0)|0]|0;a[l]=f;a[g]=C&-9;Te((c[j+24>>2]|0)+24|0,(f&255)<<16|256);f=a[g]|0;if((a[l]&1)==0){a[j+130|0]=(f&8^8)+24;Kc(c[j+4>>2]|0,9,8,j);break}else{a[g]=f|32;a[j+130|0]=f&8^72;Kc(c[j+4>>2]|0,9,8,j);break}}}while(0);a[g]=a[g]&-17;i=k;return}function ee(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;Ac(b,c,d);b=e+128|0;a[b]=a[b]|16;return}function fe(b,d,f){b=b|0;d=d|0;f=f|0;d=f+128|0;a[d]=a[d]|32;return a[(c[b+5888>>2]|0)+(e[f+58>>1]|0)|0]|0}function ge(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0;f=f+80|0;g=c[f>>2]|0;h=g&511;if(h<<16>>16==0){g=0}else{g=g>>>12&255&(d[(c[a+5888>>2]|0)+(h&65535)|0]|0)>>>((g>>>9&7)>>>0)}Ac(a,b,e);b=d[f]|d[f+1|0]<<8|d[f+2|0]<<16|d[f+3|0]<<24|0;e=b&511;if(e<<16>>16==0){return}f=b>>>12;h=b>>>9&7;Ac(a,e,((d[(c[a+5888>>2]|0)+(e&65535)|0]|0)&((f&255)<<h^255)|(f&g)<<h)&255);return}function he(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;f=i;b=g+130|0;h=a[b]|0;e=g+4|0;j=c[e>>2]|0;l=g+80|0;l=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;k=l&511;if(k<<16>>16==0){h=h&255}else{l=(l>>>12&255)<<(l>>>9&7);h=h&255;Ac(j,k,((d[(c[j+5888>>2]|0)+(k&65535)|0]|0)&(l^255)|l&h)&255);j=c[e>>2]|0}gc(j,3,28512,(l=i,i=i+16|0,c[l>>2]=30112,c[l+8>>2]=h,l)|0);i=l;Te((c[g+24>>2]|0)+48|0,h);Yc(c[e>>2]|0,g+88|0)|0;a[b]=0;i=f;return(F=0,0)|0}function ie(e){e=e|0;var f=0,g=0,h=0,i=0;f=c[e+4>>2]|0;g=e+164|0;do{if((a[g]|0)!=0){h=g+8|0;h=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;g=h&511;if(g<<16>>16==0){break}Ac(f,g,(d[(c[f+5888>>2]|0)+(g&65535)|0]|(h>>>12&255)<<(h>>>9&7))&255)}}while(0);g=e;Se(c[e+24>>2]|0,18,g);Jc(f,20,g);Jc(f,16,g);g=e+204|0;a[g+68|0]=0;b[g+66>>1]=0;b[g+64>>1]=0;g=e+72|0;g=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;h=g&511;if(h<<16>>16==0){g=f+5888|0}else{i=f+5888|0;Ac(f,h,(d[(c[i>>2]|0)+(h&65535)|0]|(g>>>12&255)<<(g>>>9&7))&255);g=i}h=e+76|0;h=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;i=h&511;Ac(f,i,((h>>>12&255)<<(h>>>9&7)^255)&d[(c[g>>2]|0)+(i&65535)|0]&255);i=e+60|0;i=d[i]|d[i+1|0]<<8|d[i+2|0]<<16|d[i+3|0]<<24|0;h=i&511;if(h<<16>>16==0){i=e+280|0;f=100;h=0;g=i|0;c[g>>2]=f;i=i+4|0;c[i>>2]=h;return}Ac(f,h,(d[(c[g>>2]|0)+(h&65535)|0]|(i>>>12&255)<<(i>>>9&7))&255);i=e+280|0;f=100;h=0;g=i|0;c[g>>2]=f;i=i+4|0;c[i>>2]=h;return}function je(d,e){d=d|0;e=e|0;var f=0,g=0,h=0;h=e|0;f=e;af(f|0,29584,40)|0;c[e+276>>2]=3;He(d,h);Wc(d,e+84|0);Wc(d,e+124|0);g=e+164|0;Wc(d,g);Me(h,a[e+40|0]|1969320448,4,0)|0;h=(c[e+24>>2]|0)+88|0;a[h]=a[h]|2;h=e+48|0;Je(d,b[h>>1]|0,24,f);Ie(d,b[h>>1]|0,16,f);Ie(d,c[e+92>>2]&511,12,f);if((a[g|0]|0)!=0){Je(d,c[e+168>>2]&511,40,f)}g=b[e+50>>1]|0;if(g<<16>>16!=0){Je(d,g,40,f)}e=b[e+80>>1]|0;if(e<<16>>16==0){return}Je(d,e,42,f);return}function ke(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0;if((e|0)==0){g=-1;return g|0}f=a[b+40|0]|0;if((f|1969320704|0)==(d|0)){c[b+276>>2]=c[e>>2];g=0}else{g=-1}if((f|1969317632|0)!=(d|0)){return g|0}c[e>>2]=c[b+276>>2];g=0;return g|0}function le(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0;i=c[g+4>>2]|0;e=c[g+56>>2]|0;h=e&511;if(h<<16>>16==0){return}if(((d[(c[i+5888>>2]|0)+(h&65535)|0]|0)>>>((e>>>9&7)>>>0)&e>>>12&255)<<24>>24==0){return}h=g+268|0;j=b[h>>1]|0;e=g+270|0;k=b[e>>1]|0;if(j<<16>>16==k<<16>>16){Kc(i,c[g+280>>2]|0,20,g);i=b[e>>1]|0;j=b[h>>1]|0}else{i=k}k=i+1&63;if(j<<16>>16!=k<<16>>16){a[(i&65535)+(g+204)|0]=f;b[e>>1]=k;j=b[h>>1]|0;i=k}if((i+1&63)!=j<<16>>16){return}Te((c[g+24>>2]|0)+72|0,1);return}function me(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;b=c[f+56>>2]|0;e=b&511;do{if(e<<16>>16!=0){if(((d[(c[a+5888>>2]|0)+(e&65535)|0]|0)>>>((b>>>9&7)>>>0)&b>>>12&255)<<24>>24==0){break}Yc(a,f+84|0)|0}}while(0);return(F=0,0)|0}function ne(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;b=c[f+60>>2]|0;e=b&511;do{if(e<<16>>16!=0){if(((d[(c[a+5888>>2]|0)+(e&65535)|0]|0)>>>((b>>>9&7)>>>0)&b>>>12&255)<<24>>24==0){break}Yc(a,f+164|0)|0;Yc(a,f+124|0)|0}}while(0);return(F=0,0)|0}function oe(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;h=i;Ac(b,e,f);if((a[g+164|0]|0)!=0){k=g+172|0;k=d[k]|d[k+1|0]<<8|d[k+2|0]<<16|d[k+3|0]<<24|0;l=k&511;Ac(b,l,((k>>>12&255)<<(k>>>9&7)^255)&d[(c[b+5888>>2]|0)+(l&65535)|0]&255)}Kc(b,c[g+280>>2]|0,16,g);do{if((c[g+276>>2]&2|0)!=0){e=g+288|0;j=c[e>>2]|0;if((j|0)==0){j=Ve(256)|0;c[e>>2]=j}l=g+292|0;k=c[l>>2]|0;c[l>>2]=k+1;a[j+k|0]=(f&255)>>>0<32>>>0?46:f;a[(c[e>>2]|0)+(c[l>>2]|0)|0]=0;if(f<<24>>24!=10){if((c[l>>2]|0)!=256){break}}c[l>>2]=0;gc(b,3,27184,(l=i,i=i+8|0,c[l>>2]=c[e>>2],l)|0);i=l}}while(0);j=c[g+60>>2]|0;e=j&511;if(e<<16>>16==0){i=h;return}if(((d[(c[b+5888>>2]|0)+(e&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255)<<24>>24==0){i=h;return}Te((c[g+24>>2]|0)+24|0,f&255);i=h;return}function pe(e,f,g){e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0;h=g+92|0;h=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;j=h&511;k=e+5888|0;Ac(e,j,((h>>>12&255)<<(h>>>9&7)^255)&d[(c[k>>2]|0)+(j&65535)|0]&255);j=c[g+56>>2]|0;h=j&511;do{if(h<<16>>16==0){i=c[k>>2]|0}else{i=c[k>>2]|0;if(((d[i+(h&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255)<<24>>24==0){break}h=g+268|0;l=b[h>>1]|0;j=g+270|0;if(l<<16>>16==(b[j>>1]|0)){l=0}else{i=a[g+204+(l&65535)|0]|0;b[h>>1]=l+1&63;l=i;i=c[k>>2]|0}a[i+(f&65535)|0]=l;f=Bc(e,f)|0;if((b[h>>1]|0)==(b[j>>1]|0)){l=f;return l|0}Kc(e,c[g+280>>2]|0,20,g);l=f;return l|0}}while(0);a[i+(f&65535)|0]=0;Bc(e,f)|0;l=0;return l|0}function qe(a,e,f){a=a|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;e=Bc(a,e)|0;h=f+56|0;g=c[h>>2]|0;j=g&511;do{if(j<<16>>16==0){i=1}else{i=c[a+5888>>2]|0;if(((d[i+(j&65535)|0]|0)>>>((g>>>9&7)>>>0)&g>>>12&255)<<24>>24==0){i=1;break}j=c[f+92>>2]|0;k=j&511;if(k<<16>>16==0){i=1;break}i=((d[i+(k&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255)<<24>>24==0|0}}while(0);l=c[f+60>>2]|0;k=l&511;do{if(k<<16>>16==0){j=0}else{j=c[a+5888>>2]|0;if(((d[j+(k&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255)<<24>>24==0){j=0;break}l=c[f+132>>2]|0;k=l&511;if(k<<16>>16==0){j=0;break}j=((d[j+(k&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255)<<24>>24!=0}}while(0);if(!((c[f+276>>2]&1|0)==0|(i|0)==0|j)){Ka(1)|0;g=c[h>>2]|0}h=g&511;if(h<<16>>16==0){return e|0}if(((d[(c[a+5888>>2]|0)+(h&65535)|0]|0)>>>((g>>>9&7)>>>0)&g>>>12&255)<<24>>24==0){return e|0}if((b[f+268>>1]|0)!=(b[f+270>>1]|0)){return e|0}l=f+24|0;Te((c[l>>2]|0)+72|0,0);Te((c[l>>2]|0)+48|0,1);return e|0}function re(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0;j=g+164|0;i=j;if((a[j]|0)==0){return}h=e&65535;k=g+168|0;m=c[k>>2]|0;do{if((h|0)==(m&511|0)){l=m&511;if(l<<16>>16==0){l=0}else{l=(d[(c[b+5888>>2]|0)+(l&65535)|0]|0)>>>((m>>>9&7)>>>0)&m>>>12&255}Ac(b,e,f);e=c[k>>2]|0;k=e&511;if(k<<16>>16==0){break}if(l<<24>>24!=0|((d[(c[b+5888>>2]|0)+(k&65535)|0]|0)>>>((e>>>9&7)>>>0)&e>>>12&255)<<24>>24==0){break}m=Lc(b,16,g)|0;if(!((m|0)==0&(F|0)==0)){break}Yc(b,i)|0}}while(0);if((a[j]|0)==0){return}if((h|0)!=(c[g+172>>2]&511|0)){return}i=g+124|0;j=c[g+132>>2]|0;e=j&511;if(e<<16>>16==0){j=0}else{j=(d[(c[b+5888>>2]|0)+(e&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255}g=c[g+64>>2]|0;do{if((h|0)==(g&511|0)){h=g&511;if(h<<16>>16==0){break}m=(g>>>12&255)<<(g>>>9&7);Ac(b,h,(d[(c[b+5888>>2]|0)+(h&65535)|0]&(m^255)|m&(f&255))&255)}}while(0);_c(b,i,j)|0;return}function se(b,f,g,h){b=b|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;j=i;Ac(b,f,g);n=c[b+5888>>2]|0;g=d[n+(e[h+82>>1]|0)|0]<<8|d[n+(e[h+80>>1]|0)|0];k=c[h+64>>2]|0;f=k&511;l=f<<16>>16==0;if(l){m=4}else{m=((d[n+(f&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24==0?4:3}m=(((c[b+40>>2]|0)>>>0)/((g+1|0)>>>0)|0)>>>(m>>>0);p=c[h+72>>2]|0;o=p&511;if(o<<16>>16==0){o=0}else{o=p>>>12&255&(d[n+(o&65535)|0]|0)>>>((p>>>9&7)>>>0)}p=c[h+76>>2]|0;q=p&511;if(q<<16>>16==0){p=0}else{p=((d[n+(q&65535)|0]|0)>>>((p>>>9&7)>>>0)&p>>>12)<<2&1020}o=c[23848+((p|o)<<2)>>2]|0;p=c[h+68>>2]|0;q=p&511;if(q<<16>>16==0){p=1}else{p=(p>>>12&255&(d[n+(q&65535)|0]|0)>>>((p>>>9&7)>>>0))+1|0}if(l){f=1}else{f=((d[n+(f&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24!=0?2:1}gc(b,3,26856,(q=i,i=i+48|0,c[q>>2]=a[h+40|0]|0,c[q+8>>2]=g,c[q+16>>2]=m,c[q+24>>2]=f,c[q+32>>2]=o,c[q+40>>2]=p,q)|0);i=q;p=1e6/(((m>>>0)/((o+2+p|0)>>>0)|0)>>>0)|0;q=h+280|0;c[q>>2]=p;c[q+4>>2]=0;gc(b,3,28920,(q=i,i=i+8|0,c[q>>2]=p,q)|0);i=q;i=j;return}function te(b,d){b=b|0;d=d|0;var e=0;e=d;af(e|0,29544,40)|0;He(b,d|0);Wc(b,d+68|0);Je(b,c[d+44>>2]&511,12,e);a[d+120|0]=0;return}function ue(b){b=b|0;var e=0,f=0,g=0,h=0,i=0,j=0;f=c[b+4>>2]|0;if((a[b+120|0]|0)==0){i=b+68|0;i=i+12|0;j=b;Se(i,4,j);return}e=b;c[f+104>>2]=c[b+124>>2];g=b+48|0;g=d[g]|d[g+1|0]<<8|d[g+2|0]<<16|d[g+3|0]<<24|0;h=g&511;if(h<<16>>16!=0){Ac(f,h,(d[(c[f+5888>>2]|0)+(h&65535)|0]|(g>>>12&255)<<(g>>>9&7))&255)}h=b+40|0;h=d[h]|d[h+1|0]<<8|d[h+2|0]<<16|d[h+3|0]<<24|0;g=h&511;if(g<<16>>16==0){g=f+5888|0}else{j=f+5888|0;Ac(f,g,(d[(c[j>>2]|0)+(g&65535)|0]|(h>>>12&255)<<(h>>>9&7))&255);g=j}h=b+52|0;j=c[h>>2]|0;do{if((j&511|0)!=0){i=j&511;if(i<<16>>16==0){break}Ac(f,i,d[(c[g>>2]|0)+(i&65535)|0]&((j>>>12&255)<<(j>>>9&7)^255)&255)}}while(0);i=c[h+4>>2]|0;do{if((i&511|0)!=0){j=i&511;if(j<<16>>16==0){break}Ac(f,j,d[(c[g>>2]|0)+(j&65535)|0]&((i>>>12&255)<<(i>>>9&7)^255)&255)}}while(0);j=c[h+8>>2]|0;do{if((j&511|0)!=0){i=j&511;if(i<<16>>16==0){break}Ac(f,i,d[(c[g>>2]|0)+(i&65535)|0]&((j>>>12&255)<<(j>>>9&7)^255)&255)}}while(0);i=c[h+12>>2]|0;do{if((i&511|0)!=0){h=i&511;if(h<<16>>16==0){break}Ac(f,h,d[(c[g>>2]|0)+(h&65535)|0]&((i>>>12&255)<<(i>>>9&7)^255)&255)}}while(0);xe(f,e,0,0);i=b+68|0;i=i+12|0;j=b;Se(i,4,j);return}function ve(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0,h=0;if((b|0)!=2003072114){h=-1;return h|0}e=a+4|0;h=c[a+48>>2]|0;b=h&511;if(b<<16>>16==0){f=4}else{g=c[e>>2]|0;if(((d[(c[g+5888>>2]|0)+(b&65535)|0]|0)>>>((h>>>9&7)>>>0)&h>>>12&255)<<24>>24==0){f=4}}do{if((f|0)==4){b=c[a+72>>2]|0;f=b&511;if(f<<16>>16==0){h=0;return h|0}g=c[e>>2]|0;if(((d[(c[g+5888>>2]|0)+(f&65535)|0]|0)>>>((b>>>9&7)>>>0)&b>>>12&255)<<24>>24==0){a=0}else{break}return a|0}}while(0);h=a+112|0;Ic(g,c[h>>2]|0,c[h+4>>2]|0,14,a);h=0;return h|0}function we(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=g;j=g+48|0;k=c[j>>2]|0;i=k&511;if(i<<16>>16==0){i=0}else{i=(d[(c[b+5888>>2]|0)+(i&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255}l=g+72|0;k=c[l>>2]|0;m=k&511;if(m<<16>>16==0){k=0}else{k=(d[(c[b+5888>>2]|0)+(m&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255}m=g+44|0;n=c[m>>2]|0;o=n&511;if(o<<16>>16==0){n=0}else{n=(d[(c[b+5888>>2]|0)+(o&65535)|0]|0)>>>((n>>>9&7)>>>0)&n>>>12&255}if(i<<24>>24==0){i=k<<24>>24!=0|0}else{i=1}p=e&65535;k=b+5888|0;o=a[(c[k>>2]|0)+p|0]|0;Ac(b,e,f);if(n<<24>>24!=0){l=c[g+52>>2]|0;f=l&511;if((f|0)==0){f=0}else{f=(d[(c[k>>2]|0)+f|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255}l=c[g+56>>2]|0;e=l&511;if((e|0)!=0){f=(((d[(c[k>>2]|0)+e|0]|0)>>>((l>>>9&7)>>>0)&l>>>12)<<1|f&255)&255}l=c[g+60>>2]|0;e=l&511;if((e|0)!=0){f=(((d[(c[k>>2]|0)+e|0]|0)>>>((l>>>9&7)>>>0)&l>>>12)<<2|f&255)&255}l=c[g+64>>2]|0;e=l&511;if((e|0)!=0){f=(((d[(c[k>>2]|0)+e|0]|0)>>>((l>>>9&7)>>>0)&l>>>12)<<3|f&255)&255}l=c[g+40>>2]|0;e=l&511;do{if(e<<16>>16!=0){g=c[k>>2]|0;if(((d[g+(e&65535)|0]|0)>>>((l>>>9&7)>>>0)&l>>>12&255)<<24>>24==0){break}j=d[j]|d[j+1|0]<<8|d[j+2|0]<<16|d[j+3|0]<<24|0;k=j&511;if(k<<16>>16==0){break}Ac(b,k,(d[g+(k&65535)|0]|0|(j>>>12&255)<<(j>>>9&7))&255)}}while(0);xe(b,h,i,f);return}a[(c[k>>2]|0)+p|0]=o;e=c[m>>2]|0;if((e&511|0)==0){m=0}else{m=(f&255)>>>((e>>>9&7)>>>0)&e>>>12&255}o=c[j>>2]|0;do{if((o&511|0)!=0){n=o>>>9&7;j=o>>>12;p=((f&255)>>>(n>>>0)&j&255)<<24>>24==0;if(m<<24>>24==0|p){if(p){break}g=o&511;if(g<<16>>16==0){break}Ac(b,g,(d[(c[k>>2]|0)+(g&65535)|0]|0|(j&255)<<n)&255);break}h=e&511;if(h<<16>>16!=0){Ac(b,h,(d[(c[k>>2]|0)+(h&65535)|0]|0|(e>>>12&255)<<(e>>>9&7))&255)}Ic(b,4,0,6,g);return}}while(0);j=d[l]|d[l+1|0]<<8|d[l+2|0]<<16|d[l+3|0]<<24|0;g=j&511;if(g<<16>>16!=0){p=(j>>>12&255)<<(j>>>9&7);Ac(b,g,((d[(c[k>>2]|0)+(g&65535)|0]|0)&(p^255)|p&(f&255))&255)}xe(b,h,i,-1);return}function xe(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;g=i;h=a+5888|0;k=c[b+52>>2]|0;j=k&511;if((j|0)==0){l=0}else{l=(d[(c[h>>2]|0)+j|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255}k=c[b+56>>2]|0;j=k&511;if((j|0)!=0){l=(((d[(c[h>>2]|0)+j|0]|0)>>>((k>>>9&7)>>>0)&k>>>12)<<1|l&255)&255}k=c[b+60>>2]|0;j=k&511;if((j|0)!=0){l=(((d[(c[h>>2]|0)+j|0]|0)>>>((k>>>9&7)>>>0)&k>>>12)<<2|l&255)&255}k=c[b+64>>2]|0;j=k&511;if((j|0)!=0){l=(((d[(c[h>>2]|0)+j|0]|0)>>>((k>>>9&7)>>>0)&k>>>12)<<3|l&255)&255}l=l&255;j=2048<<l;m=j;o=(j|0)<0|0?-1:0;k=b+112|0;c[k>>2]=m;c[k+4>>2]=o;m=of(m,o,c[a+40>>2]|0,0)|0;m=pf(m,F,128e3,0)|0;c[k>>2]=m;c[k+4>>2]=F;o=c[b+48>>2]|0;n=o&511;if(n<<16>>16==0){n=0}else{n=(d[(c[h>>2]|0)+(n&65535)|0]|0)>>>((o>>>9&7)>>>0)&o>>>12&255}o=c[b+72>>2]|0;p=o&511;if(p<<16>>16==0){h=0}else{h=(d[(c[h>>2]|0)+(p&65535)|0]|0)>>>((o>>>9&7)>>>0)&o>>>12&255}n=n<<24>>24!=0;if(n){o=1}else{o=h<<24>>24!=0|0}e=(e&255|0)!=(o|0);if(f<<24>>24>-1){f=(l|0)!=(f<<24>>24|0)|0}else{f=0}if(!(e|f<<24>>24!=0)){i=g;return}if(!(h<<24>>24==0&(n^1))){gc(a,3,25992,(p=i,i=i+32|0,c[p>>2]=c[23832+((e&1)<<3)+((f&255)<<2)>>2],c[p+8>>2]=j,c[p+16>>2]=1<<l,c[p+24>>2]=m,p)|0);i=p;Ic(a,c[k>>2]|0,c[k+4>>2]|0,14,b);i=g;return}if(!e){i=g;return}gc(a,3,25288,(p=i,i=i+1|0,i=i+7&-8,c[p>>2]=0,p)|0);i=p;Jc(a,14,b);i=g;return}function ye(a,b,e){a=a|0;b=b|0;e=e|0;var f=0,g=0;a=c[e+4>>2]|0;if((b|0)!=0){return}f=c[e+76>>2]|0;b=f&511;if(b<<16>>16==0){return}g=c[a+5888>>2]|0;if(((d[g+(b&65535)|0]|0)>>>((f>>>9&7)>>>0)&f>>>12&255)<<24>>24==0){return}b=e+72|0;b=d[b]|d[b+1|0]<<8|d[b+2|0]<<16|d[b+3|0]<<24|0;f=b&511;Ac(a,f,((b>>>12&255)<<(b>>>9&7)^255)&(d[g+(f&65535)|0]|0)&255);return}function ze(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0;h=i;j=c[g+72>>2]|0;k=j&511;do{if(k<<16>>16!=0){if(((d[(c[b+5888>>2]|0)+(k&65535)|0]|0)>>>((j>>>9&7)>>>0)&j>>>12&255)<<24>>24==0){break}gc(b,3,25e3,(k=i,i=i+1|0,i=i+7&-8,c[k>>2]=0,k)|0);i=k;Yc(b,g+68|0)|0;k=g+112|0;f=df(c[k>>2]|0,c[k+4>>2]|0,e,f)|0;e=F;i=h;return(F=e,f)|0}}while(0);k=c[g+48>>2]|0;j=k&511;if(j<<16>>16==0){e=0;f=0;i=h;return(F=e,f)|0}if(((d[(c[b+5888>>2]|0)+(j&65535)|0]|0)>>>((k>>>9&7)>>>0)&k>>>12&255)<<24>>24==0){e=0;f=0;i=h;return(F=e,f)|0}gc(b,3,24744,(e=i,i=i+1|0,i=i+7&-8,c[e>>2]=0,e)|0);i=e;e=b+104|0;c[g+124>>2]=c[e>>2];a[g+120|0]=1;c[e>>2]=20;e=0;f=0;i=h;return(F=e,f)|0}function Ae(a,b,e,f){a=a|0;b=b|0;e=e|0;f=f|0;b=c[f+4>>2]|0;a=f+44|0;a=d[a]|d[a+1|0]<<8|d[a+2|0]<<16|d[a+3|0]<<24|0;e=a&511;Ac(b,e,((a>>>12&255)<<(a>>>9&7)^255)&(d[(c[b+5888>>2]|0)+(e&65535)|0]|0)&255);return(F=0,0)|0}function Be(a){a=a|0;kc(a);return}function Ce(){return tc(11904,11704)|0}function De(){return tc(200,11704)|0}function Ee(a){a=a|0;jd(a,a+7984|0);sd(a,a+8232|0);te(a,a+8104|0);pd(a,a+8352|0);zd(a,a+8840|0);zd(a,a+8932|0);zd(a,a+9024|0);je(a,a+9120|0);ad(a,a+9416|0);Nd(a,a+9960|0);Nd(a,a+10456|0);Nd(a,a+10952|0);Id(a,a+11448|0);be(a,a+11572|0);return}function Fe(a){a=a|0;return}function Ge(a,b,d){a=a|0;b=b|0;d=d|0;var e=0;a=c[a+5892>>2]|0;if((a|0)==0){e=-1;return e|0}do{e=c[a+32>>2]|0;if((e|0)==0){e=-1}else{e=Fb[e&31](a,b,d)|0}a=c[a>>2]|0;}while((a|0)!=0&(e|0)==-1);return e|0}function He(a,b){a=a|0;b=b|0;var d=0;d=a+5892|0;c[b>>2]=c[d>>2];c[b+4>>2]=a;c[d>>2]=b;return}function Ie(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0;f=i;g=b-32&65535;b=a+136+(g*20|0)+4|0;h=c[b>>2]|0;do{if((h|0)==0){if((c[a+136+(g*20|0)+8>>2]|0)!=0){break}c[b>>2]=e;j=a+136+(g*20|0)+8|0;c[j>>2]=d;i=f;return}}while(0);j=a+136+(g*20|0)+8|0;do{if((h|0)==(e|0)){if((c[j>>2]|0)!=(d|0)){break}c[b>>2]=e;j=a+136+(g*20|0)+8|0;c[j>>2]=d;i=f;return}}while(0);gc(a,1,26552,(f=i,i=i+1|0,i=i+7&-8,c[f>>2]=0,f)|0);i=f;f=c[j>>2]|0;j=c[b>>2]|0;gc(a,1,28816,(h=i,i=i+40|0,c[h>>2]=g,c[h+8>>2]=f,c[h+16>>2]=j,c[h+24>>2]=d,c[h+32>>2]=e,h)|0);i=h;Aa()}function Je(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;f=b&65535;j=b-32&65535;l=j&65535;if((j&65535)>>>0>279>>>0){gc(a,1,27088,(j=i,i=i+16|0,c[j>>2]=l,c[j+8>>2]=280,j)|0);i=j;Aa()}b=a+136+(l*20|0)+12|0;j=c[b>>2]|0;if((j|0)==0){if((c[a+136+(l*20|0)+16>>2]|0)!=0){k=5}}else{k=5}do{if((k|0)==5){k=c[a+136+(l*20|0)+16>>2]|0;if((j|0)==(e|0)&(k|0)==(d|0)){break}l=a+136+(l*20|0)+16|0;do{if((k|0)==4){h=j}else{k=a+5736|0;j=c[k>>2]|0;c[k>>2]=j+1;if((j|0)>3){gc(a,1,25928,(l=i,i=i+1|0,i=i+7&-8,c[l>>2]=0,l)|0);i=l;Aa()}else{gc(a,3,25224,(h=i,i=i+8|0,c[h>>2]=f,h)|0);i=h;c[a+5740+(j*36|0)>>2]=1;c[a+5740+(j*36|0)+4>>2]=c[b>>2];c[a+5740+(j*36|0)+8>>2]=c[l>>2];h=j;c[b>>2]=h;c[l>>2]=4;break}}}while(0);l=a+5740+(h*36|0)|0;b=c[l>>2]|0;c[l>>2]=b+1;if((b|0)>3){gc(a,1,24936,(l=i,i=i+8|0,c[l>>2]=f,l)|0);i=l;Aa()}c[a+5740+(h*36|0)+4+(b<<3)>>2]=e;c[a+5740+(h*36|0)+4+(b<<3)+4>>2]=d;i=g;return}}while(0);c[b>>2]=e;c[a+136+(l*20|0)+16>>2]=d;i=g;return}function Ke(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;a=c[a+5892>>2]|0;if((a|0)==0){f=0;return f|0}a:while(1){f=c[a+24>>2]|0;do{if((f|0)!=0){if((c[a+16>>2]|0)!=(b|0)){break}if((c[a+20>>2]|0)>(d|0)){break a}}}while(0);a=c[a>>2]|0;if((a|0)==0){d=0;e=7;break}}if((e|0)==7){return d|0}f=f+(d*24|0)|0;return f|0}function Le(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;g=i;i=i+224|0;h=g+184|0;if((f|0)>8){l=0;i=g;return l|0}j=d&65535;d=b+136+((d-32&65535)*20|0)|0;if((c[d>>2]|0)==0){l=0;k=g|0;do{if((l|0)<8){Wa(k|0,24728,(m=i,i=i+16|0,c[m>>2]=j,c[m+8>>2]=l,m)|0)|0;i=m}else{Wa(k|0,24376,(m=i,i=i+8|0,c[m>>2]=j,m)|0)|0;i=m}c[h+(l<<2)>>2]=k;k=k+((_e(k|0)|0)+1)|0;l=l+1|0;}while((l|0)<9);m=Qe(b+112|0,0,9,h|0)|0;c[d>>2]=m;m=m+16|0;a[m]=a[m]|2;m=(c[d>>2]|0)+40|0;a[m]=a[m]|2;m=(c[d>>2]|0)+64|0;a[m]=a[m]|2;m=(c[d>>2]|0)+88|0;a[m]=a[m]|2;m=(c[d>>2]|0)+112|0;a[m]=a[m]|2;m=(c[d>>2]|0)+136|0;a[m]=a[m]|2;m=(c[d>>2]|0)+160|0;a[m]=a[m]|2;m=(c[d>>2]|0)+184|0;a[m]=a[m]|2}if((e|0)!=0){k=(_e(e|0)|0)+10|0;m=nb()|0;l=i;i=i+k|0;i=i+7&-8;Wa(l|0,24224,(k=i,i=i+8|0,c[k>>2]=e,k)|0)|0;i=k;We(c[(c[d>>2]|0)+(f*24|0)+4>>2]|0);l=Za(l|0)|0;c[(c[d>>2]|0)+(f*24|0)+4>>2]=l;hb(m|0)}m=(c[d>>2]|0)+(f*24|0)|0;i=g;return m|0}function Me(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;g=i;i=i+64|0;j=g|0;c[b+20>>2]=e;if((f|0)!=0){q=f;p=b+24|0;c[p>>2]=q;p=b+16|0;c[p>>2]=d;i=g;return q|0}f=b+12|0;n=c[f>>2]|0;a:do{if((n|0)==0){h=0}else{q=e<<2;p=Ve(q)|0;h=p;$e(p|0,0,q|0)|0;if((e|0)<=0){break}j=j|0;k=b+8|0;l=d&255;if(l>>>0>32>>>0){m=0;while(1){q=c[n+(m<<2)>>2]|0;o=a[q]|0;if(((o<<24>>24)-48|0)>>>0<10>>>0){n=j;while(1){q=q+1|0;p=n+1|0;a[n]=o;o=a[q]|0;if(((o<<24>>24)-48|0)>>>0<10>>>0){n=p}else{n=q;break}}}else{p=j;n=q}if((ab(o<<24>>24|0)|0)==0){while(1){o=n+1|0;q=p+1|0;a[p]=a[n]|0;if((ab(a[o]|0)|0)==0){p=q;n=o}else{p=q;n=o;break}}}r=p;x=7501409;a[r]=x;x=x>>8;a[r+1|0]=x;x=x>>8;a[r+2|0]=x;x=x>>8;a[r+3|0]=x;r=_e(p|0)|0;q=r+1|0;o=p+q|0;a[p+r|0]=46;bf(o|0,c[k>>2]|0)|0;q=(_e(o|0)|0)+q|0;o=q+1|0;a[p+q|0]=cf(l|0)|0;q=p+(q+2)|0;a[p+o|0]=46;bf(q|0,n|0)|0;a[p+(o+((_e(q|0)|0)+1))|0]=0;c[h+(m<<2)>>2]=Za(j|0)|0;m=m+1|0;if((m|0)>=(e|0)){break a}n=c[f>>2]|0}}else{l=0;while(1){p=c[n+(l<<2)>>2]|0;n=a[p]|0;if(((n<<24>>24)-48|0)>>>0<10>>>0){m=j;while(1){p=p+1|0;o=m+1|0;a[m]=n;n=a[p]|0;if(((n<<24>>24)-48|0)>>>0<10>>>0){m=o}else{m=p;break}}}else{o=j;m=p}if((ab(n<<24>>24|0)|0)==0){while(1){n=m+1|0;p=o+1|0;a[o]=a[m]|0;if((ab(a[n]|0)|0)==0){o=p;m=n}else{o=p;m=n;break}}}p=o;x=7501409;a[p]=x;x=x>>8;a[p+1|0]=x;x=x>>8;a[p+2|0]=x;x=x>>8;a[p+3|0]=x;p=_e(o|0)|0;q=p+1|0;r=o+q|0;a[o+p|0]=46;bf(r|0,c[k>>2]|0)|0;q=(_e(r|0)|0)+q|0;r=o+(q+1)|0;a[o+q|0]=46;bf(r|0,m|0)|0;a[o+(q+((_e(r|0)|0)+1))|0]=0;c[h+(l<<2)>>2]=Za(j|0)|0;l=l+1|0;if((l|0)>=(e|0)){break a}n=c[f>>2]|0}}}}while(0);j=Qe((c[b+4>>2]|0)+112|0,0,e,h)|0;if((h|0)==0){r=j;q=b+24|0;c[q>>2]=r;q=b+16|0;c[q>>2]=d;i=g;return r|0}if((e|0)>0){f=0;do{We(c[h+(f<<2)>>2]|0);f=f+1|0;}while((f|0)<(e|0))}We(h);r=j;q=b+24|0;c[q>>2]=r;q=b+16|0;c[q>>2]=d;i=g;return r|0}function Ne(a){a=a|0;var b=0,d=0,e=0,f=0;a=a+5892|0;b=c[a>>2]|0;if((b|0)==0){c[a>>2]=0;return}while(1){e=b|0;d=c[e>>2]|0;f=c[b+36>>2]|0;if((f|0)!=0){Db[f&63](b)}f=b+20|0;Re(c[b+24>>2]|0,c[f>>2]|0);c[f>>2]=0;c[b+16>>2]=0;c[b+4>>2]=0;c[e>>2]=0;if((d|0)==0){break}else{b=d}}c[a>>2]=0;return}function Oe(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=a+5740+(e*36|0)|0;h=c[f>>2]|0;if((h|0)>0){g=0}else{return}do{i=c[a+5740+(e*36|0)+4+(g<<3)+4>>2]|0;if((i|0)!=0){Kb[i&63](a,b,d,c[a+5740+(e*36|0)+4+(g<<3)>>2]|0);h=c[f>>2]|0}g=g+1|0;}while((g|0)<(h|0));return}function Pe(b,d,e,f,g){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=i;$e(d|0,0,f*24|0|0)|0;if((f|0)==0){i=h;return}l=(g|0)==0;j=b|0;k=b+4|0;if((b|0)==0){k=0;do{b=k+e|0;c[d+(k*24|0)+8>>2]=b;a[d+(k*24|0)+16|0]=8;do{if(l){m=7}else{j=c[g+(k<<2)>>2]|0;if((j|0)==0){m=7;break}c[d+(k*24|0)+4>>2]=Za(j|0)|0}}while(0);if((m|0)==7){m=0;Ca(26216,(p=i,i=i+16|0,c[p>>2]=30040,c[p+8>>2]=b,p)|0)|0;i=p}k=k+1|0;}while(k>>>0<f>>>0);i=h;return}if(l){g=0;do{m=d+(g*24|0)+8|0;c[m>>2]=g+e;a[d+(g*24|0)+16|0]=8;l=d+(g*24|0)|0;n=c[j>>2]|0;o=c[k>>2]|0;if((n&15|0)==0){o=Xe(o,(n<<2)+64|0)|0;c[k>>2]=o;n=c[j>>2]|0}c[j>>2]=n+1;c[o+(n<<2)>>2]=l;c[l>>2]=b;o=c[m>>2]|0;Ca(26216,(p=i,i=i+16|0,c[p>>2]=30040,c[p+8>>2]=o,p)|0)|0;i=p;g=g+1|0;}while(g>>>0<f>>>0);i=h;return}else{m=0}do{l=d+(m*24|0)+8|0;c[l>>2]=m+e;a[d+(m*24|0)+16|0]=8;n=d+(m*24|0)|0;p=c[j>>2]|0;o=c[k>>2]|0;if((p&15|0)==0){o=Xe(o,(p<<2)+64|0)|0;c[k>>2]=o;p=c[j>>2]|0}c[j>>2]=p+1;c[o+(p<<2)>>2]=n;c[n>>2]=b;n=c[g+(m<<2)>>2]|0;if((n|0)==0){o=c[l>>2]|0;Ca(26216,(p=i,i=i+16|0,c[p>>2]=30040,c[p+8>>2]=o,p)|0)|0;i=p}else{c[d+(m*24|0)+4>>2]=Za(n|0)|0}m=m+1|0;}while(m>>>0<f>>>0);i=h;return}function Qe(b,c,d,e){b=b|0;c=c|0;d=d|0;e=e|0;var f=0;f=Ve(d*24|0)|0;Pe(b,f,c,d,e);if((d|0)==0){return f|0}else{e=0}do{b=f+(e*24|0)+16|0;a[b]=a[b]|4;e=e+1|0;}while(e>>>0<d>>>0);return f|0}function Re(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0,j=0;if((b|0)!=0&(d|0)!=0){e=0}else{return}do{f=b+(e*24|0)|0;h=c[f>>2]|0;a:do{if((h|0)!=0){g=c[h>>2]|0;if((g|0)<=0){break}h=c[h+4>>2]|0;i=0;while(1){j=h+(i<<2)|0;i=i+1|0;if((c[j>>2]|0)==(f|0)){break}if((i|0)>=(g|0)){break a}}c[j>>2]=0}}while(0);f=b+(e*24|0)+4|0;g=c[f>>2]|0;if((g|0)!=0){We(g)}c[f>>2]=0;f=b+(e*24|0)+20|0;g=c[f>>2]|0;if((g|0)!=0){while(1){h=c[g>>2]|0;We(g);if((h|0)==0){break}else{g=h}}}c[f>>2]=0;e=e+1|0;}while(e>>>0<d>>>0);if((a[b+16|0]&4)==0){return}We(b);return}function Se(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0;if(!((a|0)!=0&(b|0)!=0)){return}e=a+20|0;a=c[e>>2]|0;a:do{if((a|0)!=0){f=a;while(1){if((c[f+12>>2]|0)==(b|0)){if((c[f+16>>2]|0)==(d|0)){break}}f=c[f>>2]|0;if((f|0)==0){break a}}return}}while(0);f=Ve(20)|0;$e(f|0,0,16)|0;c[f>>2]=a;c[e>>2]=f;c[f+12>>2]=b;c[f+16>>2]=d;return}function Te(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,i=0;if((b|0)==0){return}g=b+16|0;f=a[g]|0;if((f&1)!=0){d=(d|0)==0|0}e=b+12|0;if((c[e>>2]|0)==(d|0)&(f&10)==2){return}a[g]=f&-9;h=c[b+20>>2]|0;if((h|0)!=0){while(1){f=c[h>>2]|0;g=h+4|0;if((c[g>>2]|0)==0){c[g>>2]=1;i=c[h+12>>2]|0;if((i|0)!=0){Gb[i&31](b,d,c[h+16>>2]|0)}h=c[h+8>>2]|0;if((h|0)!=0){Te(h,d)}c[g>>2]=(c[g>>2]|0)-1}if((f|0)==0){break}else{h=f}}}c[e>>2]=d;return}function Ue(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;if((b|0)==0|(a|0)==0|(a|0)==(b|0)){Ba(c[p>>2]|0,28720,(f=i,i=i+24|0,c[f>>2]=30432,c[f+8>>2]=a,c[f+16>>2]=b,f)|0)|0;i=f;i=d;return}e=a+20|0;a=c[e>>2]|0;a:do{if((a|0)!=0){f=a;while(1){if((c[f+8>>2]|0)==(b|0)){break}f=c[f>>2]|0;if((f|0)==0){break a}}i=d;return}}while(0);f=Ve(20)|0;$e(f|0,0,20)|0;c[f>>2]=a;c[e>>2]=f;c[f+8>>2]=b;i=d;return}



function Ve(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;do{if(a>>>0<245>>>0){if(a>>>0<11>>>0){a=16}else{a=a+11&-8}f=a>>>3;e=c[11732]|0;b=e>>>(f>>>0);if((b&3|0)!=0){h=(b&1^1)+f|0;a=h<<1;d=46968+(a<<2)|0;a=46968+(a+2<<2)|0;g=c[a>>2]|0;f=g+8|0;b=c[f>>2]|0;do{if((d|0)==(b|0)){c[11732]=e&~(1<<h)}else{if(b>>>0<(c[11736]|0)>>>0){Aa();return 0}e=b+12|0;if((c[e>>2]|0)==(g|0)){c[e>>2]=d;c[a>>2]=b;break}else{Aa();return 0}}}while(0);q=h<<3;c[g+4>>2]=q|3;q=g+(q|4)|0;c[q>>2]=c[q>>2]|1;q=f;return q|0}if(a>>>0<=(c[11734]|0)>>>0){break}if((b|0)!=0){i=2<<f;i=b<<f&(i|-i);i=(i&-i)-1|0;b=i>>>12&16;i=i>>>(b>>>0);h=i>>>5&8;i=i>>>(h>>>0);f=i>>>2&4;i=i>>>(f>>>0);g=i>>>1&2;i=i>>>(g>>>0);d=i>>>1&1;d=(h|b|f|g|d)+(i>>>(d>>>0))|0;i=d<<1;g=46968+(i<<2)|0;i=46968+(i+2<<2)|0;f=c[i>>2]|0;b=f+8|0;h=c[b>>2]|0;do{if((g|0)==(h|0)){c[11732]=e&~(1<<d)}else{if(h>>>0<(c[11736]|0)>>>0){Aa();return 0}e=h+12|0;if((c[e>>2]|0)==(f|0)){c[e>>2]=g;c[i>>2]=h;break}else{Aa();return 0}}}while(0);q=d<<3;d=q-a|0;c[f+4>>2]=a|3;e=f+a|0;c[f+(a|4)>>2]=d|1;c[f+q>>2]=d;f=c[11734]|0;if((f|0)!=0){a=c[11737]|0;i=f>>>3;g=i<<1;f=46968+(g<<2)|0;h=c[11732]|0;i=1<<i;do{if((h&i|0)==0){c[11732]=h|i;h=f;g=46968+(g+2<<2)|0}else{g=46968+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0>=(c[11736]|0)>>>0){break}Aa();return 0}}while(0);c[g>>2]=a;c[h+12>>2]=a;c[a+8>>2]=h;c[a+12>>2]=f}c[11734]=d;c[11737]=e;q=b;return q|0}b=c[11733]|0;if((b|0)==0){break}e=(b&-b)-1|0;p=e>>>12&16;e=e>>>(p>>>0);o=e>>>5&8;e=e>>>(o>>>0);q=e>>>2&4;e=e>>>(q>>>0);b=e>>>1&2;e=e>>>(b>>>0);d=e>>>1&1;d=c[47232+((o|p|q|b|d)+(e>>>(d>>>0))<<2)>>2]|0;e=d;b=d;d=(c[d+4>>2]&-8)-a|0;while(1){h=c[e+16>>2]|0;if((h|0)==0){h=c[e+20>>2]|0;if((h|0)==0){break}}g=(c[h+4>>2]&-8)-a|0;f=g>>>0<d>>>0;e=h;b=f?h:b;d=f?g:d}f=b;h=c[11736]|0;if(f>>>0<h>>>0){Aa();return 0}q=f+a|0;e=q;if(f>>>0>=q>>>0){Aa();return 0}g=c[b+24>>2]|0;i=c[b+12>>2]|0;do{if((i|0)==(b|0)){j=b+20|0;i=c[j>>2]|0;if((i|0)==0){j=b+16|0;i=c[j>>2]|0;if((i|0)==0){i=0;break}}while(1){l=i+20|0;k=c[l>>2]|0;if((k|0)!=0){i=k;j=l;continue}k=i+16|0;l=c[k>>2]|0;if((l|0)==0){break}else{i=l;j=k}}if(j>>>0<h>>>0){Aa();return 0}else{c[j>>2]=0;break}}else{j=c[b+8>>2]|0;if(j>>>0<h>>>0){Aa();return 0}h=j+12|0;if((c[h>>2]|0)!=(b|0)){Aa();return 0}k=i+8|0;if((c[k>>2]|0)==(b|0)){c[h>>2]=i;c[k>>2]=j;break}else{Aa();return 0}}}while(0);a:do{if((g|0)!=0){j=b+28|0;h=47232+(c[j>>2]<<2)|0;do{if((b|0)==(c[h>>2]|0)){c[h>>2]=i;if((i|0)!=0){break}c[11733]=c[11733]&~(1<<c[j>>2]);break a}else{if(g>>>0<(c[11736]|0)>>>0){Aa();return 0}h=g+16|0;if((c[h>>2]|0)==(b|0)){c[h>>2]=i}else{c[g+20>>2]=i}if((i|0)==0){break a}}}while(0);if(i>>>0<(c[11736]|0)>>>0){Aa();return 0}c[i+24>>2]=g;g=c[b+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[i+16>>2]=g;c[g+24>>2]=i;break}}}while(0);g=c[b+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[i+20>>2]=g;c[g+24>>2]=i;break}}}while(0);if(d>>>0<16>>>0){q=d+a|0;c[b+4>>2]=q|3;q=f+(q+4)|0;c[q>>2]=c[q>>2]|1}else{c[b+4>>2]=a|3;c[f+(a|4)>>2]=d|1;c[f+(d+a)>>2]=d;f=c[11734]|0;if((f|0)!=0){a=c[11737]|0;h=f>>>3;g=h<<1;f=46968+(g<<2)|0;i=c[11732]|0;h=1<<h;do{if((i&h|0)==0){c[11732]=i|h;h=f;g=46968+(g+2<<2)|0}else{g=46968+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0>=(c[11736]|0)>>>0){break}Aa();return 0}}while(0);c[g>>2]=a;c[h+12>>2]=a;c[a+8>>2]=h;c[a+12>>2]=f}c[11734]=d;c[11737]=e}q=b+8|0;return q|0}else{if(a>>>0>4294967231>>>0){a=-1;break}b=a+11|0;a=b&-8;f=c[11733]|0;if((f|0)==0){break}e=-a|0;b=b>>>8;do{if((b|0)==0){g=0}else{if(a>>>0>16777215>>>0){g=31;break}p=(b+1048320|0)>>>16&8;q=b<<p;o=(q+520192|0)>>>16&4;q=q<<o;g=(q+245760|0)>>>16&2;g=14-(o|p|g)+(q<<g>>>15)|0;g=a>>>((g+7|0)>>>0)&1|g<<1}}while(0);h=c[47232+(g<<2)>>2]|0;b:do{if((h|0)==0){b=0;j=0}else{if((g|0)==31){i=0}else{i=25-(g>>>1)|0}b=0;i=a<<i;j=0;while(1){l=c[h+4>>2]&-8;k=l-a|0;if(k>>>0<e>>>0){if((l|0)==(a|0)){b=h;e=k;j=h;break b}else{b=h;e=k}}k=c[h+20>>2]|0;h=c[h+16+(i>>>31<<2)>>2]|0;j=(k|0)==0|(k|0)==(h|0)?j:k;if((h|0)==0){break}else{i=i<<1}}}}while(0);if((j|0)==0&(b|0)==0){q=2<<g;f=f&(q|-q);if((f|0)==0){break}q=(f&-f)-1|0;n=q>>>12&16;q=q>>>(n>>>0);m=q>>>5&8;q=q>>>(m>>>0);o=q>>>2&4;q=q>>>(o>>>0);p=q>>>1&2;q=q>>>(p>>>0);j=q>>>1&1;j=c[47232+((m|n|o|p|j)+(q>>>(j>>>0))<<2)>>2]|0}if((j|0)!=0){while(1){g=(c[j+4>>2]&-8)-a|0;f=g>>>0<e>>>0;e=f?g:e;b=f?j:b;f=c[j+16>>2]|0;if((f|0)!=0){j=f;continue}j=c[j+20>>2]|0;if((j|0)==0){break}}}if((b|0)==0){break}if(e>>>0>=((c[11734]|0)-a|0)>>>0){break}d=b;i=c[11736]|0;if(d>>>0<i>>>0){Aa();return 0}g=d+a|0;f=g;if(d>>>0>=g>>>0){Aa();return 0}h=c[b+24>>2]|0;j=c[b+12>>2]|0;do{if((j|0)==(b|0)){k=b+20|0;j=c[k>>2]|0;if((j|0)==0){k=b+16|0;j=c[k>>2]|0;if((j|0)==0){j=0;break}}while(1){l=j+20|0;m=c[l>>2]|0;if((m|0)!=0){j=m;k=l;continue}l=j+16|0;m=c[l>>2]|0;if((m|0)==0){break}else{j=m;k=l}}if(k>>>0<i>>>0){Aa();return 0}else{c[k>>2]=0;break}}else{k=c[b+8>>2]|0;if(k>>>0<i>>>0){Aa();return 0}i=k+12|0;if((c[i>>2]|0)!=(b|0)){Aa();return 0}l=j+8|0;if((c[l>>2]|0)==(b|0)){c[i>>2]=j;c[l>>2]=k;break}else{Aa();return 0}}}while(0);c:do{if((h|0)!=0){i=b+28|0;k=47232+(c[i>>2]<<2)|0;do{if((b|0)==(c[k>>2]|0)){c[k>>2]=j;if((j|0)!=0){break}c[11733]=c[11733]&~(1<<c[i>>2]);break c}else{if(h>>>0<(c[11736]|0)>>>0){Aa();return 0}i=h+16|0;if((c[i>>2]|0)==(b|0)){c[i>>2]=j}else{c[h+20>>2]=j}if((j|0)==0){break c}}}while(0);if(j>>>0<(c[11736]|0)>>>0){Aa();return 0}c[j+24>>2]=h;h=c[b+16>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[j+16>>2]=h;c[h+24>>2]=j;break}}}while(0);h=c[b+20>>2]|0;if((h|0)==0){break}if(h>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}while(0);d:do{if(e>>>0<16>>>0){q=e+a|0;c[b+4>>2]=q|3;q=d+(q+4)|0;c[q>>2]=c[q>>2]|1}else{c[b+4>>2]=a|3;c[d+(a|4)>>2]=e|1;c[d+(e+a)>>2]=e;h=e>>>3;if(e>>>0<256>>>0){g=h<<1;e=46968+(g<<2)|0;i=c[11732]|0;h=1<<h;do{if((i&h|0)==0){c[11732]=i|h;h=e;g=46968+(g+2<<2)|0}else{g=46968+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0>=(c[11736]|0)>>>0){break}Aa();return 0}}while(0);c[g>>2]=f;c[h+12>>2]=f;c[d+(a+8)>>2]=h;c[d+(a+12)>>2]=e;break}f=e>>>8;do{if((f|0)==0){h=0}else{if(e>>>0>16777215>>>0){h=31;break}p=(f+1048320|0)>>>16&8;q=f<<p;o=(q+520192|0)>>>16&4;q=q<<o;h=(q+245760|0)>>>16&2;h=14-(o|p|h)+(q<<h>>>15)|0;h=e>>>((h+7|0)>>>0)&1|h<<1}}while(0);f=47232+(h<<2)|0;c[d+(a+28)>>2]=h;c[d+(a+20)>>2]=0;c[d+(a+16)>>2]=0;j=c[11733]|0;i=1<<h;if((j&i|0)==0){c[11733]=j|i;c[f>>2]=g;c[d+(a+24)>>2]=f;c[d+(a+12)>>2]=g;c[d+(a+8)>>2]=g;break}f=c[f>>2]|0;if((h|0)==31){h=0}else{h=25-(h>>>1)|0}e:do{if((c[f+4>>2]&-8|0)!=(e|0)){h=e<<h;while(1){i=f+16+(h>>>31<<2)|0;j=c[i>>2]|0;if((j|0)==0){break}if((c[j+4>>2]&-8|0)==(e|0)){f=j;break e}else{f=j;h=h<<1}}if(i>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[i>>2]=g;c[d+(a+24)>>2]=f;c[d+(a+12)>>2]=g;c[d+(a+8)>>2]=g;break d}}}while(0);h=f+8|0;e=c[h>>2]|0;q=c[11736]|0;if(f>>>0>=q>>>0&e>>>0>=q>>>0){c[e+12>>2]=g;c[h>>2]=g;c[d+(a+8)>>2]=e;c[d+(a+12)>>2]=f;c[d+(a+24)>>2]=0;break}else{Aa();return 0}}}while(0);q=b+8|0;return q|0}}while(0);b=c[11734]|0;if(b>>>0>=a>>>0){d=b-a|0;e=c[11737]|0;if(d>>>0>15>>>0){q=e;c[11737]=q+a;c[11734]=d;c[q+(a+4)>>2]=d|1;c[q+b>>2]=d;c[e+4>>2]=a|3}else{c[11734]=0;c[11737]=0;c[e+4>>2]=b|3;q=e+(b+4)|0;c[q>>2]=c[q>>2]|1}q=e+8|0;return q|0}b=c[11735]|0;if(b>>>0>a>>>0){o=b-a|0;c[11735]=o;q=c[11738]|0;p=q;c[11738]=p+a;c[p+(a+4)>>2]=o|1;c[q+4>>2]=a|3;q=q+8|0;return q|0}do{if((c[7626]|0)==0){b=ub(30)|0;if((b-1&b|0)==0){c[7628]=b;c[7627]=b;c[7629]=-1;c[7630]=-1;c[7631]=0;c[11843]=0;c[7626]=(Ya(0)|0)&-16^1431655768;break}else{Aa();return 0}}}while(0);h=a+48|0;e=c[7628]|0;g=a+47|0;b=e+g|0;e=-e|0;f=b&e;if(f>>>0<=a>>>0){q=0;return q|0}i=c[11842]|0;do{if((i|0)!=0){p=c[11840]|0;q=p+f|0;if(q>>>0<=p>>>0|q>>>0>i>>>0){a=0}else{break}return a|0}}while(0);f:do{if((c[11843]&4|0)==0){k=c[11738]|0;g:do{if((k|0)==0){d=181}else{l=47376;while(1){j=l|0;m=c[j>>2]|0;if(m>>>0<=k>>>0){i=l+4|0;if((m+(c[i>>2]|0)|0)>>>0>k>>>0){break}}l=c[l+8>>2]|0;if((l|0)==0){d=181;break g}}if((l|0)==0){d=181;break}e=b-(c[11735]|0)&e;if(e>>>0>=2147483647>>>0){e=0;break}b=mb(e|0)|0;if((b|0)==((c[j>>2]|0)+(c[i>>2]|0)|0)){d=190}else{d=191}}}while(0);do{if((d|0)==181){i=mb(0)|0;if((i|0)==-1){e=0;break}e=i;b=c[7627]|0;j=b-1|0;if((j&e|0)==0){e=f}else{e=f-e+(j+e&-b)|0}j=c[11840]|0;b=j+e|0;if(!(e>>>0>a>>>0&e>>>0<2147483647>>>0)){e=0;break}k=c[11842]|0;if((k|0)!=0){if(b>>>0<=j>>>0|b>>>0>k>>>0){e=0;break}}b=mb(e|0)|0;if((b|0)==(i|0)){b=i;d=190}else{d=191}}}while(0);h:do{if((d|0)==190){if((b|0)!=-1){d=201;break f}}else if((d|0)==191){d=-e|0;do{if((b|0)!=-1&e>>>0<2147483647>>>0&h>>>0>e>>>0){q=c[7628]|0;g=g-e+q&-q;if(g>>>0>=2147483647>>>0){break}if((mb(g|0)|0)==-1){mb(d|0)|0;e=0;break h}else{e=g+e|0;break}}}while(0);if((b|0)==-1){e=0}else{d=201;break f}}}while(0);c[11843]=c[11843]|4;d=198}else{e=0;d=198}}while(0);do{if((d|0)==198){if(f>>>0>=2147483647>>>0){break}b=mb(f|0)|0;f=mb(0)|0;if(!((b|0)!=-1&(f|0)!=-1&b>>>0<f>>>0)){break}g=f-b|0;f=g>>>0>(a+40|0)>>>0;if(f){e=f?g:e;d=201}}}while(0);do{if((d|0)==201){f=(c[11840]|0)+e|0;c[11840]=f;if(f>>>0>(c[11841]|0)>>>0){c[11841]=f}f=c[11738]|0;i:do{if((f|0)==0){q=c[11736]|0;if((q|0)==0|b>>>0<q>>>0){c[11736]=b}c[11844]=b;c[11845]=e;c[11847]=0;c[11741]=c[7626];c[11740]=-1;d=0;do{q=d<<1;p=46968+(q<<2)|0;c[46968+(q+3<<2)>>2]=p;c[46968+(q+2<<2)>>2]=p;d=d+1|0;}while(d>>>0<32>>>0);d=b+8|0;if((d&7|0)==0){d=0}else{d=-d&7}q=e-40-d|0;c[11738]=b+d;c[11735]=q;c[b+(d+4)>>2]=q|1;c[b+(e-36)>>2]=40;c[11739]=c[7630]}else{g=47376;do{j=c[g>>2]|0;i=g+4|0;h=c[i>>2]|0;if((b|0)==(j+h|0)){d=213;break}g=c[g+8>>2]|0;}while((g|0)!=0);do{if((d|0)==213){if((c[g+12>>2]&8|0)!=0){break}q=f;if(!(q>>>0>=j>>>0&q>>>0<b>>>0)){break}c[i>>2]=h+e;q=c[11738]|0;b=(c[11735]|0)+e|0;d=q;e=q+8|0;if((e&7|0)==0){e=0}else{e=-e&7}q=b-e|0;c[11738]=d+e;c[11735]=q;c[d+(e+4)>>2]=q|1;c[d+(b+4)>>2]=40;c[11739]=c[7630];break i}}while(0);if(b>>>0<(c[11736]|0)>>>0){c[11736]=b}g=b+e|0;i=47376;do{h=i|0;if((c[h>>2]|0)==(g|0)){d=223;break}i=c[i+8>>2]|0;}while((i|0)!=0);do{if((d|0)==223){if((c[i+12>>2]&8|0)!=0){break}c[h>>2]=b;d=i+4|0;c[d>>2]=(c[d>>2]|0)+e;d=b+8|0;if((d&7|0)==0){d=0}else{d=-d&7}f=b+(e+8)|0;if((f&7|0)==0){j=0}else{j=-f&7}m=b+(j+e)|0;l=m;f=d+a|0;h=b+f|0;g=h;i=m-(b+d)-a|0;c[b+(d+4)>>2]=a|3;j:do{if((l|0)==(c[11738]|0)){q=(c[11735]|0)+i|0;c[11735]=q;c[11738]=g;c[b+(f+4)>>2]=q|1}else{if((l|0)==(c[11737]|0)){q=(c[11734]|0)+i|0;c[11734]=q;c[11737]=g;c[b+(f+4)>>2]=q|1;c[b+(q+f)>>2]=q;break}k=e+4|0;o=c[b+(k+j)>>2]|0;if((o&3|0)==1){a=o&-8;n=o>>>3;k:do{if(o>>>0<256>>>0){k=c[b+((j|8)+e)>>2]|0;m=c[b+(e+12+j)>>2]|0;o=46968+(n<<1<<2)|0;do{if((k|0)!=(o|0)){if(k>>>0<(c[11736]|0)>>>0){Aa();return 0}if((c[k+12>>2]|0)==(l|0)){break}Aa();return 0}}while(0);if((m|0)==(k|0)){c[11732]=c[11732]&~(1<<n);break}do{if((m|0)==(o|0)){n=m+8|0}else{if(m>>>0<(c[11736]|0)>>>0){Aa();return 0}n=m+8|0;if((c[n>>2]|0)==(l|0)){break}Aa();return 0}}while(0);c[k+12>>2]=m;c[n>>2]=k}else{l=c[b+((j|24)+e)>>2]|0;n=c[b+(e+12+j)>>2]|0;do{if((n|0)==(m|0)){p=j|16;o=b+(k+p)|0;n=c[o>>2]|0;if((n|0)==0){o=b+(p+e)|0;n=c[o>>2]|0;if((n|0)==0){n=0;break}}while(1){q=n+20|0;p=c[q>>2]|0;if((p|0)!=0){n=p;o=q;continue}p=n+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{n=q;o=p}}if(o>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[o>>2]=0;break}}else{q=c[b+((j|8)+e)>>2]|0;if(q>>>0<(c[11736]|0)>>>0){Aa();return 0}o=q+12|0;if((c[o>>2]|0)!=(m|0)){Aa();return 0}p=n+8|0;if((c[p>>2]|0)==(m|0)){c[o>>2]=n;c[p>>2]=q;break}else{Aa();return 0}}}while(0);if((l|0)==0){break}o=b+(e+28+j)|0;p=47232+(c[o>>2]<<2)|0;do{if((m|0)==(c[p>>2]|0)){c[p>>2]=n;if((n|0)!=0){break}c[11733]=c[11733]&~(1<<c[o>>2]);break k}else{if(l>>>0<(c[11736]|0)>>>0){Aa();return 0}o=l+16|0;if((c[o>>2]|0)==(m|0)){c[o>>2]=n}else{c[l+20>>2]=n}if((n|0)==0){break k}}}while(0);if(n>>>0<(c[11736]|0)>>>0){Aa();return 0}c[n+24>>2]=l;m=j|16;l=c[b+(m+e)>>2]|0;do{if((l|0)!=0){if(l>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[n+16>>2]=l;c[l+24>>2]=n;break}}}while(0);k=c[b+(k+m)>>2]|0;if((k|0)==0){break}if(k>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[n+20>>2]=k;c[k+24>>2]=n;break}}}while(0);l=b+((a|j)+e)|0;i=a+i|0}e=l+4|0;c[e>>2]=c[e>>2]&-2;c[b+(f+4)>>2]=i|1;c[b+(i+f)>>2]=i;e=i>>>3;if(i>>>0<256>>>0){h=e<<1;a=46968+(h<<2)|0;i=c[11732]|0;e=1<<e;do{if((i&e|0)==0){c[11732]=i|e;e=a;h=46968+(h+2<<2)|0}else{h=46968+(h+2<<2)|0;e=c[h>>2]|0;if(e>>>0>=(c[11736]|0)>>>0){break}Aa();return 0}}while(0);c[h>>2]=g;c[e+12>>2]=g;c[b+(f+8)>>2]=e;c[b+(f+12)>>2]=a;break}a=i>>>8;do{if((a|0)==0){e=0}else{if(i>>>0>16777215>>>0){e=31;break}p=(a+1048320|0)>>>16&8;q=a<<p;o=(q+520192|0)>>>16&4;q=q<<o;e=(q+245760|0)>>>16&2;e=14-(o|p|e)+(q<<e>>>15)|0;e=i>>>((e+7|0)>>>0)&1|e<<1}}while(0);a=47232+(e<<2)|0;c[b+(f+28)>>2]=e;c[b+(f+20)>>2]=0;c[b+(f+16)>>2]=0;j=c[11733]|0;g=1<<e;if((j&g|0)==0){c[11733]=j|g;c[a>>2]=h;c[b+(f+24)>>2]=a;c[b+(f+12)>>2]=h;c[b+(f+8)>>2]=h;break}a=c[a>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}l:do{if((c[a+4>>2]&-8|0)!=(i|0)){j=i<<e;while(1){g=a+16+(j>>>31<<2)|0;e=c[g>>2]|0;if((e|0)==0){break}if((c[e+4>>2]&-8|0)==(i|0)){a=e;break l}else{a=e;j=j<<1}}if(g>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[g>>2]=h;c[b+(f+24)>>2]=a;c[b+(f+12)>>2]=h;c[b+(f+8)>>2]=h;break j}}}while(0);e=a+8|0;g=c[e>>2]|0;q=c[11736]|0;if(a>>>0>=q>>>0&g>>>0>=q>>>0){c[g+12>>2]=h;c[e>>2]=h;c[b+(f+8)>>2]=g;c[b+(f+12)>>2]=a;c[b+(f+24)>>2]=0;break}else{Aa();return 0}}}while(0);q=b+(d|8)|0;return q|0}}while(0);d=f;j=47376;while(1){i=c[j>>2]|0;if(i>>>0<=d>>>0){h=c[j+4>>2]|0;g=i+h|0;if(g>>>0>d>>>0){break}}j=c[j+8>>2]|0}j=i+(h-39)|0;if((j&7|0)==0){j=0}else{j=-j&7}h=i+(h-47+j)|0;h=h>>>0<(f+16|0)>>>0?d:h;i=h+8|0;j=b+8|0;if((j&7|0)==0){j=0}else{j=-j&7}q=e-40-j|0;c[11738]=b+j;c[11735]=q;c[b+(j+4)>>2]=q|1;c[b+(e-36)>>2]=40;c[11739]=c[7630];c[h+4>>2]=27;c[i>>2]=c[11844];c[i+4>>2]=c[11845];c[i+8>>2]=c[11846];c[i+12>>2]=c[11847];c[11844]=b;c[11845]=e;c[11847]=0;c[11846]=i;e=h+28|0;c[e>>2]=7;if((h+32|0)>>>0<g>>>0){while(1){b=e+4|0;c[b>>2]=7;if((e+8|0)>>>0<g>>>0){e=b}else{break}}}if((h|0)==(d|0)){break}e=h-f|0;g=d+(e+4)|0;c[g>>2]=c[g>>2]&-2;c[f+4>>2]=e|1;c[d+e>>2]=e;g=e>>>3;if(e>>>0<256>>>0){d=g<<1;b=46968+(d<<2)|0;e=c[11732]|0;g=1<<g;do{if((e&g|0)==0){c[11732]=e|g;e=b;d=46968+(d+2<<2)|0}else{d=46968+(d+2<<2)|0;e=c[d>>2]|0;if(e>>>0>=(c[11736]|0)>>>0){break}Aa();return 0}}while(0);c[d>>2]=f;c[e+12>>2]=f;c[f+8>>2]=e;c[f+12>>2]=b;break}b=f;d=e>>>8;do{if((d|0)==0){d=0}else{if(e>>>0>16777215>>>0){d=31;break}p=(d+1048320|0)>>>16&8;q=d<<p;o=(q+520192|0)>>>16&4;q=q<<o;d=(q+245760|0)>>>16&2;d=14-(o|p|d)+(q<<d>>>15)|0;d=e>>>((d+7|0)>>>0)&1|d<<1}}while(0);g=47232+(d<<2)|0;c[f+28>>2]=d;c[f+20>>2]=0;c[f+16>>2]=0;i=c[11733]|0;h=1<<d;if((i&h|0)==0){c[11733]=i|h;c[g>>2]=b;c[f+24>>2]=g;c[f+12>>2]=f;c[f+8>>2]=f;break}i=c[g>>2]|0;if((d|0)==31){g=0}else{g=25-(d>>>1)|0}m:do{if((c[i+4>>2]&-8|0)!=(e|0)){d=i;h=e<<g;while(1){g=d+16+(h>>>31<<2)|0;i=c[g>>2]|0;if((i|0)==0){break}if((c[i+4>>2]&-8|0)==(e|0)){break m}else{d=i;h=h<<1}}if(g>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[g>>2]=b;c[f+24>>2]=d;c[f+12>>2]=f;c[f+8>>2]=f;break i}}}while(0);d=i+8|0;e=c[d>>2]|0;q=c[11736]|0;if(i>>>0>=q>>>0&e>>>0>=q>>>0){c[e+12>>2]=b;c[d>>2]=b;c[f+8>>2]=e;c[f+12>>2]=i;c[f+24>>2]=0;break}else{Aa();return 0}}}while(0);b=c[11735]|0;if(b>>>0<=a>>>0){break}o=b-a|0;c[11735]=o;q=c[11738]|0;p=q;c[11738]=p+a;c[p+(a+4)>>2]=o|1;c[q+4>>2]=a|3;q=q+8|0;return q|0}}while(0);c[(rb()|0)>>2]=12;q=0;return q|0}function We(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;if((a|0)==0){return}p=a-8|0;r=p;q=c[11736]|0;if(p>>>0<q>>>0){Aa()}n=c[a-4>>2]|0;m=n&3;if((m|0)==1){Aa()}h=n&-8;k=a+(h-8)|0;i=k;a:do{if((n&1|0)==0){u=c[p>>2]|0;if((m|0)==0){return}p=-8-u|0;r=a+p|0;m=r;n=u+h|0;if(r>>>0<q>>>0){Aa()}if((m|0)==(c[11737]|0)){b=a+(h-4)|0;if((c[b>>2]&3|0)!=3){b=m;l=n;break}c[11734]=n;c[b>>2]=c[b>>2]&-2;c[a+(p+4)>>2]=n|1;c[k>>2]=n;return}t=u>>>3;if(u>>>0<256>>>0){b=c[a+(p+8)>>2]|0;l=c[a+(p+12)>>2]|0;o=46968+(t<<1<<2)|0;do{if((b|0)!=(o|0)){if(b>>>0<q>>>0){Aa()}if((c[b+12>>2]|0)==(m|0)){break}Aa()}}while(0);if((l|0)==(b|0)){c[11732]=c[11732]&~(1<<t);b=m;l=n;break}do{if((l|0)==(o|0)){s=l+8|0}else{if(l>>>0<q>>>0){Aa()}o=l+8|0;if((c[o>>2]|0)==(m|0)){s=o;break}Aa()}}while(0);c[b+12>>2]=l;c[s>>2]=b;b=m;l=n;break}s=c[a+(p+24)>>2]|0;u=c[a+(p+12)>>2]|0;do{if((u|0)==(r|0)){u=a+(p+20)|0;t=c[u>>2]|0;if((t|0)==0){u=a+(p+16)|0;t=c[u>>2]|0;if((t|0)==0){o=0;break}}while(1){w=t+20|0;v=c[w>>2]|0;if((v|0)!=0){t=v;u=w;continue}v=t+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{t=w;u=v}}if(u>>>0<q>>>0){Aa()}else{c[u>>2]=0;o=t;break}}else{t=c[a+(p+8)>>2]|0;if(t>>>0<q>>>0){Aa()}q=t+12|0;if((c[q>>2]|0)!=(r|0)){Aa()}v=u+8|0;if((c[v>>2]|0)==(r|0)){c[q>>2]=u;c[v>>2]=t;o=u;break}else{Aa()}}}while(0);if((s|0)==0){b=m;l=n;break}q=a+(p+28)|0;t=47232+(c[q>>2]<<2)|0;do{if((r|0)==(c[t>>2]|0)){c[t>>2]=o;if((o|0)!=0){break}c[11733]=c[11733]&~(1<<c[q>>2]);b=m;l=n;break a}else{if(s>>>0<(c[11736]|0)>>>0){Aa()}q=s+16|0;if((c[q>>2]|0)==(r|0)){c[q>>2]=o}else{c[s+20>>2]=o}if((o|0)==0){b=m;l=n;break a}}}while(0);if(o>>>0<(c[11736]|0)>>>0){Aa()}c[o+24>>2]=s;q=c[a+(p+16)>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[11736]|0)>>>0){Aa()}else{c[o+16>>2]=q;c[q+24>>2]=o;break}}}while(0);p=c[a+(p+20)>>2]|0;if((p|0)==0){b=m;l=n;break}if(p>>>0<(c[11736]|0)>>>0){Aa()}else{c[o+20>>2]=p;c[p+24>>2]=o;b=m;l=n;break}}else{b=r;l=h}}while(0);m=b;if(m>>>0>=k>>>0){Aa()}n=a+(h-4)|0;o=c[n>>2]|0;if((o&1|0)==0){Aa()}do{if((o&2|0)==0){if((i|0)==(c[11738]|0)){w=(c[11735]|0)+l|0;c[11735]=w;c[11738]=b;c[b+4>>2]=w|1;if((b|0)!=(c[11737]|0)){return}c[11737]=0;c[11734]=0;return}if((i|0)==(c[11737]|0)){w=(c[11734]|0)+l|0;c[11734]=w;c[11737]=b;c[b+4>>2]=w|1;c[m+w>>2]=w;return}l=(o&-8)+l|0;n=o>>>3;b:do{if(o>>>0<256>>>0){g=c[a+h>>2]|0;h=c[a+(h|4)>>2]|0;a=46968+(n<<1<<2)|0;do{if((g|0)!=(a|0)){if(g>>>0<(c[11736]|0)>>>0){Aa()}if((c[g+12>>2]|0)==(i|0)){break}Aa()}}while(0);if((h|0)==(g|0)){c[11732]=c[11732]&~(1<<n);break}do{if((h|0)==(a|0)){j=h+8|0}else{if(h>>>0<(c[11736]|0)>>>0){Aa()}a=h+8|0;if((c[a>>2]|0)==(i|0)){j=a;break}Aa()}}while(0);c[g+12>>2]=h;c[j>>2]=g}else{i=c[a+(h+16)>>2]|0;n=c[a+(h|4)>>2]|0;do{if((n|0)==(k|0)){n=a+(h+12)|0;j=c[n>>2]|0;if((j|0)==0){n=a+(h+8)|0;j=c[n>>2]|0;if((j|0)==0){g=0;break}}while(1){p=j+20|0;o=c[p>>2]|0;if((o|0)!=0){j=o;n=p;continue}o=j+16|0;p=c[o>>2]|0;if((p|0)==0){break}else{j=p;n=o}}if(n>>>0<(c[11736]|0)>>>0){Aa()}else{c[n>>2]=0;g=j;break}}else{o=c[a+h>>2]|0;if(o>>>0<(c[11736]|0)>>>0){Aa()}p=o+12|0;if((c[p>>2]|0)!=(k|0)){Aa()}j=n+8|0;if((c[j>>2]|0)==(k|0)){c[p>>2]=n;c[j>>2]=o;g=n;break}else{Aa()}}}while(0);if((i|0)==0){break}j=a+(h+20)|0;n=47232+(c[j>>2]<<2)|0;do{if((k|0)==(c[n>>2]|0)){c[n>>2]=g;if((g|0)!=0){break}c[11733]=c[11733]&~(1<<c[j>>2]);break b}else{if(i>>>0<(c[11736]|0)>>>0){Aa()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=g}else{c[i+20>>2]=g}if((g|0)==0){break b}}}while(0);if(g>>>0<(c[11736]|0)>>>0){Aa()}c[g+24>>2]=i;i=c[a+(h+8)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[11736]|0)>>>0){Aa()}else{c[g+16>>2]=i;c[i+24>>2]=g;break}}}while(0);h=c[a+(h+12)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[11736]|0)>>>0){Aa()}else{c[g+20>>2]=h;c[h+24>>2]=g;break}}}while(0);c[b+4>>2]=l|1;c[m+l>>2]=l;if((b|0)!=(c[11737]|0)){break}c[11734]=l;return}else{c[n>>2]=o&-2;c[b+4>>2]=l|1;c[m+l>>2]=l}}while(0);g=l>>>3;if(l>>>0<256>>>0){a=g<<1;d=46968+(a<<2)|0;h=c[11732]|0;g=1<<g;do{if((h&g|0)==0){c[11732]=h|g;f=d;e=46968+(a+2<<2)|0}else{h=46968+(a+2<<2)|0;g=c[h>>2]|0;if(g>>>0>=(c[11736]|0)>>>0){f=g;e=h;break}Aa()}}while(0);c[e>>2]=b;c[f+12>>2]=b;c[b+8>>2]=f;c[b+12>>2]=d;return}e=b;f=l>>>8;do{if((f|0)==0){f=0}else{if(l>>>0>16777215>>>0){f=31;break}v=(f+1048320|0)>>>16&8;w=f<<v;u=(w+520192|0)>>>16&4;w=w<<u;f=(w+245760|0)>>>16&2;f=14-(u|v|f)+(w<<f>>>15)|0;f=l>>>((f+7|0)>>>0)&1|f<<1}}while(0);g=47232+(f<<2)|0;c[b+28>>2]=f;c[b+20>>2]=0;c[b+16>>2]=0;a=c[11733]|0;h=1<<f;c:do{if((a&h|0)==0){c[11733]=a|h;c[g>>2]=e;c[b+24>>2]=g;c[b+12>>2]=b;c[b+8>>2]=b}else{h=c[g>>2]|0;if((f|0)==31){g=0}else{g=25-(f>>>1)|0}d:do{if((c[h+4>>2]&-8|0)==(l|0)){d=h}else{f=h;h=l<<g;while(1){a=f+16+(h>>>31<<2)|0;g=c[a>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(l|0)){d=g;break d}else{f=g;h=h<<1}}if(a>>>0<(c[11736]|0)>>>0){Aa()}else{c[a>>2]=e;c[b+24>>2]=f;c[b+12>>2]=b;c[b+8>>2]=b;break c}}}while(0);f=d+8|0;g=c[f>>2]|0;w=c[11736]|0;if(d>>>0>=w>>>0&g>>>0>=w>>>0){c[g+12>>2]=e;c[f>>2]=e;c[b+8>>2]=g;c[b+12>>2]=d;c[b+24>>2]=0;break}else{Aa()}}}while(0);w=(c[11740]|0)-1|0;c[11740]=w;if((w|0)==0){b=47384}else{return}while(1){b=c[b>>2]|0;if((b|0)==0){break}else{b=b+8|0}}c[11740]=-1;return}function Xe(a,b){a=a|0;b=b|0;var d=0,e=0;if((a|0)==0){e=Ve(b)|0;return e|0}if(b>>>0>4294967231>>>0){c[(rb()|0)>>2]=12;e=0;return e|0}if(b>>>0<11>>>0){d=16}else{d=b+11&-8}d=Ye(a-8|0,d)|0;if((d|0)!=0){e=d+8|0;return e|0}d=Ve(b)|0;if((d|0)==0){e=0;return e|0}e=c[a-4>>2]|0;e=(e&-8)-((e&3|0)==0?8:4)|0;af(d|0,a|0,e>>>0<b>>>0?e:b)|0;We(a);e=d;return e|0}function Ye(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0;d=a+4|0;f=c[d>>2]|0;h=f&-8;e=a;j=e+h|0;k=j;i=c[11736]|0;m=f&3;if(!((m|0)!=1&e>>>0>=i>>>0&e>>>0<j>>>0)){Aa();return 0}g=e+(h|4)|0;l=c[g>>2]|0;if((l&1|0)==0){Aa();return 0}if((m|0)==0){if(b>>>0<256>>>0){o=0;return o|0}do{if(h>>>0>=(b+4|0)>>>0){if((h-b|0)>>>0>c[7628]<<1>>>0){break}return a|0}}while(0);o=0;return o|0}if(h>>>0>=b>>>0){h=h-b|0;if(h>>>0<=15>>>0){o=a;return o|0}c[d>>2]=f&1|b|2;c[e+(b+4)>>2]=h|3;c[g>>2]=c[g>>2]|1;Ze(e+b|0,h);o=a;return o|0}if((k|0)==(c[11738]|0)){g=(c[11735]|0)+h|0;if(g>>>0<=b>>>0){o=0;return o|0}o=g-b|0;c[d>>2]=f&1|b|2;c[e+(b+4)>>2]=o|1;c[11738]=e+b;c[11735]=o;o=a;return o|0}if((k|0)==(c[11737]|0)){h=(c[11734]|0)+h|0;if(h>>>0<b>>>0){o=0;return o|0}g=h-b|0;if(g>>>0>15>>>0){c[d>>2]=f&1|b|2;c[e+(b+4)>>2]=g|1;c[e+h>>2]=g;d=e+(h+4)|0;c[d>>2]=c[d>>2]&-2;d=e+b|0}else{c[d>>2]=f&1|h|2;d=e+(h+4)|0;c[d>>2]=c[d>>2]|1;d=0;g=0}c[11734]=g;c[11737]=d;o=a;return o|0}if((l&2|0)!=0){o=0;return o|0}g=(l&-8)+h|0;if(g>>>0<b>>>0){o=0;return o|0}f=g-b|0;m=l>>>3;a:do{if(l>>>0<256>>>0){j=c[e+(h+8)>>2]|0;h=c[e+(h+12)>>2]|0;l=46968+(m<<1<<2)|0;do{if((j|0)!=(l|0)){if(j>>>0<i>>>0){Aa();return 0}if((c[j+12>>2]|0)==(k|0)){break}Aa();return 0}}while(0);if((h|0)==(j|0)){c[11732]=c[11732]&~(1<<m);break}do{if((h|0)==(l|0)){i=h+8|0}else{if(h>>>0<i>>>0){Aa();return 0}i=h+8|0;if((c[i>>2]|0)==(k|0)){break}Aa();return 0}}while(0);c[j+12>>2]=h;c[i>>2]=j}else{k=c[e+(h+24)>>2]|0;l=c[e+(h+12)>>2]|0;do{if((l|0)==(j|0)){m=e+(h+20)|0;l=c[m>>2]|0;if((l|0)==0){m=e+(h+16)|0;l=c[m>>2]|0;if((l|0)==0){l=0;break}}while(1){o=l+20|0;n=c[o>>2]|0;if((n|0)!=0){l=n;m=o;continue}o=l+16|0;n=c[o>>2]|0;if((n|0)==0){break}else{l=n;m=o}}if(m>>>0<i>>>0){Aa();return 0}else{c[m>>2]=0;break}}else{m=c[e+(h+8)>>2]|0;if(m>>>0<i>>>0){Aa();return 0}n=m+12|0;if((c[n>>2]|0)!=(j|0)){Aa();return 0}i=l+8|0;if((c[i>>2]|0)==(j|0)){c[n>>2]=l;c[i>>2]=m;break}else{Aa();return 0}}}while(0);if((k|0)==0){break}m=e+(h+28)|0;i=47232+(c[m>>2]<<2)|0;do{if((j|0)==(c[i>>2]|0)){c[i>>2]=l;if((l|0)!=0){break}c[11733]=c[11733]&~(1<<c[m>>2]);break a}else{if(k>>>0<(c[11736]|0)>>>0){Aa();return 0}i=k+16|0;if((c[i>>2]|0)==(j|0)){c[i>>2]=l}else{c[k+20>>2]=l}if((l|0)==0){break a}}}while(0);if(l>>>0<(c[11736]|0)>>>0){Aa();return 0}c[l+24>>2]=k;i=c[e+(h+16)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[l+16>>2]=i;c[i+24>>2]=l;break}}}while(0);h=c[e+(h+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[11736]|0)>>>0){Aa();return 0}else{c[l+20>>2]=h;c[h+24>>2]=l;break}}}while(0);if(f>>>0<16>>>0){c[d>>2]=g|c[d>>2]&1|2;o=e+(g|4)|0;c[o>>2]=c[o>>2]|1;o=a;return o|0}else{c[d>>2]=c[d>>2]&1|b|2;c[e+(b+4)>>2]=f|3;o=e+(g|4)|0;c[o>>2]=c[o>>2]|1;Ze(e+b|0,f);o=a;return o|0}return 0}function Ze(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;h=a;k=h+b|0;j=k;m=c[a+4>>2]|0;a:do{if((m&1|0)==0){o=c[a>>2]|0;if((m&3|0)==0){return}r=h+(-o|0)|0;m=r;a=o+b|0;p=c[11736]|0;if(r>>>0<p>>>0){Aa()}if((m|0)==(c[11737]|0)){d=h+(b+4)|0;if((c[d>>2]&3|0)!=3){d=m;l=a;break}c[11734]=a;c[d>>2]=c[d>>2]&-2;c[h+(4-o)>>2]=a|1;c[k>>2]=a;return}s=o>>>3;if(o>>>0<256>>>0){d=c[h+(8-o)>>2]|0;l=c[h+(12-o)>>2]|0;n=46968+(s<<1<<2)|0;do{if((d|0)!=(n|0)){if(d>>>0<p>>>0){Aa()}if((c[d+12>>2]|0)==(m|0)){break}Aa()}}while(0);if((l|0)==(d|0)){c[11732]=c[11732]&~(1<<s);d=m;l=a;break}do{if((l|0)==(n|0)){q=l+8|0}else{if(l>>>0<p>>>0){Aa()}n=l+8|0;if((c[n>>2]|0)==(m|0)){q=n;break}Aa()}}while(0);c[d+12>>2]=l;c[q>>2]=d;d=m;l=a;break}q=c[h+(24-o)>>2]|0;t=c[h+(12-o)>>2]|0;do{if((t|0)==(r|0)){u=16-o|0;t=h+(u+4)|0;s=c[t>>2]|0;if((s|0)==0){t=h+u|0;s=c[t>>2]|0;if((s|0)==0){n=0;break}}while(1){v=s+20|0;u=c[v>>2]|0;if((u|0)!=0){s=u;t=v;continue}v=s+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{s=u;t=v}}if(t>>>0<p>>>0){Aa()}else{c[t>>2]=0;n=s;break}}else{s=c[h+(8-o)>>2]|0;if(s>>>0<p>>>0){Aa()}u=s+12|0;if((c[u>>2]|0)!=(r|0)){Aa()}p=t+8|0;if((c[p>>2]|0)==(r|0)){c[u>>2]=t;c[p>>2]=s;n=t;break}else{Aa()}}}while(0);if((q|0)==0){d=m;l=a;break}s=h+(28-o)|0;p=47232+(c[s>>2]<<2)|0;do{if((r|0)==(c[p>>2]|0)){c[p>>2]=n;if((n|0)!=0){break}c[11733]=c[11733]&~(1<<c[s>>2]);d=m;l=a;break a}else{if(q>>>0<(c[11736]|0)>>>0){Aa()}p=q+16|0;if((c[p>>2]|0)==(r|0)){c[p>>2]=n}else{c[q+20>>2]=n}if((n|0)==0){d=m;l=a;break a}}}while(0);if(n>>>0<(c[11736]|0)>>>0){Aa()}c[n+24>>2]=q;p=16-o|0;o=c[h+p>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[11736]|0)>>>0){Aa()}else{c[n+16>>2]=o;c[o+24>>2]=n;break}}}while(0);o=c[h+(p+4)>>2]|0;if((o|0)==0){d=m;l=a;break}if(o>>>0<(c[11736]|0)>>>0){Aa()}else{c[n+20>>2]=o;c[o+24>>2]=n;d=m;l=a;break}}else{d=a;l=b}}while(0);m=c[11736]|0;if(k>>>0<m>>>0){Aa()}a=h+(b+4)|0;n=c[a>>2]|0;do{if((n&2|0)==0){if((j|0)==(c[11738]|0)){v=(c[11735]|0)+l|0;c[11735]=v;c[11738]=d;c[d+4>>2]=v|1;if((d|0)!=(c[11737]|0)){return}c[11737]=0;c[11734]=0;return}if((j|0)==(c[11737]|0)){v=(c[11734]|0)+l|0;c[11734]=v;c[11737]=d;c[d+4>>2]=v|1;c[d+v>>2]=v;return}l=(n&-8)+l|0;a=n>>>3;b:do{if(n>>>0<256>>>0){g=c[h+(b+8)>>2]|0;b=c[h+(b+12)>>2]|0;h=46968+(a<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<m>>>0){Aa()}if((c[g+12>>2]|0)==(j|0)){break}Aa()}}while(0);if((b|0)==(g|0)){c[11732]=c[11732]&~(1<<a);break}do{if((b|0)==(h|0)){i=b+8|0}else{if(b>>>0<m>>>0){Aa()}h=b+8|0;if((c[h>>2]|0)==(j|0)){i=h;break}Aa()}}while(0);c[g+12>>2]=b;c[i>>2]=g}else{i=c[h+(b+24)>>2]|0;j=c[h+(b+12)>>2]|0;do{if((j|0)==(k|0)){a=h+(b+20)|0;j=c[a>>2]|0;if((j|0)==0){a=h+(b+16)|0;j=c[a>>2]|0;if((j|0)==0){g=0;break}}while(1){o=j+20|0;n=c[o>>2]|0;if((n|0)!=0){j=n;a=o;continue}n=j+16|0;o=c[n>>2]|0;if((o|0)==0){break}else{j=o;a=n}}if(a>>>0<m>>>0){Aa()}else{c[a>>2]=0;g=j;break}}else{a=c[h+(b+8)>>2]|0;if(a>>>0<m>>>0){Aa()}m=a+12|0;if((c[m>>2]|0)!=(k|0)){Aa()}n=j+8|0;if((c[n>>2]|0)==(k|0)){c[m>>2]=j;c[n>>2]=a;g=j;break}else{Aa()}}}while(0);if((i|0)==0){break}j=h+(b+28)|0;m=47232+(c[j>>2]<<2)|0;do{if((k|0)==(c[m>>2]|0)){c[m>>2]=g;if((g|0)!=0){break}c[11733]=c[11733]&~(1<<c[j>>2]);break b}else{if(i>>>0<(c[11736]|0)>>>0){Aa()}j=i+16|0;if((c[j>>2]|0)==(k|0)){c[j>>2]=g}else{c[i+20>>2]=g}if((g|0)==0){break b}}}while(0);if(g>>>0<(c[11736]|0)>>>0){Aa()}c[g+24>>2]=i;i=c[h+(b+16)>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[11736]|0)>>>0){Aa()}else{c[g+16>>2]=i;c[i+24>>2]=g;break}}}while(0);b=c[h+(b+20)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[11736]|0)>>>0){Aa()}else{c[g+20>>2]=b;c[b+24>>2]=g;break}}}while(0);c[d+4>>2]=l|1;c[d+l>>2]=l;if((d|0)!=(c[11737]|0)){break}c[11734]=l;return}else{c[a>>2]=n&-2;c[d+4>>2]=l|1;c[d+l>>2]=l}}while(0);i=l>>>3;if(l>>>0<256>>>0){g=i<<1;b=46968+(g<<2)|0;h=c[11732]|0;i=1<<i;do{if((h&i|0)==0){c[11732]=h|i;f=b;e=46968+(g+2<<2)|0}else{g=46968+(g+2<<2)|0;h=c[g>>2]|0;if(h>>>0>=(c[11736]|0)>>>0){f=h;e=g;break}Aa()}}while(0);c[e>>2]=d;c[f+12>>2]=d;c[d+8>>2]=f;c[d+12>>2]=b;return}e=d;f=l>>>8;do{if((f|0)==0){f=0}else{if(l>>>0>16777215>>>0){f=31;break}u=(f+1048320|0)>>>16&8;v=f<<u;t=(v+520192|0)>>>16&4;v=v<<t;f=(v+245760|0)>>>16&2;f=14-(t|u|f)+(v<<f>>>15)|0;f=l>>>((f+7|0)>>>0)&1|f<<1}}while(0);b=47232+(f<<2)|0;c[d+28>>2]=f;c[d+20>>2]=0;c[d+16>>2]=0;h=c[11733]|0;g=1<<f;if((h&g|0)==0){c[11733]=h|g;c[b>>2]=e;c[d+24>>2]=b;c[d+12>>2]=d;c[d+8>>2]=d;return}g=c[b>>2]|0;if((f|0)==31){b=0}else{b=25-(f>>>1)|0}c:do{if((c[g+4>>2]&-8|0)!=(l|0)){f=g;h=l<<b;while(1){b=f+16+(h>>>31<<2)|0;g=c[b>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(l|0)){break c}else{f=g;h=h<<1}}if(b>>>0<(c[11736]|0)>>>0){Aa()}c[b>>2]=e;c[d+24>>2]=f;c[d+12>>2]=d;c[d+8>>2]=d;return}}while(0);b=g+8|0;f=c[b>>2]|0;v=c[11736]|0;if(!(g>>>0>=v>>>0&f>>>0>=v>>>0)){Aa()}c[f+12>>2]=e;c[b>>2]=e;c[d+8>>2]=f;c[d+12>>2]=g;c[d+24>>2]=0;return}function _e(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function $e(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function af(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bf(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function cf(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function df(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;c=a+c>>>0;return(F=b+d+(c>>>0<a>>>0|0)>>>0,c|0)|0}function ef(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;b=b-d-(c>>>0>a>>>0|0)>>>0;return(F=b,a-c>>>0|0)|0}function ff(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b<<c|(a&(1<<c)-1<<32-c)>>>32-c;return a<<c}F=a<<c-32;return 0}function gf(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b>>>c;return a>>>c|(b&(1<<c)-1)<<32-c}F=0;return b>>>c-32|0}function hf(a,b,c){a=a|0;b=b|0;c=c|0;if((c|0)<32){F=b>>c;return a>>>c|(b&(1<<c)-1)<<32-c}F=(b|0)<0?-1:0;return b>>c-32|0}function jf(b){b=b|0;var c=0;c=a[n+(b>>>24)|0]|0;if((c|0)<8)return c|0;c=a[n+(b>>16&255)|0]|0;if((c|0)<8)return c+8|0;c=a[n+(b>>8&255)|0]|0;if((c|0)<8)return c+16|0;return(a[n+(b&255)|0]|0)+24|0}function kf(b){b=b|0;var c=0;c=a[m+(b&255)|0]|0;if((c|0)<8)return c|0;c=a[m+(b>>8&255)|0]|0;if((c|0)<8)return c+8|0;c=a[m+(b>>16&255)|0]|0;if((c|0)<8)return c+16|0;return(a[m+(b>>>24)|0]|0)+24|0}function lf(a,b){a=a|0;b=b|0;var c=0,d=0,e=0,f=0;f=a&65535;d=b&65535;c=ba(d,f)|0;e=a>>>16;d=(c>>>16)+(ba(d,e)|0)|0;b=b>>>16;a=ba(b,f)|0;return(F=(d>>>16)+(ba(b,e)|0)+(((d&65535)+a|0)>>>16)|0,d+a<<16|c&65535|0)|0}function mf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,h=0;e=b>>31|((b|0)<0?-1:0)<<1;f=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;g=d>>31|((d|0)<0?-1:0)<<1;h=((d|0)<0?-1:0)>>31|((d|0)<0?-1:0)<<1;a=ef(e^a,f^b,e,f)|0;b=F;e=g^e;f=h^f;g=ef((rf(a,b,ef(g^c,h^d,g,h)|0,F,0)|0)^e,F^f,e,f)|0;return(F=F,g)|0}function nf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;f=g|0;h=b>>31|((b|0)<0?-1:0)<<1;j=((b|0)<0?-1:0)>>31|((b|0)<0?-1:0)<<1;k=e>>31|((e|0)<0?-1:0)<<1;l=((e|0)<0?-1:0)>>31|((e|0)<0?-1:0)<<1;a=ef(h^a,j^b,h,j)|0;b=F;rf(a,b,ef(k^d,l^e,k,l)|0,F,f)|0;k=ef(c[f>>2]^h,c[f+4>>2]^j,h,j)|0;j=F;i=g;return(F=j,k)|0}function of(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0;e=a;f=c;a=lf(e,f)|0;c=F;return(F=(ba(b,f)|0)+(ba(d,e)|0)+c|c&0,a|0|0)|0}function pf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;a=rf(a,b,c,d,0)|0;return(F=F,a)|0}function qf(a,b,d,e){a=a|0;b=b|0;d=d|0;e=e|0;var f=0,g=0;g=i;i=i+8|0;f=g|0;rf(a,b,d,e,f)|0;i=g;return(F=c[f+4>>2]|0,c[f>>2]|0)|0}function rf(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0;h=a;j=b;i=j;k=d;g=e;l=g;if((i|0)==0){d=(f|0)!=0;if((l|0)==0){if(d){c[f>>2]=(h>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(h>>>0)/(k>>>0)>>>0;return(F=l,m)|0}else{if(!d){l=0;m=0;return(F=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=b&0;l=0;m=0;return(F=l,m)|0}}m=(l|0)==0;do{if((k|0)==0){if(m){if((f|0)!=0){c[f>>2]=(i>>>0)%(k>>>0);c[f+4>>2]=0}l=0;m=(i>>>0)/(k>>>0)>>>0;return(F=l,m)|0}if((h|0)==0){if((f|0)!=0){c[f>>2]=0;c[f+4>>2]=(i>>>0)%(l>>>0)}k=0;m=(i>>>0)/(l>>>0)>>>0;return(F=k,m)|0}k=l-1|0;if((k&l|0)==0){if((f|0)!=0){c[f>>2]=a|0;c[f+4>>2]=k&i|b&0}k=0;m=i>>>((kf(l|0)|0)>>>0);return(F=k,m)|0}k=(jf(l|0)|0)-(jf(i|0)|0)|0;if(k>>>0<=30){b=k+1|0;m=31-k|0;j=b;a=i<<m|h>>>(b>>>0);b=i>>>(b>>>0);l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(F=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(F=l,m)|0}else{if(!m){k=(jf(l|0)|0)-(jf(i|0)|0)|0;if(k>>>0<=31){l=k+1|0;m=31-k|0;b=k-31>>31;j=l;a=h>>>(l>>>0)&b|i<<m;b=i>>>(l>>>0)&b;l=0;i=h<<m;break}if((f|0)==0){l=0;m=0;return(F=l,m)|0}c[f>>2]=a|0;c[f+4>>2]=j|b&0;l=0;m=0;return(F=l,m)|0}l=k-1|0;if((l&k|0)!=0){m=(jf(k|0)|0)+33-(jf(i|0)|0)|0;p=64-m|0;k=32-m|0;n=k>>31;o=m-32|0;b=o>>31;j=m;a=k-1>>31&i>>>(o>>>0)|(i<<k|h>>>(m>>>0))&b;b=b&i>>>(m>>>0);l=h<<p&n;i=(i<<p|h>>>(o>>>0))&n|h<<k&m-33>>31;break}if((f|0)!=0){c[f>>2]=l&h;c[f+4>>2]=0}if((k|0)==1){o=j|b&0;p=a|0|0;return(F=o,p)|0}else{p=kf(k|0)|0;o=i>>>(p>>>0)|0;p=i<<32-p|h>>>(p>>>0)|0;return(F=o,p)|0}}}while(0);if((j|0)==0){m=a;d=0;a=0}else{d=d|0|0;g=g|e&0;e=df(d,g,-1,-1)|0;h=F;k=b;m=a;a=0;while(1){b=l>>>31|i<<1;l=a|l<<1;i=m<<1|i>>>31|0;k=m>>>31|k<<1|0;ef(e,h,i,k)|0;m=F;p=m>>31|((m|0)<0?-1:0)<<1;a=p&1;m=ef(i,k,p&d,(((m|0)<0?-1:0)>>31|((m|0)<0?-1:0)<<1)&g)|0;k=F;j=j-1|0;if((j|0)==0){break}else{i=b}}i=b;b=k;d=0}g=0;if((f|0)!=0){c[f>>2]=m;c[f+4>>2]=b}o=(l|0)>>>31|(i|g)<<1|(g<<1|l>>>31)&0|d;p=(l<<1|0>>>31)&-2|a;return(F=o,p)|0}function sf(a,b){a=a|0;b=b|0;return Bb[a&1](b|0)|0}function tf(a){a=a|0;return Cb[a&7]()|0}function uf(a,b){a=a|0;b=b|0;Db[a&63](b|0)}function vf(a,b,c){a=a|0;b=b|0;c=c|0;Eb[a&1](b|0,c|0)}function wf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;return Fb[a&31](b|0,c|0,d|0)|0}function xf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;Gb[a&31](b|0,c|0,d|0)}function yf(a){a=a|0;Hb[a&1]()}function zf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;return Ib[a&31](b|0,c|0,d|0,e|0)|0}function Af(a,b,c){a=a|0;b=b|0;c=c|0;return Jb[a&1](b|0,c|0)|0}function Bf(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;Kb[a&63](b|0,c|0,d|0,e|0)}function Cf(a){a=a|0;ca(0);return 0}function Df(){ca(1);return 0}function Ef(a){a=a|0;ca(2)}function Ff(a,b){a=a|0;b=b|0;ca(3)}function Gf(a,b,c){a=a|0;b=b|0;c=c|0;ca(4);return 0}function Hf(a,b,c){a=a|0;b=b|0;c=c|0;ca(5)}function If(){ca(6)}function Jf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(7);return 0}function Kf(a,b){a=a|0;b=b|0;ca(8);return 0}function Lf(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;ca(9)}




// EMSCRIPTEN_END_FUNCS
var Bb=[Cf,Cf];var Cb=[Df,Df,Ce,Df,De,Df,Df,Df];var Db=[Ef,Ef,Ee,Ef,Hd,Ef,ae,Ef,ue,Ef,rc,Ef,ie,Ef,td,Ef,Ad,Ef,bd,Ef,Be,Ef,ac,Ef,qd,Ef,vd,Ef,ic,Ef,Fe,Ef,ld,Ef,Od,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef,Ef];var Eb=[Ff,Ff];var Fb=[Gf,Gf,Bd,Gf,ve,Gf,ke,Gf,kd,Gf,ed,Gf,qe,Gf,fd,Gf,pe,Gf,ud,Gf,Ld,Gf,Wd,Gf,Dd,Gf,fe,Gf,Gf,Gf,Gf,Gf];var Gb=[Hf,Hf,rd,Hf,ye,Hf,yd,Hf,hd,Hf,Yd,Hf,jc,Hf,qc,Hf,Jd,Hf,le,Hf,ce,Hf,Hf,Hf,Hf,Hf,Hf,Hf,Hf,Hf,Hf,Hf];var Hb=[If,If];var Ib=[Jf,Jf,gd,Jf,od,Jf,Ae,Jf,he,Jf,xd,Jf,Md,Jf,ze,Jf,ne,Jf,Xd,Jf,me,Jf,nd,Jf,Pd,Jf,Qd,Jf,Rd,Jf,Jf,Jf];var Jb=[Kf,Kf];var Kb=[Lf,Lf,Vd,Lf,Oe,Lf,xc,Lf,cd,Lf,dd,Lf,we,Lf,Td,Lf,Cd,Lf,vc,Lf,Fd,Lf,Kd,Lf,oe,Lf,Ud,Lf,wc,Lf,Sd,Lf,wd,Lf,md,Lf,Ed,Lf,ge,Lf,re,Lf,se,Lf,de,Lf,ee,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf,Lf];return{_malloc:Ve,_strlen:_e,_free:We,_realloc:Xe,_loadPartialProgram:bc,_tolower:cf,_fetchN:ec,_memset:$e,_buttonHit:fc,_memcpy:af,_engineInit:cc,_strcpy:bf,runPostSets:$b,stackAlloc:Lb,stackSave:Mb,stackRestore:Nb,setThrew:Ob,setTempRet0:Rb,setTempRet1:Sb,setTempRet2:Tb,setTempRet3:Ub,setTempRet4:Vb,setTempRet5:Wb,setTempRet6:Xb,setTempRet7:Yb,setTempRet8:Zb,setTempRet9:_b,dynCall_ii:sf,dynCall_i:tf,dynCall_vi:uf,dynCall_vii:vf,dynCall_iiii:wf,dynCall_viii:xf,dynCall_v:yf,dynCall_iiiii:zf,dynCall_iii:Af,dynCall_viiii:Bf}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_i": invoke_i, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_iiii": invoke_iiii, "invoke_viii": invoke_viii, "invoke_v": invoke_v, "invoke_iiiii": invoke_iiiii, "invoke_iii": invoke_iii, "invoke_viiii": invoke_viiii, "_llvm_va_end": _llvm_va_end, "_strncmp": _strncmp, "_pread": _pread, "_sscanf": _sscanf, "___assert_fail": ___assert_fail, "__scanString": __scanString, "__inet_pton4_raw": __inet_pton4_raw, "_accept": _accept, "__getFloat": __getFloat, "_abort": _abort, "_fprintf": _fprintf, "_printf": _printf, "_close": _close, "__read_sockaddr": __read_sockaddr, "_fflush": _fflush, "_htons": _htons, "__reallyNegative": __reallyNegative, "__write_sockaddr": __write_sockaddr, "_select": _select, "_usleep": _usleep, "_fputc": _fputc, "_emscripten_asm_const": _emscripten_asm_const, "_snprintf": _snprintf, "_puts": _puts, "___setErrNo": ___setErrNo, "_fwrite": _fwrite, "_send": _send, "_write": _write, "_fputs": _fputs, "__inet_pton6_raw": __inet_pton6_raw, "_exit": _exit, "_sprintf": _sprintf, "_llvm_lifetime_end": _llvm_lifetime_end, "_time": _time, "_strdup": _strdup, "_listen": _listen, "_strchr": _strchr, "_isalpha": _isalpha, "__inet_ntop4_raw": __inet_ntop4_raw, "_read": _read, "__inet_ntop6_raw": __inet_ntop6_raw, "__formatString": __formatString, "_vfprintf": _vfprintf, "_recv": _recv, "_llvm_stackrestore": _llvm_stackrestore, "_setsockopt": _setsockopt, "_pwrite": _pwrite, "_perror": _perror, "_socket": _socket, "_sbrk": _sbrk, "_llvm_stacksave": _llvm_stacksave, "_strerror_r": _strerror_r, "_bind": _bind, "_signal": _signal, "___errno_location": ___errno_location, "_strerror": _strerror, "_llvm_lifetime_start": _llvm_lifetime_start, "_sysconf": _sysconf, "_sleep": _sleep, "__exit": __exit, "_emscripten_run_script": _emscripten_run_script, "_strcmp": _strcmp, "_memchr": _memchr, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8, "ctlz_i8": ctlz_i8, "NaN": NaN, "Infinity": Infinity, "_stdout": _stdout, "_stderr": _stderr }, buffer);
var _malloc = Module["_malloc"] = asm["_malloc"];
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _loadPartialProgram = Module["_loadPartialProgram"] = asm["_loadPartialProgram"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _fetchN = Module["_fetchN"] = asm["_fetchN"];
var _memset = Module["_memset"] = asm["_memset"];
var _buttonHit = Module["_buttonHit"] = asm["_buttonHit"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _engineInit = Module["_engineInit"] = asm["_engineInit"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };

// TODO: strip out parts of this we do not need

//======= begin closure i64 code =======

// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */

var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };


  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.

    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };


  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.


  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};


  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }

    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };


  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };


  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };


  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }

    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }

    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));

    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };


  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.


  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;


  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;


  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);


  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);


  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);


  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);


  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);


  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);


  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };


  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };


  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }

    if (this.isZero()) {
      return '0';
    }

    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }

    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));

    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);

      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };


  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };


  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };


  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };


  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };


  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };


  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };


  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };


  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };


  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }

    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }

    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };


  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };


  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };


  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }

    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }

    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.

    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;

    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;

    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };


  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }

    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }

    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }

    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));

      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);

      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }

      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }

      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };


  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };


  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };


  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };


  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };


  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };


  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };


  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };

  //======= begin jsbn =======

  var navigator = { appName: 'Modern Browser' }; // polyfill a little

  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/

  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */

  // Basic JavaScript BN library - subset useful for RSA encryption.

  // Bits per digit
  var dbits;

  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);

  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }

  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }

  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.

  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }

  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);

  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;

  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }

  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }

  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }

  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }

  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }

  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }

  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }

  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }

  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }

  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }

  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }

  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }

  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }

  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }

  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }

  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }

  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }

  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }

  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }

  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }

  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;

  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }

  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }

  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }

  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }

  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }

  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }

  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }

  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;

  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }

  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }

  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }

  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;

  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;

  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);

  // jsbn2 stuff

  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }

  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }

  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }

  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }

  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }

  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }

  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }

  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }

  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;

  //======= end jsbn =======

  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();

//======= end closure i64 code =======



// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort() at ' + stackTrace();
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}

run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






