<?php
/**
 * 页面控制器 PageController
 * 
 * @abstract
 * @author ZhangYuanwei <zhangyuanwei@baidu.com>
 *         zhangwentao <zhangwentao@baidu.com>
 */

abstract class PageController
{
    /**
     * 标签打开的动作类型
     * @see getActionKey
     */
    const ACTION_OPEN = 1;
    /**
     * 标签关闭的动作类型
     * @see getActionKey
     */
    const ACTION_CLOSE = 2;
    /**
     * 判断页面是否需要再次执行的动作类型
     * @see getActionKey
     */
    const ACTION_MORE = 3;
    
    /**
     * 执行的动作链，子类应该设置该属性，以便 doAction 调用
     * 
     * @var array
     * @access protected
     */
    protected $actionChain = null;
    
    /**
     * 得到用于执行的动作链 key, 子类应该实现，以便从 actionChain 中查找用于执行的动作链 
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @param int $action 当前的动作类型
     * @abstract
     * @access protected
     * @return string
     */
    abstract protected function getActionKey($context, $action);
    
    /**
     * 执行某个函数链
     * 
     * @param string $key 函数链名
     * @param PageletContext $context 当前 Pagelet 上下文
     * @access private
     * @return bool 函数链的执行结果
     */
    private function doAction($key, $context) 
    {
        $ret     = null;
        $actions = null;
        
        if (isset($this->actionChain[$key])) {
            $actions = $this->actionChain[$key];
            if (is_string($actions)) {
                // $actions = array(
                //     $actions
                // );
                $actions = call_user_func(array(
                    $this,
                    $actions
                ), $context);
            }
            if (is_array($actions)) {
                foreach ($actions as $method) {
                    if (is_string($method)) {
                        $ret = call_user_func(array(
                            $this,
                            $method
                        ), $context);
                    } else {
                        $ret = $method;
                    }
                    // 如果返回 false 直接退出返回
                    if($ret === false){
                        break;
                    }
                }
            } else {
                $ret = $actions;
            }
        }
        return $ret;
    } 
    
    /**
     * 标签打开时调用，控制标签的执行
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @final
     * @access public
     * @return bool 当前 Pagelet 是否需要执行
     */
    public final function openTag($context) 
    {
        return $this->doAction($this->getActionKey($context->type, self::ACTION_OPEN), $context);
    } 
    
    /**
     * 标签关闭时调用
     * 
     * @param PageletContext $context 
     * @final
     * @access public
     * @return void
     */
    public final function closeTag($context) 
    {
        $this->doAction($this->getActionKey($context->type, self::ACTION_CLOSE), $context);
    } 
    
    /**
     * 页面完成一次执行后调用，用于控制页面是否重复执行 
     * 
     * @final
     * @access public
     * @return bool 页面是否重复执行
     */
    public final function hasMore() 
    {
        return $this->doAction($this->getActionKey(BigPipe::TAG_NONE, self::ACTION_MORE), null);
    } 
    
    /**
     * 输出打开标签
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @access protected
     * @return void
     */
    protected function outputOpenTag($context) 
    {
        echo $context->getOpenHTML();
    } 
    
    /**
     * 输出闭合标签
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @access protected
     * @return void
     */
    protected function outputCloseTag($context) 
    {
        echo $context->getCloseHTML();
    } 
    
    /**
     * 开始收集内容
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @access protected
     * @return void
     */
    protected function startCollect($context) 
    {
        ob_start();
    } 
    
    /**
     * 将收集到的内容作为 pagelet 的 HTML 内容
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @access protected
     * @return void
     */
    protected function collectHTML($context) 
    {
        $context->html = ob_get_clean();
    } 
    
    /**
     * collectScript 收集脚本
     * 
     * @param PageletContext $context 当前 Pagelet 上下文
     * @access protected
     * @return void
     */
    protected function collectScript($context) 
    {
        $context->parent->addScript(
            ob_get_clean(), 
            $context->getBigPipeConfig("on", "load"), 
            $context->getBigPipeConfig("deps"), 
            $context->getBigPipeConfig("asyncs")
        );
    } 
    
}
