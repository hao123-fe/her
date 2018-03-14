/**
 * bind 方法会创建一个新函数,称为绑定函数.
 * 当调用这个绑定函数时,绑定函数会以创建它时传入bind方法的第二个参数作为this,
 * 传入bind方法的第三个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数.
 *
 * @param {Function} fn 摇绑定的函数
 * @param {Object} thisObj 调用函数时的 this 对象
 * @param {...*} [args] 执行函数时的参数
 * @access public
 * @return {Function} 绑定后的函数
 *
 * @example
 *
 * var obj = {
 *      name: "it's me!"
 * };
 *
 * var fn = bind(function(){
 *      console.log(this.name);
 *      console.log(arguments);
 * }, obj, 1, 2, 3);
 *
 * fn(4, 5, 6);
 * // it's me
 * // [ 1, 2, 3, 4, 5, 6]
 */
function bind(fn, thisObj /*, args... */) {

  function _bind(fn, thisObj /*, args... */) {
    var savedArgs, //保存绑定的参数
      savedArgLen, //绑定参数的个数
      ret; //返回函数

    // 判断是否有绑定的参数
    savedArgLen = arguments.length - 2;
    if (savedArgLen > 0) {
      //有绑定参数，需要拼接调用参数
      savedArgs = slice(arguments, 2);
      ret = function () {
        var args = toArray(arguments),
          index = savedArgLen;
        //循环将保存的参数移入调用参数
        //这里不使用 Array.prototype.concat 也是为了避免内存浪费
        while (index--) {
          args.unshift(savedArgs[index]);
        }
        return fn.apply(thisObj, args);
      };
    } else {
      // 没有绑定参数，直接调用，减少内存消耗
      ret = function () {
        return fn.apply(thisObj, arguments);
      };
    }

    return ret;
  }

  //保存原生的 bind 函数
  var native_bind = Function.prototype.bind;
  //修改 bind 函数指针
  if (native_bind) {
    //如果原生支持 Function.prototype.bind 则使用原生函数来实现
    bind = function (fn, thisObj /*, args... */) {
      return native_bind.apply(fn, slice(arguments, 1));
    };
  } else {
    bind = _bind;
  }

  return bind.apply(this, arguments);
}
