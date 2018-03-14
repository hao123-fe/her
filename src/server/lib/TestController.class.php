<?php
/**
 * TestController 输出控制器，用于处理 test 请求
 *
 * @uses PageController
 * @author zhangwentao <zhangwentao@baidu.com>
 */

BigPipe::loadClass("FirstController");
BigPipe::loadClass("BigPipeResource");

class TestController extends FirstController
{
    /**
     * 构造函数
     *
     * @param Array $ids
     * @param Array $parents
     * @return void
     */
    public function __construct($ids, $parents)
    {
        $this->ids = $ids;
        $this->parents = $parents;
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
            'collect_head_close' => array(
                'collectHeadHTML',
            ),
            'collect_body_open' => array(
                'startCollect',
                false,
            ),
            'collect_pagelet_open' => 'collect_pagelet_open',
            'collect_pagelet_close' => 'collect_pagelet_close',
            'collect_body_close' => array(
                'collectBodyHTML',
            ),
            'collect_more' => array(
                'changeState',
                true,
            ),
            //输出阶段
            'output_head_open' => array(
                'outputOpenTag',
                'outputNoscriptFallback',
                'outputHeadHTML',
                false,
            ),
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
            'output_body_close' => array(
                'outputBigPipeLibrary',
                'outputLazyPagelets',
                'outputLoadedResource',
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
        $id = $context->getParam("id", $this->sessionUniqId("__elm_"), PageletContext::FLG_APPEND_PARAM);

        if (isset($context->parent)) {
            $parentId = $context->parent->getParam("id");
            if (!empty($parentId) && in_array($parentId, $this->ids)) {
                $this->ids = array_merge($this->ids, array($id));
            }
        }

        // if only in parents, just output tag and empty pagelet
        if (!in_array($id, $this->ids)) {
            if (in_array($id, $this->parents)) {
                return array(
                    'outputOpenTag',
                    'addPagelet',
                );
            } else {
                return false;
            }
        }

        switch ($context->renderMode) {
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
        $id = $context->getParam("id");

        if (!in_array($id, $this->ids)) {
            if (in_array($id, $this->parents)) {
                return array(
                    'outputCloseTag',
                );
            } else {
                return false;
            }
        }

        switch ($context->renderMode) {
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
}
