var tagFilter = require("../plugins/tagFilter.js"),
    commonReg = require("../plugins/commonReg.js"),
    pregQuote = require("../plugins/pregQuote.js");

var smarty_left_delimiter;
var smarty_right_delimiter;

var stringRegStr = commonReg.stringRegStr,
    jscommentRegStr = commonReg.jscommentRegStr,
    jsStringArrayRegStr = commonReg.jsStringArrayRegStr;

var DEFAULT_METHOD_NAME = "__main",
    PRFIX = "_",
    SUFFIX = "_";

function setDelimiter() {
        smarty_left_delimiter = fis.config.get("settings.smarty.left_delimiter") || "{";
        smarty_right_delimiter = fis.config.get("settings.smarty.right_delimiter") || "}";
    }
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
    setDelimiter();
    var runAtServerReg = /(?:^|\s)runat\s*=\s*(["'])server\1/;
    return tagFilter.filterBlock(content,
        "script", "<", ">",
        function(outter, attr, inner) {
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
function explandSmartyPathAttr(content, tagName, attrName, file) {
    // /((?:^|\s)name\s*=\s*)((["']).*?\3)/
    setDelimiter();

    var attrReg = new RegExp("((?:^|\\s)" +
        pregQuote(attrName) +
        "\\s*=\\s*)(([\"\']).*?\\3)", "ig");
    content = tagFilter.filterTag(content,
        tagName, smarty_left_delimiter, smarty_right_delimiter,
        function(outter, attr) {

            attr = attr.replace(attrReg,
                function(all, preCodeHolder, valueCodeHolder) {
                    var info = fis.uri.getId(valueCodeHolder, file.dirname);
                    var ret = info.quote + info.id + info.quote;
                    return preCodeHolder + ret;
                });
            // attr = attr.replace(attrReg,
            //     preCodeHolder +
            //     fis_standard_map.id.ld +
            //     valueCodeHolder +
            //     fis_standard_map.id.rd);

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
function explandScriptRequirePath(content, file) {
    setDelimiter();
    var requireRegStr = "(\\brequire(?:\\s*\\.\\s*(?:async|defer))?\\s*\\(\\s*)(" +
        stringRegStr + "|" +
        jsStringArrayRegStr + ")",

        //优先匹配字符串和注释
        reg = new RegExp(stringRegStr + "|" +
            jscommentRegStr + "|" +
            requireRegStr, "g");

    content = tagFilter.filterBlock(content,
        "script", smarty_left_delimiter, smarty_right_delimiter,
        function(outter, attr, inner) {
            reg.lastIndex = 0;
            inner = inner.replace(reg,
                function(all, requirePrefix, requireValueStr) {
                    var requireValue, hasBrackets = false;

                    if (requirePrefix) {

                        //判断是否有[]，有则切割,
                        requireValueStr = requireValueStr.trim().replace(/(^\[|\]$)/g, function(m, v) {
                            if (v) {
                                hasBrackets = true;
                            }
                            return '';
                        });
                        if (hasBrackets) { //Array
                            //构造数组
                            requireValue = requireValueStr.split(/\s*,\s*/);
                            all = requirePrefix +
                                "[" + requireValue.map(function(path) {
                                    var info = fis.uri.getId(path, file.dirname);
                                    var ret = info.quote + info.id + info.quote;
                                    return ret;
                                }).join(",") + "]";
                        } else { //String
                            var info = fis.uri.getId(requireValueStr, file.dirname);
                            var ret = info.quote + info.id + info.quote;
                            all = requirePrefix + ret;
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

    content = explandSmartyPathAttr(content, "html", "her", file);
    content = explandSmartyPathAttr(content, "require", "name", file);
    content = explandSmartyPathAttr(content, "widget", "name", file);
    content = explandScriptRequirePath(content, file);
    return content;
}

function analyseScript(content, file, conf) {
    setDelimiter();
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
        function(outter, attr, inner) {
            var requires = {
                sync: {},
                async: {}
            };

            reg.lastIndex = 0;
            inner.replace(reg,
                function(all, requirePrefix, requireType, requireValueStr) {
                    var requireValue, holder;

                    if (requirePrefix) {

                        //先切割掉[]
                        requireValueStr = requireValueStr.trim().replace(/(^\[|\]$)/g, '');

                        //构造数组
                        requireValue = requireValueStr.split(/\s*,\s*/);


                        //try {
                        //} catch (e) {
                        //TODO Error
                        //}
                        //                        switch (typeof (requireValue)) {
                        //                            case "string": // String
                        //                                requireValue = [requireValue];
                        //                                break;
                        //                            case "object": // Array
                        //                                // nothing to do
                        //                                break;
                        //                            default:
                        //                                break;
                        //                        }

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

                        requireValue.forEach(function(item, index, array) {
                            holder[item] = true;
                        });
                    }
                });

            var arr, i;
            var info;

            arr = [];
            for (i in requires.sync) {
                if (requires.sync.hasOwnProperty(i)) {
                    arr.push(i);

		    // 添加tpl对js的依赖关系
                    info = fis.uri.getId(i, file.dirname);
                    file.addRequire(info.id);
                }
            }
            attr += " sync=[" + arr.join(",") + "]";

            arr = [];
            for (i in requires.async) {
                if (requires.async.hasOwnProperty(i)) {
                    arr.push(i);
                }
            }
            attr += " async=[" + arr.join(",") + "]";

            
            var result = smarty_left_delimiter +
                "script" +
                attr +
                smarty_right_delimiter +
                inner +
                smarty_left_delimiter +
                "/script" +
                smarty_right_delimiter;
            return result;
        });
    return content;
}

function defineWidget(content, file, conf) {
    setDelimiter();
    var methodReg = new RegExp("((?:^|\\s)method\\s*=\\s*)(" + stringRegStr + ")"), //创建提取method方法的正则
        nameReg = new RegExp("(?:^|\\s)name\\s*=\\s*(" + stringRegStr + ")"); //匹配widget中name的正则

    //把define替换成function，name为"_standard路径md5值_method",如没有method则取默认值__main
    content = tagFilter.filterBlock(content,
        "define", smarty_left_delimiter, smarty_right_delimiter,
        function(outter, attr, inner) {
            //把文件standard路径md5
            var md5Name = PRFIX + fis.util.md5(file.id, 32) + SUFFIX;
            //判断define中是否有method属性
            if (methodReg.test(attr)) {

                attr = attr.replace(methodReg, function(all, methodPrefix, methodValue) {
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

    //把widget中的method替换为为"_standard路径md5值_method"
    file.extras.widget = []
    content = tagFilter.filterTag(content, "widget", smarty_left_delimiter, smarty_right_delimiter, function(outter, attr, inner) {
        var matches = attr.match(nameReg),
            info, widgetName;
        if (!matches) {
            throw new Error("widget must define name attribute");
        } else {
            info = fis.util.stringQuote(matches[1]);

            widgetName = PRFIX + fis.util.md5(info.rest, 32) + SUFFIX;
        }

        // 添加tpl对tpl的依赖关系
        var id = fis.uri.getId(matches[1], file.dirname).id;
        file.addRequire(id);

        if (methodReg.test(attr)) {
            attr = attr.replace(methodReg, function(all, methodPrefix, methodValue) {
                info = fis.util.stringQuote(methodValue);
                return methodPrefix + info.quote + widgetName + info.rest + info.quote;
            });

        } else {
            attr += ' method="' + widgetName + DEFAULT_METHOD_NAME + '"';
        }

        return smarty_left_delimiter +
            "widget" +
            attr +
            smarty_right_delimiter;
    });
    
    //如果没有异步依赖，删除多余的对象
    if (file.extras.widget.length == 0) {
        delete file.extras.widget;
    }

    return content;
}

// smarty的<%require%>分析
function analyseSmartyRequire(content, file, conf) {
    setDelimiter();

    var nameReg = new RegExp("(?:^|\\s)name\\s*=\\s*(" + stringRegStr + ")"); //匹配require中name的正则

    content = tagFilter.filterTag(content, "require", smarty_left_delimiter, smarty_right_delimiter, function (outter, attr, inner) {
        // console.log(file.id, attr);
        var matches = attr.match(nameReg);
        
        // 添加tpl对<%require%>的依赖关系
        var id = fis.uri.getId(matches[1], file.dirname).id;
        file.addRequire(id);

        return outter;
    });

    return content;
}

exports.replaceScriptTag = replaceScriptTag;
exports.explandPath = explandPath;
exports.analyseScript = analyseScript;
exports.defineWidget = defineWidget;
exports.analyseSmartyRequire = analyseSmartyRequire;
