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
