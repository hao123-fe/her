__inline('runtimeAMD.js');

(function(global, window, document, undefined) {
    __inline('util/util.js');
    __inline('BigPipe.js');
    __inline('Controller.js');
    __inline('CSSLoader.js');
    __inline('EventEmitter.js');
    __inline('JSLoader.js');
    __inline('Pagelet.js');
    __inline('Requestor.js');
    __inline('Resource.js');

    var BigPipe = require("BigPipe");
    if (hasOwnProperty(global, "BigPipe")) {
        BigPipe.origBigPipe = global.BigPipe;
    }
    global.BigPipe = BigPipe;

})(this, window, document);