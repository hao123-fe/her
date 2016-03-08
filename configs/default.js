var templateBuilder = require("../plugins/templateBuilder.js");
var requireAnalyze = require("../plugins/requireAnalyze.js");
var jsWrapper = require("../plugins/jsWrapper.js");
var autoPackAnalyze = require("../plugins/autoPackAnalyze.js");
var outputHermap = require("../plugins/outputHermap.js");

//copy fis-plus default configs
module.exports = {
    //静态文件目录
    statics: "/static",
    templates: '/template',
    namespace: '',
    //fis server config
    server: {
        rewrite: true,
        libs: 'pc',
        clean: {
            exclude: "fisdata**,smarty**,rewrite**,index.php**,WEB-INF**"
        }
    },
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
                templateBuilder.analyseSmartyRequire,
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
        prepackager: [
            autoPackAnalyze,
            outputHermap
        ],
        packager: null
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
                reg: '${namespace}-hermap.json',
                release: '/config/${namespace}-hermap.json'
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
        },
        smarty: {
            left_delimiter: "{%",
            right_delimiter: "%}"
        }
        //        ,postprocessor: {
        //            jswrapper: {
        //                type: 'amd'
        //            }
        //        }
    }
};
