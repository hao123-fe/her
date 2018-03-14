/**
 * @file Bigpipe提供获取pagelet 处理pagelet和资源的接口
 * @author zhangwentao(zhangwentao@baidu.com)
 */

__d("BigPipe", ["Resource", "Requestor", "Controller"], function(global, require, module, exports) {

  var Resource = require("Resource");
  var Requestor = require("Requestor");
  var Controller = require("Controller");

  /**
   * @global
   * @namespace
   */
  var BigPipe = {
    init: function() {},
    /**
     * 页面调用函数,用于传输数据
     *
     * @param {Object} conf pagelet数据
     * @example
     * BigPipe.onPageletArrive({
     *  "id" : "",                  //pagelet 的 ID
     *  "container": "__cnt_0_1",   //pagelet HTML的容器ID
     *  "children" : [              //子pagelet的 ID 列表
     *      "header",
     *      "__elm_0_1",
     *      "__elm_0_2"
     *  ].
     *  "deps":{                    //事件的依赖资源
     *      "beforeload": [         //"beforeload" 事件的依赖资源
     *          "XbsgfuDYNN"
     *       ],
     *       "load": [              //"load" 事件的依赖资源
     *          "qwlFYEkDet"
     *       ]
     *  },
     *  "hooks":{                   //事件回调
     *      "beforeload": [         //"beforeload" 的事件回调
     *          "__cb_0_1",
     *          "__cb_0_2"
     *      ],
     *      "load":[                //"load" 的事件回调
     *          "__cb_0_3",
     *          "__cb_0_4"
     *      ]
     *  }
     * });
     */
    onPageletArrive: function(conf) {
      Controller.pageletArrive(conf);
    },
    //TODO
    /**
     * 页面调用函数,用于设置资源列表
     *
     * @param {Object} map 资源列表
     * @example
     * BigPipe.setResourceMap({
     *     "XbsgfuDYNN" : {                                         //资源ID
     *          "type" : "css",                                     //资源类型
     *          "src" : "http://s0.hao123img.com/v5/xx/XX/XX.Bigpipe",   //资源地址
     *          "deps" : [                                          //依赖资源 ID 列表
     *              "rIffdDBQKC",
     *              "qwlFYEkDet"
     *          ],
     *          "mods" : [                                          //资源所包含的模块列表
     *              "common:Bigpipe/jquery.Bigpipe",
     *              "common:Bigpipe/event.Bigpipe"
     *          ]
     *     },
     *     "rIffdDBQKC" : {
     *          // 同上
     *     }
     * });
     */
    setResourceMap : Controller.setResourceMap, //function(map) {
    //TODO
    //Resource.setResourceMap(map);
    //},
    loadedResource : Resource.loadedResource, //function(resources){
    //Resource.loadedResource(resources);
    //},
    getResource : Resource.getResource, //function(id) {
    //TODO
    //return Resource.getResource(id);
    //},
    getResourceByName : Resource.getResourceByName, //function(name){
    //return Resource.getResourceByName(name);
    //},
    hooks : Controller.hooks,
      fetch: function (pagelets, url, cb) {
          Requestor.fetch(pagelets, url, cb);
      }
  };

  module.exports = BigPipe;

});
