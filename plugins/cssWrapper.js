/**
* cssWrapper 给css添加特殊样式用于判断css加载完毕
*/

module.exports = function (content, file, conf) {

    var md5name = fis.util.md5(content, 7);

    content += "\n" + ".css_" + md5name + "{height:88px}";

    return content;

};