/**
 * @file 运行时AMD，提供define require require.defer require.async接口
 * @author zhangwentao(zhangwentao@baidu.com)
 */

(function(global){

  var isReady = false,
    DOMContentLoaded,
    _lazy_modules = [];

  var _module_map = {};

  //function define(id, dependencies, factory) {
  //var _module_map = {};

  /**
   * 运行时 AMD define 实现
   *
   * @param {String} id 模块名
   * @param {Array} dependencies 依赖模块
   * @param {factory} factory 模块函数
   * @access public
   * @return void
   * @see require
   */
  var define = function(id, dependencies, factory) {
      if (!factory) {
          factory = dependencies;
          dependencies = [];
      }
    _module_map[id] = {
      factory: factory,
      dependencies: dependencies
    };
  };


  define.amd = {
    jQuery : true
  };
  /**
   * 运行时 AMD require 实现
   *
   * @param {String} id 需要 require 的模块 id
   * @access public
   * @return {Object} 模块的exports
   * @see define
   */
  var require = function(id) {
    var module, exports, args, ret;

    if (!_module_map.hasOwnProperty(id)) {
      throw new Error('Requiring unknown module "' + id + '"');
    }

    module = _module_map[id];
    if (module.hasOwnProperty("exports")) {
      return module.exports;
    }

    module.exports = exports = {};

    args = buildArguments(module.dependencies, require, module, exports);
    ret = module.factory.apply(undefined, args);

    if(ret !== undefined){
      module.exports = ret;
    }
    return module.exports;
  };

  require.async = function(names, callback){
    var resource, modules;

    resource = getFakeResource(names);

    resource.on('resolve', function(){
      modules = getModules(names);

      callback && callback.apply(null, modules);
    });

    resource.load();
  };

  function getModules(names){
    var i,
      count = names.length,
      name,
      modules = [];

    for(i = 0; i < count; i++){
      name = names[i];
      modules.push(require(name));
    }

    return modules;
  }

  var __fakeId = 0;
  function getFakeResource(names){
    var count,
      i,
      name,
      deps = [],
      resource,
      map = {},
      id;

    count = names.length;

    for(i = 0; i < count; i++){
      name = names[i];
      deps.push(BigPipe.getResourceByName(name).id);
    }

    id = 'fake_res_' + __fakeId ++;
    map[id] = {
      deps : deps,
      type : 'js',
      mods : []
    };

    BigPipe.setResourceMap(map);
    resource = BigPipe.getResource(id);

    return resource;
  }

  require.defer = function(names, callback){
    if(isReady){
      require.async(names, callback);
    }else{
      _lazy_modules.push([names, callback]);
    }
  };
  /**
   * 根据 id 数组生成模块数组
   * 实现AMD规范
   *
   * @param {Array} deps 依赖的模块名列表
   * @param {Function} require require函数
   * @param {Object} module 模块
   * @param {Object} exports 模块的 exports 对象
   * @access public
   * @return {Array} 执行 require 后的模块数组
   */
  function buildArguments(deps, require, module, exports) {
    var index, count, did, args;

    args = [];
    count = deps.length;
    for (index = 0; index < count; index++) {
      did = deps[index];
      if (did === "global") {
        args.push(window);
      }else if (did === "require") {
        args.push(require);
      } else if (did === "module") {
        args.push(module);
      } else if (did === "exports") {
        args.push(exports);
      } else {
        args.push(require(did));
      }
    }
    return args;
  }

  function onready(){
    var i,
      len = _lazy_modules.length,
      mod,
      names,
      callback;

    if(len > 0){
      for(i = 0; i < len; i++){
        mod = _lazy_modules[i];
        names = mod[0];
        callback = mod[1];
        require.async(names, callback);
      }
      _lazy_modules = [];
    }
  }

  function ready() {
    if (!isReady) {
      isReady = true;
      onready();
      //requireLazy.onready && requireLazy.onready();
      //loadAllLazyModules();
    }
  }

  // Cleanup functions for the document ready method
  if (document.addEventListener) {
    DOMContentLoaded = function () {
      document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
      ready();
    };

  } else if (document.attachEvent) {
    DOMContentLoaded = function () {
      // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
      if (document.readyState === "complete") {
        document.detachEvent("onreadystatechange", DOMContentLoaded);
        ready();
      }
    };
  }

  function bindReady() {
    // Mozilla, Opera and webkit nightlies currently support this event
    if (document.addEventListener) {
      // Use the handy event callback
      document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

      // A fallback to window.onload, that will always work
      window.addEventListener("load", ready, false);

      // If IE event model is used
    } else if (document.attachEvent) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      document.attachEvent("onreadystatechange", DOMContentLoaded);

      // A fallback to window.onload, that will always work
      window.attachEvent("onload", ready);
    }
  }

  global.require = require;
  global.define = define;

  bindReady();
  //global.require = require;
})(window);

;

(function(global, window, document, undefined) {
    function ajax(url, cb, data) {
  var xhr = new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223 || xhr.status === 0) {
            cb(false, xhr.responseText, xhr.status);
        } else {
            cb(new Error('AjaxError'), xhr.statusText, xhr.status);
        }
    }
  };
  xhr.open(data ? 'POST' : 'GET', url + '&t=' + ~~(Math.random() * 1e6), true);

  if (data) {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(data);
}
;
/**
 * 一个简单的 AMD define 实现
 *
 * @param {String} name 模块名
 * @param {Array} dependencies 依赖模块
 * @param {factory} factory 模块函数
 * @access public
 * @return void
 * @see require
 */

var _module_map = {};

function define(id, dependencies, factory) {
  _module_map[id] = {
    factory: factory,
    deps: dependencies
  };
}

function require(id) {
  var module = _module_map[id];
  if (!hasOwnProperty(_module_map, id))
    throw new Error('Requiring unknown module "' + id + '"');
  if (hasOwnProperty(module, "exports"))
    return module.exports;

  var exports;
  module.exports = exports = {};

  var args = buildArguments(module.deps, require, module, exports);

  module.factory.apply(undefined, args);

  return module.exports;
}

/**
 * 根据 id 数组生成模块数组
 * 实现AMD规范
 *
 * @param {Array} deps 依赖的模块名列表
 * @param {Function} require require函数
 * @param {Object} module 模块
 * @param {Object} exports 模块的 exports 对象
 * @access public
 * @return {Array} 执行 require 后的模块数组
 */
function buildArguments(deps, require, module, exports) {
  var index, count, did, args;

  args = [];
  count = deps.length;
  for (index = 0; index < count; index++) {
    did = deps[index];
    if (did === "require") {
      args.push(require);
    } else if (did === "module") {
      args.push(module);
    } else if (did === "exports") {
      args.push(exports);
    } else {
      args.push(require(did));
    }
  }
  return args;
}

function __b(id, exports) {
  _module_map[id] = {
    exports: exports
  };
}

function __d(id, dependencies, factory) {
  return define(id, ['global', 'require', 'module', 'exports'].concat(dependencies), factory);
}

__b("global", global);
;
function appendToHead(element) {
  var hardpoint,
    heads = document.getElementsByTagName('head');
  hardpoint = heads.length && heads[0] || document.body;

  appendToHead = function (element) {
    hardpoint.appendChild(element);
  };
  return appendToHead(element);
}
;
/**
 * bind 方法会创建一个新函数,称为绑定函数.
 * 当调用这个绑定函数时,绑定函数会以创建它时传入bind方法的第二个参数作为this,
 * 传入bind方法的第三个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数.
 *
 * @param {Function} fn 摇绑定的函数
 * @param {Object} thisObj 调用函数时的 this 对象
 * @param {...*} [args] 执行函数时的参数
 * @access public
 * @return {Function} 绑定后的函数
 *
 * @example
 *
 * var obj = {
 *      name: "it's me!"
 * };
 *
 * var fn = bind(function(){
 *      console.log(this.name);
 *      console.log(arguments);
 * }, obj, 1, 2, 3);
 *
 * fn(4, 5, 6);
 * // it's me
 * // [ 1, 2, 3, 4, 5, 6]
 */
