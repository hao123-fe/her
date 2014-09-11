/**
* jsWrapper 以amd模式为js代码封装define，并分析文件中的require，放入depends中
*/
var commonReg = require("../plugins/commonReg.js");

//构造分析require("xxx")的正则表达式，同时优先分析字符串和注释。
var requireRegStr = commonReg.stringRegStr + "|" + 
                    commonReg.jscommentRegStr + "|" +
                    "([^\\$\\.]|^)(\\brequire\\s*)\\(\\s*(" +
                    commonReg.stringRegStr + ")\\s*\\)";

var PREFIX = "__",
    SUFFIX = "__";

module.exports = function (content, file, conf) {

    var reg = new RegExp(requireRegStr, "g"),
        deps = [],
        md5deps = [];

    content = content.replace(reg, function (all, requirePre, requireStr, requireValueStr) {
        var info, dep, md5dep;
        //满足条件说明匹配到期望的require，注释和字符中的requireValueStr都为undefined
        if (requireValueStr) {

            info = fis.util.stringQuote(requireValueStr);
            dep = info.rest;
            md5dep = PREFIX + fis.util.md5(dep) + SUFFIX;

            deps.push(dep);
            md5deps.push(md5dep);

            return requirePre + "/*" + requireStr + "*/" + md5dep;
        }
        return all;
    });

    var args = ["global", "module", "exports", "require"].concat(md5deps);

    content = "define('" + file.getId() + "'," + JSON.stringify(deps) + ",function(" + args.join(", ") + "){\n\n" + content + "\n\n});";

    return content;

};