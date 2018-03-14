/**
 * 按照顺序调用函数，避免调用堆栈过长
 *
 * @param {Function} fn 需要调用的函数
 * @access public
 * @return {Number} 当前的队列大小，返回0表示函数已经被立即执行
 *
 * @example
 *
 * function fn1(){
 *      console.log("fn1 start");
 *      queueCall(fn2);
 *      console.log("fn1 end");
 * }
 *
 * function fn2(){
 *      console.log("fn2 start");
 *      queueCall(fn3);
 *      console.log("fn2 end");
 * }
 * function fn3(){
 *      console.log("fn3 start");
 *      console.log("fn3 end");
 * }
 *
 * queueCall(fn1);
 * //fn1 start
 * //fn1 end
 * //fn2 start
 * //fn2 end
 * //fn3 start
 * //fn3 end
 */
function queueCall(fn) {
  var running = false,
    list = [];

  queueCall = function (fn) {
    var count, index;
    list.push(fn);
    if (!running) {
      running = true;
      while (true) {
        count = list.length;
        if (count <= 0) {
          break;
        }
        for (index = 0; index < count; index++) {
          //TODO 错误处理
          list[index]();
        }
        list.splice(0, count);
      }
      running = false;
    }

    return list.length;
  };

  return queueCall(fn);
}