function bind(fn, thisObj /*, args... */) {

  function _bind(fn, thisObj /*, args... */) {
    var savedArgs, //保存绑定的参数
      savedArgLen, //绑定参数的个数
      ret; //返回函数

    // 判断是否有绑定的参数
    savedArgLen = arguments.length - 2;
    if (savedArgLen > 0) {
      //有绑定参数，需要拼接调用参数
      savedArgs = slice(arguments, 2);
      ret = function () {
        var args = toArray(arguments),
          index = savedArgLen;
        //循环将保存的参数移入调用参数
        //这里不使用 Array.prototype.concat 也是为了避免内存浪费
        while (index--) {
          args.unshift(savedArgs[index]);
        }
        return fn.apply(thisObj, args);
      };
    } else {
      // 没有绑定参数，直接调用，减少内存消耗
      ret = function () {
        return fn.apply(thisObj, arguments);
      };
    }

    return ret;
  }

  //保存原生的 bind 函数
  var native_bind = Function.prototype.bind;
  //修改 bind 函数指针
  if (native_bind) {
    //如果原生支持 Function.prototype.bind 则使用原生函数来实现
    bind = function (fn, thisObj /*, args... */) {
      return native_bind.apply(fn, slice(arguments, 1));
    };
  } else {
    bind = _bind;
  }

  return bind.apply(this, arguments);
}
;
/**
 * 复制属性到对象
 *
 * @param {Object} to 目标对象
 * @param {...Object} from 多个参数
 * @access public
 * @return {Object} 目标对象
 *
 * @example
 * var objA = {
 *         a : 1
 *     },
 *     objB = {
 *         b : 2
 *     };
 *
 * copyProperties(objA, objB, {
 *      c : 3
 * });
 * console.log(objA);
 * // {
 * // a : 1,
 * // b : 2,
 * // c : 3
 * // }
 */
function copyProperties(to /*, ...*/) {
  var index, count, item, key;

  to = to || {};
  count = arguments.length;

  //遍历参数列表
  for (index = 1; index < count; index++) {
    item = arguments[index];
    for (key in item) {
      //只复制自有属性
      if (hasOwnProperty(item, key)) {
        to[key] = item[key];
      }
    }
  }

  return to;
}
;
/**
 * 计数器，返回一个用于计数调用的函数，每调用该函数一次，内部的计数器加一，直到达到 total 所指定次数，则调用 callback 函数。如果传递了 timeout 参数，则在 timeout 毫秒后如果还未达到指定次数，则调用 callback
 *
 * @param {Number} total 计数次数
 * @param {Function} callback 计数完成或超时后的回调函数
 * @param {Number} timeout 超时时间
 * @access public
 * @return {Function} 计数函数，每调用一次，内部的计数器就会加一
 *
 *
 * @example
 * var add = counter(4, function(){
 *      console.log("add 4 times!");
 * });
 *
 * add();
 * add();
 * add();
 * add(); // add 4 times!
 */

function counter(total, callback, timeout) {
  var running = true, //是否正在计数
    count = 0, //当前计数值
    timeoutId = null; //超时标记

  // 计数完成或者超时后的回调函数
  function done() {
    if (!running) {
      return;
    }

    running = false;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    //TODO 参数?错误处理?
    callback();
  }

  //将 total 值转换为整数
  total = total | 0;

  //如果目标计数值小于0,则直接调用done
  if (total <= 0) {
    done();
  } else if (timeout !== undefined) {
    timeoutId = setTimeout(done, timeout);
  }

  //返回计数器触发函数
  //该函数每执行一次，计数器加一
  //直到到达设定的 total 值或者超时
  return function () {
    if (running && ++count >= total) {
      done();
    }
  };
}
;
/**
 * Js 派生实现
 *
 * @param {Function} parent 父类
 * @param {Function} [constructor]  子类构造函数
 * @param {Object} [proto] 子类原型
 * @access public
 * @return {Function} 新的类
 *
 * @example
 *
 * var ClassA = derive(Object, function(__super){
 *      console.log("I'm an instance of ClassA:", this instanceof ClassA);
 * });
 *
 * var ClassB = derive(ClassA, function(__super){
 *      console.log("I'm an instance of ClassB:", this instanceof ClassB);
 *      __super();
 * }, {
 *      test:function(){
 *          console.log("test method!");
 *      }
 * });
 *
 * var b = new ClassB();
 * //I'm an instance of ClassA: true
 * //I'm an instance of ClassA: true
 * b.test();
 * //test method!
 */
function derive(parent, constructor, proto) {

  //如果没有传 constructor 参数
  if (typeof constructor === 'object') {
    proto = constructor;
    constructor = proto.constructor || function () {
    };
    delete proto.constructor;
  }

  var tmp = function () {
    },
  //子类构造函数
    subClass = function () {
      //有可能子类和父类初始化参数定义不同，所以将初始化延迟到子类构造函数中执行
      //构造一个 __super 函数,用于子类中调用父类构造函数
      var __super = bind(parent, this),
        args = slice(arguments);

      //将 __super 函数作为 constructor 的第一个参数
      args.unshift(__super);
      constructor.apply(this, args);

      //parent.apply(this, arguments);
      //constructor.apply(this, arguments);
    },
    subClassPrototype;

  //原型链桥接
  tmp.prototype = parent.prototype;
  subClassPrototype = new tmp();

  //复制属性到子类的原型链上
  copyProperties(
    subClassPrototype,
    constructor.prototype,
    proto || {});

  subClassPrototype.constructor = constructor.prototype.constructor;
  subClass.prototype = subClassPrototype;
  return subClass;
}

;
/**
 * 遍历数组或对象
 *
 * @param {Object|Array} object 数组或对象
 * @param {Function} callback 回调函数
 * @param {Object} [thisObj=undefined] 回调函数的this对象
 * @access public
 * @return {Object|Array} 被遍历的对象
 *
 * @example
 *
 * var arr = [1, 2, 3, 4];
 * each(arr, function(item, index, arr){
 *  console.log(index + ":" + item);
 * });
 * // 0:1
 * // 1:2
 * // 2:3
 * // 3:4
 *
 * @example
 *
 * var arr = [1, 2, 3, 4];
 * each(arr, function(item, index, arr){
 *  console.log(index + ":" + item);
 *  if(item > 2){
 *      return false;
 *  }
 * });
 * // 0:1
 * // 1:2
 */
function each(object, callback, thisObj) {
  var name, i = 0,
    length = object.length,
    isObj = length === undefined || isFunction(object);

  if (isObj) {
    for (name in object) {
      if (callback.call(thisObj, object[name], name, object) === false) {
        break;
      }
    }
  } else {
    for (i = 0; i < length; i++) {
      if (callback.call(thisObj, object[i], i, object) === false) {
        break;
      }
    }
  }
  return object;
}
;
/**
 * hasOwnProperty
 *
 * @param obj $obj
 * @param key $key
 * @access public
 * @return void
 */
function hasOwnProperty(obj, key) {

  var native_hasOwnProperty = Object.prototype.hasOwnProperty;

  hasOwnProperty = function(obj, key) {
    return native_hasOwnProperty.call(obj, key);
  };

  return hasOwnProperty(obj, key);
}
;
/**
 * inArray 判断对象是否为数组
 *
 * @param {array} arr 数据源
 * @param {item} item 需要判断的数据项
 * @access public
 * @return {index} 该数据项在目标数组中的索引
 */
