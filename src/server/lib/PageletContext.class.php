<?php
/**
 * Pagelet 节点上下文
 * 用于保存 Pagelet 的属性
 * 
 * @uses PageletEvent
 * @author ZhangYuanwei <zhangyuanwei@baidu.com> 
 *         zhangwentao <zhangwentao@baidu.com>
 */

BigPipe::loadClass("PageletEvent");

class PageletContext
{
    
    /**
     * 空标志 
     */
    const FLG_NONE = 0;
    
    /**
     * 自动添加事件的标志
     * @see getEvent 
     */
    const FLG_AUTO_ADD_EVENT = 1;
    
     
    /**
     * 如果指定参数没有值则添加参数
     * @see getParam
     */
    const FLG_APPEND_PARAM = 2;

    /**
     * 标签类型 
     * 
     * @var int
     * @access public
     */
    public $type = null;
    
    /**
     * 标签参数 
     * 
     * @var array
     * @access public
     */
    public $params = null;
    
    /**
     * 标签 HTML 内容
     *
     * @var string
     * @access public
     */
    public $html = null;
    
    /**
     * 父级Pagelet 
     * 
     * @var PageletContext
     * @access public
     */
    public $parent = null;
    
    /**
     * 子级 Pagelet 列表
     * 
     * @var array
     * @access public
     */
    public $children = null;
    
    /**
     * 当前标签是否执行( open 时返回值是否为 true ) 
     * 
     * @var bool
     * @access public
     */
    public $opened = false;
    
    /**
     * Pagelet 事件
     * 
     * @var array
     * @access public
     */
    public $events = null;
    
    //FIXME delete 
    private static $priority_list = array();
    private static $max_priority = 0;
    private $vars = null;
    public $priority = null; // 输出优先级
    public $priorityArray = null; //输出数组
    public $scripts = null; // script内容
    public $scriptLinks = null; // js 链接
    public $styles = null; // style内容
    public $styleLinks = null; // css 链接
    public $shouldShow = false;
    
    /**
     * 创建一个新的 Pagelet 节点上下文
     * 
     * @param int $type 节点类型
     * @param array $params 节点参数
     * @access public
     * @return void
     */
    public function __construct($type, $params = null) 
    {
        $this->type     = $type;
        $this->params   = $params;
        $this->children = array();
        $this->events   = array();
        
        $this->scripts     = array();
        $this->scriptLinks = array();
        $this->styles      = array();
        $this->styleLinks  = array();
        
        $this->renderMode     = BigPipe::RENDER_MODE_DEFAULT;
        $this->vars = array();

        if($type == BigPipe::TAG_HEAD || $type == BigPipe::TAG_BODY){
            $this->popTarget = true;
        }

    } 
    
    /**
     * 添加依赖资源 
     * 
     * @param string $eventType 事件类型
     * @param string|array $resourceName 资源名或者资源列表
     * @access public
     * @return void
     *
     * @example
     * $context = BigPipe::currentContext();
     * $context->addRequire("beforedisplay", "common:css/layout.css");
     * $context->addRequire("load", array("common:js/jquery.js"));
     */
    public function addRequire($eventType, $resourceName) 
    {
        //var_dump($resourceName);
        if(isset($this->popTarget) && $this->popTarget == true){
            $target = $this->parent;
        }else{
            $target = $this;
        }
        
        $event = $target->getEvent($eventType, self::FLG_AUTO_ADD_EVENT);
        if (is_array($resourceName)) {
            foreach ($resourceName as $name) {
                $event->addRequire($name);
            }
        } else {
            $event->addRequire($resourceName);
        }
    } 
    
    /**
     * 添加异步依赖资源 
     * 
     * @param string $eventType 事件类型
     * @param string|array $resourceName 资源名或者资源列表
     * @access public
     * @return void
     *
     * @see addRequire
     */
    public function addRequireAsync($eventType, $resourceName) 
    {
        if(isset($this->popTarget) && $this->popTarget == true){
            $target = $this->parent;
        }else{
            $target = $this;
        }
        $event = $target->getEvent($eventType, self::FLG_AUTO_ADD_EVENT);
        if (is_array($resourceName)) {
            foreach ($resourceName as $name) {
                $event->addRequireAsync($name);
            }
        } else {
            $event->addRequireAsync($resourceName);
        }
    } 
    
    /**
     * 添加 hook 函数
     * 
     * @param string $eventType 要添加到的事件类型
     * @param string $scriptCode 添加的代码
     * @access public
     * @return void
     *
     * @example
     * $context = BigPipe::currentContext();
     * $context->addHook("load", "console.log(\"pagelet loaded!\")");
     *
     * @see addRequire
     * @see addRequireAsync
     */
    public function addHook($eventType, $scriptCode, $strict) 
    {
        if(isset($this->popTarget) && $this->popTarget == true){
            $target = $this->parent;
        }else{
            $target = $this;
        }
        $event = $target->getEvent($eventType, self::FLG_AUTO_ADD_EVENT);
        $event->addHook($scriptCode, $strict);
    } 
    
