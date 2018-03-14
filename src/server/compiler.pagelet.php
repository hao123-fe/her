<?php
/**
 * smarty 编译插件 pagelet
 *
 * 处理 {pagelet} 标签
 * @author zhangwentao <zhangwentao@baidu.com>
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 * @see BigPipe::compileOpenTag
 */
function smarty_compiler_pagelet($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileOpenTag(BigPipe::TAG_PAGELET, $params) . '){'.
'?>';
}

/**
 * smarty 编译插件 pageletclose
 *
 * 处理 {/pagelet} 标签
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 * @see BigPipe::compileCloseTag
 */
function smarty_compiler_pageletclose($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileCloseTag(BigPipe::TAG_PAGELET, $params) . '){'.
'?>';
}