function inArray(arr, item) {
  //如果支持 Array.prototype.indexOf 方法则直接使用，
  var index = undefined;
  if (Array.prototype.indexOf) {
    return arr.indexOf(item) > -1 ? arr.indexOf(item) : -1;
  } else {
    each(arr, function (v, i, arr) {
      if (v === item) {
        index = i;
        return false;
      }
    });
  }
  return index === undefined ? -1 : index;
}
;
/**
 * isArray 判断对象是否为数组
 *
 * @param {Object} obj 需要被判断的对象
 * @access public
 * @return {Boolean} 该对象是否为 Array
 */
function isArray(obj) {
  //重设 isArray 函数指针，方便下次调用
  //如果支持 Array.isArray 方法则直接使用，
  //否则用 type 函数来判断
  isArray = Array.isArray || function (obj) {
    return type(obj) === 'array';
  };
  return isArray(obj);
}
;
/**
 * isEmpty 判断是否是空对象，数组判断长度，对象判断自定义属性，其它取非
 *
 * @param {Object} obj 需要被判断的对象
 * @access public
 * @return {Boolean} 该对象是否为为空
 */
function isEmpty(obj) {
  if (isArray(obj)) {
    return obj.length === 0;
  } else if (typeof obj === 'object') {
    for (var i in obj) return false;
    return true;
  } else return !obj;
}
;
/**
 * isFunction 判断一个对象是否为一个函数
 *
 * @param {Object} obj 需要被鉴定的对象
 * @access public
 * @return {Boolean} 该对象是否为一个函数
 */
function isFunction(obj) {
  return type(obj) === 'function';
}
;
/**
 *           File:  JSON.js
 *           Path:  src/common/js
 *         Author:  zhangyuanwei
 *       Modifier:  zhangyuanwei
 *       Modified:  2013-06-20 13:04:58
 *    Description:  JSON跨浏览器实现
 */
/*
 json2.Bigpipe
 2013-05-26

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/Bigpipe.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
  JSON = {};
}

(function () {
  'use strict';

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function () {

      return isFinite(this.valueOf())
        ? this.getUTCFullYear() + '-' +
      f(this.getUTCMonth() + 1) + '-' +
      f(this.getUTCDate()) + 'T' +
      f(this.getUTCHours()) + ':' +
      f(this.getUTCMinutes()) + ':' +
      f(this.getUTCSeconds()) + 'Z'
        : null;
    };

    String.prototype.toJSON =
      Number.prototype.toJSON =
        Boolean.prototype.toJSON = function () {
          return this.valueOf();
        };
  }

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    },
    rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
      var c = meta[a];
      return typeof c === 'string'
        ? c
        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

    var i,          // The loop counter.
      k,          // The member key.
      v,          // The member value.
      length,
      mind = gap,
      partial,
      value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
      typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

// What happens next depends on the value's type.

    switch (typeof value) {
      case 'string':
        return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

        return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

        if (!value) {
          return 'null';
        }

// Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

// Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

          v = partial.length === 0
            ? '[]'
            : gap
            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
            : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }

// If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {

// Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

        v = partial.length === 0
          ? '{}'
          : gap
          ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
          : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

// If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
        indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
        (typeof replacer !== 'object' ||
        typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
    };
  }


// If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function (a) {
          return '\\u' +
            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
          .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function'
          ? walk({'': j}, '')
          : j;
      }

// If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
    };
  }
}());
;
/**
 * 将函数延迟执行
 *
 * @param {Function} fn 希望被延迟执行的函数
 * @access public
 * @return {Number} 等待执行的任务数
 *
 * @example
 *
 * var fn = function(){
 *      console.log(2);
 * };
 *
 * nextTick(fn);
 * console.log(1);
 *
 * // 1
 * // 2
 */
function nextTick(fn) {

  var callbacks = [], //等待调用的函数栈
    running = false; //当前是否正在运行中

  //调用所有在函数栈中的函数
  //如果在执行某函数时又有新的函数被添加进来，
  //该函数也会在本次调用的最后被执行
  function callAllCallbacks() {
    var count, index;

    count = callbacks.length;
    for (index = 0; index < count; index++) {
      //TODO 错误处理
      callbacks[index]();
    }
    //删除已经调用过的函数
    callbacks.splice(0, count);

    //判断是否还有函数需要执行
    //函数可能在 callAllCallbacks 调用的过程中被添加到 callbacks 数组
    //所以需要再次判断
    if (callbacks.length) {
      setTimeout(callAllCallbacks, 1);
    } else {
      running = false;
    }
  }

  //修改 nextTick 函数指针，方便下次调用
  nextTick = function (fn) {
    //将函数存放到待调用栈中
    callbacks.push(fn);

    //判断定时器是否启动
    //如果没有启动，则启动计时器
    //如果已经启动，则不需要做什么
    //本次添加的函数会在 callAllCallbacks 时被调用
    if (!running) {
      running = true;
      setTimeout(callAllCallbacks, 1);
    }
    return callbacks.length;
  };

  return nextTick.apply(this, arguments);
}
;
/**
 * 按照顺序调用函数，避免调用堆栈过长
 *
 * @param {Function} fn 需要调用的函数
 * @access public
 * @return {Number} 当前的队列大小，返回0表示函数已经被立即执行
 *
 * @example
 *
 * function fn1(){
 *      console.log("fn1 start");
 *      queueCall(fn2);
 *      console.log("fn1 end");
 * }
 *
 * function fn2(){
 *      console.log("fn2 start");
 *      queueCall(fn3);
 *      console.log("fn2 end");
 * }
 * function fn3(){
 *      console.log("fn3 start");
 *      console.log("fn3 end");
 * }
 *
 * queueCall(fn1);
 * //fn1 start
 * //fn1 end
 * //fn2 start
 * //fn2 end
 * //fn3 start
 * //fn3 end
 */
function queueCall(fn) {
  var running = false,
    list = [];

  queueCall = function (fn) {
    var count, index;
    list.push(fn);
    if (!running) {
      running = true;
      while (true) {
        count = list.length;
        if (count <= 0) {
          break;
        }
        for (index = 0; index < count; index++) {
          //TODO 错误处理
          list[index]();
        }
        list.splice(0, count);
      }
      running = false;
    }

    return list.length;
  };

  return queueCall(fn);
}
;
/**
 * slice 把数组中一部分的浅复制存入一个新的数组对象中，并返回这个新的数组。
 *
 * @param {Array} array 数组
 * @param {Number} start 开始索引
 * @param {Number} end 结束索引
 * @access public
 * @return {Array} 被截取后的数组
 */
function slice(array, start, end) {
  var _slice = Array.prototype.slice;
  //重写 slice 函数指针,便于下次调用.
  slice = function (array, start, end) {
    switch (arguments.length) {
      case 0:
        //TODO throw Error???
        return [];
      case 1:
        return _slice.call(array);
      case 2:
        return _slice.call(array, start);
      case 3:
      default:
        return _slice.call(array, start, end);
    }
  };
  return slice.apply(this, arguments);
}
;
/**
 * toArray 将类数组对象转化为数组
 *
 * @param {Object} obj 需要被转化的类数组对象
 * @access public
 * @return {Array} 数组对象
 */
function toArray(obj) {
  return slice(obj);
}
;
/**
 * type 判断对象类型函数
 * 从 jquery 中拷贝来的
 *
 * @param {Object} obj 被鉴定的对象
 * @access public
 * @return {String} 对象类型字符串
 */
function type(obj) {
  //var types = "Boolean Number String Function Array Date RegExp Object".split(" "),
  var types = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object"],
    toString = Object.prototype.toString,
    class2type = {},
    count, name;

  //构造 class2type 表
  //{
  //  "[object Object]"   : "object",
  //  "[object RegExp]"   : "regexp",
  //  "[object Date]"     : "date",
  //  "[object Array]"    : "array",
  //  "[object Function]" : "function",
  //  "[object String]"   : "string",
  //  "[object Number]"   : "number",
  //  "[object Boolean]"  : "boolean"
  //}
  count = types.length;
  while (count--) {
    name = types[count];
    class2type["[object " + name + "]"] = name.toLowerCase();
  }

  // 判断函数,初始化后再次调用会直接调用这个函数
  function _type(obj) {
    return obj == null ?
      String(obj) :
    class2type[toString.call(obj)] || "object";
  }

  //修改 type 函数指针，以便多次调用开销
  type = _type;

  return type(obj);
}


