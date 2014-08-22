var tagFilter = require("../plugins/tagFilter.js"),
    pregQuote = require("../plugins/pregQuote.js");

var smarty_left_delimiter = fis.config.get("settings.smarty.left_delimiter") || "{",
    smarty_right_delimiter = fis.config.get("settings.smarty.left_delimiter") || "}",
    fis_standard_map = fis.compile.lang;

var stringRegStr = "(?:" +
    "\"(?:[^\\\\\"\\r\\n\\f]|\\\\[\\s\\S])*\"" + //匹配以"为界定符的字符禅
    "|" +
    "\'(?:[^\\\\\'\\r\\n\\f]|\\\\[\\s\\S])*\'" + //匹配以'为界定符的字符串
    ")",
    jscommentRegStr = "(?:" +
    "\\/\\/[^\\r\\n\\f]*" + // 匹配单行注释
    "|" +
    "\\/\\*[\\s\\S]+?\\*\\/" + //匹配多行注释
    ")",
    jsStringArrayRegStr = "(?:" +
    "\\[\\s*" + stringRegStr + "(?:\\s*,\\s*" + stringRegStr + ")*\\s*\\]" + //匹配非空字符串数组
    ")";

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
    return tagFilter.filterBlock(content, "script", "<", ">", function(outter, attr, inner) {
        if (runAtServerReg.test(attr)) {
            return smarty_left_delimiter + "script" + attr.replace(runAtServerReg, "") + smarty_right_delimiter + inner + smarty_left_delimiter + "/script" + smarty_right_delimiter;
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
    var attrReg = new RegExp("((?:^|\\s)" + pregQuote(attrName) + "\\s*=\\s*)(([\"\']).*?\\3)", "ig");
    content = tagFilter.filterTag(content, tagName, smarty_left_delimiter, smarty_right_delimiter, function(outter, attr) {
        var preCodeHolder = "$1",
            valueCodeHolder = "$2";
        //console.log(outter, attr);
        attr = attr.replace(attrReg, preCodeHolder + fis_standard_map.require.ld + valueCodeHolder + fis_standard_map.require.rd);
        //console.log(outter, attr);
        outter = smarty_left_delimiter + tagName + attr + smarty_right_delimiter;
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
    var requireRegStr = "(\\brequire(?:\\s*\\.\\s*(?:async|defer))?\\s*\\(\\s*)(" + stringRegStr + "|" + jsStringArrayRegStr + ")",
        //优先匹配字符串和注释
        reg = new RegExp(stringRegStr + "|" + jscommentRegStr + "|" + requireRegStr, "g");

    content = tagFilter.filterBlock(content, "script", smarty_left_delimiter, smarty_right_delimiter, function(outter, attr, inner) {
        reg.lastIndex = 0;
        inner = inner.replace(reg, function(all, requirePrefix, requireValueStr) {
            if (requirePrefix) {
                try {
                    requireValue = JSON.parse(requireValueStr);
                    switch (typeof(requireValue)) {
                        case "string": // String
                            all = requirePrefix + fis_standard_map.require.ld + requireValueStr + fis_standard_map.require.rd;
                            break;
                        case "object": // Array
                            for (var i = 0, count = requireValue.length, output = []; i < count; i++) {
                                output.push(fis_standard_map.require.ld + JSON.stringify(requireValue[i]) + fis_standard_map.require.rd);
                            }
                            all = requirePrefix + "[" + output.join(",") + "]";
                            break;
                    }
                } catch (e) {
                    //TODO Error
                }
            }
            return all;
        });

        return smarty_left_delimiter + "script" + attr + smarty_right_delimiter +
            inner +
            smarty_left_delimiter + "/" + "script" + smarty_right_delimiter;
    });
    return content;
}

function explandPath(content, file, conf) {
    //console.log(file);
    content = explandSmartyPathAttr(content, "html", "framework");
    content = explandSmartyPathAttr(content, "require", "name");
    content = explandSmartyPathAttr(content, "widget", "name");
    content = explandScriptRequirePath(content);
    return content;
}

function analyseScript(content, file, conf) {
    //TODO
    return content;
}


function defineWidget(content, file, conf) {
    content = tagFilter.filterBlock(content, "define", smarty_left_delimiter, smarty_right_delimiter, function(outter, attr, inner) {
        //TODO
        return smarty_left_delimiter + "function" + attr + smarty_right_delimiter +
            inner +
            smarty_left_delimiter + "/function" + smarty_right_delimiter;
    });
    return content;
}

exports.replaceScriptTag = replaceScriptTag;
exports.explandPath = explandPath;
exports.analyseScript = analyseScript;
exports.defineWidget = defineWidget;
