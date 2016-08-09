fis.config.merge({
    namespace: 'test',
    deploy: {
        test: {
            //from参数省略，表示从发布后的根目录开始上传
            //发布到当前项目的上一级的output目录中
            to: '../output'
        }
    },
    pack : {
        'static/pkg/test.css?__inline' : [
            'static/test.css'
        ],
        'static/pkg/test_copy.css' : [
            'static/test_copy.css'
        ]
    },
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
