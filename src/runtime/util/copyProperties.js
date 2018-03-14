/**
 * 复制属性到对象
 *
 * @param {Object} to 目标对象
 * @param {...Object} from 多个参数
 * @access public
 * @return {Object} 目标对象
 *
 * @example
 * var objA = {
 *         a : 1
 *     },
 *     objB = {
 *         b : 2
 *     };
 *
 * copyProperties(objA, objB, {
 *      c : 3
 * });
 * console.log(objA);
 * // {
 * // a : 1,
 * // b : 2,
 * // c : 3
 * // }
 */
function copyProperties(to /*, ...*/) {
  var index, count, item, key;

  to = to || {};
  count = arguments.length;

  //遍历参数列表
  for (index = 1; index < count; index++) {
    item = arguments[index];
    for (key in item) {
      //只复制自有属性
      if (hasOwnProperty(item, key)) {
        to[key] = item[key];
      }
    }
  }

  return to;
}
