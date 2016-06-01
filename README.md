Her - High-performence Enhanced Rendering Hao123前端高性能渲染解决方案
===
[![npm](https://img.shields.io/npm/v/her.svg?style=flat-square)](https://www.npmjs.com/package/her)
[![npm](https://img.shields.io/npm/dm/her.svg?style=flat-square)](https://www.npmjs.com/package/her)
[![npm](https://img.shields.io/npm/l/her.svg?style=flat-square)](https://www.npmjs.com/package/her)

Her (High-performence Enhanced Rendering) is a Pagelet and Bigpipe like implement, to provide High-performence Rendering in web pages, which inspried by Fackbook's [BigPipe: Pipelining web pages for high performance](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919).

Her is made up of 3 parts, the build tool, the backend output controller and the frontend render controller. The build tool is based on [FIS](http://fis.baidu.com/). The backend output controllers are  `FirstController`, `QuicklingController` and `NoScriptController`, in which `FirstController` provide 4 render modes (`server|lazy|default|none`). And the frontend render controller can load resources and render HTML snippet on demands.

The current implement is for PHP + Smarty. And this repo is the code of the build tool. The backend and frontend runtime code are here - [her-runtime](https://github.com/hao123-fe/her-runtime).

Hao123前端高性能渲染解决方案(Her)是一个为提升页面加载和渲染性能而设计的通用解决方案，实现了 Pagelet 和类 Bigpipe 输出渲染控制。

Her 由编译工具、后端输出控制和前端渲染控制组成，目前提供了基于 PHP 和 Smarty 的实现。其中编译工具基于 [FIS](http://fis.baidu.com/) 实现，继承了 FIS 强大的前端构建能力；后端输出控制提供了`FirstController|QuicklingController|NoScriptController` 3种输出控制器，分别处理基础页请求、局部 Quickling 请求和 NoScript 请求，其中 `FirstController` 提供 `server|lazy|default|none` 4种输出模式，方便实现首屏优化、模块开关等；前端渲染控制实现了资源加载、Pagelet 按需渲染和动态打包(planning)。通过对页面进行细粒度分块，收集区块的 HTML 片段、JS、CSS 等资源，后端输出控制和前端按需渲染，极大的增强了前端性能优化的能力。其设计方案和架构图如下：
![Her 设计方案](http://s0.hao123img.com/res/her/her_runtime.jpg?1)
![Her 系统架构图](http://s0.hao123img.com/res/her/iframework.png)

**本仓库为 Her 的构建工具代码，前后端运行时代码见 [her-runtime](https://github.com/hao123-fe/her-runtime)**


## 开发规范 Wiki 

[Her 开发规范 Wiki](https://github.com/hao123-fe/her/wiki/02-01.Smarty%E6%A8%A1%E6%9D%BF)

Her已经兼容fis-plus，请查看 [FISP模块迁移文档](https://github.com/hao123-dev/her-preprocessor-fispadaptor)


## 核心功能 ##
### 1. 页面分块 Pagelet ###
通过 Smarty pagelet 插件将页面分块，分块收集 HTML 片段及其依赖的 CSS、JS 资源，后端使用输出控制器控制输出，实现了类 Bigpipe 的分块输出，前端渲染控制器可以实现资源按需加载、Pagelet异步渲染，优化渲染速度和性能。

### 2. 延迟加载 lazyPagelets ###
对于非重要 Pagelets 后端可以使用 `lazy` 渲染模式，基础页请求的时候只输出占位标签，基础页渲染完成之后通过 Quickling 方式延迟加载 lazyPagelets。

### 3. 延迟渲染 bigRender ###
页面加载的时候只渲染首屏内容，用户滚动页面的时候再渲染可见区域。可以有效提高首屏速度。

### 4. 局部刷新 Quickling ###
对于数据交互频繁的模块，可以通过 BigPipe.fetch() 实现局部刷新，无需重复实现异步渲染逻辑，极大了降低了异步刷新的开发成本。


## 适用场景 ##
Her 适用于采用 Smarty 作为后端模板的 PC 和 Mobile 页面。

## Quick Start ##

### 1. 安装 Her ###
```
$ npm install -g her
```
添加bin目录到环境变量

### 2. 安装 her-pc-demo ###

cd 到工作目录运行如下命令

```
$ git clone https://github.com/hao123-fe/her-pc-demo.git
```
### 3.0 下载安装最新的 [her-runtime](https://github.com/hao123-fe/her-runtime/tree/master/dist) ###
下载安装最新的 [her-runtime](https://github.com/hao123-fe/her-runtime/tree/master/dist)，
用 plugin 目录替换 her-pc-demo common 目录下的 plugin，
用 javascript 目录下的 main.js 替换 her-pc-demo common/static/lib 目录下的 main.js

### 3. 发布 her-pc-demo ###
```
$ cd her-pc-demo/common
$ her release -c
$ cd ../home
$ her release -c
```

### 4. 启动 her-server ###
如果需要本地调试，则需要 java 和 php-cgi 环境，
安装方法见 http://fis.baidu.com/docs/api/cli.html#fis%20server%20%3Ccommand%3E%20%5Boptions%5D
```
$ her server init ##重要，会安装 server 需要的模块
$ her server start -p 8089 ##用 8089 端口防止与 fis server 默认的 8080 端口冲突
```
浏览器将打开 http://127.0.0.1:8089 ，即可看到 her-pc-demo

如果模板报错或者不能正确 rewrite，可以尝试 
```
$ her server open
```
打开 www 目录，删除 www 目录下面的所有内容，重新发布 her-pc-demo，然后再执行上面的命令


## 参考 ##
[BigPipe: Pipelining web pages for high performance](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919)

[FIS](http://fis.baidu.com/)
