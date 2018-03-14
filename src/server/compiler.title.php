<?php
/**
 * smarty 编译插件 title
 *
 * 处理 {title} 标签
 * @author zhangwentao <zhangwentao@baidu.com>
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 * @see BigPipe::compileOpenTag
 */
function smarty_compiler_title($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileOpenTag(BigPipe::TAG_TITLE, $params) . '){'.
'?>';
}

/**
 * smarty 编译插件 titleclose
 *
 * 处理 {/title} 标签
 * 
 * @param array $params
 * @param Smarty $smarty 
 * @access public
 * @return string 编译后的php代码
 * @see BigPipe::compileCloseTag
 */
function smarty_compiler_titleclose($params,  $smarty){
	return 
'<?php '.
'}'.
'if(' . BigPipe::compileCloseTag(BigPipe::TAG_TITLE, $params) . '){'.
'?>';
}
