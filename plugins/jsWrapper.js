/**
* jsWrapper 以amd模式为js代码封装define，并分析文件中的require，放入depends中
*/
var commonReg = require("../plugins/commonReg.js");

//构造分析require("xxx")的正则表达式，同时优先分析字符串和注释。
var requireRegStr = commonReg.stringRegStr + "|" + 
                    commonReg.jscommentRegStr + "|" +
                    "([^\\$\\.]|^)(\\brequire\\s*\\(\\s*(" +
                    commonReg.stringRegStr + ")\\s*\\))";

var PREFIX = "__",
    SUFFIX = "__";

var defaultDeps = ["global", "module", "exports", "require"];

module.exports = function (content, file, conf) {
    var reg, deps, md5deps, args;

    if (file.isMod || conf.wrapAll) {
        reg = new RegExp(requireRegStr, "g"); //分析require正则实例化
        deps = []; //require依赖的模块standard路径数组
        md5deps = []; //require依赖模块standard路径md5后的数组
        args; //define的factory回调函数的参数

        content = content.replace(reg, function (all, requirePrefix, requireStr, requireValueStr) {
            var info, dep, md5dep;

            //满足条件说明匹配到期望的require，注释和字符中的requirePrefix都为undefined
            if (requirePrefix !== undefined) {

                info = fis.util.stringQuote(requireValueStr);

                //把路径standard
                dep = fis.uri.getId(info.rest, file.dirname).id;

                //把standard路径再次md5，作为函数参数用
                md5dep = PREFIX + fis.util.md5(dep) + SUFFIX;

                //避免重复添加
                if (deps.indexOf(dep) < 0) {
                    deps.push(dep);
                    md5deps.push(md5dep);
                }

                //把reuqire注释并替换成md5后的函数参数
                return requirePrefix + "/*" + requireStr + "*/" + md5dep;
            }
            return all;
        });

        args = defaultDeps.concat(md5deps);

        content = "define('" + file.getId() + "'," + JSON.stringify(defaultDeps.concat(deps)) + ",function(" + args.join(", ") + "){\n\n" + content + "\n\n});";

    }

    return content;

};