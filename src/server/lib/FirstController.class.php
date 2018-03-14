<?php
/**
 * 第一次请求页面时的输出控制器
 *
 *    共分为4个阶段输出:
 *
 *    1.渲染并收集最外层结构(未被pagelet包裹的内容)并收集使用到的Js和CSS
 *    2.输出html、head、body和最外层结构，并且输出前端库及使用到的CSS和Js资源
 *    3.根据优先级输出各层结构，并输出依赖资源表
 *    4.结束
 *
 * @uses PageController
 * @author ZhangYuanwei <zhangyuanwei@baidu.com>
 *         zhangwentao <zhangwentao@baidu.com>
 */

BigPipe::loadClass("PageController");
BigPipe::loadClass("BigPipeResource");

class FirstController extends PageController
{
    const STAT_COLLECT = 1; // 收集阶段
    const STAT_OUTPUT = 2; // 输出阶段

    private $state = self::STAT_COLLECT; //初始状态
    private $headInnerHTML = null;
    private $bodyInnerHTML = null;
    private $loadedResource = array();
    private $pagelets = array(); //定义空数组不报错
    private $lazyPagelets = array();

    protected $sessionId = 0; //此次会话ID,用于自动生成不重复id,第一次默认为0
    protected $uniqIds = array(); //不重复id种子
    protected static $knownEvents = array(
        "beforeload", // Pagelet 开始加载前派发,return false 可以阻止加载
        "beforedisplay", // Pagelet 加载完成CSS资源和html资源,准备渲染时派发
        "display", // Pagelet dom渲染后派发
        "load", // Pagelet 加载并渲染完成后派发
        "unload",
    );
    /**
     * 构造函数
     *
     * @param Null
     * @return void
     */
    public function __construct()
    {
        $this->actionChain = array(
            //收集阶段
            'collect_html_open' => array(
                'outputOpenTag',
                true,
            ),
            'collect_head_open' => array(
                'startCollect',
                true,
            ),
            'collect_title_open' => array(
                'outputOpenTag',
                //FIXME collect and save title??
                true,
            ),
            'collect_title_close' => array(
                'outputCloseTag',
            ),
            'collect_head_close' => array(
                'collectHeadHTML',
            ),
            'collect_body_open' => array(
                'startCollect',
                true,
            ),
            // 动态 actionChain
            'collect_pagelet_open' => 'collect_pagelet_open',
            // 'collect_pagelet_open' => array(
            //     //TODO 'outputPageletOpenTag',
            //     'outputOpenTag',
            //     'addPagelet',
            //     'startCollect',
            //     true
            // ),
            // 动态 actionChain
            'collect_pagelet_close' => 'collect_pagelet_close',
            // 'collect_pagelet_close' => array(
            //     'collectHTML',
            //     'setupBigrender',
            //     'renderPagelet',
            //     'outputCloseTag'
            // ),
            'collect_body_close' => array(
                'collectBodyHTML',
            ),
            //'collect_html_close' => false,
            'collect_more' => array(
                'changeState',
                true,
            ),
            //输出阶段
            //'output_html_open' => false,
            'output_head_open' => array(
                'outputOpenTag',
                'outputNoscriptFallback',
                'outputHeadHTML',
                false,
            ),
            //'output_title_open' => false,
            //'output_title_close' => false,
            'output_head_close' => array(
                //TODO 'outputLayoutStyle',
                'outputLayoutStyle',
                'outputCloseTag',
            ),
            'output_body_open' => array(
                'outputOpenTag',
                'outputBodyHTML',
                false,
            ),
            //'output_pagelet_open' => false,
            //'output_pagelet_close' => false,
            'output_body_close' => array(
                'outputBigPipeLibrary',
                'outputLazyPagelets',
                'outputLoadedResource',
                //TODO 'sessionStart',
                //TODO 'outputLayoutPagelet',
                'outputLayoutPagelet',
                'outputPagelets',
                'outputCloseTag',
            ),
            'output_html_close' => array(
                'outputCloseTag',
            ),
            'output_more' => false,
            'default' => false,
        );
    }

