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
