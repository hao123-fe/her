var tagFilter = require("../plugins/tagFilter.js"),
    commonReg = require("../plugins/commonReg.js"),
    pregQuote = require("../plugins/pregQuote.js");

var smarty_left_delimiter = fis.config.get("settings.smarty.left_delimiter") || "{",
    smarty_right_delimiter = fis.config.get("settings.smarty.left_delimiter") || "}",
    fis_standard_map = fis.compile.lang;


var stringRegStr = commonReg.stringRegStr,
    jscommentRegStr = commonReg.jscommentRegStr,
    jsStringArrayRegStr = commonReg.jsStringArrayRegStr;

var DEFAULT_METHOD_NAME = "__main",
    PRFIX = "_",
    SUFFIX = "_";

/**
* replaceScriptTag 将<script runat="server"></script> 替换为 {script}{/script}
*
* @param content $content
* @param file $file
* @param conf $conf
* @access public
* @return void
*/
function replaceScriptTag(content, file, conf) {
    var runAtServerReg = /(?:^|\s)runat\s*=\s*(["'])server\1/;
    return tagFilter.filterBlock(content,
        "script", "<", ">",
        function (outter, attr, inner) {
            if (runAtServerReg.test(attr)) {
                return smarty_left_delimiter +
                    "script" +
                    attr.replace(runAtServerReg, "") +
                    smarty_right_delimiter +
                    inner +
                    smarty_left_delimiter +
                    "/script" +
                    smarty_right_delimiter;
            } else {
                return outter;
            }
        });
}

/**
* explandSmartyPathAttr 替换Smarty模板中用于定位资源的标签参数
*
* @param content $content
* @param tagName $tagName
* @param attrName $attrName
* @access public
* @return void
*/
function explandSmartyPathAttr(content, tagName, attrName) {
    // /((?:^|\s)name\s*=\s*)((["']).*?\3)/
    var attrReg = new RegExp("((?:^|\\s)" +
        pregQuote(attrName) +
        "\\s*=\\s*)(([\"\']).*?\\3)", "ig");
    content = tagFilter.filterTag(content,
        tagName, smarty_left_delimiter, smarty_right_delimiter,
        function (outter, attr) {
            var preCodeHolder = "$1",
                valueCodeHolder = "$2";

            attr = attr.replace(attrReg,
                preCodeHolder +
                fis_standard_map.id.ld +
                valueCodeHolder +
                fis_standard_map.id.rd);
            //console.log(outter, attr);
            outter = smarty_left_delimiter +
                tagName + attr +
                smarty_right_delimiter;
            //console.log(outter, attr);
            return outter;
        });

    return content;
}

/**
* explandScriptRequirePath 替换Js中 require、require.async、require.defer 用到的路径参数
*
* @param content $content
* @access public
* @return void
*/
function explandScriptRequirePath(content) {
    var requireRegStr = "(\\brequire(?:\\s*\\.\\s*(?:async|defer))?\\s*\\(\\s*)(" +
        stringRegStr + "|" +
        jsStringArrayRegStr + ")",

    //优先匹配字符串和注释
        reg = new RegExp(stringRegStr + "|" +
            jscommentRegStr + "|" +
            requireRegStr, "g");

    content = tagFilter.filterBlock(content,
        "script", smarty_left_delimiter, smarty_right_delimiter,
        function (outter, attr, inner) {
            reg.lastIndex = 0;
            inner = inner.replace(reg,
                function (all, requirePrefix, requireValueStr) {
                    if (requirePrefix) {
                        //try {
                        var requireValue = JSON.parse(requireValueStr);
                        //} catch (e) {
                        //TODO Error
                        //}
                        switch (typeof (requireValue)) {
                            case "string": // String
                                all = requirePrefix +
                                    fis_standard_map.id.ld +
                                    requireValueStr +
                                    fis_standard_map.id.rd;
                                break;
                            case "object": // Array
                                all = requirePrefix +
                                    "[" + requireValue.map(function (path) {
                                        return fis_standard_map.id.ld +
                                            JSON.stringify(path) +
                                            fis_standard_map.id.rd;
                                    }).join(",") + "]";
                                break;
                        }
                    }
                    return all;
                });

            return smarty_left_delimiter +
                "script" +
                attr +
                smarty_right_delimiter +
                inner +
                smarty_left_delimiter +
                "/script" +
                smarty_right_delimiter;
        });
    return content;
}

function explandPath(content, file, conf) {
    // console.log(file);
    content = explandSmartyPathAttr(content, "html", "framework");
    content = explandSmartyPathAttr(content, "require", "name");
    content = explandSmartyPathAttr(content, "widget", "name");
    content = explandScriptRequirePath(content);
    return content;
}

function analyseScript(content, file, conf) {
    var requireRegStr = "((?:[^\\$\\.]|^)\\brequire(?:\\s*\\.\\s*(async|defer))?\\s*\\(\\s*)(" +
        stringRegStr + "|" +
        jsStringArrayRegStr + ")",

    //优先匹配字符串和注释
        reg = new RegExp(stringRegStr + "|" +
            jscommentRegStr + "|" +
            requireRegStr, "g");

    content = tagFilter.filterBlock(content,
        "script",
        smarty_left_delimiter,
        smarty_right_delimiter,
        function (outter, attr, inner) {
            var requires = {
                sync: {},
                async: {}
            };

            reg.lastIndex = 0;
            inner.replace(reg,
                function (all, requirePrefix, requireType, requireValueStr) {
                    var requireValue, holder;

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
                        // console.log(requireType);
                        switch (requireType) {
                            case "require":
                                holder = requires.sync;
                                break;
                            case "require.async":
                            case "require.defer":
                                holder = requires.async;
                                break;
                            default:
                                //???
                        }

                        //console.log(holder, requireValue);
                        requireValue.forEach(function (item, index, array) {
                            holder[item] = true;
                        });
                    }
                });

            var arr, i;

            arr = [];
            for (i in requires.sync) {
                if (requires.sync.hasOwnProperty(i)) {
                    arr.push(JSON.stringify(i));
                }
            }
            attr += " sync=[" + arr.join(",") + "]";

            arr = [];
            for (i in requires.async) {
                if (requires.async.hasOwnProperty(i)) {
                    arr.push(JSON.stringify(i));
                }
            }
            attr += " async=[" + arr.join(",") + "]";

            return smarty_left_delimiter +
                "script" +
                attr +
                smarty_right_delimiter +
                inner +
                smarty_left_delimiter +
                "/script" +
                smarty_right_delimiter;
        });
    return content;
}

function defineWidget(content, file, conf) {
    //创建提取method方法的reg
    var methodReg = new RegExp("((?:^|\\s)method\\s*=\\s*)(" + stringRegStr + ")"),
        nameReg = new RegExp("(?:^|\\s)name\\s*=\\s*(" + stringRegStr + ")");

    //把define替换成function
    content = tagFilter.filterBlock(content,
        "define", smarty_left_delimiter, smarty_right_delimiter,
        function (outter, attr, inner) {
            var md5Name = PRFIX + fis.util.md5(file.id, 32) + SUFFIX;
            //判断define中是否有method属性
            if (methodReg.test(attr)) {

                attr = attr.replace(methodReg, function (all, methodPrefix, methodValue) {
                    var info = fis.util.stringQuote(methodValue);
                    return methodPrefix.replace('method', 'name') + info.quote + md5Name + info.rest + info.quote;
                });
            } else {
                attr += ' name="' + md5Name + DEFAULT_METHOD_NAME + '"';
            }

            return smarty_left_delimiter +
                "function" +
                attr +
                smarty_right_delimiter +
                inner +
                smarty_left_delimiter +
                "/function" +
                smarty_right_delimiter;
        });

    //把widget中的name属性 md5
    content = tagFilter.filterTag(content,
        "widget", smarty_left_delimiter, smarty_right_delimiter,
        function (outter, attr, inner) {
            var matches = attr.match(nameReg),
                info, widgetName;
            if (!matches) {
                throw new Error("widget must define name attribute");
            } else {
                info = fis.util.stringQuote(matches[1]);
                widgetName = PRFIX + fis.util.md5(info.rest, 32) + SUFFIX;
            }
            if (methodReg.test(attr)) {
                attr = attr.replace(methodReg, function (all, methodPrefix, methodValue) {
                    info = fis.util.stringQuote(methodValue);

                    return methodPrefix + info.quote + widgetName + info.rest + info.quote;
                });
            }

            return smarty_left_delimiter +
                "widget" +
                attr +
                smarty_right_delimiter;
        });


    return content;
}

exports.replaceScriptTag = replaceScriptTag;
exports.explandPath = explandPath;
exports.analyseScript = analyseScript;
exports.defineWidget = defineWidget;
