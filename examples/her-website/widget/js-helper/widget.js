/*!
 * jQuery UI Widget 1.8.20
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
// @/require jquery.js;

(function(a, d) {
	var c = a.cleanData;
	a.cleanData = function(f) {
		for (var g = 0, h;
			(h = f[g]) != null; g++) {
			try {
				a(h).triggerHandler("remove")
			} catch (j) {}
		}
		c(f)
	};
	var b = "__widget__";
	a.widget = function(f, i, e) {
		var h = f.split("."),
			g = h[0],
			k;
		f = h[1];
		k = g + "-" + f;
		if (!e) {
			e = i;
			i = a.Widget
		}
		a.expr[":"][k] = function(l) {
			return !!a.data(l, b + f)
		};
		a[g] = a[g] || {};
		a[g][f] = function(l, m) {
			if (arguments.length) {
				this._createWidget(l, m)
			}
		};
		var j = new i();
		j.options = a.extend(true, {}, j.options);
		a[g][f].prototype = a.extend(true, j, {
			namespace: g,
			widgetName: f,
			widgetEventPrefix: a[g][f].prototype.widgetEventPrefix || f,
			widgetBaseClass: k
		}, e);
		a.widget.bridge(f, a[g][f])
	};
	a.widget.bridge = function(f, e) {
		a.fn[f] = function(i) {
			var g = typeof i === "string",
				h = Array.prototype.slice.call(arguments, 1),
				j = this;
			i = !g && h.length ? a.extend.apply(null, [true, i].concat(h)) : i;
			if (g && i.charAt(0) === "_") {
				return j
			}
			if (g) {
				this.each(function() {
					var k = a.data(this, b + f),
						l = k && a.isFunction(k[i]) ? k[i].apply(k, h) : k;
					if (l !== k && l !== d) {
						j = l;
						return false
					}
				})
			} else {
				this.each(function() {
					var k = a.data(this, b + f);
					if (k) {
						k.option(i || {})._init()
					} else {
						a.data(this, b + f, new e(i, this))
					}
				})
			}
			return j
		}
	};
	a.Widget = function(e, f) {
		if (arguments.length) {
			this._createWidget(e, f)
		}
	};
	a.Widget.prototype = {
		widgetName: "widget",
		widgetEventPrefix: "",
		options: {
			disabled: false
		},
		_createWidget: function(f, g) {
			a.data(g, b + this.widgetName, this);
			this.element = a(g);
			this.options = a.extend(true, {}, this.options, this._getCreateOptions(), f);
			var e = this;
			this.element.bind("remove." + this.widgetName, function() {
				e.destroy()
			});
			this._create();
			this._trigger("create");
			this._init()
		},
		_getCreateOptions: function() {
			return this.element.data(this.widgetName)
		},
		_create: function() {},
		_init: function() {},
		destroy: function() {
			this.element.unbind("." + this.widgetName).removeData(b + this.widgetName);
			this.widget().unbind("." + this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass + "-disabled ui-state-disabled")
		},
		widget: function() {
			return this.element
		},
		option: function(f, g) {
			var e = f;
			if (arguments.length === 0) {
				return a.extend({}, this.options)
			}
			if (typeof f === "string") {
				if (g === d) {
					return this.options[f]
				}
				e = {};
				e[f] = g
			}
			this._setOptions(e);
			return this
		},
		_setOptions: function(f) {
			var e = this;
			a.each(f, function(g, h) {
				e._setOption(g, h)
			});
			return this
		},
		_setOption: function(e, f) {
			this.options[e] = f;
			if (e === "disabled") {
				this.widget()[f ? "addClass" : "removeClass"](this.widgetBaseClass + "-disabled ui-state-disabled").attr("aria-disabled", f)
			}
			return this
		},
		enable: function() {
			return this._setOption("disabled", false)
		},
		disable: function() {
			return this._setOption("disabled", true)
		},
		_trigger: function(e, f, g) {
			var j, i, h = this.options[e];
			g = g || {};
			f = a.Event(f);
			f.type = (e === this.widgetEventPrefix ? e : this.widgetEventPrefix + e).toLowerCase();
			f.target = this.element[0];
			i = f.originalEvent;
			if (i) {
				for (j in i) {
					if (!(j in f)) {
						f[j] = i[j]
					}
				}
			}
			this.element.trigger(f, g);
			return !(a.isFunction(h) && h.call(this.element[0], f, g) === false || f.isDefaultPrevented())
		}
	}
})(jQuery);