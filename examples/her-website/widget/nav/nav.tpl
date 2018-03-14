{define}
<nav id="nav" class="navigation" role="navigation">
    <ul>
        {foreach $data as $doc}
        <li>
            <a href="#{$doc.doc}">
                <i class="icon-{$doc.icon}"></i> <span>{$doc.title}</span>
            </a>
        </li>
        {/foreach}
        <li>
            <a href="https://github.com/hao123-fe/her/wiki/1.Get%20start" target="_blank">
                <i class="icon-gift"></i> <span>Get start</span>
            </a>
        </li>
    </ul>
</nav>
{/define}