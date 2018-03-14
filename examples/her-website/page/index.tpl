{extends file="./layout.tpl"}
{block name="block_head_static"}
    {* 模板中加载静态资源 *}
    {require name="home:static/lib/css/bootstrap.css"}
    {require name="home:static/lib/css/bootstrap-responsive.css"}
{/block}

{block name="global_vars"}
{$_p_id_ = intval($smarty.get._p_id_)}
{/block}

{block name="content"}
{require name="home:static/index/index.less"}

{* <a href="#" style="margin-left: 100px" 
    onclick="BigPipe.fetch(['container'],'/home/page/test');return false;"
>go test</a> *}

{* aaa *}
<div id="wrapper">
    {* inline 带有 pagelet 的 tpl *}
    <link rel="import" href="/container/section/inline.tpl?__inline">
    
    {pagelet id="container" her-renderMode="server"}
        <a id="forkme_banner" target="_blank" href="{$github}">View on GitHub</a>

        {pagelet her-renderMode="server" id="core"}
            {widget name="home:widget/slogan/slogan.tpl"}
            {widget
                name="home:widget/section/section.tpl"
                method="section"
                doc=$docs[0].doc index=$nav_index wiki=$docs[0].wiki
            }

            {script on="beforeload"}
                this.on('display', function() {
                     console.log(this.id, 'display1');
                });
               
            {/script}
            {script on="display"}
                console.log(this.id, 'display');
            {/script}
            {script}
                console.log(this.id, 'load');
            {/script}
        {/pagelet}
    
        <script runat="server">
        require.defer(['/lib/js_helper/append.js'], function(append) {
          append.init('p_feed_', {
            key: '_p_id_',
            wrapId: 'feed_wrap',
          });
        });
        </script>

        <div id="feed_wrap">
        {pagelet id="p_feed_{$_p_id_}"}

            {foreach array_slice($docs, 1) as $doc}
            {widget
                name="home:widget/section/section.tpl"
                method="section"
                doc=$doc.doc index=$nav_index wiki=$doc.wiki
            }
            {/foreach}

            {if $_p_id_ < 3}
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

            {script}
                console.log(this.id, 'load');
            {/script}
        {/pagelet}
        </div>
    {/pagelet}
</div>
    {* 启用emulator监控页面点击实现局部刷新 *}
    {* require.defer会在DomReady之后执行 *}
    {* {script}
        
        require.defer(["home:widget/js-helper/pageEmulator.js"],function(emulator){
            emulator.start();
        });
    {/script} *}
    <script runat="server">
        if(BigPipe.lazyPagelets && BigPipe.lazyPagelets.length > 0) {
            require.defer([], function() {
                BigPipe.fetch(BigPipe.lazyPagelets);
            });
        }
    </script>
    {* {script}
        var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "//hm.baidu.com/hm.js?ab6cd754962e109e24b0bcef3f05c34f";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();
    {/script} *}
{/block}