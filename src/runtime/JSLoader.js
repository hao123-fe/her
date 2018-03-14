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