var str = 'abcba';
var indexMap = {};
var tmpArr = [];
for(var i = 0; i < str.length; i++) {
  var s = str[i];
  var index = indexMap[s];
  if (index === undefined) {
    index = tmpArr.push(s) - 1;
    indexMap[s] = index;
  } else {
    tmpArr[index] = '';
  }
}

var ret = tmpArr.join('');

console.log(ret[0]);
;
;
    /**
 * @file Bigpipe提供获取pagelet 处理pagelet和资源的接口
 * @author zhangwentao(zhangwentao@baidu.com)
 */

__d("BigPipe", ["Resource", "Requestor", "Controller"], function(global, require, module, exports) {

  var Resource = require("Resource");
  var Requestor = require("Requestor");
  var Controller = require("Controller");

  /**
   * @global
   * @namespace
   */
  var BigPipe = {
    init: function() {},
    /**
     * 页面调用函数,用于传输数据
     *
     * @param {Object} conf pagelet数据
     * @example
     * BigPipe.onPageletArrive({
     *  "id" : "",                  //pagelet 的 ID
     *  "container": "__cnt_0_1",   //pagelet HTML的容器ID
     *  "children" : [              //子pagelet的 ID 列表
     *      "header",
     *      "__elm_0_1",
     *      "__elm_0_2"
     *  ].
     *  "deps":{                    //事件的依赖资源
     *      "beforeload": [         //"beforeload" 事件的依赖资源
     *          "XbsgfuDYNN"
     *       ],
     *       "load": [              //"load" 事件的依赖资源
     *          "qwlFYEkDet"
     *       ]
     *  },
     *  "hooks":{                   //事件回调
     *      "beforeload": [         //"beforeload" 的事件回调
     *          "__cb_0_1",
     *          "__cb_0_2"
     *      ],
     *      "load":[                //"load" 的事件回调
     *          "__cb_0_3",
     *          "__cb_0_4"
     *      ]
     *  }
     * });
     */
    onPageletArrive: function(conf) {
      Controller.pageletArrive(conf);
    },
    //TODO
    /**
     * 页面调用函数,用于设置资源列表
     *
     * @param {Object} map 资源列表
     * @example
     * BigPipe.setResourceMap({
     *     "XbsgfuDYNN" : {                                         //资源ID
     *          "type" : "css",                                     //资源类型
     *          "src" : "http://s0.hao123img.com/v5/xx/XX/XX.Bigpipe",   //资源地址
     *          "deps" : [                                          //依赖资源 ID 列表
     *              "rIffdDBQKC",
     *              "qwlFYEkDet"
     *          ],
     *          "mods" : [                                          //资源所包含的模块列表
     *              "common:Bigpipe/jquery.Bigpipe",
     *              "common:Bigpipe/event.Bigpipe"
     *          ]
     *     },
     *     "rIffdDBQKC" : {
     *          // 同上
     *     }
     * });
     */
    setResourceMap : Controller.setResourceMap, //function(map) {
    //TODO
    //Resource.setResourceMap(map);
    //},
    loadedResource : Resource.loadedResource, //function(resources){
    //Resource.loadedResource(resources);
    //},
    getResource : Resource.getResource, //function(id) {
    //TODO
    //return Resource.getResource(id);
    //},
    getResourceByName : Resource.getResourceByName, //function(name){
    //return Resource.getResourceByName(name);
    //},
    hooks : Controller.hooks,
      fetch: function (pagelets, url, cb) {
          Requestor.fetch(pagelets, url, cb);
      }
  };

  module.exports = BigPipe;

});
;
    /**
 * @file Controller 处理pageletArrive
 * @author zhangwentao(zhangwentao@baidu.com)
 */

