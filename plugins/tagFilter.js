//var pregQuote = require("./pregQuote");

/**
 * getPosition 得到代码指定索引所在的行列
 *
 * @param source {String} 查找的字符串
 * @param index {Number} 查找的索引
 * @access public
 * @return {Object}
 */
function getPosition(source, index) {
    var line, ichar,
        start = 0,
        next = 0;

    if (index < source.length) {
        line = 1;
        do {
            next = source.indexOf("\n", start);
            if (next < 0 || next >= index) {
                ichar = index - start + 1;
                break;
            } else {
                line++;
                start = next + 1;
            }
        } while (true);
    }

    return {
        "line": line,
        "char": ichar
    };
}

//var TagParser = Object.derive(function(content, name, ld, rd, isBlock) {
//    this.content = content;
//    this.name = name;
//    this.ld = ld;
//    this.rd = rd;
//    this.isBlock = !!isBlock;
//    //
//    this.index = 0;
//    this._parse = null;
//    this._retTag = null;
//    this._tagName = null;
//    this._attr = null;
//    this._body = null;
//}, {
//    _chkIndex: function() {
//        if (this.index >= this.content.length) {
//            this.index = this.content.length;
//            this._parse = this._parseEnd;
//        }
//    },
//    _parseText: function() {
//        var openTag = this.ld + this.name;
//        var index = this.content.indexOf(openTag, this.index);
//        if (index < 0) {
//            //end
//            this._parse = this._parseEnd;
//        } else {
//            this.index = index + openTag.length;
//            this._parse = this._parseOpenTagStart;
//            this._chkIndex();
//        }
//    },
//    _parseOpenTagStart: function() {
//        var index = this.content.indexOf(this.rd, this.index);
//        if (index === this.index) {
//            //eg: {script}
//            //           ^
//            this.index = index + this.rd.length;
//            this._parse = this._parseBody;
//        } else {
//            var char = this.content[this.index];
//            if (/\s/.test(char)) {
//                //eg: {script a="xx"}
//                //           ^
//            }
//            //failback
//            this._parse = this._parseText;
//        }
//    },
//    _parseAttr: function() {
//        if (/\s/.test(this.content[this.index])) {
//
//        }
//    },
//    _parseEnd: function() {
//        this._parse = null;
//    },
//    next: function() {
//        this._parse = this._parseText;
//
//        var content = this.content,
//            contentLen = content.length,
//            name = this.name,
//            ld = this.ld,
//            rd = this.rd,
//            index = this.index,
//            openTag = ld + name,
//            openTagLen = openTag.length,
//            closeTag = ld + "/" + name + rd,
//            closeTagLen = closeTag.length,
//            ldLen = ld.length,
//            rdLen = rd.length,
//
//            state = "TEXT",
//            outterStart = 0,
//            attrStart = 0,
//            attrEnd = 0,
//            innerStart = 0,
//            innerEnd = 0,
//            outterEnd = 0;
//
//        var found = false;
//
//        while (!found) {
//            if ((index = content.indexOf(openTag, index)) > -1) {
//                //没有更多的标签了
//                this.index = contentLen;
//                return null;
//            }
//
//            outterStart = index;
//            attrStart = outterStart + openTagLen;
//            //检查参数是否存在
//            if (content.substring(attrStart, attrStart + rdLen) === rd) {
//                //没有参数的情况
//                //eg: <script>
//                attrEnd = attrStart;
//            } else if (/\s/.test(content[attrStart])) {
//                //有参数的情况
//                //eg: <script src="xxx">
//                开始解析参数
//                index = attrStart;
//                attrEnd = attrStart;
//                do {
//                    //解决标签嵌套情况, eg: {script xxx={$xxx}}
//                    attrEnd = content.indexOf(rd, attrEnd);
//                    index = content.indexOf(ld, index);
//                    if (attrEnd < 0) {
//                        //标签未闭合
//                        //eg： {script src="xxx" $EOF$
//                        position = getPosition(content, outterStart);
//                        throw new Error("Unclosed tag \"" + content.substring(outterStart, outterStart + 20) + "...\" on line:" + position.line + " char:" + position.char);
//                    } else if (index > -1 && index < attrEnd) {
//                        // 是嵌套标签
//                        // {script xxx={$xxx}}
//                        //             ^    ^
//                        //          index attrEnd
//                        index++;
//                        attrEnd++;
//                        continue;
//                    } else {
//                        // 正常找到匹配的标签
//                        // {script xxx={$xxx}}  ...  var a = {} ...
//                        //                   ^               ^
//                        //                 attrEnd         index
//                        break;
//                    }
//                } while (false);
//            } else {
//                //标签不匹配
//                //eg: <scriptXX>
//                index = outterStart + openTagLen;
//                continue;
//            }
//
//            output.push(content.substring(lastIndex, outterStart));
//
//            if (isBlock) {
//                innerStart = attrEnd + rdLen;
//                innerEnd = content.indexOf(closeTag, innerStart);
//                if (innerEnd < 0) {
//                    // 找不到结束标签
//                    //eg {script src="xxx"}  $EOF$
//                    position = getPosition(content, outterStart);
//                    throw new Error("Unclosed block \"" + content.substring(outterStart, outterStart + 20) + "...\" opend on line:" + position.line + " char:" + position.char);
//                }
//                outterEnd = innerEnd + closeTagLen;
//
//                output.push(callback(
//                    content.substring(outterStart, outterEnd),
//                    content.substring(attrStart, attrEnd),
//                    content.substring(innerStart, innerEnd),
//                    content
//                ));
//            } else {
//                outterEnd = attrEnd + rdLen;
//                output.push(callback(
//                    content.substring(outterStart, outterEnd),
//                    content.substring(attrStart, attrEnd),
//                    content
//                ));
//            }
//            index = outterEnd;
//            lastIndex = outterEnd;
//
//        }
//    }
//});
//
//var Tag = Object.derive(function(name, ld, rd, attrs, inner) {
//    this.name = name;
//    this.ld = ld;
//    this.rd = rd;
//    this.attrs = attrs;
//    this.inner = inner;
//    this.isBlock = arguments.length >= 5 ? true : false;
//}, {
//    toString: function() {
//        var output = [],
//            attrs = this.attrs,
//            count,
//            index;
//
//        output.push(this.ld, this.name);
//        for (count = attrs.length, index = 0; index < count; index++) {
//            output.push(" ", attrs[index].key, "=", attrs[index].value);
//        }
//        output.push(this.rd);
//
//        if (this.isBlock) {
//            output.push(this.inner);
//            output.push(this.ld, "/", this.name, this.rd);
//        }
//
//        return output.join("");
//    }
//});

