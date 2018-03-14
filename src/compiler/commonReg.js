/**
* 一些通用的正则表达式库
*/

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

exports.stringRegStr = stringRegStr;
exports.jscommentRegStr = jscommentRegStr;
exports.jsStringArrayRegStr = jsStringArrayRegStr;