__d("Controller", ["Pagelet", "Resource"], function (global, require, module, exports) {

  var Pagelet = require("Pagelet");
  var Resource = require("Resource");

  var Controller = {
    pageletsArrive : function(pagelets){
      each(pagelets, function(pagelet){
        this.pageletArrive(pagelet);
      }, this);
    },
    pageletArrive : function(conf){
      var pagelet;

      if(Pagelet.hasPlagelet(conf.id)){
        Pagelet.getPlagelet(conf.id).unload();
      }

      pagelet =  Pagelet.getPlagelet(conf.id);

      if(conf.quickling){
        Resource.setResourceMap(conf.resourceMap);
      }else if(conf.html){
        conf.html = document.getElementById(conf.html.container).firstChild.data;
      }

      var hooks = conf.hooks;
      if(hooks){
        for(var i in hooks){
          var type = hooks[i];
          for(var j = 0; j < type.length; j++){
            conf.quickling ?
              pagelet.on(i, new Function(type[j])) :
              pagelet.on(i, this.hooks[type[j]]);
          }
        }
      }

      pagelet.arrive(conf);
    },
    hooks:{},
    setResourceMap : Resource.setResourceMap
  };

  module.exports = Controller;
});
/* @cmd false */
;
    __d("CSSLoader", ["EventEmitter"], function(global, require, module, exports) {
  var EventEmitter = require("EventEmitter");
  /**
   * 声明全局变量
   * @param {Number} interval 检测拉取css的时间间隔
   * @param {Number} WAITTIME 等待超时时间
   * @param {Boolen} dusSupport 是否支持data url scheme
   * @param {Boolen} checked 是否已检测过data url scheme
   * @param {Object} loadedMap 已加载css的Map
   * @param {Array} styleSheetSet 加载styleSheet的集合
   * @param {Number} timeout 超时时间
   * @param {Object} pullMap 拉取css的Map
   */

    var interval = 20;
    var WAITTIME = 15000;
    var dusSupport;
    var checked;
    var loadedMap = {};
    var styleSheetSet = [];
    var timeout;
    var pullMap = {};

  function checkDusSupport() {
    var link;
    if (checked)
      return;
    checked = true;
    link = document.createElement('link');
    link.onload = function () {
      dusSupport = true;
      link.parentNode.removeChild(link);
    };
    link.rel = 'stylesheet';
    link.href = 'data:text/css;base64,';
    appendToHead(link);
  }

  function checkCssLoaded() {
    var id,
      callbacks = [],
      contexts = [],
      signals = [],
      signal,
      style;
    if (+new Date >= timeout) { //超时
      for (id in pullMap) {
        signals.push(pullMap[id].signal);
        callbacks.push(pullMap[id].error);
        contexts.push(pullMap[id].context);
      }
      pullMap = {};
    } else {
      for (id in pullMap) {
        signal = pullMap[id].signal;
        style = window.getComputedStyle ? getComputedStyle(signal, null) : signal.currentStyle;
        if (style && parseInt(style.height, 10) > 1) {
          callbacks.push(pullMap[id].load);
          contexts.push(pullMap[id].context);
          signals.push(signal);
          delete pullMap[id];
        }
      }
    }
    //清理
    for (var i = 0; i < signals.length; i++)
      signals[i].parentNode.removeChild(signals[i]);
    if (!isEmpty(callbacks)) {
      for (i = 0; i < callbacks.length; i++) {
        callbacks[i].call(contexts[i]);
      }
      timeout = +new Date + WAITTIME;
    }
    return isEmpty(pullMap);
  }

  function pullCss(id, onload, onTimeout, context) {
    var meta, empty, timer;
    meta = document.createElement('meta');
    meta.className = 'css_' + id;
    appendToHead(meta);

    empty = !isEmpty(pullMap);
    timeout = +new Date + WAITTIME;
    pullMap[id] = {
      signal: meta,
      load: onload,
      error: onTimeout,
      context: context
    };
    if (!empty) {
      timer = setInterval(function () {
        if (checkCssLoaded()) {
          clearInterval(timer);
        }
      }, interval);
    }
  }

  function onload() {
    this.done("load");
  }

  function onTimeout() {
    this.done("timeout");
  }

  var EVENT_TYPES = [
    "load", // CSS加载完成时派发的事件
    "timeout" // CSS 加载超时事件
    //TODO 错误处理?
  ];

  var CSSLoader = derive(EventEmitter,
    /**
     * 构造一个CSS加载对象,
     *
     * @constructor
     * @extends EventEmitter
     * @alias CSSLoader
     *
     * @param {String} id CSS资源ID
     * @param {Object} config CSS资源信息
     */
    function (__super, id, config) {
      __super(EVENT_TYPES);
      /**
       * CSS资源ID
       * @member {String}
       */
      this.id = id;
      /**
       * CSS资源URL
       * @member {String}
       */
      this.uri = config.src;

    },
    /**
     * @alias CSSLoader.prototype
     */
    {
      /**
       * 开始加载资源
       * @fires CSSLoader#load
       */
      load: function () {
        var me = this,
          id = this.id,
          uri = this.uri,
          index, link;
        if (loadedMap[id])
          throw new Error('CSS component ' + id + ' has already been requested.');
        if (document.createStyleSheet) {
          for (var i = 0; i < styleSheetSet.length; i++)
            if (styleSheetSet[i].imports.length < 31) {
              index = i;
              break;
            }
          if (index === undefined) {
            styleSheetSet.push(document.createStyleSheet());
            index = styleSheetSet.length - 1;
          }
          styleSheetSet[index].addImport(uri);
          loadedMap[id] = {
            styleSheet: styleSheetSet[index],
            uri: uri
          };
          pullCss(id, onload, onTimeout, this);
          return;
        }
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = uri;
        loadedMap[id] = {
          link: link
        };
        if (dusSupport) {
          link.onload = function () {
            link.onload = link.onerror = null;
            //link.parentNode.removeChild(link);
            onload.call(me);
          };
          link.onerror = function () {
            link.onload = link.onerror = null;
            //link.parentNode.removeChild(link);
            onTimeout.call(me);
          };
        } else {
          pullCss(id, onload, onTimeout, this);
          if (dusSupport === undefined)
            checkDusSupport();
        }
        appendToHead(link);
      },
      unload: function () {
        // TODO 资源卸载?一期先不用
      }
    });

  module.exports = CSSLoader;
});
;
    __d("EventEmitter", [], function(global, require, module, exports) {
    /**
     * 事件机制实现
     *
     * @class
     * @param {Object} [bindObj] 使用借用方式调用时的目标对象
     * @param {Array} types 初始的事件列表
     * @access public
     *
     * @example
     * // 直接使用
     * var emitter = new EventEmitter(["load"]);
     *
     * emitter.on("load", function(data){
     *      console.log("load!!!");
     * });
     *
     * emitter.emit("load", data);
     *
     *
     * @example
     * // 继承使用
     * var SubClass = derive(EventEmitter, function(__super){
     *      __super(["someevent"]);
     * }, {
     *      doSomething:function() {
     *          this.emit("someevent");
     *      }
     * });
     *
     * var emitter = new SubClass();
     *
     * emitter.on("someevent", function(){
     *      console.log("some event!!");
     * });
     *
     * emitter.doSomething(); // some event!!
     *
     * @example
     * // 借用方式使用
     * var obj = {};
     * EventEmitter(obj, ["load"]);
     *
     * obj.on("load", function(data){
     *      console.log("load!!");
     * });
     * obj.emit("load", data);
     */
    function EventEmitter(bindObj, types) {
        if (this instanceof EventEmitter) {
            //使用 new EventEmitter(types)方式调用
            types = bindObj;
            bindObj = this;
        } else if (bindObj !== undefined) {
            //借用方式调用
            copyProperties(bindObj, EventEmitter.prototype);
        }
        bindObj.initEventTypes(types);
    }


    function call(item, data) {
        var ret;
        try {
            ret = item.callback.call(item.thisObj, data);
        } catch (e) {
            setTimeout(function () {
                throw e;
            }, 0);
        }
        return ret;
    }
    /**
     * 成员函数表
     * @alias EventEmitter.prototype
     */
    var eventEmitterMembers = {

        /**
         * 初始化监听事件类型
         *
         * @param {Array} types 监听的事件类型
         * @access public
         * @return void
         */
        initEventTypes: function(types) {
            var listenerMap = {};
            each(types, function(type) {
                listenerMap[type] = {
                    callbacks: [],
                    eventData: undefined
                };
            });
            /**
             * _listenerMap
             *
             * 监听函数列表
             * {
             *      "load":{                        //事件类型
             *          "callbacks": [              //回调函数列表
             *              {
             *                  callback:{Function} //回调函数
             *                  thisObj:{Object}    //执行回调函数时的 this
             *                  once:false          //是否执行一次
             *              }
             *          ],
             *          "eventData": undefined      //事件数据,调用 done 时会保存事件数据
             *      }
             * }
             */
            this._listenerMap = listenerMap;
        },

        /**
         * 添加事件监听
         *
         * @param {String} type 事件类型
         * @param {Function} callback 事件监听函数
         * @param {Object} [thisObj = this] 执行监听函数时的 this 对象
         * @param {Boolean} [once = false] 是否只触发一次
         * @return {Boolean} 是否添加成功
         */
        addEventListener: function(type, callback, thisObj, once) {
            var listenerMap = this._listenerMap,
                eventConfig,
                eventData,
                callbacks,
                immediately;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                // TODO 报错
                return false;
            }

            eventConfig = listenerMap[type];
            eventData = eventConfig.eventData;
            callbacks = eventConfig.callbacks;
            // eventData 不为undefined,该事件已经 done 过
            // 需要直接调用回调函数
            immediately = eventData !== undefined;
            thisObj = thisObj || this;
            once = !!once;


            if (!(immediately && once)) {
                //eventConfig.eventData = data;
                //如果不是直接执行并且只执行一次，则添加到回调列表中
                callbacks.push({
                    callback: callback,
                    thisObj: thisObj,
                    once: once
                });
            }
            if (immediately) {
                // TODO 错误处理?
                queueCall(bind(callback, thisObj, eventData));
            }

            return true;
        },

        /**
         * 删除事件监听
         *
         * @param {String} type 需要删除的监听类型
         * @param {Function} [callback] 要删除的监听函数,如果不传这个参数则删除该类型下的所有监听函数
         * @return {Boolean} 是否删除成功
         */
        removeEventListener: function(type, callback) {
            var listenerMap = this._listenerMap,
                eventConfig,
                callbacks,
                count;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                // TODO 报错
                return false;
            }

            eventConfig = listenerMap[type];

            if (arguments.length > 1) {
                //这里用来判断是否传入了 callback 参数
                //不用 callback === undefined 是为了避免
                //不小心传入了一个为 undefined 值的参数
                //导致所有的监听函数都被 remove

                callbacks = eventConfig.callbacks;
                count = callbacks.length;

                while (count--) { //从后往前遍历，方便 splice
                    if (callbacks[count].callback === callback) {
                        callbacks.splice(count, 1);
                    }
                }

            } else {
                //没有传入第二个参数,直接重置 callbacks 数组
                eventConfig.callbacks = [];
            }

            return true;
        },

        /**
         * 派发事件
         *
         * @param {String} type 派发的事件类型
         * @param {Object} [data=null] 事件参数
         * @return {Boolean} 如果至少有一个监听函数返回 false 则返回 false，否则返回 true
         */
        emit: function(type, data) {
            var listenerMap = this._listenerMap,
                eventConfig,
                callbacks,
                count,
                index,
                item,
                ret;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                throw new Error("unknow event type\"" + type + "\"");
            }

            eventConfig = listenerMap[type];
            callbacks = eventConfig.callbacks;
            count = callbacks.length;
            /**
             * 将 undefined 值转化为 null
             */
            data = data === undefined ? null : data;
            /**
             * 返回值，只要有一个为falas，则返回值为false
             */
            ret = true;

            for (index = 0; index < count; index++) {
                item = callbacks[index];
                if (item.once) {
                    callbacks.splice(index, 1);
                    index--;
                    count--;
                }

                ret = call(item, data) !== false && ret;
                // ret = item.callback.call(item.thisObj, data) !== false && ret;
            }
            return ret;
        },

        /**
         * 派发事件并且保存事件参数，
         * 当有新的监听添加时，直接调用.
         *
         * @param {String} type 事件类型
         * @param {Object} [data] 事件参数
         * @return {Boolean} 是否派发成功
         * @see emit
         *
         * @example
         * var emitter = new EventEmitter(["load"]);
         * emitter.done("load", data);
         *
         * emitter.on("load", function(data){
         *      console.log("这里会立即执行");
         * });
         */
        done: function(type, data) {
            var listenerMap = this._listenerMap,
                eventConfig,
                ret;

            /**
             * 将 undefined 值转化为 null
             */
            data = data === undefined ? null : data;
            eventConfig = listenerMap[type];
            eventConfig.eventData = data;

            //emit其实是一个很复杂的过程，为了确保done的事件被监听时能立即执行，把emit放在后面
            ret = this.emit(type, data);

            return ret;
        },

        /**
         * 删除由 done 保存的数据
         * @param {String} type 事件类型
         * @return {Boolean} 是否删除成功
         */
        undo: function(type) {
            var listenerMap = this._listenerMap,
                eventConfig;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                throw new Error("unknow event type\"" + type + "\"");
            }

            eventConfig = listenerMap[type];
            eventConfig.eventData = undefined;
            return true;
        }
    };


    /**
     * addEventListener 的快捷方法
     * @function
     * @param {String} type 事件类型
     * @param {Function} callback 事件监听函数
     * @param {Object} [thisObj = this] 执行监听函数时的 this 对象
     * @param {Boolean} [once = false] 是否只触发一次
     * @return {Boolean} 是否添加成功
     * @see addEventListener
     */
    eventEmitterMembers.on = eventEmitterMembers.addEventListener;

    /**
     * removeEventListener 的快捷方法
     * @function
     * @param {String} type 需要删除的监听类型
     * @param {Function} [callback] 要删除的监听函数,如果不传这个参数则删除该类型下的所有监听函数
     * @return {Boolean} 是否删除成功
     * @see removeEventListener
     */
    eventEmitterMembers.off = eventEmitterMembers.removeEventListener;
    /**
     * addEventListener 的快捷方法,用于添加只触发一次的监听
     * @function
     * @param {String} type 事件类型
     * @param {Function} callback 事件监听函数
     * @param {Object} [thisObj = this] 执行监听函数时的 this 对象
     * @return {Boolean} 是否添加成功
     * @see addEventListener
     */
    eventEmitterMembers.once = function(type, callback, thisObj) {
        return this.addEventListener(type, callback, thisObj, true);
    };

    copyProperties(EventEmitter.prototype, eventEmitterMembers);

    module.exports = EventEmitter;
});
;
    __d("JSLoader", ["EventEmitter"], function(global, require, module, exports) {
  var EventEmitter = require("EventEmitter");
  var STAT_INITIALIZED = 1,
    STAT_LOADING = 2,
    STAT_LOADED = 3,
    STAT_ERROR = 4;

  var EVENT_TYPES = [
    "load" // JS加载完成时派发的事件
    //TODO 错误处理?
  ];

  var JSLoader = derive(EventEmitter,
    /**
     * 构造一个Js加载对象,
     *
     * @constructor
     * @extends EventEmitter
     * @alias JSLoader
     *
     * @param {String} id JS资源ID
     * @param {Object} config JS资源信息
     */
    function (__super, id, config) {
      __super(EVENT_TYPES);
      /**
       * JS资源ID
       * @member {String}
       */
      this.id = id;
      /**
       * JS资源URL
       * @member {String}
       */
      this.url = config.src;
      /**
       * loader加载状态
       * @member {Number}
       */
      this.state = STAT_INITIALIZED;
    },
    /**
     * @alias JSLoader.prototype
     */
    {
      /**
       * 开始加载资源
       * @fires JSLoader#load
       */
      load: function () {
        //TODO 实现资源加载
        var me = this,
          script,
          onload;
        if (this.state >= STAT_LOADING)
          return;
        this.state = STAT_LOADING;

        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = me.url;
        script.async = true;

        script.onload = function () {
          callback(true);
        };

        script.onerror = function () {
          callback(false);
        };

        script.onreadystatechange = function () {
          if (this.readyState in {
              loaded: 1,
              complete: 1
            }) {
            callback(true);
          }
        };

        appendToHead(script);
        /**
         * 资源加载完成回调
         *
         * @event JSLoader#load
         */
        function callback(success) {
          if (me.state >= STAT_LOADED) {
            return;
          }
          me.state = success ? STAT_LOADED : STAT_ERROR;

          me.emit("load");

          nextTick(function () {

            script.onload = script.onerror = script.onreadystatechange = null;
            script.parentNode && script.parentNode.removeChild(script);
            script = null;
          });
        }
      },

      unload: function () {
        // TODO 资源卸载?一期先不用
      }
    });

  module.exports = JSLoader;
});
;
    __d("Pagelet", ["EventEmitter", "Resource"], function (global, require, module, exports) {

  var EventEmitter = require("EventEmitter"),
  Resource = require("Resource");

  var EVENT_TYPES = [
    "beforeload"       // Pagelet 开始加载前派发,return false 可以阻止加载
    , "beforedisplay"    // Pagelet 加载完成CSS资源和html资源,准备渲染时派发
    , "display"          //Pagelet dom渲染后派发
    , "load"             // Pagelet 加载并渲染完成后派发
    , "unload"           // Pagelet 卸载完成后派发
  ];

  var STAT_UNINITIALIZED = 0,
    STAT_INITIALIZED = 1,
    STAT_LOADING = 2,
    STAT_DISPLAYED = 3,
    STAT_UNLOADING = 4;

  var pageletSet = {};

  var Pagelet = derive(EventEmitter,
    /**
     * 构造一个 Pagelet 对象,
     *
     * @constructor
     * @extends EventEmitter
     * @alias Pagelet
     *
     * @param {String} id Pagelet id
     */
    function (__super, id) {
      __super(EVENT_TYPES);

      /**
       * Pagelet id
       * @member {String}
       */
      this.id = id;

      /**
       * Pagelet root
       * @member {Boolen}
       */
      this.root = this.id === null;
      /**
       * Pagelet state
       * @member {Number}
       */
      this.state = STAT_UNINITIALIZED;

      /**
       * 绑定会被作为参数传递的成员函数
       */
      this.load = bind(this.load, this);
      this.display = bind(this.display, this);
    },
    /**
     * @alias Pagelet.prototype
     */
    {
      /**
       * 加载依赖资源组
       *
       * @param {String} name 要加载的依赖资源组key
       * @param {Function} [callback] 依赖资源加载完成后的回调函数
       */
      loadDepends: function (key, callback) {
        var deps, count, timeout, onload, onresoved;

        /**
         * 依赖资源 ID 的数组
         */
        deps = this.deps[key] || [];

        /**
         * 依赖资源总数
         */
        count = deps.length;

        /**
         * 超时时间 ???
         */
        //timeout = 0;

        if (!callback) {
          callback = function () {
          }; //noop function
        }

        /**
         * 单个资源加载后的回调函数
         * 使用计数器生成
         */
        onload = counter(count, callback /*, timeout TODO 需要超时么??? */);

        /**
         * 加载所有依赖资源
         */
        each(deps, function (id) {
          var res = Resource.getResource(id);
          res.on("resolve", onload);
          res.load();
        });
      },
      /**
       * 调用事件
       *
       * @param {String} key 要调用的事件名
       * @param {callback} 事件调用后的处理函数
       */
      callHooks: function (key, callback) {
        var thisObj = this;
        this.loadDepends(key, function () {
          if (thisObj.emit(key)) {
            callback && callback();
          }
        });
      },
      /**
       * Pagelet 到达前端
       * @param {String} config Pagelet config
       * @fires Pagelet#beforeload
       */
      arrive: function (config) {
        copyProperties(this, {
          /**
           * HTML 内容
           * @member {String|Function}
           */
          html: config.html || null,
          /**
           * 事件依赖的资源ID
           * @member {Object}
           */
          deps: config.deps || {},
          /**
           * 父节点
           * @member {Paget}
           */
          parent: config.parent ? Pagelet.getPlagelet(config.parent) : null,
          /**
           * 子节点的ID
           * @member {Array}
           */
          children: config.children || [],
          renderMode: config.renderMode || null,
          /**
           * Pagelet state
           * @member {Number}
           */
          state: STAT_INITIALIZED
        })
        /**
         * 触发 beforeload 事件,如果没有被阻止,则执行加载
         */
        this.callHooks("beforeload", this.load);
      },

      /**
       * 加载 Pagelet
       */
      load: function () {
        /**
         * 加载渲染前依赖的资源(CSS等)，派发 beforeload 事件
         * 如果没有被阻止，则开始渲染
         * 这里提前加载JS，可能会有坑，如果有依赖的js是没有包装define并且会操作DOM的话，在innerHTML之前加载可能导致DOM不存在
         */
        var me = this;
        if (me.state >= STAT_LOADING)
          return false;
        me.state = STAT_LOADING;
        this.callHooks("beforedisplay", function () {
          me.parent ? me.parent.on("display", me.display) : me.display();
        });

        this.loadDepends("load");
      },

      /**
       * 渲染节点
       */
      display: function () {
        /**
         * 获取html内容
         * 用innerHTML将html添加到文档中，最外层不需要
         */
        if (this.state >= STAT_DISPLAYED)
          return false;
        this.state = STAT_DISPLAYED;
        if (!this.root) {
          var dom = document.getElementById(this.id);
          // console.log(this);
          if(dom && this.html !== null) {
            dom.innerHTML = this.html;
          }
          if(dom && this.renderMode && this.renderMode !== dom.getAttribute('data-rm')) {
            dom.setAttribute('data-rm', this.renderMode);
          }
          this.done("display");
        }
        this.callHooks("load");
      },

      /**
       * 卸载pagelet
       */
      unload: function () {

        if (this.state == STAT_UNLOADING || this.state == STAT_UNINITIALIZED) return;
        // 如果是 STAT_INITIALIZED 或 STAT_LOADING
        if (this.state <= STAT_LOADING) {
          this.drop();
        }

        var children = this.children;
        var count = children.length;
        var onunload;
        var pagelet = this;

        /**
         * 每个子pagelet卸载之后的回调函数
         * 使用计数器生成
         */
        onunload = counter(count, callback);
        /**
         * 卸载所有子pagelet
         */
        each(children, function (child) {
          //var res = Resource.getResource(id);
          child = Pagelet.getPlagelet(child);
          child.on("unload", onunload);
          child.unload();
        });

        /**
         * 所有子pagelet卸载完成之后的回调函数
         */
        function callback() {
          pagelet.remove();
          //delete pageletSet[pagelet.id];
          pagelet.state = STAT_UNINITIALIZED;
          pagelet.callHooks("unload");
        }
      },

      /**
       * 对于STAT_INITIALIZED 或 STAT_LOADING 状态，放弃加载
       */
      drop: function () {
      },
      /**
       * 从pageletSet删除pagelet
       */
      remove: function () {
        if (pageletSet[this.id]) {
          delete pageletSet[this.id];
        }
      }
    });

  Pagelet.getPlagelet = function (id) {
    var pagelet;
    if (id === null) {
      return new Pagelet(id);
    }
    pagelet = pageletSet[id];
    if (!pagelet) {
      pagelet = new Pagelet(id);
      pageletSet[id] = pagelet;
    }
    return pagelet;
  };

  Pagelet.hasPlagelet = function (id) {
    return !!pageletSet[id];
  };

  module.exports = Pagelet;

});
;
    /**
 * @file Requestor 发起quickling请求，管理sessionid和pagelet缓存
 * @author zhangwentao(zhangwentao@baidu.com)
 */