    /**
     * collect_pagelet_open 时的 actionChain
     *
     * @param PageletContext $context
     * @return <Array> actionChain
     */
    protected function collect_pagelet_open($context)
    {
        // if no pagelet id, append unique id
        $context->getParam("id", $this->sessionUniqId("__elm_"), PageletContext::FLG_APPEND_PARAM);
        switch ($context->renderMode) {
            case BigPipe::RENDER_MODE_LAZY:
                $actionChain = array('outputOpenTag');
                $this->lazyPagelets[] = $context->getParam("id");
                break;
            case BigPipe::RENDER_MODE_NONE:
                $actionChain = false;
                break;
            default:
                $actionChain = array(
                    'outputOpenTag',
                    'addPagelet',
                    'startCollect',
                    true,
                );
        }
        return $actionChain;
    }
    /**
     * collect_pagelet_close 时的 actionChain
     *
     * @param PageletContext $context
     * @return <Array> actionChain
     */
    protected function collect_pagelet_close($context)
    {
        switch ($context->renderMode) {
            case BigPipe::RENDER_MODE_LAZY:
                $actionChain = array('outputCloseTag');
                break;
            case BigPipe::RENDER_MODE_NONE:
                $actionChain = false;
                break;
            case BigPipe::RENDER_MODE_SERVER:
                $actionChain = array(
                    'collectHTML',
                    // 'setupBigrender',
                    'renderPagelet',
                    'outputCloseTag',
                );
                break;
            default:
                $actionChain = array(
                    'collectHTML',
                    'outputCloseTag',
                );
        }
        return $actionChain;
    }
    /**
     * 收集阶段调用函数,收集 head 标签中的 HTML 内容
     *
     * @param PageletContext $context
     */
    protected function collectHeadHTML($context)
    {
        $this->headInnerHTML = ob_get_clean();
    }

    /**
     * 收集阶段调用函数,收集 body 标签中的HTML内容
     *
     * @param PageletContext $context
     */
    protected function collectBodyHTML($context)
    {
        $this->bodyInnerHTML = ob_get_clean();
    }

    /**
     * 将当前 pagelet 添加到输出列表中
     *
     * @param PageletContext $context
     */
    protected function addPagelet($context)
    {
        $this->pagelets[] = $context;
    }

    /**
     * outputNoscriptFallback 输出noscript跳转 {{{
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function outputNoscriptFallback($context)
    {
        $uri = $_SERVER["REQUEST_URI"];
        $uri = $uri . (strpos($uri, "?") === false ? "?" : "&") . BigPipe::NO_JS . "=1";

        // $_SERVER["REQUEST_URI"] is encoded in some cases,
        // decode make sure get the decoded uri
        $uri = urldecode($uri);

        // parse_url and encode path and query
        $uri_arr = parse_url($uri);
        $uri_ret = '';

        if (isset($uri_arr['path'])) {
            $path = $uri_arr['path'];
            $path_ret = array();

            foreach (explode('/', $path) as $p) {
                $path_ret[] = urlencode($p);
            }
            $path = implode('/', $path_ret);
            $uri_ret .= $path;
        }

        if ($uri_arr['query']) {
            $query = $uri_arr['query'];
            $query_ret = array();
            foreach (explode('&', $query) as $q) {
                $k_temp = array();
                foreach (explode('=', $q) as $k) {
                    $k_temp[] = urlencode($k);
                }
                $query_ret[] = implode('=', $k_temp);
            }
            $query = implode('&', $query_ret);
            $uri_ret .= '?' . $query;
        }
        echo "<noscript>";
        echo "<meta http-equiv=\"refresh\" content=\"0; URL='$uri_ret'\" />";
        echo "</noscript>";
    }

    /**
     * 输出布局阶段调用函数,将收集到的 head 标签中的 HTML 内容输出
     *
     * @param PageletContext $context
     */
    protected function outputHeadHTML($context)
    {
        echo $this->headInnerHTML;
    }

    /**
     * 输出布局阶段调用函数,将收集到的 body 标签中的 HTML 内容输出
     *
     * @param PageletContext $context
     */
    protected function outputBodyHTML($context)
    {
        echo $this->bodyInnerHTML;
    }

