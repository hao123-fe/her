<?php
/**
 * smarty 编译插件 html
 *
 * 处理 {html} 标签
 *
 * @param array $params
 * @param Smarty $smarty
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_html($params,  $smarty){
	$strBigPipePath = preg_replace('/[\\/\\\\]+/', '/', dirname(__FILE__) . '/lib/BigPipe.class.php');

	if(!class_exists("BigPipe", false)){
		require_once($strBigPipePath);
	}

	return
'<?php '.
'if(!class_exists("BigPipe", false)){require_once(\'' . $strBigPipePath . '\');}'.
'if(BigPipe::init($_smarty_tpl->smarty)){'.
	'do{'.
		'if(' . BigPipe::compileOpenTag(BigPipe::TAG_HTML, $params) . '){'.
'?>';
}

/**
 * smarty 编译插件 htmlclose
 *
 * 处理 {/html} 标签
 *
 * @param array $params
 * @param Smarty $smarty
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_htmlclose($params,  $smarty){
	return
'<?php '.
        '}'.
        BigPipe::compileCloseTag(BigPipe::TAG_HTML, $params) . ";" .
	'}while(BigPipe::more());'.
'}'.
'?>';
}
