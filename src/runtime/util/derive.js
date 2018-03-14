/**
 * Js 派生实现
 *
 * @param {Function} parent 父类
 * @param {Function} [constructor]  子类构造函数
 * @param {Object} [proto] 子类原型
 * @access public
 * @return {Function} 新的类
 *
 * @example
 *
 * var ClassA = derive(Object, function(__super){
 *      console.log("I'm an instance of ClassA:", this instanceof ClassA);
 * });
 *
 * var ClassB = derive(ClassA, function(__super){
 *      console.log("I'm an instance of ClassB:", this instanceof ClassB);
 *      __super();
 * }, {
 *      test:function(){
 *          console.log("test method!");
 *      }
 * });
 *
 * var b = new ClassB();
 * //I'm an instance of ClassA: true
 * //I'm an instance of ClassA: true
 * b.test();
 * //test method!
 */
function derive(parent, constructor, proto) {

  //如果没有传 constructor 参数
  if (typeof constructor === 'object') {
    proto = constructor;
    constructor = proto.constructor || function () {
    };
    delete proto.constructor;
  }

  var tmp = function () {
    },
  //子类构造函数
    subClass = function () {
      //有可能子类和父类初始化参数定义不同，所以将初始化延迟到子类构造函数中执行
      //构造一个 __super 函数,用于子类中调用父类构造函数
      var __super = bind(parent, this),
        args = slice(arguments);

      //将 __super 函数作为 constructor 的第一个参数
      args.unshift(__super);
      constructor.apply(this, args);

      //parent.apply(this, arguments);
      //constructor.apply(this, arguments);
    },
    subClassPrototype;

  //原型链桥接
  tmp.prototype = parent.prototype;
  subClassPrototype = new tmp();

  //复制属性到子类的原型链上
  copyProperties(
    subClassPrototype,
    constructor.prototype,
    proto || {});

  subClassPrototype.constructor = constructor.prototype.constructor;
  subClass.prototype = subClassPrototype;
  return subClass;
}