    /**
     * 输出布局阶段调用函数,将收集到的 body 标签中的 HTML 内容输出
     *
     * @param PageletContext $context
     */
    // protected function setupBigrender($context)
    // {
    //     if(isset($context->bigrender)){
    //         $eventType = "beforeload";
    //         $context->addRequire($eventType, BigPipe::$bigrenderLib);
    //         $context->addHook($eventType, BigPipe::getBigrenderCode());
    //     }
    // }
    /**
     *  输出 lazy pagelets id 数组
     *
     * @param PageletContext $context
     */
    protected function outputLazyPagelets()
    {
        echo "\n<script>BigPipe.lazyPagelets = " . json_encode($this->lazyPagelets) . ";</script>";
    }
    /**
     * 渲染 pagelet
     *
     * @param PageletContext $context
     */
    protected function renderPagelet($context)
    {
        $bodyContext = BigPipe::bodyContext();

        if ($context->getEvent('beforedisplay') !== false) {
            $requires = $context->getEvent('beforedisplay')->requires;
            if (!empty($requires) && $bodyContext) {
                foreach ($requires as $res) {
                    $bodyContext->addRequire('beforedisplay', $res);
                }
            }
        }
        echo $context->html;
        unset($context->html);
    }
    /**
     * 输出布局阶段调用函数,将收集到的 head和body标签中的 HTML 内容输出
     *
     * @param PageletContext $context
     */
    protected function outputLayoutStyle($context)
    {
        $event = $context->parent->getEvent('beforedisplay');

        if ($event != false) {
            $styleLinks = $event->requires;

            $styleResources = BigPipeResource::pathToResource($styleLinks, 'css');
            $styleResources = BigPipeResource::getDependResource($styleResources, false);

            $this->loadedResource = BigPipe::array_merge($styleResources, $this->loadedResource);

            foreach ($styleResources as $resource) {
                if (isset(BigPipe::$herConf)
                    && isset(BigPipe::$herConf['inlineCSS'])
                    && BigPipe::$herConf['inlineCSS']
                    && isset($resource['content'])
                ) {
                    echo "<style>{$resource['content']}</style>";
                } else {
                    echo "<link rel=\"stylesheet\" type=\"text/css\" href=\"{$resource['src']}\" />";
                }
            }
        }

    }

    protected function outputBigPipeLibrary($context)
    {

        $jsLibs = BigPipeResource::pathToResource(array(BigPipe::$jsLib));
        $jsLibs = BigPipeResource::getDependResource($jsLibs, false);

        foreach ($jsLibs as $resource) {
            if (!isset($this->loadedResource[$resource['id']])) {
                switch ($resource['type']) {
                    case 'js':
                        echo "<script src=\"{$resource['src']}\"></script>";
                        break;
                    case 'css':
                        echo "<link rel=\"stylesheet\" href=\"{$resource['src']}\"></link>";
                        break;
                }
            }
        }

        $this->loadedResource = BigPipe::array_merge($jsLibs, $this->loadedResource);
    } //

    protected function outputLoadedResource($context)
    {
        $loadedResource = json_encode(array_keys(($this->loadedResource)));
        echo "\n<script>BigPipe.loadedResource(" . $loadedResource . ");</script>";
    }
    /**
     * 输出布局阶段调用函数,将收集到的 head和body标签中的 HTML 内容输出
     *
     * @param PageletContext $context
     */
    protected function outputLayoutPagelet($context)
    {
        $context->parent->children = $context->children;
        $this->outputPagelet($context->parent);
    }

    /**
     * 输出页面中所有的 pagelet
     *
     * @param PageletContext $context
     */
    protected function outputPagelets($context)
    {
        foreach ($this->pagelets as $pagelet) {
            // var_dump($pagelet->getParam("id"), $pagelet->children);
            $this->outputPagelet($pagelet);
        }
    }

    protected function outputPagelet($pagelet)
    {
        $resourceMap = array();
        $hooks = array();
        $config = $this->getPageletConfig($pagelet, $html, $resourceMap, $hooks);

        // 输出注释里的 HTML
        if (!empty($html)) {
            echo "\n" . $html;
        }

        // 输出函数
        if (!empty($hooks)) {
            foreach ($hooks as $id => $hook) {
                echo "<script>BigPipe.hooks[\"$id\"]=function(){{$hook}};</script>\n";
            }
        }
        //设置资源表
        if (!empty($resourceMap)) {
            $resourceMap = BigPipeResource::pathToResource($resourceMap);
            $resourceMap = BigPipeResource::getDependResource($resourceMap);

            $resourceMap = BigPipe::array_merge($resourceMap, $this->loadedResource);

            $outputMap = array();
            foreach ($resourceMap as $id => $resource) {

                if (isset(BigPipeResource::$knownResources[$id])) {
                    continue;
                }

                $requires = $resource['requires'];
                unset($resource['requires']);
                unset($resource['requireAsyncs']);

                $requireIds = array();
                if (!empty($requires)) {
                    $requires = BigPipeResource::pathToResource($requires);
                    $requireIds = array_keys($requires);
                }
                $resource['deps'] = $requireIds;
                $resource['mods'] = $resource['defines'];

                unset($resource['defines']);
                unset($resource['id']);
                if (isset($resource['content'])) {
                    unset($resource['content']);
                }
                $outputMap[$id] = $resource;
                BigPipeResource::$knownResources[$id] = $resource;
            }

            if (!empty($outputMap)) {
                echo "<script>BigPipe.setResourceMap(", json_encode($outputMap), ");</script>\n";
            }
        }

        //输出 pagelet 配置
        echo "<script>BigPipe.onPageletArrive(", json_encode($config), ");</script>\n";
    }

