fis.config.get('modules.preprocessor.tpl').unshift('fispadaptor')

fis.config.merge({
    namespace: 'fisp-test',
    deploy: {
        test: {
            //from参数省略，表示从发布后的根目录开始上传
            //发布到当前项目的上一级的output目录中
            to: '../output'
        }
    },
    // pack : {
    //     'static/pkg/aio.css' : [
    //         'static/lib/css/bootstrap.css',
    //         'static/lib/css/bootstrap-responsive.css',
    //         'widget/**.css'
    //     ],
    //     'static/pkg/aio.js' : [
    //         'static/lib/js/jquery-1.10.1.js',
    //         'widget/**.js'
    //     ]
    // },
    roadmap: {
        path: [{
            reg: /^\/widget\/(.*\.tpl)$/i,
            isMod: true,
            url: '${namespace}/widget/$1',
            release: '/template/${namespace}/widget/$1'
        }]
    },
    settings: {
        smarty: {
            left_delimiter: "{",
            right_delimiter: "}"
        }
    }

});
