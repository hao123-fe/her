<?php
/**
 * smarty 模版函数 require
 * 处理 {require} 标签
 * @author zhangwentao <zhangwentao@baidu.com>
 *
 * @param array $params
 * @param Smarty $smarty
 * @return void
 * @see BigPipeResource::registModule
 * @see BigPipe::currentContext
 * @see PageletContext->addRequire
 */
function smarty_function_require($params, $smarty){
    $link = $params['name'];
    unset($params['name']);

    BigPipeResource::registModule($link);

    $context   = BigPipe::currentContext();
    $resource =  BigPipeResource::getResourceByPath($link);

    switch ($resource["type"]) {
        case 'css':
            $on = isset($params['on']) ? $params['on'] : 'beforedisplay';
            break;
        case 'js':
            $on = isset($params['on']) ? $params['on'] : 'load';
            break;
    }

    $context->addRequire($on, $link);      
}
