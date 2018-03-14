/**
 * isFunction 判断一个对象是否为一个函数
 *
 * @param {Object} obj 需要被鉴定的对象
 * @access public
 * @return {Boolean} 该对象是否为一个函数
 */
function isFunction(obj) {
  return type(obj) === 'function';
}
