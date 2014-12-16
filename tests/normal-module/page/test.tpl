This is "test.tpl";

{widget name="test:widget/test-widget.tpl"}

{script}
var test = require("/static/test.js");
{/script}

<script runat="server">
var test = require("/static/test.js");
</script>