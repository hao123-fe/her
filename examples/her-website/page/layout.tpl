{block name="global_vars"}{/block}

{* 使用html插件替换普通html标签，同时注册JS组件化库 *}
{html her="home:lib/main.js" her-config=['inlineCSS' => true]}
  {* 使用head插件替换head标签，主要为控制加载同步静态资源使用 *}
	{head}
	    <meta charset="utf-8"/>
    	<meta content="{$description}" name="description">
      <link rel="shortcut icon" href="http://www.hao123.com/favicon.ico">
      <link rel="icon" href="http://www.hao123.com/favicon.ico">
    	<title>{$title}</title>
    	{block name="block_head_static"}{/block}
	{/head}
	{* 使用body插件替换body标签，主要为可控制加载JS资源 *}
	{body}
		{block name="content"}{/block}
    <script>
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "//hm.baidu.com/hm.js?c9155afe7e2bf25278b810e8165bf551";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
    </script>
	{/body}
{/html}
