<?php
/**
 * SmartController 输出控制器，用于处理quickling请求
 *
 * @uses PageController
 * @author zhangwentao <zhangwentao@baidu.com>
 */

BigPipe::loadClass("FirstController");
BigPipe::loadClass("BigPipeResource");

class SmartController extends FirstController
{
    const STAT_COLLECT = 1; // 收集阶段
    const STAT_OUTPUT = 2; // 输出阶段

    private $state = self::STAT_COLLECT; //初始状态
    private $headInnerHTML = null;
    private $bodyInnerHTML = null;

    private $loadedResource = array();

    protected $sessionId = 0; // 此次会话ID,用于自动生成不重复id,第一次默认为0
    protected $uniqIds = array(); // 不重复id种子

    /**
     * 构造函数
     *
     * @access public
     * @return void
     */
    public function __construct($sessions, $ids)
    {
        $this->ids = $ids;
        $this->sessions = $sessions;

        $this->pagelets = array();
        $this->cids = array();
        $this->oids = $ids;

        $this->actionChain = array(
            //收集阶段
            'collect_pagelet_open' => 'collect_pagelet_open',
            'collect_pagelet_close' => 'collect_pagelet_close',
            // 'collect_pagelet_open' => array(
            //     //TODO 'outputPageletOpenTag',
            //     'addPagelet',
            //     'outputSmartOpenTag',
            //     'startCollect',
            //     true
            // ),
            // 'collect_pagelet_close' => array(
            //     'collectHTML',
            //     // 'setupBigrender',
            //     'outputSmartCloseTag'
            // ),
            'collect_more' => array(
                'changeState',
                true,
            ),
            //输出阶段
            'output_body_close' => array(
                'outputPagelets',
            ),
            'output_more' => false,
            'default' => false,
        );
    }

    /**
     * collect_pagelet_open 时的 actionChain
     *
     * @param PageletContext $context
     * @return mixed:<Array|false> actionChain
     */
    protected function collect_pagelet_open($context)
    {
        if ($context->renderMode === BigPipe::RENDER_MODE_NONE) {
            return false;
        }

        $context->renderMode = BigPipe::RENDER_MODE_QUICKLING;

        $id = $context->getParam(
            "id",
            $this->sessionUniqId("__elm_"),
            PageletContext::FLG_APPEND_PARAM
        );

        if (isset($context->parent)) {
            $parentId = $context->parent->getParam("id");
            if (!empty($parentId) && in_array($parentId, $this->ids)) {
                $this->ids = array_merge($this->ids, array($id));
                $this->cids[] = $id;
            }
        }
        if (in_array($id, $this->ids)) {
            $this->pagelets[] = $context;
            // var_dump($context->getParam("id"), $this->cids );
            if (in_array($context->getParam("id"), $this->cids)) {
                return array(
                    'outputOpenTag',
                    'addPagelet',
                    'startCollect',
                    true,
                );
            } else {
                return array(
                    // 'outputOpenTag',
                    'addPagelet',
                    'startCollect',
                    true,
                );
            }
        } else {
            // $context->renderMode = BigPipe::RENDER_MODE_NONE;
            // $context->opened = false;
            return false;
        }
    }

    /**
     * collect_pagelet_close 时的 actionChain
     *
     * @param PageletContext $context
     * @return mixed:<Array|false> actionChain
     */
    protected function collect_pagelet_close($context)
    {

        // if($context->renderMode === BigPipe::RENDER_MODE_NONE) {
        if (!$context->opened) {
            return false;
        }

        if (in_array($context->getParam("id"), $this->cids)) {
            return array(
                'collectHTML',
                'outputCloseTag',
            );
        }

        return array(
            'collectHTML',
        );
    }

    /**
     * 输出Quickling请求的pagelets
     *
     * @param PageletContext $context
     */
    protected function outputPagelets($context)
    {
        $pagelets = array();
        foreach ($this->pagelets as $pagelet) {
            $id = $pagelet->getParam("id");
            if (in_array($id, $this->ids)) {
                $config = $this->outputPagelet($pagelet);

                if (isset($this->sessions[$id])) {
                    $config["session"] = $this->sessions[$id];
                }
                $pagelets[] = $config;
            }
        }

        // 输出之前 设置 Content-Type: application/json
        header('Content-Type: application/json;charset=UTF-8');
        echo json_encode($pagelets);
    }
    /**
     * 按Quickling模式输出一个pagelet
     *
     * @param PageletContext $context
     */
    protected function outputPagelet($pagelet)
    {
        $resourceMap = array();
        $hooks = array();
        $config = $this->getPageletConfig($pagelet, $html, $resourceMap, $hooks, true);
        $config['quickling'] = true;
        $outputMap = array();
        //设置资源表
        if (!empty($resourceMap)) {
            $resourceMap = BigPipeResource::pathToResource($resourceMap);
            $resourceMap = BigPipeResource::getDependResource($resourceMap);

            $resourceMap = BigPipe::array_merge($resourceMap, $this->loadedResource);

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
                unset($resource['content']);
                
                $outputMap[$id] = $resource;
                BigPipeResource::$knownResources[$id] = $resource;
            }
        }

        $config["resourceMap"] = $outputMap;

        return $config;
    }
}
