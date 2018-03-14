/**
 * @file 自动打包方案分析脚本
 * @author caoyu (261179233@qq.com)
 */
var exports = module.exports = function (ret, conf, settings, opt) {

    if (fis.config.get('autopack')) {

        var res = ret.map.res;

        // 获取tpl依赖的js
        function getDepsOfPage(id, arr, type) {

            if (res[id].deps && res[id].deps.length) {
                // 遍历依赖的tpl/js/css
                for (var i = 0; i < res[id].deps.length; i++) {
                    var itemId = res[id].deps[i];
                    if (res[itemId]) {
                        if (res[itemId].type === 'tpl') {
                            // 获取widget的依赖
                            arr = getDepsOfPage(itemId, arr, type);
                        } else if (res[itemId].type === type) {
                            // 子集资源 index
                            var itemIndex = arr.indexOf(itemId);
                            // 父级资源 index
                            var parentIndex = arr.indexOf(id) === -1 ? arr.length : arr.indexOf(id); 

                            if (itemIndex === -1) {
                                arr.splice(parentIndex, 0, itemId);
                            }
                            // 获取资源的依赖
                            arr = getDepsOfPage(itemId, arr, type);
                        }
                    }
                }
            }
            
            return arr;
        }

        function analyze(type) {
            // 第一步：以page为维度，创建page依赖的资源链，递归进行，去重，排序，不支持循环引用
            var pageOfJsMap = {};
            fis.util.map(res, function (key, value) {
                if (value.extras && value.extras.isPage) {
                    pageOfJsMap[key] = getDepsOfPage(key, [], type);
                }
            });

            // 第二步：以第一步产出的js为维度，合并tpl，进行js去重
            var jsOfPageArrMap = {};
            fis.util.map(pageOfJsMap, function (parentKey, parentValue) {
                fis.util.map(parentValue, function (subKey, subValue) {
                    jsOfPageArrMap[subValue] = jsOfPageArrMap[subValue] || [];
                    if (jsOfPageArrMap[subValue].indexOf(parentKey) === -1) {
                        jsOfPageArrMap[subValue].push(parentKey);
                    }
                });
            });

            // 给page数组排序,将相同的tpl数组顺序统一
            fis.util.map(jsOfPageArrMap, function (key, value) {
                value.sort();
            });

            // 第三步：以第二步产出的tpl array为维度，合并js，进行tpl&array去重
            var pageArrOfJsArrMap = {};
            fis.util.map(jsOfPageArrMap, function (key, value) {
                var info = '/resource/pkg/aio-' + fis.util.md5(value.join(',')) + '.' + type;
                pageArrOfJsArrMap[info] = pageArrOfJsArrMap[info] || [];
                if (pageArrOfJsArrMap[info].indexOf(key) === -1) {
                    pageArrOfJsArrMap[info].push((key.split(':'))[1]);
                }
            });

            fis.config.merge({
                pack: pageArrOfJsArrMap
            });
        }

        analyze('css');
        analyze('js');
    }
};

