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
