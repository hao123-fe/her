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
    var herMap = {}, //资源表map
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

                herId = fis.util.md5(file.getContent(), 10);
                herRes = herMap[herId] = {
                    src: file.getUrl(opt.hash, opt.domain),
                    type: file.rExt.replace(/^\./, '')
                };

                herRes.mods = [file.id];
                if (file.requires && file.requires.length) {
                    herRes.deps = file.requires;
                }
                for (var key in file.extras) {
                    if (file.extras.hasOwnProperty(key)) {
                        herRes.async = file.extras.async;
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