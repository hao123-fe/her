/**
* requireAnalyze 分析文件中的同步require和异步require
*/
var commonReg = require("../plugins/commonReg.js");

var stringRegStr = commonReg.stringRegStr,
    jscommentRegStr = commonReg.jscommentRegStr,
    jsStringArrayRegStr = commonReg.jsStringArrayRegStr,
    requireRegStr = "((?:[^\\$\\.]|^)\\brequire(?:\\s*\\.\\s*(async|defer))?\\s*\\(\\s*)(" +
        stringRegStr + "|" +
        jsStringArrayRegStr + ")";


module.exports = function (content, file, conf) {

    //优先匹配字符串和注释
    var reg = new RegExp(stringRegStr + "|" +
            jscommentRegStr + "|" +
            requireRegStr, "g");

    var requires = {
        sync: {},
        async: {}
    };

    var initial = false;
    if (file.extras == undefined) {
        file.extras = {};
        initial = true;
    }
    file.extras.async = [];

    content = content.replace(reg, function (all, requirePrefix, requireType, requireValueStr) {
        var requireValue, holder, info;

        if (requirePrefix) {
            //try {
            requireValue = JSON.parse(requireValueStr);
            //} catch (e) {
            //TODO Error
            //}
            switch (typeof (requireValue)) {
                case "string": // String
                    requireValue = [requireValue];
                    break;
                case "object": // Array
                    // nothing to do
                    break;
                default:
                    //???
            }

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
            }

            requireValue.forEach(function (item, index, array) {
                info = fis.uri.getId(item, file.dirname);
                holder[info.id] = true;
            });
        }
    });

    //处理同步require
    for (var id in requires.sync) {
        file.addRequire(id);
    }

    //处理异步require
    for (var id in requires.async) {
        if (file.extras.async.indexOf(id) < 0) {
            file.extras.async.push(id);
        }
    }

    if (file.extras.async.length == 0) {
        delete file.extras.async;
        if (initial) {
            delete file.extras;
        }
    }

    return content;

};