__d("Requestor", ["Controller"], function (global, require, module, exports) {

  var Controller = require('Controller');

    var requestor = {
    sessions: {},
    /*
     cacheData : {
     url1 : {
     id1 : {}, // {child : id2}
     id2 : {}
     },
     url2 : {
     id1 : {}, // {child : id2}
     id2 : {}
     }
     }
     */
    cacheData: {},
        fetch: function (pagelets, url, cb) {
      var cache,
        cached = [],
        nonCached = [],
        pagelet,
        i,
        length = pagelets.length,
        j,
        child;

      // if (cache = this.cacheData[url]) {
      //   for (i = 0; i < length; i++) {
      //     pagelet = pagelets[i];
      //     if (!cache[pagelet]) {
      //       nonCached.push(pagelet);
      //     } else {
      //       //cached.push(cache[pagelet]);
      //       findChild(cache[pagelet]);
      //     }
      //   }
      // } else {
        nonCached = pagelets;
      // }
            function pageletsArrive(data) {
                for (var i = 0; i < data.length; i++) {
                    // BigPipe.onPageletArrive(data[i]);
                    var conf = data[i];
                    if (conf.html.html) {
                        conf.html = conf.html.html;
                    }

                    // conf.html = conf.html.html;
                    // if(!this.cacheData[url]) this.cacheData[url] = {};
                    // if (!cache[conf.id]) {
                    //   cache[conf.id] = conf;
                    // }
                    // if(conf.session >= me.sessions[conf.id]){
                    Controller.pageletArrive(data[i]);
                    // callback && callback(data[i]);
                    // }
                }
            }

            this._fetch(nonCached, url, function (err, data, xhrStatus) {
                if (err) {
                    cb && cb(err, data, xhrStatus);
                } else {
                    // Controller.pageletsArrive(data);
                    pageletsArrive(data);
                }
            }, cached);

      // function findChild(pagelet) {
      //   var count;
      //   var childObj;
      //   count = pagelet.children && pagelet.children.length || 0;

      //   cached.push(pagelet);

      //   if (count) {
      //     for (j = 0; j < count; j++) {
      //       child = pagelet.children[j];
      //       childObj = cache[child];

      //       if (!childObj) {
      //         nonCached.push(child);
      //       } else {
      //         findChild(childObj);
      //       }
      //     }
      //   }
      // }
    },
    _fetch: function (pagelets, url, callback, cached) {
      //var url;
      // var cache;

      // if (!this.cacheData[url]) {
      //   this.cacheData[url] = {};
      // }
      // cache = this.cacheData[url];

      // if (!pagelets.length && cached.length) {
      //   parseData(cached);
      //   return;
      // }

      for (var i = 0; i < pagelets.length; i++) {
        if (this.sessions[pagelets[i]] === undefined) {
          this.sessions[pagelets[i]] = 0;
        } else {
          this.sessions[pagelets[i]]++;
        }
        pagelets[i] += '.' + this.sessions[pagelets[i]];
      }
      url = url || '';

      if (url.indexOf('?') > -1) {
        url += '&__quickling__=' + pagelets.join(',');
      }
      else {
        url += '?__quickling__=' + pagelets.join(',');
      }

        /* globals ajax */
        ajax(url, function (err, text, xhrStatus) {
            if (err) {
                callback(err, text, xhrStatus);
            } else {
                var data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    return callback(new Error('JSONParseError'), text, xhrStatus);
                }

                if (cached && cached.length) {
                    data = data.concat(cached);
                }
                callback(false, data);
            }
        });
    }
  };

    module.exports = requestor;
});
/* __wrapped__ */
/* @cmd false */
;
    /**
 * @file 资源管理
 */

