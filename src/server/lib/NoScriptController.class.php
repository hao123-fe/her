<?php
/**
 * NoScriptController
 *
 * @author zhangwentao <zhangwentao@baidu.com>
 */

BigPipe::loadClass("PageController");
BigPipe::loadClass("BigPipeResource");

class NoScriptController extends PageController
{
    const STAT_COLLECT = 1;
    const STAT_OUTPUT = 2;

    private $state = self::STAT_COLLECT;
    private $bodyHTML = null;
    private $bodyStyleLinks = array();
    private $reload = true;

    public function __construct()
    {
        if (BigPipe::$noscript === true) {
            $this->reload = false;
        }

        $this->actionChain = array(
            'default' => false,
            // 收集
            'collect_html_open' => array(
                'outputOpenTag',
                true,
            ),
            'collect_body_open' => array(
                'startCollect',
                true,
            ),

            'collect_block_open' => 'collect_block_open',
            'collect_block_close' => 'collect_block_close',
            /*
            'collect_block_open' => array(
                'outputOpenTag',
                true,
            ),
            'collect_block_close' => array(
                'outputCloseTag',
                'collectResource',
            ),
             */
            'collect_body_close' => array(
                'collectBody',
            ),
            'collect_more' => array(
                'changeState',
                true,
            ),
            // 输出
            'output_head_open' => 'output_head_open',
            /*
            'output_head_open' => array(
                'outputOpenTag',
                'outputScriptReload',
                true,
            ),
            */
            'output_title_open' => array(
                'outputOpenTag',
                true,
            ),
            'output_title_close' => array(
                'outputCloseTag',
            ),
            'output_head_close' => array(
                'outputStyle',
                'outputCloseTag',
            ),
            'output_body_open' => array(
                'outputOpenTag',
                'outputBody',
                false,
            ),
            'output_body_close' => array(
                'outputCloseTag',
            ),
            'output_html_close' => array(
                'outputCloseTag',
            ),
            'output_more' => false,
        );
    }

    /**
     * collectBody
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function collectBody($context)
    {
        $this->bodyHTML = ob_get_clean();
    }

    /**
     * collect_block_open
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function collect_block_open($context)
    {
        switch ($context->renderMode) {
            case BigPipe::RENDER_MODE_NONE:
                $actionChain = false;
                break;
            default:
                $actionChain = array(
                    'outputOpenTag',
                    true,
                );
        }
        return $actionChain;
    }

    /**
     * collect_block_close
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function collect_block_close($context)
    {
        switch ($context->renderMode) {
            case BigPipe::RENDER_MODE_NONE:
                $actionChain = false;
                break;
            default:
                $actionChain = array(
                    'outputCloseTag',
                    'collectResource',
                );
        }
        return $actionChain;
    }

    /**
     * collectResource
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function collectResource($context)
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
    }

    /**
     * outputStyle
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function outputStyle($context)
    {
        $event = $context->parent->getEvent('beforedisplay');

        if ($event != false) {
            $styleLinks = $event->requires;

            $styleResources = BigPipeResource::pathToResource($styleLinks, 'css');
            $styleResources = BigPipeResource::getDependResource($styleResources);
        }
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

    /**
     * output_head_open 输出 head tag
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function output_head_open($context)
    {
        $actionChain = array();
        $actionChain[] = 'outputOpenTag';

        if ($this->reload) {
            $actionChain[] = 'outputScriptReload';
        }

        $actionChain[] = true;

        return $actionChain;
    }

    /**
     * outputScriptReload
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function outputScriptReload($context)
    {
        echo '<script>';
        echo '(function(d,l,r){';
        echo 'd.cookie="', BigPipe::NO_JS, '=0;expires="+(new Date(0).toGMTString());';
        echo 'l[r](d.URL[r](/^(.*?)(([?&])', BigPipe::NO_JS, '=[^&]*(&|$))(.*)/,"$1$3$4$5"));';
        echo '})(document,location,"replace")';
        echo '</script>';
    }

    /**
     * outputBody 输出 body
     *
     * @param mixed $context
     * @access protected
     * @return void
     */
    protected function outputBody($context)
    {
        echo $this->bodyHTML;
    }

    /**
     * changeState
     *
     * @param empty
     * @access protected
     * @return void
     */
    protected function changeState()
    {
        switch ($this->state) {
            case self::STAT_COLLECT:
                $this->state = self::STAT_OUTPUT;
                break;
            case self::STAT_OUTPUT:
                break;
            default:
                break;
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
                $keys[] = "block";
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
}
