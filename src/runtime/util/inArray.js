/**
 * inArray 判断对象是否为数组
 *
 * @param {array} arr 数据源
 * @param {item} item 需要判断的数据项
 * @access public
 * @return {index} 该数据项在目标数组中的索引
 */
function inArray(arr, item) {
  //如果支持 Array.prototype.indexOf 方法则直接使用，
  var index = undefined;
  if (Array.prototype.indexOf) {
    return arr.indexOf(item) > -1 ? arr.indexOf(item) : -1;
  } else {
    each(arr, function (v, i, arr) {
      if (v === item) {
        index = i;
        return false;
      }
    });
  }
  return index === undefined ? -1 : index;
}
