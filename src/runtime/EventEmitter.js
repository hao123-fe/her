__d("EventEmitter", [], function(global, require, module, exports) {
    /**
     * 事件机制实现
     *
     * @class
     * @param {Object} [bindObj] 使用借用方式调用时的目标对象
     * @param {Array} types 初始的事件列表
     * @access public
     *
     * @example
     * // 直接使用
     * var emitter = new EventEmitter(["load"]);
     *
     * emitter.on("load", function(data){
     *      console.log("load!!!");
     * });
     *
     * emitter.emit("load", data);
     *
     *
     * @example
     * // 继承使用
     * var SubClass = derive(EventEmitter, function(__super){
     *      __super(["someevent"]);
     * }, {
     *      doSomething:function() {
     *          this.emit("someevent");
     *      }
     * });
     *
     * var emitter = new SubClass();
     *
     * emitter.on("someevent", function(){
     *      console.log("some event!!");
     * });
     *
     * emitter.doSomething(); // some event!!
     *
     * @example
     * // 借用方式使用
     * var obj = {};
     * EventEmitter(obj, ["load"]);
     *
     * obj.on("load", function(data){
     *      console.log("load!!");
     * });
     * obj.emit("load", data);
     */
    function EventEmitter(bindObj, types) {
        if (this instanceof EventEmitter) {
            //使用 new EventEmitter(types)方式调用
            types = bindObj;
            bindObj = this;
        } else if (bindObj !== undefined) {
            //借用方式调用
            copyProperties(bindObj, EventEmitter.prototype);
        }
        bindObj.initEventTypes(types);
    }


    function call(item, data) {
        var ret;
        try {
            ret = item.callback.call(item.thisObj, data);
        } catch (e) {
            setTimeout(function () {
                throw e;
            }, 0);
        }
        return ret;
    }
    /**
     * 成员函数表
     * @alias EventEmitter.prototype
     */
    var eventEmitterMembers = {

        /**
         * 初始化监听事件类型
         *
         * @param {Array} types 监听的事件类型
         * @access public
         * @return void
         */
        initEventTypes: function(types) {
            var listenerMap = {};
            each(types, function(type) {
                listenerMap[type] = {
                    callbacks: [],
                    eventData: undefined
                };
            });
            /**
             * _listenerMap
             *
             * 监听函数列表
             * {
             *      "load":{                        //事件类型
             *          "callbacks": [              //回调函数列表
             *              {
             *                  callback:{Function} //回调函数
             *                  thisObj:{Object}    //执行回调函数时的 this
             *                  once:false          //是否执行一次
             *              }
             *          ],
             *          "eventData": undefined      //事件数据,调用 done 时会保存事件数据
             *      }
             * }
             */
            this._listenerMap = listenerMap;
        },

        /**
         * 添加事件监听
         *
         * @param {String} type 事件类型
         * @param {Function} callback 事件监听函数
         * @param {Object} [thisObj = this] 执行监听函数时的 this 对象
         * @param {Boolean} [once = false] 是否只触发一次
         * @return {Boolean} 是否添加成功
         */
        addEventListener: function(type, callback, thisObj, once) {
            var listenerMap = this._listenerMap,
                eventConfig,
                eventData,
                callbacks,
                immediately;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                // TODO 报错
                return false;
            }

            eventConfig = listenerMap[type];
            eventData = eventConfig.eventData;
            callbacks = eventConfig.callbacks;
            // eventData 不为undefined,该事件已经 done 过
            // 需要直接调用回调函数
            immediately = eventData !== undefined;
            thisObj = thisObj || this;
            once = !!once;


            if (!(immediately && once)) {
                //eventConfig.eventData = data;
                //如果不是直接执行并且只执行一次，则添加到回调列表中
                callbacks.push({
                    callback: callback,
                    thisObj: thisObj,
                    once: once
                });
            }
            if (immediately) {
                // TODO 错误处理?
                queueCall(bind(callback, thisObj, eventData));
            }

            return true;
        },

        /**
         * 删除事件监听
         *
         * @param {String} type 需要删除的监听类型
         * @param {Function} [callback] 要删除的监听函数,如果不传这个参数则删除该类型下的所有监听函数
         * @return {Boolean} 是否删除成功
         */
        removeEventListener: function(type, callback) {
            var listenerMap = this._listenerMap,
                eventConfig,
                callbacks,
                count;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                // TODO 报错
                return false;
            }

            eventConfig = listenerMap[type];

            if (arguments.length > 1) {
                //这里用来判断是否传入了 callback 参数
                //不用 callback === undefined 是为了避免
                //不小心传入了一个为 undefined 值的参数
                //导致所有的监听函数都被 remove

                callbacks = eventConfig.callbacks;
                count = callbacks.length;

                while (count--) { //从后往前遍历，方便 splice
                    if (callbacks[count].callback === callback) {
                        callbacks.splice(count, 1);
                    }
                }

            } else {
                //没有传入第二个参数,直接重置 callbacks 数组
                eventConfig.callbacks = [];
            }

            return true;
        },

        /**
         * 派发事件
         *
         * @param {String} type 派发的事件类型
         * @param {Object} [data=null] 事件参数
         * @return {Boolean} 如果至少有一个监听函数返回 false 则返回 false，否则返回 true
         */
        emit: function(type, data) {
            var listenerMap = this._listenerMap,
                eventConfig,
                callbacks,
                count,
                index,
                item,
                ret;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                throw new Error("unknow event type\"" + type + "\"");
            }

            eventConfig = listenerMap[type];
            callbacks = eventConfig.callbacks;
            count = callbacks.length;
            /**
             * 将 undefined 值转化为 null
             */
            data = data === undefined ? null : data;
            /**
             * 返回值，只要有一个为falas，则返回值为false
             */
            ret = true;

            for (index = 0; index < count; index++) {
                item = callbacks[index];
                if (item.once) {
                    callbacks.splice(index, 1);
                    index--;
                    count--;
                }

                ret = call(item, data) !== false && ret;
                // ret = item.callback.call(item.thisObj, data) !== false && ret;
            }
            return ret;
        },

        /**
         * 派发事件并且保存事件参数，
         * 当有新的监听添加时，直接调用.
         *
         * @param {String} type 事件类型
         * @param {Object} [data] 事件参数
         * @return {Boolean} 是否派发成功
         * @see emit
         *
         * @example
         * var emitter = new EventEmitter(["load"]);
         * emitter.done("load", data);
         *
         * emitter.on("load", function(data){
         *      console.log("这里会立即执行");
         * });
         */
        done: function(type, data) {
            var listenerMap = this._listenerMap,
                eventConfig,
                ret;

            /**
             * 将 undefined 值转化为 null
             */
            data = data === undefined ? null : data;
            eventConfig = listenerMap[type];
            eventConfig.eventData = data;

            //emit其实是一个很复杂的过程，为了确保done的事件被监听时能立即执行，把emit放在后面
            ret = this.emit(type, data);

            return ret;
        },

        /**
         * 删除由 done 保存的数据
         * @param {String} type 事件类型
         * @return {Boolean} 是否删除成功
         */
        undo: function(type) {
            var listenerMap = this._listenerMap,
                eventConfig;

            if (!hasOwnProperty(listenerMap, type)) {
                // 不知道的事件类型
                throw new Error("unknow event type\"" + type + "\"");
            }

            eventConfig = listenerMap[type];
            eventConfig.eventData = undefined;
            return true;
        }
    };


    /**
     * addEventListener 的快捷方法
     * @function
     * @param {String} type 事件类型
     * @param {Function} callback 事件监听函数
     * @param {Object} [thisObj = this] 执行监听函数时的 this 对象
     * @param {Boolean} [once = false] 是否只触发一次
     * @return {Boolean} 是否添加成功
     * @see addEventListener
     */
    eventEmitterMembers.on = eventEmitterMembers.addEventListener;

    /**
     * removeEventListener 的快捷方法
     * @function
     * @param {String} type 需要删除的监听类型
     * @param {Function} [callback] 要删除的监听函数,如果不传这个参数则删除该类型下的所有监听函数
     * @return {Boolean} 是否删除成功
     * @see removeEventListener
     */
    eventEmitterMembers.off = eventEmitterMembers.removeEventListener;
    /**
     * addEventListener 的快捷方法,用于添加只触发一次的监听
     * @function
     * @param {String} type 事件类型
     * @param {Function} callback 事件监听函数
     * @param {Object} [thisObj = this] 执行监听函数时的 this 对象
     * @return {Boolean} 是否添加成功
     * @see addEventListener
     */
    eventEmitterMembers.once = function(type, callback, thisObj) {
        return this.addEventListener(type, callback, thisObj, true);
    };

    copyProperties(EventEmitter.prototype, eventEmitterMembers);

    module.exports = EventEmitter;
});
