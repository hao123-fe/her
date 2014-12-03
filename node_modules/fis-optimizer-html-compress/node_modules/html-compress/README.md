# html compress..

对html以及smarty模板进行压缩
======

## 安装

**npm install  html-compress**


## 使用方法

### 载入模块

```javascript
var xss = require('html-compress');
```

### 设置配置参数

```javascript

var option = {
    'level' : 'strip',   //压缩等级分为strip、strip_comment、strip_space,默认为strip
    'leftDelimiter' : '{%', //模板左界定符
    'rightDelimiter' : '%}' //模板右界定符
};
var HtmlCompress = require('html-compress');
var content = HtmlCompress.compress(htmlcontent,option); //传入html字符串进行压缩
```

## 测试

### 系统测试

在源码目录执行命令：**npm test**