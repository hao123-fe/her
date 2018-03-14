/**
 * isEmpty 判断是否是空对象，数组判断长度，对象判断自定义属性，其它取非
 *
 * @param {Object} obj 需要被判断的对象
 * @access public
 * @return {Boolean} 该对象是否为为空
 */
function isEmpty(obj) {
  if (isArray(obj)) {
    return obj.length === 0;
  } else if (typeof obj === 'object') {
    for (var i in obj) return false;
    return true;
  } else return !obj;
}
