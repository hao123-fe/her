/**
 * 遍历数组或对象
 *
 * @param {Object|Array} object 数组或对象
 * @param {Function} callback 回调函数
 * @param {Object} [thisObj=undefined] 回调函数的this对象
 * @access public
 * @return {Object|Array} 被遍历的对象
 *
 * @example
 *
 * var arr = [1, 2, 3, 4];
 * each(arr, function(item, index, arr){
 *  console.log(index + ":" + item);
 * });
 * // 0:1
 * // 1:2
 * // 2:3
 * // 3:4
 *
 * @example
 *
 * var arr = [1, 2, 3, 4];
 * each(arr, function(item, index, arr){
 *  console.log(index + ":" + item);
 *  if(item > 2){
 *      return false;
 *  }
 * });
 * // 0:1
 * // 1:2
 */
function each(object, callback, thisObj) {
  var name, i = 0,
    length = object.length,
    isObj = length === undefined || isFunction(object);

  if (isObj) {
    for (name in object) {
      if (callback.call(thisObj, object[name], name, object) === false) {
        break;
      }
    }
  } else {
    for (i = 0; i < length; i++) {
      if (callback.call(thisObj, object[i], i, object) === false) {
        break;
      }
    }
  }
  return object;
}
