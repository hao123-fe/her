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
