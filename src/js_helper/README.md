# js_helper
基于 her 基本方法封装的一些插件

## append.js

结合 `BigPipe.fetch()` 实现无限追加，实现无限滚动加载等功能

其原理是利用 pagelet id 的动态特性，在前端对 pagelet id 做自增计数，同时预先插入与 id 对应的空的 pagelet 占位容器作为 quickling 渲染的容器，并将 id 通过 query 参数传到 smarty，将 smarty 端的 pagelet id 与前端对应上，即可实现 append 的效果。

支持方法：

```javascript
// 初始化配置
// pageletPrefix 为需要 append 的 pagelet id 前缀
// conf 为对应的配置
append.init(<string> pageletPrefix, <object {
  <string> key,       // pagelet 自增 id 参数名, 可同时作为分页参数
  <string> wrapId     // 父容器节点 id
}> conf)

// 调用 append
// pageletPrefix 同上
// 其中 url, cb 同 BigPipe.fetch(pagelets, url, cb)
append(<string> pageletPrefix, <string> url, <function> cb)

```

使用实例：

```smarty
{* 声明全局 $_p_id_ 变量, 即 pagelet 的自增 id, 通过 intval() 转换防止 xss *}
{* 注意: 一定要放在全局, 即 {html} 标签之外或 {html} 内 {head} 和 {body} 外, 否则 quickling 会跳过  *}
{block name="global_vars"}
{$_p_id_ = intval($smarty.get._p_id_)}
{/block}


{* 在 content 之前完成初始化配置 *}
<script runat="server">
require.defer(['/lib/js_helper/append.js'], function(append) {
  append.init('p_feed_', {
    key: '_p_id_',
    wrapId: 'feed_wrap'
  });
});
</script>

{* 将 pagelet 防止父容器 #feed_wrap 中 *}
<div id="feed_wrap">

{* 将 pagelet 的 id 设置为 "前缀_{自增id}" *}
{pagelet id="p_feed_{$_p_id_}"}

    这是 pagelet 的内容, 可以使用 $_p_id_ 进行相应的分页取数据操作……
    
    {* 下面是结合 lazy 实现的自动加载, 结束条件是 $_p_id_ >= 3 *}
    {* 当然也可以不使用自动加载, 根据需求手动调用 append() *}
    {if $_p_id_ < 3}

    {* 在 pagelet 底部创建空 div 用于 lazy 的触发 hook, 然后在 js 中绑定 lazy 和 append() 回调 *}
    <div data-hook="feed-bottom"></div>
    <script runat="server">
        var pagelet = this;
        require.defer(['/widget/js/jquery-1.10.1.js', '/lib/js_helper/lazy.js', '/lib/js_helper/append.js'], function($, lazy, append) {
            var $pagelet = $('#' + pagelet.id);
            var $feedBottom = $('[data-hook=feed-bottom]', $pagelet);
            lazy.add($feedBottom[0], function() {
                append('p_feed_', '/');
            });
        });
    </script>
    {/if}
{/pagelet}
</div>
```

