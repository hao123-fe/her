/**
 * toArray 将类数组对象转化为数组
 *
 * @param {Object} obj 需要被转化的类数组对象
 * @access public
 * @return {Array} 数组对象
 */
function toArray(obj) {
  return slice(obj);
}
