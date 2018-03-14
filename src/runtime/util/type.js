/**
 * type 判断对象类型函数
 * 从 jquery 中拷贝来的
 *
 * @param {Object} obj 被鉴定的对象
 * @access public
 * @return {String} 对象类型字符串
 */
function type(obj) {
  //var types = "Boolean Number String Function Array Date RegExp Object".split(" "),
  var types = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object"],
    toString = Object.prototype.toString,
    class2type = {},
    count, name;

  //构造 class2type 表
  //{
  //  "[object Object]"   : "object",
  //  "[object RegExp]"   : "regexp",
  //  "[object Date]"     : "date",
  //  "[object Array]"    : "array",
  //  "[object Function]" : "function",
  //  "[object String]"   : "string",
  //  "[object Number]"   : "number",
  //  "[object Boolean]"  : "boolean"
  //}
  count = types.length;
  while (count--) {
    name = types[count];
    class2type["[object " + name + "]"] = name.toLowerCase();
  }

  // 判断函数,初始化后再次调用会直接调用这个函数
  function _type(obj) {
    return obj == null ?
      String(obj) :
    class2type[toString.call(obj)] || "object";
  }

  //修改 type 函数指针，以便多次调用开销
  type = _type;

  return type(obj);
}


var str = 'abcba';
var indexMap = {};
var tmpArr = [];
for(var i = 0; i < str.length; i++) {
  var s = str[i];
  var index = indexMap[s];
  if (index === undefined) {
    index = tmpArr.push(s) - 1;
    indexMap[s] = index;
  } else {
    tmpArr[index] = '';
  }
}

var ret = tmpArr.join('');

console.log(ret[0]);
