/**
 * 一个简单的 AMD define 实现
 *
 * @param {String} name 模块名
 * @param {Array} dependencies 依赖模块
 * @param {factory} factory 模块函数
 * @access public
 * @return void
 * @see require
 */

var _module_map = {};

function define(id, dependencies, factory) {
  _module_map[id] = {
    factory: factory,
    deps: dependencies
  };
}

function require(id) {
  var module = _module_map[id];
  if (!hasOwnProperty(_module_map, id))
    throw new Error('Requiring unknown module "' + id + '"');
  if (hasOwnProperty(module, "exports"))
    return module.exports;

  var exports;
  module.exports = exports = {};

  var args = buildArguments(module.deps, require, module, exports);

  module.factory.apply(undefined, args);

  return module.exports;
}

/**
 * 根据 id 数组生成模块数组
 * 实现AMD规范
 *
 * @param {Array} deps 依赖的模块名列表
 * @param {Function} require require函数
 * @param {Object} module 模块
 * @param {Object} exports 模块的 exports 对象
 * @access public
 * @return {Array} 执行 require 后的模块数组
 */
function buildArguments(deps, require, module, exports) {
  var index, count, did, args;

  args = [];
  count = deps.length;
  for (index = 0; index < count; index++) {
    did = deps[index];
    if (did === "require") {
      args.push(require);
    } else if (did === "module") {
      args.push(module);
    } else if (did === "exports") {
      args.push(exports);
    } else {
      args.push(require(did));
    }
  }
  return args;
}

function __b(id, exports) {
  _module_map[id] = {
    exports: exports
  };
}

function __d(id, dependencies, factory) {
  return define(id, ['global', 'require', 'module', 'exports'].concat(dependencies), factory);
}

__b("global", global);
