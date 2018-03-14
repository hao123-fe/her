<?php
/**
 * 资源管理类
 *
 * @author zhangwentao <zhangwentao@baidu.com>
 */
class BigPipeResource
{
    /**
     * 存储资源map
     */
    private static $map = array(
        "res" => array(),
        "her" => array(),
    );
    /**
     * 存储已经注册的module
     */
    private static $registedMoudle = array();
    /**
     * 存储已经处理过返回给前端的Resources
     */
    public static $knownResources = array();
    /**
     * 初始化资源map
     *
     * @param array $map 类名
     * @static
     * @access public
     * @return void
     */
    public static function setupMap($map)
    {
        self::$map["res"] = self::$map["res"] + $map["res"];
        self::$map["her"] = self::$map["her"] + $map["her"];
    }

    /**
     * 注册一个module 将module的map存在$registedMoudle
     *
     * @param string $name 标准化资源路径
     * @static
     * @access public
     * @return void
     */
    public static function registModule($name)
    {
        $intPos = strpos($name, ':');

        if ($intPos === false) {
            return;
        } else {
            $femodule = substr($name, 0, $intPos);
        }

        $configPath = BIGPIPE_CONF_DIR;

        if (!in_array($femodule, self::$registedMoudle)) {

            if (defined("FE_HTTPS") && FE_HTTPS) {
                $femodulefix = $femodule . '-https';
            } else {
                $femodulefix = $femodule;
            }
            $mapPath = $configPath . '/' . $femodulefix . '-map.json';
            if (!file_exists($mapPath)) {
                throw new Exception("map file not exist, module: $femodule, path: $mapPath");
            }

            $map = json_decode(file_get_contents($mapPath), true);
            if (!is_array($map)) {
                throw new Exception("map decode fail, module: $femodule");
            }

            BigPipeResource::setupMap($map);
            self::$registedMoudle[] = $femodule;
        }
    }

    /**
     * 通过标准化路径获取tpl资源
     *
     * @param string $path 标准化资源路径
     * @static
     * @access public
     * @return resource
     */
    public static function getTplByPath($path)
    {
        return self::$map["res"][$path];
    }

    /**
     * 通过标准化路径获取资源
     *
     * @param string $path 标准化资源路径
     * @static
     * @access public
     * @return resource
     */
    public static function getResourceByPath($path, $type = null)
    {

        $map = self::$map["her"];
        $resource = self::getResource($map, $path, $type);
        if ($resource) {
            return $resource;
        }

        return false;
    }

    /**
     * 从给定 map 获取资源
     *
     * @param array $map 资源map
     * @param string $path 资源path
     * @param string $type 资源类型
     * @return resource
     */
    public static function getResource($map, $path, $type)
    {
        foreach ($map as $id => $resource) {
            if ((!isset($type) || $type == $resource['type'])
                && in_array($path, $resource['defines'])) {
                $resource['id'] = $id;
                if (!isset($resource['requires'])) {
                    $resource['requires'] = array();
                }

                if (!isset($resource['requireAsyncs'])) {
                    $resource['requireAsyncs'] = array();
                }

                return $resource;
            }
        }
        return false;
    }

    /**
     * 通过路径数组获取资源数组
     *
     * @param string $pathArr 标准化资源路径数组
     * @static
     * @access public
     * @return resources 资源数组
     */
    public static function pathToResource($pathArr, $type = null)
    {
        $resources = array();

        foreach ($pathArr as $path) {
            $resource = self::getResourceByPath($path, $type);
            if ($resource) {
                $resources[$resource['id']] = $resource;
            }
        }
        return $resources;
    }

    /**
     * 通过资源数组获取依赖资源数组
     *
     * @param array $resources 资源数组
     * @param bool $asyncs 是否需要获取async依赖
     * @static
     * @access public
     * @return resources 依赖资源数组
     */
    public static function getDependResource($resources, $asyncs = true)
    {
        $dependResources = array();

        $depends = $resources;

        while (!empty($depends)) {

            $last = end($depends);
            array_pop($depends);

            $id = $last['id'];

            if (isset($dependResources[$id])) {
                continue;
            }
            $dependResources[$id] = $last;

            $lastDepends = self::getDepend($last, $asyncs);
            if (!empty($lastDepends)) {
                $depends = BigPipe::array_merge($depends, $lastDepends);
            }
        }

        return array_reverse($dependResources, true);
    }

    /**
     * 获取一个资源的依赖
     *
     * @param mixed $resource 资源数组
     * @param bool $asyncs 是否需要获取async依赖
     * @static
     * @access public
     * @return resources 依赖资源数组
     */
    private static function getDepend($resource, $asyncs)
    {
        $requires = $resource['requires'];

        if ($asyncs) {
            $requires = array_merge($requires, $resource['requireAsyncs']);
        }

        if (count($requires) > 0) {
            return $dependResources = self::pathToResource($requires);
        }
        return array();
    }

}
