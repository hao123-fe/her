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
![Her 设计方案](https://gss2.bdstatic.com/5eR1dDebRNRTm2_p8IuM_a/res/her/her_runtime.jpg)
![Her 系统架构图](https://gss2.bdstatic.com/5eR1dDebRNRTm2_p8IuM_a/res/her/iframework.png)

**本仓库为 Her 的构建工具代码，前后端运行时代码见 [her-runtime](https://github.com/hao123-fe/her-runtime)**

## [Docs](https://github.com/hao123-fe/her/wiki) / [Get Start](https://github.com/hao123-fe/her/wiki/1.Get-start) 

Her已经兼容fis-plus，请查看 [FISP模块迁移文档](https://github.com/hao123-dev/her-preprocessor-fispadaptor)

## 核心能力 ##

Her 通过实现以下核心能力来解决前端性能优化：

* **强大的自动化构建能力**。Her 集成了 FIS `资源定位、内容嵌入、依赖声明` 3种编译构建能力，满足了前端构建需求。

* **核心运行时能力**
  * 通过 `Pagelet` Smarty 插件对页面分块。分块收集 HTML 片段及其依赖的 CSS、JS 资源，对页面模块进行细粒度编码，分解资源依赖和数据获取等
  * 后端输出控制器。后端输出控制提供了`FirstController|QuicklingController|NoScriptController` 3种输出控制器，分别处理基础页请求、局部 Quickling 请求和 NoScript 请求，其中 `FirstController` 为 `Pagelet` 提供了 `server|lazy|default|none` 4种输出模式，方便实现核心(首屏)模块优先输出、非核心模块延迟输出，模块开关等
  * 前端渲染控制器。实现了 `Pagelet` 按需加载、渲染，资源及其依赖加载、资源动态化打包(计划中)等

* **定制优化方案的能力**，通过对 `Pagelet` 输出和渲染方式的简单配置编码，可以方便实现以下优化方案和业务方案
  * 延迟加载 lazyPagelets。对于非核心模块 `Pagelets` 后端可以使用 `lazy` 渲染模式，基础页请求的时候只输出占位标签，基础页渲染完成之后通过 `Quickling` 方式延迟加载 lazyPagelets，从而实现延迟加载 lazyPagelets，减少基础页 DOM 节点数，极大的优化页面渲染性能。
  * 延迟渲染 bigRender。对于不可见模块可以先不渲染，当用户滚动页面的时候再渲染相应模块。可以进一步提升性能，减少不可见模块的图片和数据接口请求等。
  * 局部刷新 Quickling。对于数据交互频繁的模块，可以通过 `BigPipe.fetch()` 实现局部刷新，可以实现同构的异步渲染逻辑，极大了降低了异步刷新的开发成本。

## 适用场景 ##
Her 适用于采用 Smarty 作为后端模板的 PC 和 Mobile 页面。

## 案例
[![hao123新首页](https://gss2.bdstatic.com/5eR1dDebRNRTm2_p8IuM_a/res/img/richanglogo168_24.png)](http://www.hao123.com/newindex)
[![hao123游戏](https://gss2.bdstatic.com/5eR1dDebRNRTm2_p8IuM_a/res/her/game-logo.jpg)](https://game.hao123.com/)
[![hao到家](https://gss2.bdstatic.com/5eR1dDebRNRTm2_p8IuM_a/resource/life/img/o2o/logo.1c06601.png)](http://life.hao123.com/)
[![hao123新闻](https://gss2.bdstatic.com/5eR1dDebRNRTm2_p8IuM_a/resource/tuijian/img/logo.c877631.png)](http://tuijian.hao123.com/)

## 参考 ##
[BigPipe: Pipelining web pages for high performance](https://www.facebook.com/notes/facebook-engineering/bigpipe-pipelining-web-pages-for-high-performance/389414033919)

[FIS](http://fis.baidu.com/)
