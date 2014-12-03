/*
 * fis
 * http://fis.baidu.com/
 */

'use strict';


var less = require('less');
var root = fis.project.getProjectPath();

module.exports = function(content, file, conf){
    conf.paths = [ file.dirname, root ];
    conf.syncImport = true;
    conf.relativeUrls = true;
    var parser = new(less.Parser)(conf);
    parser.parse(content, function (err, tree) {
        if(err){
            throw err;
        } else {
            if(parser.imports){
                fis.util.map(parser.imports.files, function(path){
                    file.cache.addDeps(path);
                });
            }
            content = tree.toCSS(conf);
        }
    });
	return content;
};