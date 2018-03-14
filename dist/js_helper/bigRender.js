/*
 *           File:  bigRender.js
 *           Path:  commmon/js/bigRender.js
 *         Author:  HuangYi
 *       Modifier:  HuangYi
 *       Modified:  2013-7-16
 *    Description:  延迟渲染js
 */
var lazy = require("./lazy.js");

function add(pagelet) {

  var lazyKey, ele, cssText;
  try {
    // if(pagelet.parent){
    //     pagelet.parent.on("load",function(){
    //         bindBigRender(pagelet);
    //     });
    // }else{
    bindBigRender(pagelet);
    //}
    return true;
  } catch (e) {
    setTimeout(function() {
      throw e;
    }, 0);
    return false;
  }
}

function bindBigRender(pagelet) {
  var ele = document.getElementById(pagelet.id);
  addClass(ele, "g-bigrender");

  var lazyKey = lazy.add(ele, function() {

    pagelet.on("load", function() {
      removeClass(ele, "g-bigrender");
    });
    pagelet.load();

  });

  pagelet.on("unload", function() {
    lazy.remove(lazyKey);
  });
}

function addClass(element, className) {
  if (!element)
    return;
  var elementClassName = element.className;
  if (elementClassName.length == 0) {
    element.className = className;
    return;
  }
  if (elementClassName == className || elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
    return;
  element.className = elementClassName + " " + className;
}

function removeClass(element, className) {
  if (!element)
    return;
  var elementClassName = element.className;
  if (elementClassName.length == 0)
    return;
  if (elementClassName == className) {
    element.className = "";
    return;
  }
  if (elementClassName.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
    element.className = elementClassName.replace((new RegExp("(^|\\s)" + className + "(\\s|$)")), " ");
}


module.exports = {
  add: add
};
