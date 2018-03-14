<?php
/**
 * Pagelet 事件 
 * 封装 Pagelet 事件的相关属性
 * 
 * @author ZhangYuanwei <zhangyuanwei@baidu.com> 
 *         zhangwentao <zhangwentao@baidu.com>
 */

class PageletEvent
{
    /**
     * 事件的依赖资源 
     * 
     * @var mixed
     * @access public
     */
    public $requires = null;
    
    /**
     * 事件的异步依赖资源 
     * 
     * @var mixed
     * @access public
     */
    public $requireAsyncs = null;
    
    /**
     * 事件的钩子函数 
     * 
     * @var mixed
     * @access public
     */
    public $hooks = null;
    
    /**
     * 构造新的 PageletEvent 对象 
     * 
     * @access public
     * @return void
     */
    public function __construct()
    {
        $this->requires      = array();
        $this->requireAsyncs = array();
        $this->hooks         = array();
    }
    
    /**
     * 添加依赖资源 
     * 
     * @param string $resourceName 依赖资源名
     * @access public
     * @return void
     */
    public function addRequire($resourceName)
    {
        if (!in_array($resourceName, $this->requires)) {
            $this->requires[] = $resourceName;
        }
    }
    
    /**
     * 添加异步依赖资源 
     * 
     * @param string $resourceName 异步依赖资源名
     * @access public
     * @return void
     */
    public function addRequireAsync($resourceName)
    {
        if (!in_array($resourceName, $this->requireAsyncs)) {
            $this->requireAsyncs[] = $resourceName;
        }
    }
    
    /**
     * 添加钩子函数 
     * 
     * @param string $scriptCode 钩子函数代码
     * @access public
     * @return void
     */
    public function addHook($scriptCode, $strict)
    {
        if($strict){
            $scriptCode = "'use strict';\n" . $scriptCode;
        }
        $this->hooks[] = $scriptCode;
    }
} 