/**
 * filter 处理文件中的tag
 *
 * @param content {String} 文件内容
 * @param ld {String} 左界定符
 * @param rd {String} 右界定符
 * @param name {String} 块名称
 * @param callback {Function} 回调处理函数,参数如下：
 * @param isBlock {Boolean} 是否为块标签
 * @access public
 * @return {String} 处理过后的文件内容
 */
function filter(content, name, ld, rd, callback, isBlock) {

    if (!callback) {
        return content;
    }

    isBlock = !!isBlock;

    var openTag = ld + name,
        openTagLen = openTag.length,
        closeTag = ld + "/" + name + rd,
        closeTagLen = closeTag.length,
        ldLen = ld.length,
        rdLen = rd.length,

        outterStart = 0,
        attrStart = 0,
        attrEnd = 0,
        innerStart = 0,
        innerEnd = 0,
        outterEnd = 0,

        index = 0,
        lastIndex = 0,
        output = [],
        position = null;

    //查找开始标记
    while ((index = content.indexOf(openTag, index)) > -1) {
        outterStart = index;
        attrStart = outterStart + openTagLen;
        //检查参数是否存在
        if (content.substring(attrStart, attrStart + rdLen) === rd) {
            //没有参数的情况
            //eg: <script>
            attrEnd = attrStart;
        } else if (/\s/.test(content[attrStart])) {
            //有参数的情况
            //eg: <script src="xxx">
            index = attrStart;
            attrEnd = attrStart;
            do {
                //解决标签嵌套情况, eg: {script xxx={$xxx}}
                attrEnd = content.indexOf(rd, attrEnd);
                index = content.indexOf(ld, index);
                if (attrEnd < 0) {
                    //标签未闭合
                    //eg： {script src="xxx" $EOF$
                    position = getPosition(content, outterStart);
                    throw new Error("Unclosed tag \"" + content.substring(outterStart, outterStart + 20) + "...\" on line:" + position.line + " char:" + position.char);
                } else if (index > -1 && index < attrEnd) {
                    // 是嵌套标签
                    // {script xxx={$xxx}}
                    //             ^    ^
                    //          index attrEnd
                    index++;
                    attrEnd++;
                    continue;
                } else {
                    // 正常找到匹配的标签
                    // {script xxx={$xxx}}  ...  var a = {} ...
                    //                   ^               ^
                    //                 attrEnd         index
                    break;
                }
            } while (false);
        } else {
            //标签不匹配
            //eg: <scriptXX>
            index = outterStart + openTagLen;
            continue;
        }

        output.push(content.substring(lastIndex, outterStart));

        if (isBlock) {
            innerStart = attrEnd + rdLen;
            innerEnd = content.indexOf(closeTag, innerStart);
            //FIXME 这里有标签嵌套的问题！
            if (innerEnd < 0) {
                // 找不到结束标签
                //eg {script src="xxx"}  $EOF$
                position = getPosition(content, outterStart);
                throw new Error("Unclosed block \"" + content.substring(outterStart, outterStart + 20) + "...\" opend on line:" + position.line + " char:" + position.char);
            }
            outterEnd = innerEnd + closeTagLen;

            output.push(callback(
                content.substring(outterStart, outterEnd),
                content.substring(attrStart, attrEnd),
                content.substring(innerStart, innerEnd),
                content
            ));
        } else {
            outterEnd = attrEnd + rdLen;
            output.push(callback(
                content.substring(outterStart, outterEnd),
                content.substring(attrStart, attrEnd),
                content
            ));
        }
        index = outterEnd;
        lastIndex = outterEnd;
    }

    output.push(content.substring(lastIndex));

    return output.join("");

    //    var lde = pregQuote(ld),
    //        rde = pregQuote(rd),
    //        ne = pregQuote(name),
    //        reg = new RegExp("(" + lde + ne + "(?:\\s+[\\s\\S]*?[\"\'\\s\\w\\/]" + rde + "|\\s*" + rde + "))([\\s\\S]*?)(" + lde + "\\/" + ne + rde + "|$)", "ig");
    //
    //    return content.replace(reg, function(outter, open, inner, close) {
    //        if (!close) {
    //            //TODO unclose
    //        }
    //        console.log(outter);
    //        //return callback(outter, );
    //    });
}

module.exports = {
    filterTag: function(content, name, ld, rd, callback) {
        return filter(content, name, ld, rd, callback, false);
    },
    filterBlock: function(content, name, ld, rd, callback) {
        return filter(content, name, ld, rd, callback, true);
    }
};
