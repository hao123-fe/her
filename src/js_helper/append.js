/**
 *  一个简单的 append
 *  可以结合 BigPipe.fetch 实现无限追加, 使用方法见 README.md
 *  @file append.js
 *  @author zhangwentao <zhangwentao@baidu.com>
 */

var config = {};

function initConf(key, conf) {
    config[key] = conf;
}

function getConf(key, defaultValue) {
    return config.hasOwnProperty(key) ? config[key] : defaultValue;
}


function append(prefix, url, cb) {
    var conf = getConf(prefix);

    if (conf) {
        var wrapId = conf.wrapId;
        var key = conf.key;


        if (!wrapId || !key) {
            throw new Error('wrapId or key missing');
        }

        if (!conf.id) {
            conf.id = 0;
        }

        var id = ++conf.id;

        var pageletId = prefix + id;
        var paramStr = [key, id].join('=');

        var $wrap = document.getElementById(wrapId);

        if (!$wrap) {
            throw new Error('Wrap node does not exist ' + wrapId);
        }

        var $div = document.createElement('div');
        $div.id = pageletId;

        $wrap.appendChild($div);

        url += url.indexOf('?') > -1 ? ('&' + paramStr) : ('?' + paramStr);

        /* globals BigPipe */
        BigPipe.fetch([pageletId], url, cb);

    } else {
        throw new Error('There is no config for ' + prefix);
    }
}

append.init = initConf;

module.exports = append;
