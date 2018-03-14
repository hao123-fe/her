fis.config.merge({
	namespace : 'home',
    pack : {
        'static/pkg/aio.css?__inline' : [
            'static/lib/css/bootstrap.css',
            'static/lib/css/bootstrap-responsive.css',
            'widget/**.css'
        ],
        'static/pkg/aio.js' : [
            'static/lib/js/jquery-1.10.1.js',
            'widget/**.js'
        ]
    },
    settings: {
        smarty: {
            left_delimiter: '{',
            right_delimiter: '}'
        }
    }
});

fis.config.get('roadmap.path').unshift(
    {
        reg: /^\/lib\/server\/(.*)$/i,
        release: '/plugin/$1'
    },
    {
        reg: /^\/lib\/main\.js$/i,
        release: '/static/${namespace}/lib/$1'
    },
    {
        reg: /^\/lib\/js_helper\/(.*)$/i,
        isMod: true,
        release: '/static/${namespace}/js_helper/$1'
    }
);