    /**
     * getPageletHTML
     *
     * @param String $html
     * @return <Array> [$html, $containerId]
     */
    private function getPageletHTML($html)
    {
        $containerId = $this->sessionUniqId("__cnt_");
        $ret = "<code id=\"$containerId\" style=\"display:none\"><!-- ";
        $ret .= $this->getCommentHTML($html);
        $ret .= " --></code>";
        return array($ret, $containerId);
    }

    /**
     * getPageletHooks
     *
     * @param Array $hook
     * @param Array &$hooks
     * @return String $hookId
     */
    private function getPageletHooks($hook, &$hooks)
    {
        $hookId = $this->sessionUniqId("__cb_");
        $hooks[$hookId] = $hook;
        // $config["hooks"][$type][] = $hookId;
        return $hookId;
    }

    /**
     * 得到 pagelet 的配置，用于 BigPipe.onPageletArrive
     *
     * @param PageletContext $pagelet
     * @param string $html
     * @param array $resourceMap
     * @param array $hooks
     */
    protected function getPageletConfig($pagelet, &$html, &$resourceMap, &$hooks, $quickling = false)
    {
        $config = array();
        $config["id"] = $pagelet->getParam("id");
        $config["children"] = array();
        $config["renderMode"] = $pagelet->renderMode;

        foreach ($pagelet->children as $child) {
            $config["children"][] = $child->getParam("id");
        }

        if ($pagelet->parent) {
            $config["parent"] = $pagelet->parent->getParam("id");
        }

        if (!empty($pagelet->html)) {
            //生成容器ID
            $htmlArr = $this->getPageletHTML($pagelet->html);
            //生成注释的内容
            $html = $htmlArr[0];
            //设置html属性
            if ($quickling) {
                $config["html"]["html"] = $pagelet->html;
            } else {
                $config["html"]["container"] = $htmlArr[1];
            }
        }

        foreach (self::$knownEvents as $type) {
            $event = $pagelet->getEvent($type);

            if ($event !== false) {
                foreach ($event->hooks as $hook) {
                    $config["hooks"][$type][] = $quickling
                    ? $hook
                    : $this->getPageletHooks($hook, $hooks);
                }
                //deps
                $requireResources = BigPipeResource::pathToResource($event->requires);
                $config["deps"][$type] = array_keys($requireResources);

                $resourceMap = array_merge($resourceMap, $event->requires, $event->requireAsyncs);
            }
        }
        return $config;
    }

    /**
     * 得到注释包裹的HTML
     *
     * @param string $html
     * @return string
     */
    private function getCommentHTML($html)
    {
        return str_replace(array(
            "\\",
            "-->",
        ), array(
            "\\\\",
            "--\\>",
        ), $html);
    }

    /**
     * 改变状态
     *
     * @param PageletContext $context
     */
    protected function changeState($context)
    {
        if ($this->state === self::STAT_COLLECT) {
            $this->state = self::STAT_OUTPUT;
        }
    }

    /**
     * getActionKey 得到需要执行的动作索引
     *
     * @param mixed $context
     * @param mixed $action
     * @access protected
     * @return void
     */
    protected function getActionKey($type, $action)
    {
        $keys = array();
        switch ($this->state) {
            case self::STAT_COLLECT:
                $keys[] = "collect";
                break;
            case self::STAT_OUTPUT:
                $keys[] = "output";
                break;
            default:
        }

        switch ($type) {
            case BigPipe::TAG_HTML:
                $keys[] = "html";
                break;
            case BigPipe::TAG_HEAD:
                $keys[] = "head";
                break;
            case BigPipe::TAG_TITLE:
                $keys[] = "title";
                break;
            case BigPipe::TAG_BODY:
                $keys[] = "body";
                break;
            case BigPipe::TAG_PAGELET:
                $keys[] = "pagelet";
                break;
            default:
        }

        switch ($action) {
            case PageController::ACTION_OPEN:
                $keys[] = "open";
                break;
            case PageController::ACTION_CLOSE:
                $keys[] = "close";
                break;
            case PageController::ACTION_MORE:
                $keys[] = "more";
                break;
            default:
        }

        $key = join("_", $keys);
        if (!isset($this->actionChain[$key])) {
            $key = 'default';
        }
        return $key;
    }

    /**
     * 得到本次会话中唯一ID
     *
     * @param string $prefix 可选前缀
     * @return string
     */
    protected function sessionUniqId($prefix = "")
    {
        if (!isset($this->uniqIds[$prefix])) {
            $this->uniqIds[$prefix] = 0;
        }
        $this->uniqIds[$prefix]++;
        return $prefix . $this->sessionId . "_" . $this->uniqIds[$prefix];
        //sessionKey
    }

}
