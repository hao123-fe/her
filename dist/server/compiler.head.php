<?php
/**
 * smarty 编译插件 head
 *
 * 处理 {head} 标签
 * @author zhangwentao <zhangwentao@baidu.com>
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_head($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileOpenTag(BigPipe::TAG_HEAD, $params) . '){'.
'?>';
}

/**
 * smarty 编译插件 headclose
 *
 * 处理 {/head} 标签
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 */
function smarty_compiler_headclose($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileCloseTag(BigPipe::TAG_HEAD, $params) . '){'.
'?>';
}
