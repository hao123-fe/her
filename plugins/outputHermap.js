/**
 * outputHermap 输出her所需的资源关系map文件, 打包的非打包情况生成表的格式都一样
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
    ns = fis.config.get('namespace'), //namespace
    pkgMap, packed, root, hit, pack;

    conf = fis.config.get('autopack') ? fis.config.get('pack') : conf;
    fis.config.get('autopack') && console.log(conf);
  //如果打包
  if (opt.pack) {
    pkgMap = {};
    packed = {};
    root = fis.project.getProjectPath();

    //construct package table
    fis.util.map(conf, function (path, patterns, index) {
      var pid, subpath, pkg;
      if (typeof patterns === 'string' || patterns instanceof RegExp) {
        patterns = [patterns];
      }
      if (fis.util.is(patterns, 'Array') && patterns.length) {
        pid = 'p' + index;
        subpath = path.replace(/^\//, '');
        pkg = fis.file(root, subpath);
        if (typeof ret.src[pkg.subpath] !== 'undefined') {
          fis.log.warning('there is a namesake file of package [' + path + ']');
        }
        pkgMap[pid] = {
          id: pid,
          file: pkg,
          regs: patterns,
          pkgs: new Array(patterns.length)
        };
      } else {
        fis.log.warning('invalid pack config [' + path + ']');
      }
    });

    //determine if subpath hit a pack config
    hit = function (subpath, regs) {
      for (var i = 0, len = regs.length; i < len; i++) {
        var reg = regs[i];
        if (reg && fis.util.filter(subpath, reg)) {
          return i;
        }
      }
      return false;
    };

    //pack file
    pack = function (subpath, file) {
      if (packed[subpath] || !(file.isJsLike || file.isCssLike))
        return;
      fis.util.map(pkgMap, function (pid, pkg) {
        var index = hit(file.subpath, pkg.regs),
          stack;
        if (index !== false) {
          packed[subpath] = true;
          file.requires.forEach(function (id) {
            var dep = ret.ids[id];
            if (dep && dep.rExt === file.rExt) {
              pack(dep.subpath, dep);
            }
          });
          stack = pkg.pkgs[index] || [];
          stack.push(file);
          pkg.pkgs[index] = stack;
          //stop to pack
          return true;
        }
      });
    };

    //walk
    fis.util.map(ret.src, function (subpath, file) {
      pack(subpath, file);
    });

    //pack
    fis.util.map(pkgMap, function (pid, pkg) {
      //collect contents
      var content = '', defines = [], index = 0,
        requires = [], requireMap = {}, deps,
        requireAsyncs = [], requireAsyncMap = {}, asyncs;
      pkg.pkgs.forEach(function (pkg) {
        pkg.forEach(function (file) {
          var id = file.getId();
          if (ret.map.res[id]) {
            var c = file.getContent();
            if (c != '') {
              if (index++ > 0) {
                content += '\n';
                if (file.isJsLike) {
                  content += ';';
                } else if (file.isCssLike) {
                  c = c.replace(/@charset\s+(?:'[^']*'|"[^"]*"|\S*);?/gi, '');
                }
              }
              content += c;
            }
            requires = requires.concat(file.requires);
            requireMap[id] = true;

            if (file.extras && file.extras.async) {
              requireAsyncs = requireAsyncs.concat(file.extras.async);
              requireAsyncMap[id] = true;
            }

            defines.push(id);
          }
        });
      });
      if (defines.length) {
        pkg.file.setContent(content);
        ret.pkg[pkg.file.subpath] = pkg.file;

        //collect dependencies
        deps = [];
        requires.forEach(function (id) {
          if (!requireMap[id]) {
            deps.push(id);
            requireMap[id] = true;
          }
        });
        asyncs = [];
        requireAsyncs.forEach(function (id) {
          if (!requireAsyncMap[id]) {
            asyncs.push(id);
            requireAsyncMap[id] = true;
          }
        });

        // 为了防止内容相同的不同defines生成相同的ID, md5加入了defines
        herId = [fis.util.md5(content), fis.util.md5(defines.join(','), 4)].join('_');
        //处理css
        if (pkg.file.isCssLike) {
          // TODO: 如何使pkg file的md5与生成pkgID时保持一致
          // 同file, css hook在content之后
          content += "\n" + ".css_" + herId + "{height:88px}";
          pkg.file.setContent(content);
        }

        herRes = herMap[herId] = {
          src: pkg.file.getUrl(opt.hash, opt.domain),
          type: pkg.file.rExt.replace(/^\./, '')
        };

        herRes.defines = defines;
        herRes.requires = deps;
        herRes.requireAsyncs = asyncs;
      }
    });
  }

  //遍历文件目录，生成map
  fis.util.map(ret.src, function (subpath, file) {
    if (opt.pack && packed[subpath]) { //如果打包的，不处理
      return;
    }
    if (file.release && file.useMap) {
      //生成herMap
      if (file.isJsLike || file.isCssLike) {
        content = file.getContent();

        // 为了防止内容相同的不同defines生成相同的ID, md5加入了defines
        // herId = fis.util.md5(content);
        herId = [fis.util.md5(content), fis.util.md5(file.id, 4)].join('_');
        // 处理css
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
        if (file.extras && file.extras.async) {
          herRes.requireAsyncs = file.extras.async;
        }
      }
    }
  });

  ret.map.her = herMap;
  ////create hermap.json
  //herjson = fis.file(root, (ns ? ns + '-' : '') + 'hermap.json');
  //if (herjson.release) {
  //    herjson.setContent(JSON.stringify(herMap, null, opt.optimize ? null : 4));
  //
  //    ret.pkg[herjson.subpath] = herjson;
  //}
};
