/**
 * @file Requestor 发起quickling请求，管理sessionid和pagelet缓存
 * @author zhangwentao(zhangwentao@baidu.com)
 */

__d("Requestor", ["Controller"], function (global, require, module, exports) {

  var Controller = require('Controller');

    var requestor = {
    sessions: {},
    /*
     cacheData : {
     url1 : {
     id1 : {}, // {child : id2}
     id2 : {}
     },
     url2 : {
     id1 : {}, // {child : id2}
     id2 : {}
     }
     }
     */
    cacheData: {},
        fetch: function (pagelets, url, cb) {
      var cache,
        cached = [],
        nonCached = [],
        pagelet,
        i,
        length = pagelets.length,
        j,
        child;

      // if (cache = this.cacheData[url]) {
      //   for (i = 0; i < length; i++) {
      //     pagelet = pagelets[i];
      //     if (!cache[pagelet]) {
      //       nonCached.push(pagelet);
      //     } else {
      //       //cached.push(cache[pagelet]);
      //       findChild(cache[pagelet]);
      //     }
      //   }
      // } else {
        nonCached = pagelets;
      // }
            function pageletsArrive(data) {
                for (var i = 0; i < data.length; i++) {
                    // BigPipe.onPageletArrive(data[i]);
                    var conf = data[i];
                    if (conf.html.html) {
                        conf.html = conf.html.html;
                    }

                    // conf.html = conf.html.html;
                    // if(!this.cacheData[url]) this.cacheData[url] = {};
                    // if (!cache[conf.id]) {
                    //   cache[conf.id] = conf;
                    // }
                    // if(conf.session >= me.sessions[conf.id]){
                    Controller.pageletArrive(data[i]);
                    // callback && callback(data[i]);
                    // }
                }
            }

            this._fetch(nonCached, url, function (err, data, xhrStatus) {
                if (err) {
                    cb && cb(err, data, xhrStatus);
                } else {
                    // Controller.pageletsArrive(data);
                    pageletsArrive(data);
                }
            }, cached);

      // function findChild(pagelet) {
      //   var count;
      //   var childObj;
      //   count = pagelet.children && pagelet.children.length || 0;

      //   cached.push(pagelet);

      //   if (count) {
      //     for (j = 0; j < count; j++) {
      //       child = pagelet.children[j];
      //       childObj = cache[child];

      //       if (!childObj) {
      //         nonCached.push(child);
      //       } else {
      //         findChild(childObj);
      //       }
      //     }
      //   }
      // }
    },
    _fetch: function (pagelets, url, callback, cached) {
      //var url;
      // var cache;

      // if (!this.cacheData[url]) {
      //   this.cacheData[url] = {};
      // }
      // cache = this.cacheData[url];

      // if (!pagelets.length && cached.length) {
      //   parseData(cached);
      //   return;
      // }

      for (var i = 0; i < pagelets.length; i++) {
        if (this.sessions[pagelets[i]] === undefined) {
          this.sessions[pagelets[i]] = 0;
        } else {
          this.sessions[pagelets[i]]++;
        }
        pagelets[i] += '.' + this.sessions[pagelets[i]];
      }
      url = url || '';

      if (url.indexOf('?') > -1) {
        url += '&__quickling__=' + pagelets.join(',');
      }
      else {
        url += '?__quickling__=' + pagelets.join(',');
      }

        /* globals ajax */
        ajax(url, function (err, text, xhrStatus) {
            if (err) {
                callback(err, text, xhrStatus);
            } else {
                var data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    return callback(new Error('JSONParseError'), text, xhrStatus);
                }

                if (cached && cached.length) {
                    data = data.concat(cached);
                }
                callback(false, data);
            }
        });
    }
  };

    module.exports = requestor;
});
/* __wrapped__ */
/* @cmd false */