    /**
     * 得到事件对象 
     * 
     * @param string $eventType 事件类型
     * @param int $flag 事件添加标志,可选值:FLG_AUTO_ADD_EVENT
     * @access private
     * @return PageletEvent 指定的事件对象
     */
    public function getEvent($eventType, $flag = self::FLG_NONE) 
    {
        if (isset($this->events[$eventType])) {
            return $this->events[$eventType];
        } else if ($flag & self::FLG_AUTO_ADD_EVENT) {
            $this->events[$eventType] = new PageletEvent();
            return $this->events[$eventType];
        } else {
            return false;
        }
    } 
    
    /**
     * 得到参数,如果不存在此参数,则返回默认值
     * 
     * @param string $name 参数名 
     * @param mixed $default 默认值
     * @access public
     * @return mixed 参数值
     */
    public function getParam($name, $default = null, $flag = self::FLG_NONE) 
    {
        if (isset($this->params[$name])) {
            return $this->params[$name];
        } else if ($flag & self::FLG_APPEND_PARAM) {
            $this->params[$name] = $default;
        }
        return $default;
    } 
    
    /**
     * 得到标签名 
     * 
     * @access private
     * @return string 标签名
     */
    private function getTagName() 
    {
        switch ($this->type) {
            case BigPipe::TAG_HTML:
                return 'html';
            case BigPipe::TAG_HEAD:
                return 'head';
            case BigPipe::TAG_TITLE:
                return 'title';
            case BigPipe::TAG_BODY:
                return 'body';
            case BigPipe::TAG_PAGELET:
                return $this->getParam("html-tag", "div");
            default:
        }
    } 
    
    /**
     * 得到打开标签的 HTML 
     * 
     * @param array $params 标签参数,如果为false,则不显示参数
     * @access public
     * @return string 标签打开的 HTML
     */
    public function getOpenHTML($params = null) 
    {
        
        $text = "";
        if( $this->type == BigPipe::TAG_HTML ){
            $text .= "<!DOCTYPE html>";
        }
        $text .= '<' . $this->getTagName();

        if ($params !== false) {
            if (!isset($params)) {
                $params = $this->params;
            }
            
            // Parse _attributes param for Hao123-sub
            if($this->type == BigPipe::TAG_BODY && isset($params["_attributes"])){
                $attrs = $params["_attributes"];
                unset($params["_attributes"]);

                foreach ($attrs as $key => $value) {
                    $text .= " $key=\"" . htmlspecialchars($value, ENT_QUOTES, 'UTF-8', true) . "\"";
                }
            }
            
            foreach ($params as $key => $value) {
                if(!isset($value)) continue;
                if (strpos($key, BigPipe::ATTR_PREFIX) !== 0) {
                    $text .= " $key=\"" . htmlspecialchars($value, ENT_QUOTES, 'UTF-8', true) . "\"";
                }
            }

            if(!empty($this->renderMode) && $this->type === BigPipe::TAG_PAGELET) {
                $text .= " data-rm=\"$this->renderMode\"";
            }
        }
        $text .= '>';
        return $text;
    } 
    
    /**
     * 得到闭合标签的HTML 
     * 
     * @access public
     * @return string 标签闭合的 HTML
     */
    public function getCloseHTML() 
    {
        return '</' . $this->getTagName() . '>';
    } 
    
    private static function getPriorityString($arr)
    {
        $str = array();
        foreach ($arr as $pri) {
            $str[] = str_pad($pri, self::$max_priority, '0', STR_PAD_LEFT);
        }
        $str = implode('/', $str) . ".";
        return $str;
    }
    
    public static function uniquePriority()
    {
        $list = array();
        foreach (self::$priority_list as $arr) {
            $list[] = self::getPriorityString($arr);
        }
        $list = array_unique($list, SORT_STRING);
        rsort($list, SORT_STRING);
        return $list;
    }
    
    public function setPriority($priority)
    {
        if ($this->parent !== null && $this->parent->priorityArray !== null) {
            $priorityArray = $this->parent->priorityArray;
        } else {
            $priorityArray = array();
        }
        $priorityArray[]       = $priority;
        $this->priorityArray   = $priorityArray;
        self::$priority_list[] = $this->priorityArray;
        self::$max_priority    = max(self::$max_priority, strlen($priority));
    }
    
    public function getPriority()
    {
        if ($this->priority === null) {
            $this->priority = self::getPriorityString($this->priorityArray);
        }
        return $this->priority;
    }
    
    public function get($key, $default = null)
    {
        if (isset($this->vars[$key])) {
            return $this->vars[$key];
        }
        return $default;
    }
    
    public function set($key, $value = null)
    {
        if (isset($value)) {
            $this->vars[$key] = $value;
        } elseif (isset($this->vars[$key])) {
            unset($this->vars[$key]);
        }
        return $value;
    }
    
}