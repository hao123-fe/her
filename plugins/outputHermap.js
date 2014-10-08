/**
* outputHermap 输出her所需的资源关系map文件
* {
* "24831cf566": {
*        "src": "/widget/test/test.js",
*        "type": "js",
*        "mods": [
*            "hertest:widget/test/test.js"
*        ],
*        "deps": [
*            "hertest:widget/test/test.css",
*            "hertest:widget/test/testb.js",
*            "hertest:page/index.js"
*        ],
*        "async": [
*            "hertest:widget/test/testb.js"
*        ]
*    },
*  "c0d582350f": ...
*  }
*/
var exports = module.exports = function (ret, conf, settings, opt) {
    var content, //文件内容 
        herMap = {}, //资源表map
        herId, // 资源id,
        herRes, //资源描述
        herjson, //生成的mapjson文件
        root = fis.project.getProjectPath(), //project root
        ns = fis.config.get('namespace'); //namespace

    //遍历文件目录，生成map
    fis.util.map(ret.src, function (subpath, file) {
        if (file.release && file.useMap) {
            //生成herMap
            if (file.isJsLike || file.isCssLike) {
                content = file.getContent();
                herId = fis.util.md5(content);
                //处理css
                if (file.isCssLike) {
                    content += "\n" + ".css_" + herId + "{height:88px}";
                    file.setContent(content);
                }
                herRes = herMap[herId] = {
                    src: file.getUrl(opt.hash, opt.domain),
                    type: file.rExt.replace(/^\./, '')
                };

                herRes.defines = [file.id];
                if (file.requires && file.requires.length) {
                    herRes.requires = file.requires;
                }
                for (var key in file.extras) {
                    if (file.extras.hasOwnProperty(key)) {
                        herRes.requireAsyncs = file.extras.async;
                    }
                }
            }
        }
    });

    //create hermap.json
    herjson = fis.file(root, (ns ? ns + '-' : '') + 'hermap.json');
    if (herjson.release) {
        herjson.setContent(JSON.stringify(herMap, null, opt.optimize ? null : 4));
        fis.deploy(opt, [herjson]);
    }
};