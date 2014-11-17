var templateBuilder = require("../plugins/templateBuilder.js"),
    requireAnalyze = require("../plugins/requireAnalyze.js"),
    jsWrapper = require("../plugins/jsWrapper.js"),
    outputHermap = require("../plugins/outputHermap.js");

module.exports = {
    //静态文件目录
    statics: "/static",
    modules: {
        parser: {
            less: "less"
        },
        preprocessor: {
            //tpl: "extlang"
            tpl: [
                templateBuilder.replaceScriptTag,
                templateBuilder.explandPath
            ]
        },
        postprocessor: {
            tpl: [
                templateBuilder.analyseScript,
                templateBuilder.defineWidget
            ],
            //TOOD her 主要处理点
            js: [
                requireAnalyze,
                jsWrapper
            ]
            //css: explander.css
        },
        optimizer: {
            tpl: 'smarty-xss,html-compress'
            //tpl: 'html-compress'
        },
        packager: null,
        prepackager: outputHermap
    },
    //    modules: {
    //        parser: {
    //            less: 'less'
    //        },
    //        preprocessor: {
    //            tpl: 'extlang'
    //        },
    //        postprocessor: {
    //            tpl: 'require-async',
    //            js: 'jswrapper, require-async'
    //        },
    //        optimizer: {
    //            tpl: 'smarty-xss,html-compress'
    //        },
    //        prepackager: 'widget-inline,js-i18n'
    //    },
    roadmap: {
        ext: {
            less: 'css',
            tmpl: 'js',
            po: 'json'
        },
        path: [
            // i18n
            {
                reg: '/fis_translate.tpl',
                release: '/template/${namespace}/widget/fis_translate.tpl'
            }, {
                reg: /\/lang\/([^\/]+)\.po/i,
                release: '/config/lang/${namespace}.$1.po'
            },
            //i18n end
            {
                reg: /^\/widget\/(.*\.tpl)$/i,
                isMod: true,
                url: '${namespace}/widget/$1',
                release: '/template/${namespace}/widget/$1'
            }, {
                reg: /^\/widget\/(.*\.(js|css))$/i,
                isMod: true,
                release: '${statics}/${namespace}/widget/$1'
            }, {
                reg: /^\/page\/(.+\.tpl)$/i,
                isMod: true,
                release: '/template/${namespace}/page/$1',
                extras: {
                    isPage: true
                }
            }, {
                reg: /\.tmpl$/i,
                release: false
            }, {
                reg: /^\/(static)\/(.*)/i,
                release: '${statics}/${namespace}/$2'
            }, {
                reg: /^\/(config|test)\/(.*)/i,
                isMod: false,
                release: '/$1/${namespace}/$2'
            }, {
                reg: /^\/(plugin|smarty\.conf$)|\.php$/i
            }, {
                reg: 'server.conf',
                release: '/server-conf/${namespace}.conf'
            }, {
                reg: "domain.conf",
                release: '/config/$&'
            }, {
                reg: "build.sh",
                release: false
            }, {
                reg: '${namespace}-map.json',
                release: '/config/${namespace}-map.json'
            }, {
                reg: /^.+$/,
                release: '${statics}/${namespace}$&'
            }
        ]
    },
    settings: {
        parser: {
            bdtmpl: {
                LEFT_DELIMITER: '<#',
                RIGHT_DELIMITER: '#>'
            }
        }
//        ,postprocessor: {
//            jswrapper: {
//                type: 'amd'
//            }
//        }
    }
};
