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
