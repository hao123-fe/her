/**
* requireAnalyze 分析文件中的同步require和异步require
*/
var commonReg = require("../plugins/commonReg.js");

var stringRegStr = commonReg.stringRegStr,
    jscommentRegStr = commonReg.jscommentRegStr,
    jsStringArrayRegStr = commonReg.jsStringArrayRegStr,
    //构造分析require|require.async|require.defer的正则表达式
    requireRegStr = "((?:[^\\$\\.]|^)\\brequire(?:\\s*\\.\\s*(async|defer))?\\s*\\(\\s*)(" +
        stringRegStr + "|" +
        jsStringArrayRegStr + ")";

module.exports = function (content, file, conf) {

    var reg, requires, initial;

    if (file.isMod || conf.wrapAll) {
        //优先匹配字符串和注释
        reg = new RegExp(stringRegStr + "|" +
            jscommentRegStr + "|" +
            requireRegStr, "g");
        //存储分析的同步require和异步require
        requires = {
            sync: {},
            async: {}
        };
        initial = false;

        if (file.extras == undefined) {
            file.extras = {};
            initial = true;
        }
        file.extras.async = [];

        content = content.replace(reg, function (all, requirePrefix, requireType, requireValueStr) {
            var hasBrackets = false,
                requireValue, holder, info, quote;

            //满足条件说明匹配到期望的require，注释和字符中的requirePrefix都为undefined
            if (requirePrefix) {

                //判断是否有[]，有则切割,
                requireValueStr = requireValueStr.trim().replace(/(^\[|\]$)/g, function (m, v) {
                    if (v) {
                        hasBrackets = true;
                    }
                    return '';
                });

                requireValue = requireValueStr.split(/\s*,\s*/);

                requireType = "require" + (requireType ? ("." + requireType) : "");

                switch (requireType) {
                    case "require":
                        holder = requires.sync;
                        break;
                    case "require.async":
                    case "require.defer":
                        holder = requires.async;
                        break;
                    default:
                        break;
                }

                requireValue.forEach(function (item, index, array) {
                    //standard路径
                    info = fis.uri.getId(item, file.dirname);
                    holder[info.id] = true;

                });

                //standard路径
                if (hasBrackets) {//Array
                    all = requirePrefix +
                                    "[" + requireValue.map(function (path) {
                                        quote = fis.util.stringQuote(path).quote;
                                        return quote + fis.uri.getId(path, file.dirname).id + quote
                                    }).join(",") + "]";
                } else { //String
                    quote = fis.util.stringQuote(requireValueStr).quote;
                    all = requirePrefix + quote + fis.uri.getId(requireValueStr, file.dirname).id + quote;
                }

            }
            return all;
        });

        //处理同步require
        // for (var id in requires.sync) {
    //     file.addRequire(id);
    // }


        //处理异步require
        for (var id in requires.async) {
            if (file.extras.async.indexOf(id) < 0) {
                file.extras.async.push(id);
            }
        }

        //如果没有异步依赖，删除多余的对象
        if (file.extras.async.length == 0) {
            delete file.extras.async;
            if (initial) {
                delete file.extras;
            }
        }
    }

    return content;

};