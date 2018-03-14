{define method="section" index=0 doc=null wiki=null}
<a name="{$doc}"></a>
<section class="section">
    <div class="container-fluid">
        <div class="row-fluid title" id="section-{$index}">
            <h2>{$data.title}</h2>
        </div>
        <div class="row-fluid content">
        
        {widget name="home:widget/section/docs/`$doc`.tpl"}
        <a href="{$wiki}" target="_blank" class="btn btn-primary pull-right">
            了解更多
            <i class="icon-circle-arrow-right icon-white"></i>
        </a>
        </div>
    </div>
</section>
{/define}
