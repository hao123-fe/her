var tagFilter = require("../plugins/tagFilter.js"),
    pregQuote = require("../plugins/pregQuote.js");


var smarty_left_delimiter = fis.config.get("settings.smarty.left_delimiter") || "{",
    smarty_right_delimiter = fis.config.get("settings.smarty.left_delimiter") || "}",
    fis_standard_map = fis.compile.lang;

// ==== 将<script runat="server"></script> 替换为 {script}{/script}
function replaceScriptTagHandler(outter, attr, inner) {
    var runAtServerReg = /(?:^|\s)runat\s*=\s*(["'])server\1/;
    if (runAtServerReg.test(attr)) {
        return smarty_left_delimiter + "script" + attr.replace(runAtServerReg, "") + smarty_right_delimiter + inner + smarty_left_delimiter + "/script" + smarty_right_delimiter;
    } else {
        return outter;
    }
}

function replaceScriptTag(content, file, conf) {
    return tagFilter.filterBlock(content, "script", "<", ">", replaceScriptTagHandler);
}

// ==== 替换模板中所有可能的路径
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

function explandScriptRequirePathHandler(outter, attr, inner) {
    //TODO 
    return outter;
}

function explandScriptRequirePath(content) {
    content = tagFilter.filterBlock(content, "script", smarty_left_delimiter, smarty_right_delimiter, explandScriptRequirePathHandler);
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

exports.replaceScriptTag = replaceScriptTag;
exports.explandPath = explandPath;
