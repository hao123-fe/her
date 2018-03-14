<?php
/**
 * smarty 编译插件 body
 *
 * 处理 {body} 标签
 * @author zhangwentao <zhangwentao@baidu.com>
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_body($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileOpenTag(BigPipe::TAG_BODY, $params) . '){'.
'?>';
}

/**
 * smarty 编译插件 bodyclose
 *
 * 处理 {/body} 标签
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_bodyclose($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileCloseTag(BigPipe::TAG_BODY, $params) . '){'.
'?>';
}
