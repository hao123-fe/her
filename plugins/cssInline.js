/**
 * postpackager cssInline
 * 
 * @author zhangwentao <zhangwentao@baidu.com>
 */

module.exports = function(ret, conf, settings, opt) {
    fis.util.map(ret.map.her, function (herId) {
        var herRes = ret.map.her[herId];
        if (herRes.inline && herRes.file) {
            // console.log(herId);
            herRes.content = herRes.file.getContent();
            delete herRes.inline;
            delete herRes.file;
        }
    });
};