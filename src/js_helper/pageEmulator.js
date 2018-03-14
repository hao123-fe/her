var cacheMaxTime = 0, // 缓存时间
  appOptions = {}, // app页面管理的options
  layer; // 事件代理层

var EventUtil = {
  addHandler: function(element, type, handler, flag) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, flag || false);
    } else if (element.attachEvent) {
      element.attachEvent("on" + type, handler);
    } else {
      element["on" + type] = handler;
    }
  },
  getEvent: function(event) {
    return event ? event : window.event;
  },
  getTarget: function(event) {
    //return event.tagert || event.srcElement;
    return event.target || event.srcElement;
  },
  preventDefault: function(event) {
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  },
  stopPropagation: function(event) {
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  },
  removeHandler: function(element, type, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false);
    } else if (element.detachEvent) {
      element.detachEvent("on" + type, handler);
    } else {
      element["on" + type] = null;
    }
  }
};


/**
 * 启动页面管理
 * @param  {Object} options 初始化参数
 * @param {String} options["selector"] 全局代理元素的选择器匹配，写法同 document.querySeletor 函数
 * @param {Number} options["cacheMaxTime"] 页面缓存时间
 * @param {Function|RegExp} options["validate"] url验证方法，
 * @return {void}
 */

function start(options) {

  /**
   * 默认参数 {
   *     selector : <string> // 代理元素的选择器规则
   *     cacheMaxTime: <integer> //缓存存活时间，默认5min
   * }
   */
  var defaultOptions = {
    cacheMaxTime: 5 * 60 * 1000,
    layer: document
  };

  appOptions = merge(defaultOptions, options);
  cacheMaxTime = appOptions.cacheMaxTime;
  layer = getLayer(appOptions.layer);
  bindEvent();
}

/**
 * 事件绑定
 * @return {void}
 */

function bindEvent() {
  EventUtil.addHandler(layer, 'click', proxy, true);
}

function getLayer(ele) {
  if (typeof ele === "string") {
    return document.querySelector(ele);
  } else if (ele && ele.nodeType) {
    return ele;
  } else {
    return document.body
  }
}

/**
 * 简单merge两个对象
 * @param {object} _old
 * @param {object} _new
 * @returns {*}
 */

function merge(_old, _new) {
  for (var i in _new) {
    if (_new.hasOwnProperty(i) && _new[i] !== null) {
      _old[i] = _new[i];
    }
  }
  return _old;
}

/**
 * 事件代理
 * @param {MouseEvent} 点击事件对象
 */

function proxy(e) {
  var element = EventUtil.getTarget(e),
    parent = element,
    selector = appOptions.selector;

  var url, urlAttr, pagelets;

  while (parent !== layer) {

    urlAttr = parent.tagName.toLowerCase() === "a" ? "href" : "data-href";
    url = parent.getAttribute(urlAttr);
    pagelets = parent.getAttribute("data-pagelets");

    if (url && pagelets) {
      pagelets = pagelets.split(',');

      if (pagelets.length) {

        EventUtil.stopPropagation(e);
        EventUtil.preventDefault(e);

        BigPipe.fetch(pagelets, url);
      }
      break;
    } else {
      parent = parent.parentNode;
    }
  }
}

module.exports = {
  start: start
};
