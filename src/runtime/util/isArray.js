/**
 * isArray 判断对象是否为数组
 *
 * @param {Object} obj 需要被判断的对象
 * @access public
 * @return {Boolean} 该对象是否为 Array
 */
function isArray(obj) {
  //重设 isArray 函数指针，方便下次调用
  //如果支持 Array.isArray 方法则直接使用，
  //否则用 type 函数来判断
  isArray = Array.isArray || function (obj) {
    return type(obj) === 'array';
  };
  return isArray(obj);
}
