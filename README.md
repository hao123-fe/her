Her
===
[![npm](https://img.shields.io/npm/v/her.svg?style=flat-square)](https://www.npmjs.com/package/her)
[![npm](https://img.shields.io/npm/dm/her.svg?style=flat-square)](https://www.npmjs.com/package/her)
[![npm](https://img.shields.io/npm/l/her.svg?style=flat-square)](https://www.npmjs.com/package/her)

Hao123 前端集成解决方案

Her是基于FIS编译工具和smarty plugin开发的一套前端集成解决方案。实现了基于smarty运行时和前端Bigpipe框架的分块输出和按需渲染，极大的优化了前端性能。

Her的开发规范兼容fisp，分为编译工具her和后端smarty运行时以及前端JS运行时。通过对页面进行细粒度分块，收集区块的dom、js、css等资源，通过后端controller控制按需输出，前端Bigpipe框架按需渲染，实现最大限度的前端性能优化。

Her已经兼容fisp，[FISP模块迁移文档](https://github.com/hao123-dev/her-preprocessor-fispadaptor)

## 核心参考 ##
[BigPipe: Pipelining web pages for high performance](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919)

[FIS](http://fis.baidu.com/)

[Her运行时源码](https://github.com/hao123-fe/her-runtime)

## 核心功能 ##
### 1.页面分块pagelet ###
smarty pagelet插件将页面分块，分块手机html片段及其依赖的css、js，后端使用bigpipe controller控制按需输出，实现了类bigpipe的分块输出，前端BigPipe模块可以实现资源加载、pagelet异步渲染，优化渲染速度和性能。

### 2.延迟渲染bigRender ###
页面加载的时候只渲染首屏内容，用户滚动页面的时候再渲染可见区域。可以有效提高首屏速度。

### 3.局部刷新Quickling ###
对于数据交互频繁的模块，可以通过BigPipe.fetch()实现局部刷新。对于开发者几乎是0成本。
### WIKI ###
https://github.com/hao123-fe/her/wiki/02-01.Smarty%E6%A8%A1%E6%9D%BF

## 适用场景 ##
her适用于采用Smarty作为后端模板的PC和Mobile站点。

## 安装使用 ##

### 1.安装Her ###
```
$ npm install -g her
```
添加bin目录到环境变量

### 2.安装her-pc-demo ###

cd 到工作目录运行如下命令

```
$ git clone https://github.com/hao123-fe/her-pc-demo.git
```
### 3.0 下载安装最新的[her-runtime](https://github.com/hao123-fe/her-runtime/tree/master/dist) ###
下载安装最新的[her-runtime](https://github.com/hao123-fe/her-runtime/tree/master/dist)，
用plugin目录替换her-pc-demo common目录下的plugin，
用javascript目录下的main.js替换her-pc-demo common/static/lib目录下的main.js

### 3. 发布her-pc-demo ###
```
$ cd her-pc-demo/common
$ her release -c
$ cd ../home
$ her release -c
```

### 4.启动her-server ###
如果需要本地调试，则需要java和php-cgi环境，
安装方法见 http://fis.baidu.com/docs/api/cli.html#fis%20server%20%3Ccommand%3E%20%5Boptions%5D
```
$ her server init ##重要，会安装server需要的模块
$ her server start -p 8089 ##用8089端口防止与fis server默认的8080端口冲突
```
浏览器将打开127.0.0.1:8089端口，即可看到her-pc-demo

如果模板报错或者不能正确rewrite，可以尝试 
```
$ her server open
```
打开www目录，删除www目录下面的所有内容，重新发布her-pc-demo，然后再执行上面的命令