/* global type,each */
__d("Resource", ["EventEmitter", "CSSLoader", "JSLoader"], function (global, require, module, exports) {

  var EventEmitter = require("EventEmitter");
  var CSSLoader = require('CSSLoader');
  var JSLoader = require('JSLoader');

  var _nameMap = {},  // mods到 资源id的映射
    _resourceMap = {}, // 页面资源原始数据
    _loadedResource = [],
    STAT_INITIALIZED = 1,
    STAT_LOADING = 2,
    STAT_LOADED = 3,
    STAT_RESOLVED = 4;

  var loader = {
    css: function (id, config) {
      return new CSSLoader(id, config);
    },
    js: function (id, config) {
      return new JSLoader(id, config);
    }
  };


  var EVENT_TYPES = [
    "load", // 资源加载完成时派发的事件
    "resolve" // 资源本身以及依赖资源全部加载完成时派发的事件
    //TODO 错误处理?
  ];

  /**
   * 加载资源
   */
  function loadResource() {
    var me = this,
      loader = Resource.getResourceLoader(me.id);
    loader.on('load', function () {
      me.loaded = true;
      me.state = STAT_LOADED;
      me.done('load');
    });
    loader.load();

  }

  /*
   // 解析依赖数组
   function parseArr(id, arr) {
   var dep, subDeps;
   if (hasOwnProperty(_resourceMap[id], 'deps') && _resourceMap[id].deps.length > 0) {
   subDeps = _resourceMap[id].deps;
   while (subDeps.length) {
   dep = subDeps.shift();
   if (inArray(arr, dep) > -1) {
   arr.splice(inArray(arr, dep), 1).push(dep);
   }
   arguments.callee(dep, arr);
   }
   }
   }
   */

  var Resource = derive(EventEmitter,
    /**
     * 构造一个资源对象,
     * 不能使用 new Resource() 方式调用，
     * 如果需要得到资源，请使用 Resource.getResource(id) 方法
     *
     * @constructor
     * @extends EventEmitter
     * @alias Resource
     *
     * @param {String} id 资源ID
     * @param {Array} [deps=[]] 依赖的资源ID
     * @param {Boolean} [parallel=true] 是否并行加载
     * @param {Array} [mods=[]] 资源包含的mod
     */
    function (__super, id, deps, parallel, mods) {
      __super(EVENT_TYPES);
      /**
       * 资源ID
       * @member {String}
       */
      this.id = id;
      /**
       * 依赖的资源ID
       * @member {Array}
       */
      this.deps = deps || [];
      /**
       * 资源包含的mod
       * @member {Array}
       */
      this.mods = mods || [];
      /**
       * 是否并行加载
       * 并行加载时资源本身和它的依赖资源同时加载
       * 串行加载是先加载资源的依赖，依赖reslove后再加载资源本身
       * @member {Boolean}
       */
      this.parallel = parallel === undefined ? true : !!parallel;
      /**
       * Resource状态
       * @member {Number}
       */
      this.state = STAT_INITIALIZED;
    },
    /**
     * @alias Resource.prototype
     */
    {
      /**
       * 开始加载资源
       * @fires Resource#load
       * @fires Resource#resolve
       */
      load: function () {
        // 实现资源加载
        var me = this,
          depRes,
          depId,
          onload,
          depsLen = me.deps.length;
        // 标记当前资源状态
        if (me.state >= STAT_LOADING) {
          return;
        }
        me.state = STAT_LOADING;

        if (me.parallel) {
          //并行
          onload = counter((me.mods.length === 0 ? depsLen : depsLen + 1), function () {
            me.state = STAT_RESOLVED;
            me.done('resolve');
          });
        } else {
          // 串行
          onload = counter(depsLen, function () {
            if (me.mods.length === 0 || me.loaded) {
              me.state = STAT_RESOLVED;
              me.done('resolve');
              return;
            }
            me.on("load", function () {
              me.state = STAT_RESOLVED;
              me.done('resolve');
            });
            loadResource.call(me);
          });
        }

        //加载依赖资源
        while (depsLen--) {
          depId = me.deps[depsLen];
          depRes = Resource.getResource(depId, me.parallel);
          depRes.on('resolve', onload);
          depRes.load();
        }

        //加载资源本身
        if (me.parallel && me.mods.length > 0) {

          if (me.loaded) {
            onload();
          } else {
            me.on("load", function () {
              onload();
            });
            loadResource.call(me);
          }
        }
      },

      unload: function () {
        // TODO 资源卸载?一期先不用
      }
    });


  /**
   * 设置资源映射表
   * 把资源拷贝到局部变量中？？？
   * @param {Object} map 资源映射表
   */
  Resource.setResourceMap = function (map) {
      if (type(map) === 'object') {
          // copyProperties(_resourceMap, map);
          each(map, function (value, key) {
              if (!hasOwnProperty(_resourceMap, key)) {
                  _resourceMap[key] = value;
                  var mods = value.mods;

                  if (mods && mods.length) {
                      each(mods, function (item) {
                          _nameMap[item] = key;
                      });
                  }
              }
          });
      }
  };

  /**
   * 根据id得到资源
   *
   * @param {String} id 资源ID
   * @return {Resource} 资源对象
   * @throws 如果资源表中没有注册该ID则会报错
   *
   * @example
   * var res = Resource.getResource("XXX");
   * res.on("load", function(){
 *  console.log("resource XXX loaded!");
 * });
   * res.load();
   */
  Resource.getResource = function (id, flag) {
    var res,
      item;
    if (hasOwnProperty(_resourceMap, id)) {
      item = _resourceMap[id];
      if (!(res = item._handler)) {
        res = item._handler = new Resource(id, _resourceMap[id].deps || [], flag, _resourceMap[id].mods || []);
        if (inArray(_loadedResource, id) > -1) {
          res.loaded = true;
        }
      }
      return res;
    } else {
      throw new Error("resource \"" + id + "\" unknow.");
    }
  };

  /**
   * 通过模块名得到资源实例
   *
   * @param {String} name 模块名
   * @return {Resource} 包含该模块的资源对象
   * @throws 如果资源表中没有注册该 name 则会报错
   */
  Resource.getResourceByName = function (name) {
    var resId;
    if (hasOwnProperty(_nameMap, name)) {
      resId = _nameMap[name];
      return Resource.getResource(resId);
    } else {
      throw new Error("resource \"" + name + "\" unknow.");
    }
  };

  /**
   * 通过ID得到资源加载器
   *
   * @param {String} id 资源id
   * @return {ResourceLoader} 资源加载器
   * @throws 如果资源id不存在，或者不能实例化对象则会报错
   */
  Resource.getResourceLoader = function (id) {
    var conf = _resourceMap[id];
    if (hasOwnProperty(_resourceMap[id], 'type')) {
      return loader[conf.type](id, conf);
    } else {
      throw new Error("resource \"" + id + "\" unknow.");
    }
  };

  /**
   * 添加已加载的资源
   *
   * @param {String | array} id 资源id
   */
  Resource.loadedResource = function (id) {
    if (isArray(id)) {
      each(id, function (item, index, arr) {
        if (inArray(_loadedResource, item) < 0) {
          _loadedResource.push(item);
        }
      })
    } else {
      if (typeof id === 'string' && inArray(_loadedResource, id) < 0) {
        _loadedResource.push(id);
      }
    }
  };

  module.exports = Resource;

});
;

    var BigPipe = require("BigPipe");
    if (hasOwnProperty(global, "BigPipe")) {
        BigPipe.origBigPipe = global.BigPipe;
    }
    global.BigPipe = BigPipe;

})(this, window, document);