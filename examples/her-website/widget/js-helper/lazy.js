/**
 * 工具函数:懒加载
 *
 * 加载的唯一标准是元素的位置有没有出现在视口内。
 * by hongwei
 * 2013.06.04
 */

var pageEvents = require("./pageEvents.js"),
    queue = require("./queue.js"),
    //保存每一条需要懒加载的信息，每条包括elem,callback,key。
    //elem:有src属性的元素，callback，自定义的处理加载的函数，key：每一次add的每一条信息都用唯一的key值标识
    _data = [],

    //标识add方法的每次添加
    _key = 0,
    viewport,
    disabled = false;

var global = window;
/**
 * 添加需要懒加载的元素
 *
 * @param {array|类array|单个dom元素} 可以是单个dom元素,也可以是一个有length的对象
 * @param {function}                  自定义的回调函数，执行自定义加载图片，默认回调函数会把data-src属性值赋给src属性
 * @returns {number} 全局唯一的key，用作删除本次增加的参数
 */

function add(elems, callback) {
    if (!('length' in elems)) {
        elems = [elems];
    }
    for (var i = 0, item, len = elems.length; i < len; i++) {
        item = {
            elem: elems[i],
            callback: callback || defaultCallback,
            key: _key,
            valid: true
        }
        _data.push(item);
    }
    if (!viewport)
        viewport = pageEvents.getViewport();
    //TODO:调用计算添加元素的offsetTop的方法
    queue.call(getElementsOffsetTop);
    return _key++;
}

/**
 * 删除需要懒加载的元素
 *
 * @param {key}   添加时的返回值
 */

function remove(key) {
    var len = _data.length;
    while (len--) {
        if (_data[len].key === key) {
            _data[len].valid = false;
        }
    }
}

/*var STATE_UNINIT = 1,
    STATE_LOADING = 2,
    STATE_LOADED = 3,
    jqueryLoadState = STATE_UNINIT;*/

function getElementsOffsetTop() {
    var $ = require("jquery");
    //if (jqueryLoadState == STATE_UNINIT) {
    //    jqueryLoadState = STATE_LOADING;
    //    requireLazy(["common.js.jquery"], function($) {
    //        jqueryLoadState = STATE_LOADED;
            getElementsOffsetTop = getElementsOffsetTopViaJquery;
            queue.call(getElementsOffsetTop);
    //    });
    //}
}

function getElementsOffsetTopViaJquery() {
    var index, count, item;
    for (index = 0, count = _data.length; index < count; index++) {
        item = _data[index];
        if (item.offsetTop === undefined && item.valid) {
            item.offsetTop = findValideTop(item.elem);
        }
        if (item.offsetTop !== undefined && checkItem(item)) {
            _data.splice(index, 1);
            index--;
            count--;
        }
    }
}

function checkItem(item) {
    if (!item.valid)
        return true;
    if (viewport.scrollTop + viewport.height + 50 > item.offsetTop) {
        queue.call(item.callback, global, item.elem);
        return true;
    }
    return false;
}

function defaultCallback(elem) {
    elem.setAttribute('src', elem.getAttribute('data-src'));
}

function findValideTop(elem) {
    var offsetTop = 0,
        offset;
    try {
        while (offsetTop <= 0) {
            if (!(elem && (offset = $(elem).offset()))) {
                return undefined;
            }
            offsetTop = offset.top;
            elem = elem.parentNode;
        }
    } catch (e) {
        return undefined;
    }
    return offsetTop;
}

function excute() {
    if (disabled) return;
    viewport = pageEvents.getViewport();
    queue.call(getElementsOffsetTop);
}

function reset() {
    if (disabled) return;
    for (var i = 0, len = _data.length; i < len; i++) {
        _data[i].offsetTop = undefined;
    }
    queue.call(getElementsOffsetTop);
}

pageEvents.on('viewport.change', excute);
pageEvents.on('page.endchange', reset);

function disable() {
    disabled = true;
}

function enable() {
    disabled = false;
}

module.exports = {
    add: add,
    remove: remove,
    disable: disable,
    enable: enable
};

/*华丽的分割线------------------------------*/

/*var viewPortChanged = false,
    excuteing = false;

function checkViewPortChange() {
    if (viewPortChanged && !excuteing) {
        excuteing = true;
        viewPortChanged = false;
        excute(event.getViewport());
        setTimeout(function () {
            excuteing = false; 
            checkViewPortChange();
          }, 20);
    }
}

function excute(e, data) {
    if (e) {
        _viewSize = e;
    }
    data = data || _data;
    var len = data.length, item;
    if (len <= 0) {return; }
    requireLazy(['common.js.jquery'], function ($) {
        var len = data.length, item;
        while (len--) {
            item = data[len];
            if (item.offsetTop == undefined) {
                item.offsetTop = findValideTop(item.elem);
            }
            if (_viewSize.scrollTop > (item.offsetTop - _viewSize.height - 10)) {
                //顺序很重要，如果删除在callback之后 ，如果callback有错，导致删除不成功。
                data.splice(len, 1);
                item.callback(item.elem);
            }
            //如果是手动执行且未执行显示，需要把元素添加到_data,以便viewport.change发生时再次调用 
            else if (!e) {
                _data.push(data[len]);
            }
        }

    });
}
*/
