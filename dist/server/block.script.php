<?php
/**
 * smarty 块函数 script
 * 处理 {script} 标签
 * @author zhangwentao <zhangwentao@baidu.com>
 *
 * @param array $params
 * @param string $content
 * @param Smarty $smarty
 * @param bool $repeat 
 * @see BigPipe::currentContext
 * @see PageletContext->addRequire
 * @see PageletContext->addRequireAsync
 * @see PageletContext->addHook
 */
function smarty_block_script($params, $content, $smarty, &$repeat)
{
    if (!$repeat && isset($content)) {
        $eventType = isset($params['on']) ? $params['on'] : "load";
        $strict = (isset($params['strict']) && $params['strict'] == false) ? false : true;
        $context   = BigPipe::currentContext();
        
        if (isset($params["sync"])) {
            foreach ($params["sync"] as $resource) {
                BigPipeResource::registModule($resource);
            }
            $context->addRequire($eventType, $params["sync"]);
        }
        
        if (isset($params["async"])) {
            foreach ($params["async"] as $resource) {
                BigPipeResource::registModule($resource);
            }
            $context->addRequireAsync($eventType, $params["async"]);
        }

        $context->addHook($eventType, $content, $strict);
    }
}

