{pagelet id="sidebar"}
    {$nav_index = $smarty.get.nav|default:0}
    {* 通过widget插件加载模块化页面片段，name属性对应文件路径,模块名:文件目录路径 *}
    {widget
        name="home:widget/sidebar/sidebar.tpl" 
        data=$docs
    }
    {require name="home:static/lib/js/jquery-1.10.1.js"}
    {script}
        {* $('html').toggleClass('expanded'); *}
        $('#sidebar').hover(function() {
            require.defer(['/widget/sidebar/sidebar.async.js'], function(sidebar){
                sidebar.run();
            });
        });
    {/script}
{/pagelet}