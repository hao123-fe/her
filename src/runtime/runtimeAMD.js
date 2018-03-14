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

