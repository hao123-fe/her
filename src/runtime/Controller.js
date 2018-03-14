/**
 * @file Controller 处理pageletArrive
 * @author zhangwentao(zhangwentao@baidu.com)
 */

__d("Controller", ["Pagelet", "Resource"], function (global, require, module, exports) {

  var Pagelet = require("Pagelet");
  var Resource = require("Resource");

  var Controller = {
    pageletsArrive : function(pagelets){
      each(pagelets, function(pagelet){
        this.pageletArrive(pagelet);
      }, this);
    },
    pageletArrive : function(conf){
      var pagelet;

      if(Pagelet.hasPlagelet(conf.id)){
        Pagelet.getPlagelet(conf.id).unload();
      }

      pagelet =  Pagelet.getPlagelet(conf.id);

      if(conf.quickling){
        Resource.setResourceMap(conf.resourceMap);
      }else if(conf.html){
        conf.html = document.getElementById(conf.html.container).firstChild.data;
      }

      var hooks = conf.hooks;
      if(hooks){
        for(var i in hooks){
          var type = hooks[i];
          for(var j = 0; j < type.length; j++){
            conf.quickling ?
              pagelet.on(i, new Function(type[j])) :
              pagelet.on(i, this.hooks[type[j]]);
          }
        }
      }

      pagelet.arrive(conf);
    },
    hooks:{},
    setResourceMap : Resource.setResourceMap
  };

  module.exports = Controller;
});
/* @cmd false */
