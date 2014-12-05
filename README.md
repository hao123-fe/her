Her
===

Hao123 前端集成方案

包括开发工具her和smarty运行环境[her-smarty-plugin](https://github.com/hao123-dev/her-smarty-plugin)

基于[FIS](http://fis.baidu.com/)

##核心功能##
###1.页面分块BigPipe+pagelet###
pagelet将页面的dom，以及dom依赖的css、js分块收集，使用bigPipe控制按需输出，同时前端BigPipe可以实现异步渲染。

###2.延迟渲染bigRender###
页面加载的时候只渲染首屏内容，用户滚动页面的时候再渲染可见区域。可以有效提高首屏速度。

###3.局部刷新Quickling###
对于数据交互频繁的模块，可以通过BigPipe.fetch()实现局部刷新。对于开发者几乎是0成本。
### WIKI ###
https://github.com/hao123-dev/her/wiki/03-01.Smarty%E6%A8%A1%E6%9D%BF

##适用场景##
her适用于采用Smarty作为后端模板的PC和Mobile站点。

##安装使用##

###1.安装Her###
```
$ npm install -g her
```
添加bin目录到环境变量

###2.安装her-pc-demo###
~~安装her-pc-demo之前，先安装fis的包管理工具lights http://lightjs.duapp.com/~~
~~注意：lights install下载文件到当前目录，可以cd到工作目录运行lights install~~

```
$ ### npm install -g lights #要求node版本在v0.10.27以上
$ ### lights install her-pc-demo
```
因为her-pc-demo涉及到后端运行时部分，目前正在努力开源中。

目前仅提供百度内部访问，地址 http://fe.qch.me/store/her-pc-demo.zip

下载后解压即可~

###3.发布her-pc-demo###
```
$ cd her-pc-demo/common
$ her release -c
$ cd ../home
$ her release -c
```

###4.启动her-server###
需要java和php-cgi环境，安装方法见 http://fis.baidu.com/docs/api/cli.html#fis%20server%20%3Ccommand%3E%20%5Boptions%5D
```
$ her server init ##重要，会安装server需要的模块
$ her server start -p 8089 ##用8089端口防止与fis server默认的8080端口冲突
```
浏览器将打开127.0.0.1:8089端口，即可看到her-pc-demo

如果模板报错或者不能正确rewrite，可以尝试 
```
$ her server open
```
打开www目录，删除www目录下面的所有内容，然后再执行上面的命令
