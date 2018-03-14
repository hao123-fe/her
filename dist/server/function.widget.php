<?php
/**
 * smarty function widget
 * called by {widget} tag
 * @author zhangwentao <zhangwentao@baidu.com>
 *
 * @param array $params
 * @param Smarty $template
 * @return Smarty template funtion call
 * @see BigPipeResource::registModule
 * @see BigPipeResource::getTplByPath
 * @see BigPipe::currentContext
 * @see PageletContext->addRequire
 */

function smarty_function_widget($params, $template)
{
    $name = $params['name'];
    $method = $params['method'];
    unset($params['name']);
    unset($params['method']);

    if(isset($params['call'])){
        $call = $params['call'];
        unset($params['call']);
    }

    BigPipeResource::registModule($name);

    $tpl = BigPipeResource::getTplByPath($name);
    // Auto add widget css and less deps (no js) to currentContext.
    if(!empty($tpl["deps"])){

        $deps = $tpl["deps"];
        $context   = BigPipe::currentContext();

        foreach($deps as $dep){
            BigPipeResource::registModule($dep);
            $depResource = BigPipeResource::getResourceByPath($dep);

            if($depResource["type"] === "css"){
                $on = 'beforedisplay';
                $context->addRequire($on, $dep);
            }
        }
    }

    $smarty=$template->smarty;
    $tplpath = $tpl["uri"];

    // First try to call the mothed passed via the $call param,
    // in order to made it compatible for fisp.
    if(isset($call)){
        $call = 'smarty_template_function_' . $call;
        if(!function_exists($call)) {
            try {
                $smarty->fetch($tplpath);
            } catch (Exception $e) {
                throw new Exception("\nNo tpl here, via call \n\"$name\" \n@ \"$tplpath\"");
            }
        }
        if(function_exists($call)) {
            return $call($template, $params);
        }
    }

    // If there is no method named $call,
    // try to call mothed passed via the $method param
    $fn='smarty_template_function_' . $method;
    if(!function_exists($fn)) {
        try {
            $smarty->fetch($tplpath);
        } catch (Exception $e) {
            throw new Exception("\nNo tpl here,via method \n\"$name\" \n@ \"$tplpath\"");
        }
    }

    if(function_exists($fn)) {
        return $fn($template, $params);
    }

    // If still no method named $method,
    // try to construct a method name with the tpl path, via md5().
    // This is in order to support call method through dynamic tpl path.
    else
    {
        $methodName = preg_replace('/^_[a-fA-F0-9]{32}_/','',$method);

        if($method !== $methodName){
            $method = '_' . md5($name) . '_' . $methodName;

            $fn='smarty_template_function_' . $method;

            if(function_exists($fn)){
                return $fn($template, $params);
            }
        }
        throw new Exception("\nUndefined function \"$method\" \nin \"$name\" \n@ \"$tplpath\"");
    }
}
