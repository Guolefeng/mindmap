var zrender$1 = {};
var zrender = {};
var idStart = 2311;
function _default$f() {
  return idStart++;
}
var guid$1 = _default$f;
var env$6 = {};
if (typeof wx === "object" && typeof wx.getSystemInfoSync === "function") {
  env$6 = {
    browser: {},
    os: {},
    node: false,
    wxa: true,
    // Weixin Application
    canvasSupported: true,
    svgSupported: false,
    touchEventsSupported: true,
    domSupported: false
  };
} else if (typeof document === "undefined" && typeof self !== "undefined") {
  env$6 = {
    browser: {},
    os: {},
    node: false,
    worker: true,
    canvasSupported: true,
    domSupported: false
  };
} else if (typeof navigator === "undefined") {
  env$6 = {
    browser: {},
    os: {},
    node: true,
    worker: false,
    // Assume canvas is supported
    canvasSupported: true,
    svgSupported: true,
    domSupported: false
  };
} else {
  env$6 = detect(navigator.userAgent);
}
var _default$e = env$6;
function detect(ua) {
  var os = {};
  var browser = {};
  var firefox = ua.match(/Firefox\/([\d.]+)/);
  var ie = ua.match(/MSIE\s([\d.]+)/) || ua.match(/Trident\/.+?rv:(([\d.]+))/);
  var edge = ua.match(/Edge\/([\d.]+)/);
  var weChat = /micromessenger/i.test(ua);
  if (firefox) {
    browser.firefox = true;
    browser.version = firefox[1];
  }
  if (ie) {
    browser.ie = true;
    browser.version = ie[1];
  }
  if (edge) {
    browser.edge = true;
    browser.version = edge[1];
  }
  if (weChat) {
    browser.weChat = true;
  }
  return {
    browser,
    os,
    node: false,
    // 原生canvas支持，改极端点了
    // canvasSupported : !(browser.ie && parseFloat(browser.version) < 9)
    canvasSupported: !!document.createElement("canvas").getContext,
    svgSupported: typeof SVGRect !== "undefined",
    // works on most browsers
    // IE10/11 does not support touch event, and MS Edge supports them but not by
    // default, so we dont check navigator.maxTouchPoints for them here.
    touchEventsSupported: "ontouchstart" in window && !browser.ie && !browser.edge,
    // <http://caniuse.com/#search=pointer%20event>.
    pointerEventsSupported: (
      // (1) Firefox supports pointer but not by default, only MS browsers are reliable on pointer
      // events currently. So we dont use that on other browsers unless tested sufficiently.
      // For example, in iOS 13 Mobile Chromium 78, if the touching behavior starts page
      // scroll, the `pointermove` event can not be fired any more. That will break some
      // features like "pan horizontally to move something and pan vertically to page scroll".
      // The horizontal pan probably be interrupted by the casually triggered page scroll.
      // (2) Although IE 10 supports pointer event, it use old style and is different from the
      // standard. So we exclude that. (IE 10 is hardly used on touch device)
      "onpointerdown" in window && (browser.edge || browser.ie && browser.version >= 11)
    ),
    // passiveSupported: detectPassiveSupport()
    domSupported: typeof document !== "undefined"
  };
}
var env_1 = _default$e;
var util$6 = {};
var BUILTIN_OBJECT = {
  "[object Function]": 1,
  "[object RegExp]": 1,
  "[object Date]": 1,
  "[object Error]": 1,
  "[object CanvasGradient]": 1,
  "[object CanvasPattern]": 1,
  // For node-canvas
  "[object Image]": 1,
  "[object Canvas]": 1
};
var TYPED_ARRAY = {
  "[object Int8Array]": 1,
  "[object Uint8Array]": 1,
  "[object Uint8ClampedArray]": 1,
  "[object Int16Array]": 1,
  "[object Uint16Array]": 1,
  "[object Int32Array]": 1,
  "[object Uint32Array]": 1,
  "[object Float32Array]": 1,
  "[object Float64Array]": 1
};
var objToString = Object.prototype.toString;
var arrayProto = Array.prototype;
var nativeForEach = arrayProto.forEach;
var nativeFilter = arrayProto.filter;
var nativeSlice = arrayProto.slice;
var nativeMap = arrayProto.map;
var nativeReduce = arrayProto.reduce;
var methods = {};
function $override(name, fn) {
  if (name === "createCanvas") {
    _ctx = null;
  }
  methods[name] = fn;
}
function clone(source) {
  if (source == null || typeof source !== "object") {
    return source;
  }
  var result = source;
  var typeStr = objToString.call(source);
  if (typeStr === "[object Array]") {
    if (!isPrimitive(source)) {
      result = [];
      for (var i = 0, len = source.length; i < len; i++) {
        result[i] = clone(source[i]);
      }
    }
  } else if (TYPED_ARRAY[typeStr]) {
    if (!isPrimitive(source)) {
      var Ctor = source.constructor;
      if (source.constructor.from) {
        result = Ctor.from(source);
      } else {
        result = new Ctor(source.length);
        for (var i = 0, len = source.length; i < len; i++) {
          result[i] = clone(source[i]);
        }
      }
    }
  } else if (!BUILTIN_OBJECT[typeStr] && !isPrimitive(source) && !isDom(source)) {
    result = {};
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        result[key] = clone(source[key]);
      }
    }
  }
  return result;
}
function merge(target, source, overwrite) {
  if (!isObject(source) || !isObject(target)) {
    return overwrite ? clone(source) : target;
  }
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      var targetProp = target[key];
      var sourceProp = source[key];
      if (isObject(sourceProp) && isObject(targetProp) && !isArray(sourceProp) && !isArray(targetProp) && !isDom(sourceProp) && !isDom(targetProp) && !isBuiltInObject(sourceProp) && !isBuiltInObject(targetProp) && !isPrimitive(sourceProp) && !isPrimitive(targetProp)) {
        merge(targetProp, sourceProp, overwrite);
      } else if (overwrite || !(key in target)) {
        target[key] = clone(source[key]);
      }
    }
  }
  return target;
}
function mergeAll(targetAndSources, overwrite) {
  var result = targetAndSources[0];
  for (var i = 1, len = targetAndSources.length; i < len; i++) {
    result = merge(result, targetAndSources[i], overwrite);
  }
  return result;
}
function extend(target, source) {
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}
function defaults(target, source, overlay) {
  for (var key in source) {
    if (source.hasOwnProperty(key) && (overlay ? source[key] != null : target[key] == null)) {
      target[key] = source[key];
    }
  }
  return target;
}
var createCanvas = function() {
  return methods.createCanvas();
};
methods.createCanvas = function() {
  return document.createElement("canvas");
};
var _ctx;
function getContext() {
  if (!_ctx) {
    _ctx = createCanvas().getContext("2d");
  }
  return _ctx;
}
function indexOf(array, value) {
  if (array) {
    if (array.indexOf) {
      return array.indexOf(value);
    }
    for (var i = 0, len = array.length; i < len; i++) {
      if (array[i] === value) {
        return i;
      }
    }
  }
  return -1;
}
function inherits(clazz, baseClazz) {
  var clazzPrototype = clazz.prototype;
  function F() {
  }
  F.prototype = baseClazz.prototype;
  clazz.prototype = new F();
  for (var prop in clazzPrototype) {
    if (clazzPrototype.hasOwnProperty(prop)) {
      clazz.prototype[prop] = clazzPrototype[prop];
    }
  }
  clazz.prototype.constructor = clazz;
  clazz.superClass = baseClazz;
}
function mixin(target, source, overlay) {
  target = "prototype" in target ? target.prototype : target;
  source = "prototype" in source ? source.prototype : source;
  defaults(target, source, overlay);
}
function isArrayLike$1(data) {
  if (!data) {
    return;
  }
  if (typeof data === "string") {
    return false;
  }
  return typeof data.length === "number";
}
function each(obj, cb, context) {
  if (!(obj && cb)) {
    return;
  }
  if (obj.forEach && obj.forEach === nativeForEach) {
    obj.forEach(cb, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, len = obj.length; i < len; i++) {
      cb.call(context, obj[i], i, obj);
    }
  } else {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cb.call(context, obj[key], key, obj);
      }
    }
  }
}
function map(obj, cb, context) {
  if (!(obj && cb)) {
    return;
  }
  if (obj.map && obj.map === nativeMap) {
    return obj.map(cb, context);
  } else {
    var result = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      result.push(cb.call(context, obj[i], i, obj));
    }
    return result;
  }
}
function reduce(obj, cb, memo, context) {
  if (!(obj && cb)) {
    return;
  }
  if (obj.reduce && obj.reduce === nativeReduce) {
    return obj.reduce(cb, memo, context);
  } else {
    for (var i = 0, len = obj.length; i < len; i++) {
      memo = cb.call(context, memo, obj[i], i, obj);
    }
    return memo;
  }
}
function filter(obj, cb, context) {
  if (!(obj && cb)) {
    return;
  }
  if (obj.filter && obj.filter === nativeFilter) {
    return obj.filter(cb, context);
  } else {
    var result = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      if (cb.call(context, obj[i], i, obj)) {
        result.push(obj[i]);
      }
    }
    return result;
  }
}
function find(obj, cb, context) {
  if (!(obj && cb)) {
    return;
  }
  for (var i = 0, len = obj.length; i < len; i++) {
    if (cb.call(context, obj[i], i, obj)) {
      return obj[i];
    }
  }
}
function bind(func, context) {
  var args = nativeSlice.call(arguments, 2);
  return function() {
    return func.apply(context, args.concat(nativeSlice.call(arguments)));
  };
}
function curry(func) {
  var args = nativeSlice.call(arguments, 1);
  return function() {
    return func.apply(this, args.concat(nativeSlice.call(arguments)));
  };
}
function isArray(value) {
  return objToString.call(value) === "[object Array]";
}
function isFunction(value) {
  return typeof value === "function";
}
function isString(value) {
  return objToString.call(value) === "[object String]";
}
function isObject(value) {
  var type = typeof value;
  return type === "function" || !!value && type === "object";
}
function isBuiltInObject(value) {
  return !!BUILTIN_OBJECT[objToString.call(value)];
}
function isTypedArray(value) {
  return !!TYPED_ARRAY[objToString.call(value)];
}
function isDom(value) {
  return typeof value === "object" && typeof value.nodeType === "number" && typeof value.ownerDocument === "object";
}
function eqNaN(value) {
  return value !== value;
}
function retrieve(values) {
  for (var i = 0, len = arguments.length; i < len; i++) {
    if (arguments[i] != null) {
      return arguments[i];
    }
  }
}
function retrieve2(value0, value1) {
  return value0 != null ? value0 : value1;
}
function retrieve3(value0, value1, value2) {
  return value0 != null ? value0 : value1 != null ? value1 : value2;
}
function slice() {
  return Function.call.apply(nativeSlice, arguments);
}
function normalizeCssArray(val) {
  if (typeof val === "number") {
    return [val, val, val, val];
  }
  var len = val.length;
  if (len === 2) {
    return [val[0], val[1], val[0], val[1]];
  } else if (len === 3) {
    return [val[0], val[1], val[2], val[1]];
  }
  return val;
}
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
function trim(str) {
  if (str == null) {
    return null;
  } else if (typeof str.trim === "function") {
    return str.trim();
  } else {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  }
}
var primitiveKey = "__ec_primitive__";
function setAsPrimitive(obj) {
  obj[primitiveKey] = true;
}
function isPrimitive(obj) {
  return obj[primitiveKey];
}
function HashMap(obj) {
  var isArr = isArray(obj);
  this.data = {};
  var thisMap = this;
  obj instanceof HashMap ? obj.each(visit) : obj && each(obj, visit);
  function visit(value, key) {
    isArr ? thisMap.set(value, key) : thisMap.set(key, value);
  }
}
HashMap.prototype = {
  constructor: HashMap,
  // Do not provide `has` method to avoid defining what is `has`.
  // (We usually treat `null` and `undefined` as the same, different
  // from ES6 Map).
  get: function(key) {
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  },
  set: function(key, value) {
    return this.data[key] = value;
  },
  // Although util.each can be performed on this hashMap directly, user
  // should not use the exposed keys, who are prefixed.
  each: function(cb, context) {
    context !== void 0 && (cb = bind(cb, context));
    for (var key in this.data) {
      this.data.hasOwnProperty(key) && cb(this.data[key], key);
    }
  },
  // Do not use this method if performance sensitive.
  removeKey: function(key) {
    delete this.data[key];
  }
};
function createHashMap(obj) {
  return new HashMap(obj);
}
function concatArray(a, b) {
  var newArray = new a.constructor(a.length + b.length);
  for (var i = 0; i < a.length; i++) {
    newArray[i] = a[i];
  }
  var offset = a.length;
  for (i = 0; i < b.length; i++) {
    newArray[i + offset] = b[i];
  }
  return newArray;
}
function noop() {
}
util$6.$override = $override;
util$6.clone = clone;
util$6.merge = merge;
util$6.mergeAll = mergeAll;
util$6.extend = extend;
util$6.defaults = defaults;
util$6.createCanvas = createCanvas;
util$6.getContext = getContext;
util$6.indexOf = indexOf;
util$6.inherits = inherits;
util$6.mixin = mixin;
util$6.isArrayLike = isArrayLike$1;
util$6.each = each;
util$6.map = map;
util$6.reduce = reduce;
util$6.filter = filter;
util$6.find = find;
util$6.bind = bind;
util$6.curry = curry;
util$6.isArray = isArray;
util$6.isFunction = isFunction;
util$6.isString = isString;
util$6.isObject = isObject;
util$6.isBuiltInObject = isBuiltInObject;
util$6.isTypedArray = isTypedArray;
util$6.isDom = isDom;
util$6.eqNaN = eqNaN;
util$6.retrieve = retrieve;
util$6.retrieve2 = retrieve2;
util$6.retrieve3 = retrieve3;
util$6.slice = slice;
util$6.normalizeCssArray = normalizeCssArray;
util$6.assert = assert;
util$6.trim = trim;
util$6.setAsPrimitive = setAsPrimitive;
util$6.isPrimitive = isPrimitive;
util$6.createHashMap = createHashMap;
util$6.concatArray = concatArray;
util$6.noop = noop;
var vector = {};
var hasRequiredVector;
function requireVector() {
  if (hasRequiredVector) return vector;
  hasRequiredVector = 1;
  var ArrayCtor = typeof Float32Array === "undefined" ? Array : Float32Array;
  function create(x, y) {
    var out = new ArrayCtor(2);
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    out[0] = x;
    out[1] = y;
    return out;
  }
  function copy(out, v) {
    out[0] = v[0];
    out[1] = v[1];
    return out;
  }
  function clone2(v) {
    var out = new ArrayCtor(2);
    out[0] = v[0];
    out[1] = v[1];
    return out;
  }
  function set(out, a, b) {
    out[0] = a;
    out[1] = b;
    return out;
  }
  function add(out, v1, v2) {
    out[0] = v1[0] + v2[0];
    out[1] = v1[1] + v2[1];
    return out;
  }
  function scaleAndAdd(out, v1, v2, a) {
    out[0] = v1[0] + v2[0] * a;
    out[1] = v1[1] + v2[1] * a;
    return out;
  }
  function sub(out, v1, v2) {
    out[0] = v1[0] - v2[0];
    out[1] = v1[1] - v2[1];
    return out;
  }
  function len(v) {
    return Math.sqrt(lenSquare(v));
  }
  var length = len;
  function lenSquare(v) {
    return v[0] * v[0] + v[1] * v[1];
  }
  var lengthSquare = lenSquare;
  function mul(out, v1, v2) {
    out[0] = v1[0] * v2[0];
    out[1] = v1[1] * v2[1];
    return out;
  }
  function div(out, v1, v2) {
    out[0] = v1[0] / v2[0];
    out[1] = v1[1] / v2[1];
    return out;
  }
  function dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
  }
  function scale(out, v, s) {
    out[0] = v[0] * s;
    out[1] = v[1] * s;
    return out;
  }
  function normalize(out, v) {
    var d = len(v);
    if (d === 0) {
      out[0] = 0;
      out[1] = 0;
    } else {
      out[0] = v[0] / d;
      out[1] = v[1] / d;
    }
    return out;
  }
  function distance(v1, v2) {
    return Math.sqrt((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]));
  }
  var dist2 = distance;
  function distanceSquare(v1, v2) {
    return (v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1]);
  }
  var distSquare = distanceSquare;
  function negate(out, v) {
    out[0] = -v[0];
    out[1] = -v[1];
    return out;
  }
  function lerp(out, v1, v2, t) {
    out[0] = v1[0] + t * (v2[0] - v1[0]);
    out[1] = v1[1] + t * (v2[1] - v1[1]);
    return out;
  }
  function applyTransform(out, v, m) {
    var x = v[0];
    var y = v[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
  }
  function min(out, v1, v2) {
    out[0] = Math.min(v1[0], v2[0]);
    out[1] = Math.min(v1[1], v2[1]);
    return out;
  }
  function max(out, v1, v2) {
    out[0] = Math.max(v1[0], v2[0]);
    out[1] = Math.max(v1[1], v2[1]);
    return out;
  }
  vector.create = create;
  vector.copy = copy;
  vector.clone = clone2;
  vector.set = set;
  vector.add = add;
  vector.scaleAndAdd = scaleAndAdd;
  vector.sub = sub;
  vector.len = len;
  vector.length = length;
  vector.lenSquare = lenSquare;
  vector.lengthSquare = lengthSquare;
  vector.mul = mul;
  vector.div = div;
  vector.dot = dot;
  vector.scale = scale;
  vector.normalize = normalize;
  vector.distance = distance;
  vector.dist = dist2;
  vector.distanceSquare = distanceSquare;
  vector.distSquare = distSquare;
  vector.negate = negate;
  vector.lerp = lerp;
  vector.applyTransform = applyTransform;
  vector.min = min;
  vector.max = max;
  return vector;
}
function Draggable$1() {
  this.on("mousedown", this._dragStart, this);
  this.on("mousemove", this._drag, this);
  this.on("mouseup", this._dragEnd, this);
}
Draggable$1.prototype = {
  constructor: Draggable$1,
  _dragStart: function(e) {
    var draggingTarget = e.target;
    while (draggingTarget && !draggingTarget.draggable) {
      draggingTarget = draggingTarget.parent;
    }
    if (draggingTarget) {
      this._draggingTarget = draggingTarget;
      draggingTarget.dragging = true;
      this._x = e.offsetX;
      this._y = e.offsetY;
      this.dispatchToElement(param(draggingTarget, e), "dragstart", e.event);
    }
  },
  _drag: function(e) {
    var draggingTarget = this._draggingTarget;
    if (draggingTarget) {
      var x = e.offsetX;
      var y = e.offsetY;
      var dx = x - this._x;
      var dy = y - this._y;
      this._x = x;
      this._y = y;
      draggingTarget.drift(dx, dy, e);
      this.dispatchToElement(param(draggingTarget, e), "drag", e.event);
      var dropTarget = this.findHover(x, y, draggingTarget).target;
      var lastDropTarget = this._dropTarget;
      this._dropTarget = dropTarget;
      if (draggingTarget !== dropTarget) {
        if (lastDropTarget && dropTarget !== lastDropTarget) {
          this.dispatchToElement(param(lastDropTarget, e), "dragleave", e.event);
        }
        if (dropTarget && dropTarget !== lastDropTarget) {
          this.dispatchToElement(param(dropTarget, e), "dragenter", e.event);
        }
      }
    }
  },
  _dragEnd: function(e) {
    var draggingTarget = this._draggingTarget;
    if (draggingTarget) {
      draggingTarget.dragging = false;
    }
    this.dispatchToElement(param(draggingTarget, e), "dragend", e.event);
    if (this._dropTarget) {
      this.dispatchToElement(param(this._dropTarget, e), "drop", e.event);
    }
    this._draggingTarget = null;
    this._dropTarget = null;
  }
};
function param(target, e) {
  return {
    target,
    topTarget: e && e.topTarget
  };
}
var _default$d = Draggable$1;
var Draggable_1 = _default$d;
var arrySlice = Array.prototype.slice;
var Eventful$3 = function(eventProcessor) {
  this._$handlers = {};
  this._$eventProcessor = eventProcessor;
};
Eventful$3.prototype = {
  constructor: Eventful$3,
  /**
   * The handler can only be triggered once, then removed.
   *
   * @param {string} event The event name.
   * @param {string|Object} [query] Condition used on event filter.
   * @param {Function} handler The event handler.
   * @param {Object} context
   */
  one: function(event2, query, handler, context) {
    return on(this, event2, query, handler, context, true);
  },
  /**
   * Bind a handler.
   *
   * @param {string} event The event name.
   * @param {string|Object} [query] Condition used on event filter.
   * @param {Function} handler The event handler.
   * @param {Object} [context]
   */
  on: function(event2, query, handler, context) {
    return on(this, event2, query, handler, context, false);
  },
  /**
   * Whether any handler has bound.
   *
   * @param  {string}  event
   * @return {boolean}
   */
  isSilent: function(event2) {
    var _h = this._$handlers;
    return !_h[event2] || !_h[event2].length;
  },
  /**
   * Unbind a event.
   *
   * @param {string} [event] The event name.
   *        If no `event` input, "off" all listeners.
   * @param {Function} [handler] The event handler.
   *        If no `handler` input, "off" all listeners of the `event`.
   */
  off: function(event2, handler) {
    var _h = this._$handlers;
    if (!event2) {
      this._$handlers = {};
      return this;
    }
    if (handler) {
      if (_h[event2]) {
        var newList = [];
        for (var i = 0, l = _h[event2].length; i < l; i++) {
          if (_h[event2][i].h !== handler) {
            newList.push(_h[event2][i]);
          }
        }
        _h[event2] = newList;
      }
      if (_h[event2] && _h[event2].length === 0) {
        delete _h[event2];
      }
    } else {
      delete _h[event2];
    }
    return this;
  },
  /**
   * Dispatch a event.
   *
   * @param {string} type The event name.
   */
  trigger: function(type) {
    var _h = this._$handlers[type];
    var eventProcessor = this._$eventProcessor;
    if (_h) {
      var args = arguments;
      var argLen = args.length;
      if (argLen > 3) {
        args = arrySlice.call(args, 1);
      }
      var len = _h.length;
      for (var i = 0; i < len; ) {
        var hItem = _h[i];
        if (eventProcessor && eventProcessor.filter && hItem.query != null && !eventProcessor.filter(type, hItem.query)) {
          i++;
          continue;
        }
        switch (argLen) {
          case 1:
            hItem.h.call(hItem.ctx);
            break;
          case 2:
            hItem.h.call(hItem.ctx, args[1]);
            break;
          case 3:
            hItem.h.call(hItem.ctx, args[1], args[2]);
            break;
          default:
            hItem.h.apply(hItem.ctx, args);
            break;
        }
        if (hItem.one) {
          _h.splice(i, 1);
          len--;
        } else {
          i++;
        }
      }
    }
    eventProcessor && eventProcessor.afterTrigger && eventProcessor.afterTrigger(type);
    return this;
  },
  /**
   * Dispatch a event with context, which is specified at the last parameter.
   *
   * @param {string} type The event name.
   */
  triggerWithContext: function(type) {
    var _h = this._$handlers[type];
    var eventProcessor = this._$eventProcessor;
    if (_h) {
      var args = arguments;
      var argLen = args.length;
      if (argLen > 4) {
        args = arrySlice.call(args, 1, args.length - 1);
      }
      var ctx = args[args.length - 1];
      var len = _h.length;
      for (var i = 0; i < len; ) {
        var hItem = _h[i];
        if (eventProcessor && eventProcessor.filter && hItem.query != null && !eventProcessor.filter(type, hItem.query)) {
          i++;
          continue;
        }
        switch (argLen) {
          case 1:
            hItem.h.call(ctx);
            break;
          case 2:
            hItem.h.call(ctx, args[1]);
            break;
          case 3:
            hItem.h.call(ctx, args[1], args[2]);
            break;
          default:
            hItem.h.apply(ctx, args);
            break;
        }
        if (hItem.one) {
          _h.splice(i, 1);
          len--;
        } else {
          i++;
        }
      }
    }
    eventProcessor && eventProcessor.afterTrigger && eventProcessor.afterTrigger(type);
    return this;
  }
};
function normalizeQuery(host, query) {
  var eventProcessor = host._$eventProcessor;
  if (query != null && eventProcessor && eventProcessor.normalizeQuery) {
    query = eventProcessor.normalizeQuery(query);
  }
  return query;
}
function on(eventful, event2, query, handler, context, isOnce) {
  var _h = eventful._$handlers;
  if (typeof query === "function") {
    context = handler;
    handler = query;
    query = null;
  }
  if (!handler || !event2) {
    return eventful;
  }
  query = normalizeQuery(eventful, query);
  if (!_h[event2]) {
    _h[event2] = [];
  }
  for (var i = 0; i < _h[event2].length; i++) {
    if (_h[event2][i].h === handler) {
      return eventful;
    }
  }
  var wrap = {
    h: handler,
    one: isOnce,
    query,
    ctx: context || eventful,
    // FIXME
    // Do not publish this feature util it is proved that it makes sense.
    callAtLast: handler.zrEventfulCallAtLast
  };
  var lastIndex = _h[event2].length - 1;
  var lastWrap = _h[event2][lastIndex];
  lastWrap && lastWrap.callAtLast ? _h[event2].splice(lastIndex, 0, wrap) : _h[event2].push(wrap);
  return eventful;
}
var _default$c = Eventful$3;
var Eventful_1 = _default$c;
var event = {};
var dom = {};
var fourPointsTransform = {};
var LN2 = Math.log(2);
function determinant(rows, rank, rowStart, rowMask, colMask, detCache) {
  var cacheKey = rowMask + "-" + colMask;
  var fullRank = rows.length;
  if (detCache.hasOwnProperty(cacheKey)) {
    return detCache[cacheKey];
  }
  if (rank === 1) {
    var colStart = Math.round(Math.log((1 << fullRank) - 1 & ~colMask) / LN2);
    return rows[rowStart][colStart];
  }
  var subRowMask = rowMask | 1 << rowStart;
  var subRowStart = rowStart + 1;
  while (rowMask & 1 << subRowStart) {
    subRowStart++;
  }
  var sum = 0;
  for (var j = 0, colLocalIdx = 0; j < fullRank; j++) {
    var colTag = 1 << j;
    if (!(colTag & colMask)) {
      sum += (colLocalIdx % 2 ? -1 : 1) * rows[rowStart][j] * determinant(rows, rank - 1, subRowStart, subRowMask, colMask | colTag, detCache);
      colLocalIdx++;
    }
  }
  detCache[cacheKey] = sum;
  return sum;
}
function buildTransformer$1(src, dest) {
  var mA = [[src[0], src[1], 1, 0, 0, 0, -dest[0] * src[0], -dest[0] * src[1]], [0, 0, 0, src[0], src[1], 1, -dest[1] * src[0], -dest[1] * src[1]], [src[2], src[3], 1, 0, 0, 0, -dest[2] * src[2], -dest[2] * src[3]], [0, 0, 0, src[2], src[3], 1, -dest[3] * src[2], -dest[3] * src[3]], [src[4], src[5], 1, 0, 0, 0, -dest[4] * src[4], -dest[4] * src[5]], [0, 0, 0, src[4], src[5], 1, -dest[5] * src[4], -dest[5] * src[5]], [src[6], src[7], 1, 0, 0, 0, -dest[6] * src[6], -dest[6] * src[7]], [0, 0, 0, src[6], src[7], 1, -dest[7] * src[6], -dest[7] * src[7]]];
  var detCache = {};
  var det = determinant(mA, 8, 0, 0, 0, detCache);
  if (det === 0) {
    return;
  }
  var vh = [];
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      vh[j] == null && (vh[j] = 0);
      vh[j] += ((i + j) % 2 ? -1 : 1) * // det(subMatrix(i, j))
      determinant(mA, 7, i === 0 ? 1 : 0, 1 << i, 1 << j, detCache) / det * dest[i];
    }
  }
  return function(out, srcPointX, srcPointY) {
    var pk = srcPointX * vh[6] + srcPointY * vh[7] + 1;
    out[0] = (srcPointX * vh[0] + srcPointY * vh[1] + vh[2]) / pk;
    out[1] = (srcPointX * vh[3] + srcPointY * vh[4] + vh[5]) / pk;
  };
}
fourPointsTransform.buildTransformer = buildTransformer$1;
var env$5 = env_1;
var _fourPointsTransform = fourPointsTransform;
var buildTransformer = _fourPointsTransform.buildTransformer;
var EVENT_SAVED_PROP = "___zrEVENTSAVED";
var _calcOut$1 = [];
function transformLocalCoord(out, elFrom, elTarget, inX, inY) {
  return transformCoordWithViewport$1(_calcOut$1, elFrom, inX, inY, true) && transformCoordWithViewport$1(out, elTarget, _calcOut$1[0], _calcOut$1[1]);
}
function transformCoordWithViewport$1(out, el, inX, inY, inverse) {
  if (el.getBoundingClientRect && env$5.domSupported && !isCanvasEl$1(el)) {
    var saved = el[EVENT_SAVED_PROP] || (el[EVENT_SAVED_PROP] = {});
    var markers = prepareCoordMarkers(el, saved);
    var transformer = preparePointerTransformer(markers, saved, inverse);
    if (transformer) {
      transformer(out, inX, inY);
      return true;
    }
  }
  return false;
}
function prepareCoordMarkers(el, saved) {
  var markers = saved.markers;
  if (markers) {
    return markers;
  }
  markers = saved.markers = [];
  var propLR = ["left", "right"];
  var propTB = ["top", "bottom"];
  for (var i = 0; i < 4; i++) {
    var marker = document.createElement("div");
    var stl = marker.style;
    var idxLR = i % 2;
    var idxTB = (i >> 1) % 2;
    stl.cssText = [
      "position: absolute",
      "visibility: hidden",
      "padding: 0",
      "margin: 0",
      "border-width: 0",
      "user-select: none",
      "width:0",
      "height:0",
      // 'width: 5px',
      // 'height: 5px',
      propLR[idxLR] + ":0",
      propTB[idxTB] + ":0",
      propLR[1 - idxLR] + ":auto",
      propTB[1 - idxTB] + ":auto",
      ""
    ].join("!important;");
    el.appendChild(marker);
    markers.push(marker);
  }
  return markers;
}
function preparePointerTransformer(markers, saved, inverse) {
  var transformerName = inverse ? "invTrans" : "trans";
  var transformer = saved[transformerName];
  var oldSrcCoords = saved.srcCoords;
  var oldCoordTheSame = true;
  var srcCoords = [];
  var destCoords = [];
  for (var i = 0; i < 4; i++) {
    var rect = markers[i].getBoundingClientRect();
    var ii = 2 * i;
    var x = rect.left;
    var y = rect.top;
    srcCoords.push(x, y);
    oldCoordTheSame = oldCoordTheSame && oldSrcCoords && x === oldSrcCoords[ii] && y === oldSrcCoords[ii + 1];
    destCoords.push(markers[i].offsetLeft, markers[i].offsetTop);
  }
  return oldCoordTheSame && transformer ? transformer : (saved.srcCoords = srcCoords, saved[transformerName] = inverse ? buildTransformer(destCoords, srcCoords) : buildTransformer(srcCoords, destCoords));
}
function isCanvasEl$1(el) {
  return el.nodeName.toUpperCase() === "CANVAS";
}
dom.transformLocalCoord = transformLocalCoord;
dom.transformCoordWithViewport = transformCoordWithViewport$1;
dom.isCanvasEl = isCanvasEl$1;
var Eventful$2 = Eventful_1;
event.Dispatcher = Eventful$2;
var env$4 = env_1;
var _dom = dom;
var isCanvasEl = _dom.isCanvasEl;
var transformCoordWithViewport = _dom.transformCoordWithViewport;
var isDomLevel2 = typeof window !== "undefined" && !!window.addEventListener;
var MOUSE_EVENT_REG = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;
var _calcOut = [];
function clientToLocal(el, e, out, calculate) {
  out = out || {};
  if (calculate || !env$4.canvasSupported) {
    calculateZrXY(el, e, out);
  } else if (env$4.browser.firefox && e.layerX != null && e.layerX !== e.offsetX) {
    out.zrX = e.layerX;
    out.zrY = e.layerY;
  } else if (e.offsetX != null) {
    out.zrX = e.offsetX;
    out.zrY = e.offsetY;
  } else {
    calculateZrXY(el, e, out);
  }
  return out;
}
function calculateZrXY(el, e, out) {
  if (env$4.domSupported && el.getBoundingClientRect) {
    var ex = e.clientX;
    var ey = e.clientY;
    if (isCanvasEl(el)) {
      var box = el.getBoundingClientRect();
      out.zrX = ex - box.left;
      out.zrY = ey - box.top;
      return;
    } else {
      if (transformCoordWithViewport(_calcOut, el, ex, ey)) {
        out.zrX = _calcOut[0];
        out.zrY = _calcOut[1];
        return;
      }
    }
  }
  out.zrX = out.zrY = 0;
}
function getNativeEvent$1(e) {
  return e || window.event;
}
function normalizeEvent$1(el, e, calculate) {
  e = getNativeEvent$1(e);
  if (e.zrX != null) {
    return e;
  }
  var eventType = e.type;
  var isTouch = eventType && eventType.indexOf("touch") >= 0;
  if (!isTouch) {
    clientToLocal(el, e, e, calculate);
    e.zrDelta = e.wheelDelta ? e.wheelDelta / 120 : -(e.detail || 0) / 3;
  } else {
    var touch = eventType !== "touchend" ? e.targetTouches[0] : e.changedTouches[0];
    touch && clientToLocal(el, touch, e, calculate);
  }
  var button = e.button;
  if (e.which == null && button !== void 0 && MOUSE_EVENT_REG.test(e.type)) {
    e.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
  }
  return e;
}
function addEventListener$1(el, name, handler, opt) {
  if (isDomLevel2) {
    el.addEventListener(name, handler, opt);
  } else {
    el.attachEvent("on" + name, handler);
  }
}
function removeEventListener$1(el, name, handler, opt) {
  if (isDomLevel2) {
    el.removeEventListener(name, handler, opt);
  } else {
    el.detachEvent("on" + name, handler);
  }
}
var stop = isDomLevel2 ? function(e) {
  e.preventDefault();
  e.stopPropagation();
  e.cancelBubble = true;
} : function(e) {
  e.returnValue = false;
  e.cancelBubble = true;
};
function isMiddleOrRightButtonOnMouseUpDown(e) {
  return e.which === 2 || e.which === 3;
}
function notLeftMouse(e) {
  return e.which > 1;
}
event.clientToLocal = clientToLocal;
event.getNativeEvent = getNativeEvent$1;
event.normalizeEvent = normalizeEvent$1;
event.addEventListener = addEventListener$1;
event.removeEventListener = removeEventListener$1;
event.stop = stop;
event.isMiddleOrRightButtonOnMouseUpDown = isMiddleOrRightButtonOnMouseUpDown;
event.notLeftMouse = notLeftMouse;
var eventUtil = event;
var GestureMgr$1 = function() {
  this._track = [];
};
GestureMgr$1.prototype = {
  constructor: GestureMgr$1,
  recognize: function(event2, target, root) {
    this._doTrack(event2, target, root);
    return this._recognize(event2);
  },
  clear: function() {
    this._track.length = 0;
    return this;
  },
  _doTrack: function(event2, target, root) {
    var touches = event2.touches;
    if (!touches) {
      return;
    }
    var trackItem = {
      points: [],
      touches: [],
      target,
      event: event2
    };
    for (var i = 0, len = touches.length; i < len; i++) {
      var touch = touches[i];
      var pos = eventUtil.clientToLocal(root, touch, {});
      trackItem.points.push([pos.zrX, pos.zrY]);
      trackItem.touches.push(touch);
    }
    this._track.push(trackItem);
  },
  _recognize: function(event2) {
    for (var eventName in recognizers) {
      if (recognizers.hasOwnProperty(eventName)) {
        var gestureInfo = recognizers[eventName](this._track, event2);
        if (gestureInfo) {
          return gestureInfo;
        }
      }
    }
  }
};
function dist(pointPair) {
  var dx = pointPair[1][0] - pointPair[0][0];
  var dy = pointPair[1][1] - pointPair[0][1];
  return Math.sqrt(dx * dx + dy * dy);
}
function center(pointPair) {
  return [(pointPair[0][0] + pointPair[1][0]) / 2, (pointPair[0][1] + pointPair[1][1]) / 2];
}
var recognizers = {
  pinch: function(track, event2) {
    var trackLen = track.length;
    if (!trackLen) {
      return;
    }
    var pinchEnd = (track[trackLen - 1] || {}).points;
    var pinchPre = (track[trackLen - 2] || {}).points || pinchEnd;
    if (pinchPre && pinchPre.length > 1 && pinchEnd && pinchEnd.length > 1) {
      var pinchScale = dist(pinchEnd) / dist(pinchPre);
      !isFinite(pinchScale) && (pinchScale = 1);
      event2.pinchScale = pinchScale;
      var pinchCenter = center(pinchEnd);
      event2.pinchX = pinchCenter[0];
      event2.pinchY = pinchCenter[1];
      return {
        type: "pinch",
        target: track[0].target,
        event: event2
      };
    }
  }
  // Only pinch currently.
};
var _default$b = GestureMgr$1;
var GestureMgr_1 = _default$b;
var util$5 = util$6;
var vec2 = requireVector();
var Draggable = Draggable_1;
var Eventful$1 = Eventful_1;
var eventTool = event;
var GestureMgr = GestureMgr_1;
var SILENT = "silent";
function makeEventPacket(eveType, targetInfo, event2) {
  return {
    type: eveType,
    event: event2,
    // target can only be an element that is not silent.
    target: targetInfo.target,
    // topTarget can be a silent element.
    topTarget: targetInfo.topTarget,
    cancelBubble: false,
    offsetX: event2.zrX,
    offsetY: event2.zrY,
    gestureEvent: event2.gestureEvent,
    pinchX: event2.pinchX,
    pinchY: event2.pinchY,
    pinchScale: event2.pinchScale,
    wheelDelta: event2.zrDelta,
    zrByTouch: event2.zrByTouch,
    which: event2.which,
    stop: stopEvent
  };
}
function stopEvent() {
  eventTool.stop(this.event);
}
function EmptyProxy() {
}
EmptyProxy.prototype.dispose = function() {
};
var handlerNames = ["click", "dblclick", "mousewheel", "mouseout", "mouseup", "mousedown", "mousemove", "contextmenu"];
var Handler$1 = function(storage, painter, proxy, painterRoot) {
  Eventful$1.call(this);
  this.storage = storage;
  this.painter = painter;
  this.painterRoot = painterRoot;
  proxy = proxy || new EmptyProxy();
  this.proxy = null;
  this._hovered = {};
  this._lastTouchMoment;
  this._lastX;
  this._lastY;
  this._gestureMgr;
  Draggable.call(this);
  this.setHandlerProxy(proxy);
};
Handler$1.prototype = {
  constructor: Handler$1,
  setHandlerProxy: function(proxy) {
    if (this.proxy) {
      this.proxy.dispose();
    }
    if (proxy) {
      util$5.each(handlerNames, function(name) {
        proxy.on && proxy.on(name, this[name], this);
      }, this);
      proxy.handler = this;
    }
    this.proxy = proxy;
  },
  mousemove: function(event2) {
    var x = event2.zrX;
    var y = event2.zrY;
    var isOutside = isOutsideBoundary(this, x, y);
    var lastHovered = this._hovered;
    var lastHoveredTarget = lastHovered.target;
    if (lastHoveredTarget && !lastHoveredTarget.__zr) {
      lastHovered = this.findHover(lastHovered.x, lastHovered.y);
      lastHoveredTarget = lastHovered.target;
    }
    var hovered = this._hovered = isOutside ? {
      x,
      y
    } : this.findHover(x, y);
    var hoveredTarget = hovered.target;
    var proxy = this.proxy;
    proxy.setCursor && proxy.setCursor(hoveredTarget ? hoveredTarget.cursor : "default");
    if (lastHoveredTarget && hoveredTarget !== lastHoveredTarget) {
      this.dispatchToElement(lastHovered, "mouseout", event2);
    }
    this.dispatchToElement(hovered, "mousemove", event2);
    if (hoveredTarget && hoveredTarget !== lastHoveredTarget) {
      this.dispatchToElement(hovered, "mouseover", event2);
    }
  },
  mouseout: function(event2) {
    var eventControl = event2.zrEventControl;
    var zrIsToLocalDOM = event2.zrIsToLocalDOM;
    if (eventControl !== "only_globalout") {
      this.dispatchToElement(this._hovered, "mouseout", event2);
    }
    if (eventControl !== "no_globalout") {
      !zrIsToLocalDOM && this.trigger("globalout", {
        type: "globalout",
        event: event2
      });
    }
  },
  /**
   * Resize
   */
  resize: function(event2) {
    this._hovered = {};
  },
  /**
   * Dispatch event
   * @param {string} eventName
   * @param {event=} eventArgs
   */
  dispatch: function(eventName, eventArgs) {
    var handler = this[eventName];
    handler && handler.call(this, eventArgs);
  },
  /**
   * Dispose
   */
  dispose: function() {
    this.proxy.dispose();
    this.storage = this.proxy = this.painter = null;
  },
  /**
   * 设置默认的cursor style
   * @param {string} [cursorStyle='default'] 例如 crosshair
   */
  setCursorStyle: function(cursorStyle) {
    var proxy = this.proxy;
    proxy.setCursor && proxy.setCursor(cursorStyle);
  },
  /**
   * 事件分发代理
   *
   * @private
   * @param {Object} targetInfo {target, topTarget} 目标图形元素
   * @param {string} eventName 事件名称
   * @param {Object} event 事件对象
   */
  dispatchToElement: function(targetInfo, eventName, event2) {
    targetInfo = targetInfo || {};
    var el = targetInfo.target;
    if (el && el.silent) {
      return;
    }
    var eventHandler = "on" + eventName;
    var eventPacket = makeEventPacket(eventName, targetInfo, event2);
    while (el) {
      el[eventHandler] && (eventPacket.cancelBubble = el[eventHandler].call(el, eventPacket));
      el.trigger(eventName, eventPacket);
      el = el.parent;
      if (eventPacket.cancelBubble) {
        break;
      }
    }
    if (!eventPacket.cancelBubble) {
      this.trigger(eventName, eventPacket);
      this.painter && this.painter.eachOtherLayer(function(layer) {
        if (typeof layer[eventHandler] === "function") {
          layer[eventHandler].call(layer, eventPacket);
        }
        if (layer.trigger) {
          layer.trigger(eventName, eventPacket);
        }
      });
    }
  },
  /**
   * @private
   * @param {number} x
   * @param {number} y
   * @param {module:zrender/graphic/Displayable} exclude
   * @return {model:zrender/Element}
   * @method
   */
  findHover: function(x, y, exclude) {
    var list = this.storage.getDisplayList();
    var out = {
      x,
      y
    };
    for (var i = list.length - 1; i >= 0; i--) {
      var hoverCheckResult;
      if (list[i] !== exclude && !list[i].ignore && (hoverCheckResult = isHover(list[i], x, y))) {
        !out.topTarget && (out.topTarget = list[i]);
        if (hoverCheckResult !== SILENT) {
          out.target = list[i];
          break;
        }
      }
    }
    return out;
  },
  processGesture: function(event2, stage) {
    if (!this._gestureMgr) {
      this._gestureMgr = new GestureMgr();
    }
    var gestureMgr = this._gestureMgr;
    stage === "start" && gestureMgr.clear();
    var gestureInfo = gestureMgr.recognize(event2, this.findHover(event2.zrX, event2.zrY, null).target, this.proxy.dom);
    stage === "end" && gestureMgr.clear();
    if (gestureInfo) {
      var type = gestureInfo.type;
      event2.gestureEvent = type;
      this.dispatchToElement({
        target: gestureInfo.target
      }, type, gestureInfo.event);
    }
  }
};
util$5.each(["click", "mousedown", "mouseup", "mousewheel", "dblclick", "contextmenu"], function(name) {
  Handler$1.prototype[name] = function(event2) {
    var x = event2.zrX;
    var y = event2.zrY;
    var isOutside = isOutsideBoundary(this, x, y);
    var hovered;
    var hoveredTarget;
    if (name !== "mouseup" || !isOutside) {
      hovered = this.findHover(x, y);
      hoveredTarget = hovered.target;
    }
    if (name === "mousedown") {
      this._downEl = hoveredTarget;
      this._downPoint = [event2.zrX, event2.zrY];
      this._upEl = hoveredTarget;
    } else if (name === "mouseup") {
      this._upEl = hoveredTarget;
    } else if (name === "click") {
      if (this._downEl !== this._upEl || !this._downPoint || vec2.dist(this._downPoint, [event2.zrX, event2.zrY]) > 4) {
        return;
      }
      this._downPoint = null;
    }
    this.dispatchToElement(hovered, name, event2);
  };
});
function isHover(displayable, x, y) {
  if (displayable[displayable.rectHover ? "rectContain" : "contain"](x, y)) {
    var el = displayable;
    var isSilent;
    while (el) {
      if (el.clipPath && !el.clipPath.contain(x, y)) {
        return false;
      }
      if (el.silent) {
        isSilent = true;
      }
      el = el.parent;
    }
    return isSilent ? SILENT : true;
  }
  return false;
}
function isOutsideBoundary(handlerInstance, x, y) {
  var painter = handlerInstance.painter;
  return x < 0 || x > painter.getWidth() || y < 0 || y > painter.getHeight();
}
util$5.mixin(Handler$1, Eventful$1);
util$5.mixin(Handler$1, Draggable);
var _default$a = Handler$1;
var Handler_1 = _default$a;
var matrix = {};
var hasRequiredMatrix;
function requireMatrix() {
  if (hasRequiredMatrix) return matrix;
  hasRequiredMatrix = 1;
  var ArrayCtor = typeof Float32Array === "undefined" ? Array : Float32Array;
  function create() {
    var out = new ArrayCtor(6);
    identity(out);
    return out;
  }
  function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
  }
  function copy(out, m) {
    out[0] = m[0];
    out[1] = m[1];
    out[2] = m[2];
    out[3] = m[3];
    out[4] = m[4];
    out[5] = m[5];
    return out;
  }
  function mul(out, m1, m2) {
    var out0 = m1[0] * m2[0] + m1[2] * m2[1];
    var out1 = m1[1] * m2[0] + m1[3] * m2[1];
    var out2 = m1[0] * m2[2] + m1[2] * m2[3];
    var out3 = m1[1] * m2[2] + m1[3] * m2[3];
    var out4 = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    var out5 = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];
    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = out3;
    out[4] = out4;
    out[5] = out5;
    return out;
  }
  function translate(out, a, v) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4] + v[0];
    out[5] = a[5] + v[1];
    return out;
  }
  function rotate(out, a, rad) {
    var aa = a[0];
    var ac = a[2];
    var atx = a[4];
    var ab = a[1];
    var ad = a[3];
    var aty = a[5];
    var st = Math.sin(rad);
    var ct = Math.cos(rad);
    out[0] = aa * ct + ab * st;
    out[1] = -aa * st + ab * ct;
    out[2] = ac * ct + ad * st;
    out[3] = -ac * st + ct * ad;
    out[4] = ct * atx + st * aty;
    out[5] = ct * aty - st * atx;
    return out;
  }
  function scale(out, a, v) {
    var vx = v[0];
    var vy = v[1];
    out[0] = a[0] * vx;
    out[1] = a[1] * vy;
    out[2] = a[2] * vx;
    out[3] = a[3] * vy;
    out[4] = a[4] * vx;
    out[5] = a[5] * vy;
    return out;
  }
  function invert(out, a) {
    var aa = a[0];
    var ac = a[2];
    var atx = a[4];
    var ab = a[1];
    var ad = a[3];
    var aty = a[5];
    var det = aa * ad - ab * ac;
    if (!det) {
      return null;
    }
    det = 1 / det;
    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
  }
  function clone2(a) {
    var b = create();
    copy(b, a);
    return b;
  }
  matrix.create = create;
  matrix.identity = identity;
  matrix.copy = copy;
  matrix.mul = mul;
  matrix.translate = translate;
  matrix.rotate = rotate;
  matrix.scale = scale;
  matrix.invert = invert;
  matrix.clone = clone2;
  return matrix;
}
var Transformable_1;
var hasRequiredTransformable;
function requireTransformable() {
  if (hasRequiredTransformable) return Transformable_1;
  hasRequiredTransformable = 1;
  var matrix2 = requireMatrix();
  var vector2 = requireVector();
  var mIdentity = matrix2.identity;
  var EPSILON = 5e-5;
  function isNotAroundZero(val) {
    return val > EPSILON || val < -EPSILON;
  }
  var Transformable = function(opts) {
    opts = opts || {};
    if (!opts.position) {
      this.position = [0, 0];
    }
    if (opts.rotation == null) {
      this.rotation = 0;
    }
    if (!opts.scale) {
      this.scale = [1, 1];
    }
    this.origin = this.origin || null;
  };
  var transformableProto = Transformable.prototype;
  transformableProto.transform = null;
  transformableProto.needLocalTransform = function() {
    return isNotAroundZero(this.rotation) || isNotAroundZero(this.position[0]) || isNotAroundZero(this.position[1]) || isNotAroundZero(this.scale[0] - 1) || isNotAroundZero(this.scale[1] - 1);
  };
  var scaleTmp = [];
  transformableProto.updateTransform = function() {
    var parent = this.parent;
    var parentHasTransform = parent && parent.transform;
    var needLocalTransform = this.needLocalTransform();
    var m = this.transform;
    if (!(needLocalTransform || parentHasTransform)) {
      m && mIdentity(m);
      return;
    }
    m = m || matrix2.create();
    if (needLocalTransform) {
      this.getLocalTransform(m);
    } else {
      mIdentity(m);
    }
    if (parentHasTransform) {
      if (needLocalTransform) {
        matrix2.mul(m, parent.transform, m);
      } else {
        matrix2.copy(m, parent.transform);
      }
    }
    this.transform = m;
    var globalScaleRatio = this.globalScaleRatio;
    if (globalScaleRatio != null && globalScaleRatio !== 1) {
      this.getGlobalScale(scaleTmp);
      var relX = scaleTmp[0] < 0 ? -1 : 1;
      var relY = scaleTmp[1] < 0 ? -1 : 1;
      var sx = ((scaleTmp[0] - relX) * globalScaleRatio + relX) / scaleTmp[0] || 0;
      var sy = ((scaleTmp[1] - relY) * globalScaleRatio + relY) / scaleTmp[1] || 0;
      m[0] *= sx;
      m[1] *= sx;
      m[2] *= sy;
      m[3] *= sy;
    }
    this.invTransform = this.invTransform || matrix2.create();
    matrix2.invert(this.invTransform, m);
  };
  transformableProto.getLocalTransform = function(m) {
    return Transformable.getLocalTransform(this, m);
  };
  transformableProto.setTransform = function(ctx) {
    var m = this.transform;
    var dpr2 = ctx.dpr || 1;
    if (m) {
      ctx.setTransform(dpr2 * m[0], dpr2 * m[1], dpr2 * m[2], dpr2 * m[3], dpr2 * m[4], dpr2 * m[5]);
    } else {
      ctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
    }
  };
  transformableProto.restoreTransform = function(ctx) {
    var dpr2 = ctx.dpr || 1;
    ctx.setTransform(dpr2, 0, 0, dpr2, 0, 0);
  };
  var tmpTransform = [];
  var originTransform = matrix2.create();
  transformableProto.setLocalTransform = function(m) {
    if (!m) {
      return;
    }
    var sx = m[0] * m[0] + m[1] * m[1];
    var sy = m[2] * m[2] + m[3] * m[3];
    var position = this.position;
    var scale = this.scale;
    if (isNotAroundZero(sx - 1)) {
      sx = Math.sqrt(sx);
    }
    if (isNotAroundZero(sy - 1)) {
      sy = Math.sqrt(sy);
    }
    if (m[0] < 0) {
      sx = -sx;
    }
    if (m[3] < 0) {
      sy = -sy;
    }
    position[0] = m[4];
    position[1] = m[5];
    scale[0] = sx;
    scale[1] = sy;
    this.rotation = Math.atan2(-m[1] / sy, m[0] / sx);
  };
  transformableProto.decomposeTransform = function() {
    if (!this.transform) {
      return;
    }
    var parent = this.parent;
    var m = this.transform;
    if (parent && parent.transform) {
      matrix2.mul(tmpTransform, parent.invTransform, m);
      m = tmpTransform;
    }
    var origin = this.origin;
    if (origin && (origin[0] || origin[1])) {
      originTransform[4] = origin[0];
      originTransform[5] = origin[1];
      matrix2.mul(tmpTransform, m, originTransform);
      tmpTransform[4] -= origin[0];
      tmpTransform[5] -= origin[1];
      m = tmpTransform;
    }
    this.setLocalTransform(m);
  };
  transformableProto.getGlobalScale = function(out) {
    var m = this.transform;
    out = out || [];
    if (!m) {
      out[0] = 1;
      out[1] = 1;
      return out;
    }
    out[0] = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
    out[1] = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
    if (m[0] < 0) {
      out[0] = -out[0];
    }
    if (m[3] < 0) {
      out[1] = -out[1];
    }
    return out;
  };
  transformableProto.transformCoordToLocal = function(x, y) {
    var v2 = [x, y];
    var invTransform = this.invTransform;
    if (invTransform) {
      vector2.applyTransform(v2, v2, invTransform);
    }
    return v2;
  };
  transformableProto.transformCoordToGlobal = function(x, y) {
    var v2 = [x, y];
    var transform = this.transform;
    if (transform) {
      vector2.applyTransform(v2, v2, transform);
    }
    return v2;
  };
  Transformable.getLocalTransform = function(target, m) {
    m = m || [];
    mIdentity(m);
    var origin = target.origin;
    var scale = target.scale || [1, 1];
    var rotation = target.rotation || 0;
    var position = target.position || [0, 0];
    if (origin) {
      m[4] -= origin[0];
      m[5] -= origin[1];
    }
    matrix2.scale(m, m, scale);
    if (rotation) {
      matrix2.rotate(m, m, rotation);
    }
    if (origin) {
      m[4] += origin[0];
      m[5] += origin[1];
    }
    m[4] += position[0];
    m[5] += position[1];
    return m;
  };
  var _default2 = Transformable;
  Transformable_1 = _default2;
  return Transformable_1;
}
var easing = {
  /**
  * @param {number} k
  * @return {number}
  */
  linear: function(k) {
    return k;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quadraticIn: function(k) {
    return k * k;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quadraticOut: function(k) {
    return k * (2 - k);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quadraticInOut: function(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k;
    }
    return -0.5 * (--k * (k - 2) - 1);
  },
  // 三次方的缓动（t^3）
  /**
  * @param {number} k
  * @return {number}
  */
  cubicIn: function(k) {
    return k * k * k;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  cubicOut: function(k) {
    return --k * k * k + 1;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  cubicInOut: function(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k + 2);
  },
  // 四次方的缓动（t^4）
  /**
  * @param {number} k
  * @return {number}
  */
  quarticIn: function(k) {
    return k * k * k * k;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quarticOut: function(k) {
    return 1 - --k * k * k * k;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quarticInOut: function(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k;
    }
    return -0.5 * ((k -= 2) * k * k * k - 2);
  },
  // 五次方的缓动（t^5）
  /**
  * @param {number} k
  * @return {number}
  */
  quinticIn: function(k) {
    return k * k * k * k * k;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quinticOut: function(k) {
    return --k * k * k * k * k + 1;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  quinticInOut: function(k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k * k;
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2);
  },
  // 正弦曲线的缓动（sin(t)）
  /**
  * @param {number} k
  * @return {number}
  */
  sinusoidalIn: function(k) {
    return 1 - Math.cos(k * Math.PI / 2);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  sinusoidalOut: function(k) {
    return Math.sin(k * Math.PI / 2);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  sinusoidalInOut: function(k) {
    return 0.5 * (1 - Math.cos(Math.PI * k));
  },
  // 指数曲线的缓动（2^t）
  /**
  * @param {number} k
  * @return {number}
  */
  exponentialIn: function(k) {
    return k === 0 ? 0 : Math.pow(1024, k - 1);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  exponentialOut: function(k) {
    return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  exponentialInOut: function(k) {
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if ((k *= 2) < 1) {
      return 0.5 * Math.pow(1024, k - 1);
    }
    return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
  },
  // 圆形曲线的缓动（sqrt(1-t^2)）
  /**
  * @param {number} k
  * @return {number}
  */
  circularIn: function(k) {
    return 1 - Math.sqrt(1 - k * k);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  circularOut: function(k) {
    return Math.sqrt(1 - --k * k);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  circularInOut: function(k) {
    if ((k *= 2) < 1) {
      return -0.5 * (Math.sqrt(1 - k * k) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
  },
  // 创建类似于弹簧在停止前来回振荡的动画
  /**
  * @param {number} k
  * @return {number}
  */
  elasticIn: function(k) {
    var s;
    var a = 0.1;
    var p = 0.4;
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = p * Math.asin(1 / a) / (2 * Math.PI);
    }
    return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
  },
  /**
  * @param {number} k
  * @return {number}
  */
  elasticOut: function(k) {
    var s;
    var a = 0.1;
    var p = 0.4;
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = p * Math.asin(1 / a) / (2 * Math.PI);
    }
    return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  elasticInOut: function(k) {
    var s;
    var a = 0.1;
    var p = 0.4;
    if (k === 0) {
      return 0;
    }
    if (k === 1) {
      return 1;
    }
    if (!a || a < 1) {
      a = 1;
      s = p / 4;
    } else {
      s = p * Math.asin(1 / a) / (2 * Math.PI);
    }
    if ((k *= 2) < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
    }
    return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1;
  },
  // 在某一动画开始沿指示的路径进行动画处理前稍稍收回该动画的移动
  /**
  * @param {number} k
  * @return {number}
  */
  backIn: function(k) {
    var s = 1.70158;
    return k * k * ((s + 1) * k - s);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  backOut: function(k) {
    var s = 1.70158;
    return --k * k * ((s + 1) * k + s) + 1;
  },
  /**
  * @param {number} k
  * @return {number}
  */
  backInOut: function(k) {
    var s = 1.70158 * 1.525;
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s));
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
  },
  // 创建弹跳效果
  /**
  * @param {number} k
  * @return {number}
  */
  bounceIn: function(k) {
    return 1 - easing.bounceOut(1 - k);
  },
  /**
  * @param {number} k
  * @return {number}
  */
  bounceOut: function(k) {
    if (k < 1 / 2.75) {
      return 7.5625 * k * k;
    } else if (k < 2 / 2.75) {
      return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
    } else if (k < 2.5 / 2.75) {
      return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
    } else {
      return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
    }
  },
  /**
  * @param {number} k
  * @return {number}
  */
  bounceInOut: function(k) {
    if (k < 0.5) {
      return easing.bounceIn(k * 2) * 0.5;
    }
    return easing.bounceOut(k * 2 - 1) * 0.5 + 0.5;
  }
};
var _default$9 = easing;
var easing_1 = _default$9;
var easingFuncs = easing_1;
function Clip$1(options) {
  this._target = options.target;
  this._life = options.life || 1e3;
  this._delay = options.delay || 0;
  this._initialized = false;
  this.loop = options.loop == null ? false : options.loop;
  this.gap = options.gap || 0;
  this.easing = options.easing || "Linear";
  this.onframe = options.onframe;
  this.ondestroy = options.ondestroy;
  this.onrestart = options.onrestart;
  this._pausedTime = 0;
  this._paused = false;
}
Clip$1.prototype = {
  constructor: Clip$1,
  step: function(globalTime, deltaTime) {
    if (!this._initialized) {
      this._startTime = globalTime + this._delay;
      this._initialized = true;
    }
    if (this._paused) {
      this._pausedTime += deltaTime;
      return;
    }
    var percent = (globalTime - this._startTime - this._pausedTime) / this._life;
    if (percent < 0) {
      return;
    }
    percent = Math.min(percent, 1);
    var easing2 = this.easing;
    var easingFunc = typeof easing2 === "string" ? easingFuncs[easing2] : easing2;
    var schedule = typeof easingFunc === "function" ? easingFunc(percent) : percent;
    this.fire("frame", schedule);
    if (percent === 1) {
      if (this.loop) {
        this.restart(globalTime);
        return "restart";
      }
      this._needsRemove = true;
      return "destroy";
    }
    return null;
  },
  restart: function(globalTime) {
    var remainder = (globalTime - this._startTime - this._pausedTime) % this._life;
    this._startTime = globalTime - remainder + this.gap;
    this._pausedTime = 0;
    this._needsRemove = false;
  },
  fire: function(eventType, arg) {
    eventType = "on" + eventType;
    if (this[eventType]) {
      this[eventType](this._target, arg);
    }
  },
  pause: function() {
    this._paused = true;
  },
  resume: function() {
    this._paused = false;
  }
};
var _default$8 = Clip$1;
var Clip_1 = _default$8;
var color$1 = {};
var LRU_1;
var hasRequiredLRU;
function requireLRU() {
  if (hasRequiredLRU) return LRU_1;
  hasRequiredLRU = 1;
  var LinkedList = function() {
    this.head = null;
    this.tail = null;
    this._len = 0;
  };
  var linkedListProto = LinkedList.prototype;
  linkedListProto.insert = function(val) {
    var entry = new Entry(val);
    this.insertEntry(entry);
    return entry;
  };
  linkedListProto.insertEntry = function(entry) {
    if (!this.head) {
      this.head = this.tail = entry;
    } else {
      this.tail.next = entry;
      entry.prev = this.tail;
      entry.next = null;
      this.tail = entry;
    }
    this._len++;
  };
  linkedListProto.remove = function(entry) {
    var prev = entry.prev;
    var next = entry.next;
    if (prev) {
      prev.next = next;
    } else {
      this.head = next;
    }
    if (next) {
      next.prev = prev;
    } else {
      this.tail = prev;
    }
    entry.next = entry.prev = null;
    this._len--;
  };
  linkedListProto.len = function() {
    return this._len;
  };
  linkedListProto.clear = function() {
    this.head = this.tail = null;
    this._len = 0;
  };
  var Entry = function(val) {
    this.value = val;
    this.next;
    this.prev;
  };
  var LRU = function(maxSize) {
    this._list = new LinkedList();
    this._map = {};
    this._maxSize = maxSize || 10;
    this._lastRemovedEntry = null;
  };
  var LRUProto = LRU.prototype;
  LRUProto.put = function(key, value) {
    var list = this._list;
    var map2 = this._map;
    var removed = null;
    if (map2[key] == null) {
      var len = list.len();
      var entry = this._lastRemovedEntry;
      if (len >= this._maxSize && len > 0) {
        var leastUsedEntry = list.head;
        list.remove(leastUsedEntry);
        delete map2[leastUsedEntry.key];
        removed = leastUsedEntry.value;
        this._lastRemovedEntry = leastUsedEntry;
      }
      if (entry) {
        entry.value = value;
      } else {
        entry = new Entry(value);
      }
      entry.key = key;
      list.insertEntry(entry);
      map2[key] = entry;
    }
    return removed;
  };
  LRUProto.get = function(key) {
    var entry = this._map[key];
    var list = this._list;
    if (entry != null) {
      if (entry !== list.tail) {
        list.remove(entry);
        list.insertEntry(entry);
      }
      return entry.value;
    }
  };
  LRUProto.clear = function() {
    this._list.clear();
    this._map = {};
  };
  var _default2 = LRU;
  LRU_1 = _default2;
  return LRU_1;
}
var hasRequiredColor;
function requireColor() {
  if (hasRequiredColor) return color$1;
  hasRequiredColor = 1;
  var LRU = requireLRU();
  var kCSSColorTable = {
    "transparent": [0, 0, 0, 0],
    "aliceblue": [240, 248, 255, 1],
    "antiquewhite": [250, 235, 215, 1],
    "aqua": [0, 255, 255, 1],
    "aquamarine": [127, 255, 212, 1],
    "azure": [240, 255, 255, 1],
    "beige": [245, 245, 220, 1],
    "bisque": [255, 228, 196, 1],
    "black": [0, 0, 0, 1],
    "blanchedalmond": [255, 235, 205, 1],
    "blue": [0, 0, 255, 1],
    "blueviolet": [138, 43, 226, 1],
    "brown": [165, 42, 42, 1],
    "burlywood": [222, 184, 135, 1],
    "cadetblue": [95, 158, 160, 1],
    "chartreuse": [127, 255, 0, 1],
    "chocolate": [210, 105, 30, 1],
    "coral": [255, 127, 80, 1],
    "cornflowerblue": [100, 149, 237, 1],
    "cornsilk": [255, 248, 220, 1],
    "crimson": [220, 20, 60, 1],
    "cyan": [0, 255, 255, 1],
    "darkblue": [0, 0, 139, 1],
    "darkcyan": [0, 139, 139, 1],
    "darkgoldenrod": [184, 134, 11, 1],
    "darkgray": [169, 169, 169, 1],
    "darkgreen": [0, 100, 0, 1],
    "darkgrey": [169, 169, 169, 1],
    "darkkhaki": [189, 183, 107, 1],
    "darkmagenta": [139, 0, 139, 1],
    "darkolivegreen": [85, 107, 47, 1],
    "darkorange": [255, 140, 0, 1],
    "darkorchid": [153, 50, 204, 1],
    "darkred": [139, 0, 0, 1],
    "darksalmon": [233, 150, 122, 1],
    "darkseagreen": [143, 188, 143, 1],
    "darkslateblue": [72, 61, 139, 1],
    "darkslategray": [47, 79, 79, 1],
    "darkslategrey": [47, 79, 79, 1],
    "darkturquoise": [0, 206, 209, 1],
    "darkviolet": [148, 0, 211, 1],
    "deeppink": [255, 20, 147, 1],
    "deepskyblue": [0, 191, 255, 1],
    "dimgray": [105, 105, 105, 1],
    "dimgrey": [105, 105, 105, 1],
    "dodgerblue": [30, 144, 255, 1],
    "firebrick": [178, 34, 34, 1],
    "floralwhite": [255, 250, 240, 1],
    "forestgreen": [34, 139, 34, 1],
    "fuchsia": [255, 0, 255, 1],
    "gainsboro": [220, 220, 220, 1],
    "ghostwhite": [248, 248, 255, 1],
    "gold": [255, 215, 0, 1],
    "goldenrod": [218, 165, 32, 1],
    "gray": [128, 128, 128, 1],
    "green": [0, 128, 0, 1],
    "greenyellow": [173, 255, 47, 1],
    "grey": [128, 128, 128, 1],
    "honeydew": [240, 255, 240, 1],
    "hotpink": [255, 105, 180, 1],
    "indianred": [205, 92, 92, 1],
    "indigo": [75, 0, 130, 1],
    "ivory": [255, 255, 240, 1],
    "khaki": [240, 230, 140, 1],
    "lavender": [230, 230, 250, 1],
    "lavenderblush": [255, 240, 245, 1],
    "lawngreen": [124, 252, 0, 1],
    "lemonchiffon": [255, 250, 205, 1],
    "lightblue": [173, 216, 230, 1],
    "lightcoral": [240, 128, 128, 1],
    "lightcyan": [224, 255, 255, 1],
    "lightgoldenrodyellow": [250, 250, 210, 1],
    "lightgray": [211, 211, 211, 1],
    "lightgreen": [144, 238, 144, 1],
    "lightgrey": [211, 211, 211, 1],
    "lightpink": [255, 182, 193, 1],
    "lightsalmon": [255, 160, 122, 1],
    "lightseagreen": [32, 178, 170, 1],
    "lightskyblue": [135, 206, 250, 1],
    "lightslategray": [119, 136, 153, 1],
    "lightslategrey": [119, 136, 153, 1],
    "lightsteelblue": [176, 196, 222, 1],
    "lightyellow": [255, 255, 224, 1],
    "lime": [0, 255, 0, 1],
    "limegreen": [50, 205, 50, 1],
    "linen": [250, 240, 230, 1],
    "magenta": [255, 0, 255, 1],
    "maroon": [128, 0, 0, 1],
    "mediumaquamarine": [102, 205, 170, 1],
    "mediumblue": [0, 0, 205, 1],
    "mediumorchid": [186, 85, 211, 1],
    "mediumpurple": [147, 112, 219, 1],
    "mediumseagreen": [60, 179, 113, 1],
    "mediumslateblue": [123, 104, 238, 1],
    "mediumspringgreen": [0, 250, 154, 1],
    "mediumturquoise": [72, 209, 204, 1],
    "mediumvioletred": [199, 21, 133, 1],
    "midnightblue": [25, 25, 112, 1],
    "mintcream": [245, 255, 250, 1],
    "mistyrose": [255, 228, 225, 1],
    "moccasin": [255, 228, 181, 1],
    "navajowhite": [255, 222, 173, 1],
    "navy": [0, 0, 128, 1],
    "oldlace": [253, 245, 230, 1],
    "olive": [128, 128, 0, 1],
    "olivedrab": [107, 142, 35, 1],
    "orange": [255, 165, 0, 1],
    "orangered": [255, 69, 0, 1],
    "orchid": [218, 112, 214, 1],
    "palegoldenrod": [238, 232, 170, 1],
    "palegreen": [152, 251, 152, 1],
    "paleturquoise": [175, 238, 238, 1],
    "palevioletred": [219, 112, 147, 1],
    "papayawhip": [255, 239, 213, 1],
    "peachpuff": [255, 218, 185, 1],
    "peru": [205, 133, 63, 1],
    "pink": [255, 192, 203, 1],
    "plum": [221, 160, 221, 1],
    "powderblue": [176, 224, 230, 1],
    "purple": [128, 0, 128, 1],
    "red": [255, 0, 0, 1],
    "rosybrown": [188, 143, 143, 1],
    "royalblue": [65, 105, 225, 1],
    "saddlebrown": [139, 69, 19, 1],
    "salmon": [250, 128, 114, 1],
    "sandybrown": [244, 164, 96, 1],
    "seagreen": [46, 139, 87, 1],
    "seashell": [255, 245, 238, 1],
    "sienna": [160, 82, 45, 1],
    "silver": [192, 192, 192, 1],
    "skyblue": [135, 206, 235, 1],
    "slateblue": [106, 90, 205, 1],
    "slategray": [112, 128, 144, 1],
    "slategrey": [112, 128, 144, 1],
    "snow": [255, 250, 250, 1],
    "springgreen": [0, 255, 127, 1],
    "steelblue": [70, 130, 180, 1],
    "tan": [210, 180, 140, 1],
    "teal": [0, 128, 128, 1],
    "thistle": [216, 191, 216, 1],
    "tomato": [255, 99, 71, 1],
    "turquoise": [64, 224, 208, 1],
    "violet": [238, 130, 238, 1],
    "wheat": [245, 222, 179, 1],
    "white": [255, 255, 255, 1],
    "whitesmoke": [245, 245, 245, 1],
    "yellow": [255, 255, 0, 1],
    "yellowgreen": [154, 205, 50, 1]
  };
  function clampCssByte(i) {
    i = Math.round(i);
    return i < 0 ? 0 : i > 255 ? 255 : i;
  }
  function clampCssAngle(i) {
    i = Math.round(i);
    return i < 0 ? 0 : i > 360 ? 360 : i;
  }
  function clampCssFloat(f) {
    return f < 0 ? 0 : f > 1 ? 1 : f;
  }
  function parseCssInt(str) {
    if (str.length && str.charAt(str.length - 1) === "%") {
      return clampCssByte(parseFloat(str) / 100 * 255);
    }
    return clampCssByte(parseInt(str, 10));
  }
  function parseCssFloat(str) {
    if (str.length && str.charAt(str.length - 1) === "%") {
      return clampCssFloat(parseFloat(str) / 100);
    }
    return clampCssFloat(parseFloat(str));
  }
  function cssHueToRgb(m1, m2, h) {
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
    if (h * 6 < 1) {
      return m1 + (m2 - m1) * h * 6;
    }
    if (h * 2 < 1) {
      return m2;
    }
    if (h * 3 < 2) {
      return m1 + (m2 - m1) * (2 / 3 - h) * 6;
    }
    return m1;
  }
  function lerpNumber(a, b, p) {
    return a + (b - a) * p;
  }
  function setRgba(out, r, g, b, a) {
    out[0] = r;
    out[1] = g;
    out[2] = b;
    out[3] = a;
    return out;
  }
  function copyRgba(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
  }
  var colorCache = new LRU(20);
  var lastRemovedArr = null;
  function putToCache(colorStr, rgbaArr) {
    if (lastRemovedArr) {
      copyRgba(lastRemovedArr, rgbaArr);
    }
    lastRemovedArr = colorCache.put(colorStr, lastRemovedArr || rgbaArr.slice());
  }
  function parse(colorStr, rgbaArr) {
    if (!colorStr) {
      return;
    }
    rgbaArr = rgbaArr || [];
    var cached = colorCache.get(colorStr);
    if (cached) {
      return copyRgba(rgbaArr, cached);
    }
    colorStr = colorStr + "";
    var str = colorStr.replace(/ /g, "").toLowerCase();
    if (str in kCSSColorTable) {
      copyRgba(rgbaArr, kCSSColorTable[str]);
      putToCache(colorStr, rgbaArr);
      return rgbaArr;
    }
    if (str.charAt(0) === "#") {
      if (str.length === 4) {
        var iv = parseInt(str.substr(1), 16);
        if (!(iv >= 0 && iv <= 4095)) {
          setRgba(rgbaArr, 0, 0, 0, 1);
          return;
        }
        setRgba(rgbaArr, (iv & 3840) >> 4 | (iv & 3840) >> 8, iv & 240 | (iv & 240) >> 4, iv & 15 | (iv & 15) << 4, 1);
        putToCache(colorStr, rgbaArr);
        return rgbaArr;
      } else if (str.length === 7) {
        var iv = parseInt(str.substr(1), 16);
        if (!(iv >= 0 && iv <= 16777215)) {
          setRgba(rgbaArr, 0, 0, 0, 1);
          return;
        }
        setRgba(rgbaArr, (iv & 16711680) >> 16, (iv & 65280) >> 8, iv & 255, 1);
        putToCache(colorStr, rgbaArr);
        return rgbaArr;
      }
      return;
    }
    var op = str.indexOf("(");
    var ep = str.indexOf(")");
    if (op !== -1 && ep + 1 === str.length) {
      var fname = str.substr(0, op);
      var params = str.substr(op + 1, ep - (op + 1)).split(",");
      var alpha = 1;
      switch (fname) {
        case "rgba":
          if (params.length !== 4) {
            setRgba(rgbaArr, 0, 0, 0, 1);
            return;
          }
          alpha = parseCssFloat(params.pop());
        case "rgb":
          if (params.length !== 3) {
            setRgba(rgbaArr, 0, 0, 0, 1);
            return;
          }
          setRgba(rgbaArr, parseCssInt(params[0]), parseCssInt(params[1]), parseCssInt(params[2]), alpha);
          putToCache(colorStr, rgbaArr);
          return rgbaArr;
        case "hsla":
          if (params.length !== 4) {
            setRgba(rgbaArr, 0, 0, 0, 1);
            return;
          }
          params[3] = parseCssFloat(params[3]);
          hsla2rgba(params, rgbaArr);
          putToCache(colorStr, rgbaArr);
          return rgbaArr;
        case "hsl":
          if (params.length !== 3) {
            setRgba(rgbaArr, 0, 0, 0, 1);
            return;
          }
          hsla2rgba(params, rgbaArr);
          putToCache(colorStr, rgbaArr);
          return rgbaArr;
        default:
          return;
      }
    }
    setRgba(rgbaArr, 0, 0, 0, 1);
    return;
  }
  function hsla2rgba(hsla, rgba) {
    var h = (parseFloat(hsla[0]) % 360 + 360) % 360 / 360;
    var s = parseCssFloat(hsla[1]);
    var l = parseCssFloat(hsla[2]);
    var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    var m1 = l * 2 - m2;
    rgba = rgba || [];
    setRgba(rgba, clampCssByte(cssHueToRgb(m1, m2, h + 1 / 3) * 255), clampCssByte(cssHueToRgb(m1, m2, h) * 255), clampCssByte(cssHueToRgb(m1, m2, h - 1 / 3) * 255), 1);
    if (hsla.length === 4) {
      rgba[3] = hsla[3];
    }
    return rgba;
  }
  function rgba2hsla(rgba) {
    if (!rgba) {
      return;
    }
    var R = rgba[0] / 255;
    var G = rgba[1] / 255;
    var B = rgba[2] / 255;
    var vMin = Math.min(R, G, B);
    var vMax = Math.max(R, G, B);
    var delta = vMax - vMin;
    var L = (vMax + vMin) / 2;
    var H;
    var S;
    if (delta === 0) {
      H = 0;
      S = 0;
    } else {
      if (L < 0.5) {
        S = delta / (vMax + vMin);
      } else {
        S = delta / (2 - vMax - vMin);
      }
      var deltaR = ((vMax - R) / 6 + delta / 2) / delta;
      var deltaG = ((vMax - G) / 6 + delta / 2) / delta;
      var deltaB = ((vMax - B) / 6 + delta / 2) / delta;
      if (R === vMax) {
        H = deltaB - deltaG;
      } else if (G === vMax) {
        H = 1 / 3 + deltaR - deltaB;
      } else if (B === vMax) {
        H = 2 / 3 + deltaG - deltaR;
      }
      if (H < 0) {
        H += 1;
      }
      if (H > 1) {
        H -= 1;
      }
    }
    var hsla = [H * 360, S, L];
    if (rgba[3] != null) {
      hsla.push(rgba[3]);
    }
    return hsla;
  }
  function lift(color2, level) {
    var colorArr = parse(color2);
    if (colorArr) {
      for (var i = 0; i < 3; i++) {
        if (level < 0) {
          colorArr[i] = colorArr[i] * (1 - level) | 0;
        } else {
          colorArr[i] = (255 - colorArr[i]) * level + colorArr[i] | 0;
        }
        if (colorArr[i] > 255) {
          colorArr[i] = 255;
        } else if (color2[i] < 0) {
          colorArr[i] = 0;
        }
      }
      return stringify(colorArr, colorArr.length === 4 ? "rgba" : "rgb");
    }
  }
  function toHex(color2) {
    var colorArr = parse(color2);
    if (colorArr) {
      return ((1 << 24) + (colorArr[0] << 16) + (colorArr[1] << 8) + +colorArr[2]).toString(16).slice(1);
    }
  }
  function fastLerp(normalizedValue, colors, out) {
    if (!(colors && colors.length) || !(normalizedValue >= 0 && normalizedValue <= 1)) {
      return;
    }
    out = out || [];
    var value = normalizedValue * (colors.length - 1);
    var leftIndex = Math.floor(value);
    var rightIndex = Math.ceil(value);
    var leftColor = colors[leftIndex];
    var rightColor = colors[rightIndex];
    var dv = value - leftIndex;
    out[0] = clampCssByte(lerpNumber(leftColor[0], rightColor[0], dv));
    out[1] = clampCssByte(lerpNumber(leftColor[1], rightColor[1], dv));
    out[2] = clampCssByte(lerpNumber(leftColor[2], rightColor[2], dv));
    out[3] = clampCssFloat(lerpNumber(leftColor[3], rightColor[3], dv));
    return out;
  }
  var fastMapToColor = fastLerp;
  function lerp(normalizedValue, colors, fullOutput) {
    if (!(colors && colors.length) || !(normalizedValue >= 0 && normalizedValue <= 1)) {
      return;
    }
    var value = normalizedValue * (colors.length - 1);
    var leftIndex = Math.floor(value);
    var rightIndex = Math.ceil(value);
    var leftColor = parse(colors[leftIndex]);
    var rightColor = parse(colors[rightIndex]);
    var dv = value - leftIndex;
    var color2 = stringify([clampCssByte(lerpNumber(leftColor[0], rightColor[0], dv)), clampCssByte(lerpNumber(leftColor[1], rightColor[1], dv)), clampCssByte(lerpNumber(leftColor[2], rightColor[2], dv)), clampCssFloat(lerpNumber(leftColor[3], rightColor[3], dv))], "rgba");
    return fullOutput ? {
      color: color2,
      leftIndex,
      rightIndex,
      value
    } : color2;
  }
  var mapToColor = lerp;
  function modifyHSL(color2, h, s, l) {
    color2 = parse(color2);
    if (color2) {
      color2 = rgba2hsla(color2);
      h != null && (color2[0] = clampCssAngle(h));
      s != null && (color2[1] = parseCssFloat(s));
      l != null && (color2[2] = parseCssFloat(l));
      return stringify(hsla2rgba(color2), "rgba");
    }
  }
  function modifyAlpha(color2, alpha) {
    color2 = parse(color2);
    if (color2 && alpha != null) {
      color2[3] = clampCssFloat(alpha);
      return stringify(color2, "rgba");
    }
  }
  function stringify(arrColor, type) {
    if (!arrColor || !arrColor.length) {
      return;
    }
    var colorStr = arrColor[0] + "," + arrColor[1] + "," + arrColor[2];
    if (type === "rgba" || type === "hsva" || type === "hsla") {
      colorStr += "," + arrColor[3];
    }
    return type + "(" + colorStr + ")";
  }
  color$1.parse = parse;
  color$1.lift = lift;
  color$1.toHex = toHex;
  color$1.fastLerp = fastLerp;
  color$1.fastMapToColor = fastMapToColor;
  color$1.lerp = lerp;
  color$1.mapToColor = mapToColor;
  color$1.modifyHSL = modifyHSL;
  color$1.modifyAlpha = modifyAlpha;
  color$1.stringify = stringify;
  return color$1;
}
var Clip = Clip_1;
var color = requireColor();
var _util = util$6;
var isArrayLike = _util.isArrayLike;
var arraySlice = Array.prototype.slice;
function defaultGetter(target, key) {
  return target[key];
}
function defaultSetter(target, key, value) {
  target[key] = value;
}
function interpolateNumber(p0, p1, percent) {
  return (p1 - p0) * percent + p0;
}
function interpolateString(p0, p1, percent) {
  return percent > 0.5 ? p1 : p0;
}
function interpolateArray(p0, p1, percent, out, arrDim) {
  var len = p0.length;
  if (arrDim === 1) {
    for (var i = 0; i < len; i++) {
      out[i] = interpolateNumber(p0[i], p1[i], percent);
    }
  } else {
    var len2 = len && p0[0].length;
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len2; j++) {
        out[i][j] = interpolateNumber(p0[i][j], p1[i][j], percent);
      }
    }
  }
}
function fillArr(arr0, arr1, arrDim) {
  var arr0Len = arr0.length;
  var arr1Len = arr1.length;
  if (arr0Len !== arr1Len) {
    var isPreviousLarger = arr0Len > arr1Len;
    if (isPreviousLarger) {
      arr0.length = arr1Len;
    } else {
      for (var i = arr0Len; i < arr1Len; i++) {
        arr0.push(arrDim === 1 ? arr1[i] : arraySlice.call(arr1[i]));
      }
    }
  }
  var len2 = arr0[0] && arr0[0].length;
  for (var i = 0; i < arr0.length; i++) {
    if (arrDim === 1) {
      if (isNaN(arr0[i])) {
        arr0[i] = arr1[i];
      }
    } else {
      for (var j = 0; j < len2; j++) {
        if (isNaN(arr0[i][j])) {
          arr0[i][j] = arr1[i][j];
        }
      }
    }
  }
}
function isArraySame(arr0, arr1, arrDim) {
  if (arr0 === arr1) {
    return true;
  }
  var len = arr0.length;
  if (len !== arr1.length) {
    return false;
  }
  if (arrDim === 1) {
    for (var i = 0; i < len; i++) {
      if (arr0[i] !== arr1[i]) {
        return false;
      }
    }
  } else {
    var len2 = arr0[0].length;
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len2; j++) {
        if (arr0[i][j] !== arr1[i][j]) {
          return false;
        }
      }
    }
  }
  return true;
}
function catmullRomInterpolateArray(p0, p1, p2, p3, t, t2, t3, out, arrDim) {
  var len = p0.length;
  if (arrDim === 1) {
    for (var i = 0; i < len; i++) {
      out[i] = catmullRomInterpolate(p0[i], p1[i], p2[i], p3[i], t, t2, t3);
    }
  } else {
    var len2 = p0[0].length;
    for (var i = 0; i < len; i++) {
      for (var j = 0; j < len2; j++) {
        out[i][j] = catmullRomInterpolate(p0[i][j], p1[i][j], p2[i][j], p3[i][j], t, t2, t3);
      }
    }
  }
}
function catmullRomInterpolate(p0, p1, p2, p3, t, t2, t3) {
  var v0 = (p2 - p0) * 0.5;
  var v1 = (p3 - p1) * 0.5;
  return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
}
function cloneValue(value) {
  if (isArrayLike(value)) {
    var len = value.length;
    if (isArrayLike(value[0])) {
      var ret = [];
      for (var i = 0; i < len; i++) {
        ret.push(arraySlice.call(value[i]));
      }
      return ret;
    }
    return arraySlice.call(value);
  }
  return value;
}
function rgba2String(rgba) {
  rgba[0] = Math.floor(rgba[0]);
  rgba[1] = Math.floor(rgba[1]);
  rgba[2] = Math.floor(rgba[2]);
  return "rgba(" + rgba.join(",") + ")";
}
function getArrayDim(keyframes) {
  var lastValue = keyframes[keyframes.length - 1].value;
  return isArrayLike(lastValue && lastValue[0]) ? 2 : 1;
}
function createTrackClip(animator, easing2, oneTrackDone, keyframes, propName, forceAnimate) {
  var getter = animator._getter;
  var setter = animator._setter;
  var useSpline = easing2 === "spline";
  var trackLen = keyframes.length;
  if (!trackLen) {
    return;
  }
  var firstVal = keyframes[0].value;
  var isValueArray = isArrayLike(firstVal);
  var isValueColor = false;
  var isValueString = false;
  var arrDim = isValueArray ? getArrayDim(keyframes) : 0;
  var trackMaxTime;
  keyframes.sort(function(a, b) {
    return a.time - b.time;
  });
  trackMaxTime = keyframes[trackLen - 1].time;
  var kfPercents = [];
  var kfValues = [];
  var prevValue = keyframes[0].value;
  var isAllValueEqual = true;
  for (var i = 0; i < trackLen; i++) {
    kfPercents.push(keyframes[i].time / trackMaxTime);
    var value = keyframes[i].value;
    if (!(isValueArray && isArraySame(value, prevValue, arrDim) || !isValueArray && value === prevValue)) {
      isAllValueEqual = false;
    }
    prevValue = value;
    if (typeof value === "string") {
      var colorArray = color.parse(value);
      if (colorArray) {
        value = colorArray;
        isValueColor = true;
      } else {
        isValueString = true;
      }
    }
    kfValues.push(value);
  }
  if (!forceAnimate && isAllValueEqual) {
    return;
  }
  var lastValue = kfValues[trackLen - 1];
  for (var i = 0; i < trackLen - 1; i++) {
    if (isValueArray) {
      fillArr(kfValues[i], lastValue, arrDim);
    } else {
      if (isNaN(kfValues[i]) && !isNaN(lastValue) && !isValueString && !isValueColor) {
        kfValues[i] = lastValue;
      }
    }
  }
  isValueArray && fillArr(getter(animator._target, propName), lastValue, arrDim);
  var lastFrame = 0;
  var lastFramePercent = 0;
  var start;
  var w;
  var p0;
  var p1;
  var p2;
  var p3;
  if (isValueColor) {
    var rgba = [0, 0, 0, 0];
  }
  var onframe = function(target, percent) {
    var frame;
    if (percent < 0) {
      frame = 0;
    } else if (percent < lastFramePercent) {
      start = Math.min(lastFrame + 1, trackLen - 1);
      for (frame = start; frame >= 0; frame--) {
        if (kfPercents[frame] <= percent) {
          break;
        }
      }
      frame = Math.min(frame, trackLen - 2);
    } else {
      for (frame = lastFrame; frame < trackLen; frame++) {
        if (kfPercents[frame] > percent) {
          break;
        }
      }
      frame = Math.min(frame - 1, trackLen - 2);
    }
    lastFrame = frame;
    lastFramePercent = percent;
    var range = kfPercents[frame + 1] - kfPercents[frame];
    if (range === 0) {
      return;
    } else {
      w = (percent - kfPercents[frame]) / range;
    }
    if (useSpline) {
      p1 = kfValues[frame];
      p0 = kfValues[frame === 0 ? frame : frame - 1];
      p2 = kfValues[frame > trackLen - 2 ? trackLen - 1 : frame + 1];
      p3 = kfValues[frame > trackLen - 3 ? trackLen - 1 : frame + 2];
      if (isValueArray) {
        catmullRomInterpolateArray(p0, p1, p2, p3, w, w * w, w * w * w, getter(target, propName), arrDim);
      } else {
        var value2;
        if (isValueColor) {
          value2 = catmullRomInterpolateArray(p0, p1, p2, p3, w, w * w, w * w * w, rgba, 1);
          value2 = rgba2String(rgba);
        } else if (isValueString) {
          return interpolateString(p1, p2, w);
        } else {
          value2 = catmullRomInterpolate(p0, p1, p2, p3, w, w * w, w * w * w);
        }
        setter(target, propName, value2);
      }
    } else {
      if (isValueArray) {
        interpolateArray(kfValues[frame], kfValues[frame + 1], w, getter(target, propName), arrDim);
      } else {
        var value2;
        if (isValueColor) {
          interpolateArray(kfValues[frame], kfValues[frame + 1], w, rgba, 1);
          value2 = rgba2String(rgba);
        } else if (isValueString) {
          return interpolateString(kfValues[frame], kfValues[frame + 1], w);
        } else {
          value2 = interpolateNumber(kfValues[frame], kfValues[frame + 1], w);
        }
        setter(target, propName, value2);
      }
    }
  };
  var clip = new Clip({
    target: animator._target,
    life: trackMaxTime,
    loop: animator._loop,
    delay: animator._delay,
    onframe,
    ondestroy: oneTrackDone
  });
  if (easing2 && easing2 !== "spline") {
    clip.easing = easing2;
  }
  return clip;
}
var Animator$1 = function(target, loop, getter, setter) {
  this._tracks = {};
  this._target = target;
  this._loop = loop || false;
  this._getter = getter || defaultGetter;
  this._setter = setter || defaultSetter;
  this._clipCount = 0;
  this._delay = 0;
  this._doneList = [];
  this._onframeList = [];
  this._clipList = [];
};
Animator$1.prototype = {
  /**
   * Set Animation keyframe
   * @param  {number} time 关键帧时间，单位是ms
   * @param  {Object} props 关键帧的属性值，key-value表示
   * @return {module:zrender/animation/Animator}
   */
  when: function(time, props) {
    var tracks = this._tracks;
    for (var propName in props) {
      if (!props.hasOwnProperty(propName)) {
        continue;
      }
      if (!tracks[propName]) {
        tracks[propName] = [];
        var value = this._getter(this._target, propName);
        if (value == null) {
          continue;
        }
        if (time !== 0) {
          tracks[propName].push({
            time: 0,
            value: cloneValue(value)
          });
        }
      }
      tracks[propName].push({
        time,
        value: props[propName]
      });
    }
    return this;
  },
  /**
   * 添加动画每一帧的回调函数
   * @param  {Function} callback
   * @return {module:zrender/animation/Animator}
   */
  during: function(callback) {
    this._onframeList.push(callback);
    return this;
  },
  pause: function() {
    for (var i = 0; i < this._clipList.length; i++) {
      this._clipList[i].pause();
    }
    this._paused = true;
  },
  resume: function() {
    for (var i = 0; i < this._clipList.length; i++) {
      this._clipList[i].resume();
    }
    this._paused = false;
  },
  isPaused: function() {
    return !!this._paused;
  },
  _doneCallback: function() {
    this._tracks = {};
    this._clipList.length = 0;
    var doneList = this._doneList;
    var len = doneList.length;
    for (var i = 0; i < len; i++) {
      doneList[i].call(this);
    }
  },
  /**
   * Start the animation
   * @param  {string|Function} [easing]
   *         动画缓动函数，详见{@link module:zrender/animation/easing}
   * @param  {boolean} forceAnimate
   * @return {module:zrender/animation/Animator}
   */
  start: function(easing2, forceAnimate) {
    var self2 = this;
    var clipCount = 0;
    var oneTrackDone = function() {
      clipCount--;
      if (!clipCount) {
        self2._doneCallback();
      }
    };
    var lastClip;
    for (var propName in this._tracks) {
      if (!this._tracks.hasOwnProperty(propName)) {
        continue;
      }
      var clip = createTrackClip(this, easing2, oneTrackDone, this._tracks[propName], propName, forceAnimate);
      if (clip) {
        this._clipList.push(clip);
        clipCount++;
        if (this.animation) {
          this.animation.addClip(clip);
        }
        lastClip = clip;
      }
    }
    if (lastClip) {
      var oldOnFrame = lastClip.onframe;
      lastClip.onframe = function(target, percent) {
        oldOnFrame(target, percent);
        for (var i = 0; i < self2._onframeList.length; i++) {
          self2._onframeList[i](target, percent);
        }
      };
    }
    if (!clipCount) {
      this._doneCallback();
    }
    return this;
  },
  /**
   * Stop animation
   * @param {boolean} forwardToLast If move to last frame before stop
   */
  stop: function(forwardToLast) {
    var clipList = this._clipList;
    var animation = this.animation;
    for (var i = 0; i < clipList.length; i++) {
      var clip = clipList[i];
      if (forwardToLast) {
        clip.onframe(this._target, 1);
      }
      animation && animation.removeClip(clip);
    }
    clipList.length = 0;
  },
  /**
   * Set when animation delay starts
   * @param  {number} time 单位ms
   * @return {module:zrender/animation/Animator}
   */
  delay: function(time) {
    this._delay = time;
    return this;
  },
  /**
   * Add callback for animation end
   * @param  {Function} cb
   * @return {module:zrender/animation/Animator}
   */
  done: function(cb) {
    if (cb) {
      this._doneList.push(cb);
    }
    return this;
  },
  /**
   * @return {Array.<module:zrender/animation/Clip>}
   */
  getClips: function() {
    return this._clipList;
  }
};
var _default$7 = Animator$1;
var Animator_1 = _default$7;
var config = {};
var dpr = 1;
if (typeof window !== "undefined") {
  dpr = Math.max(window.devicePixelRatio || 1, 1);
}
var debugMode$1 = 0;
var devicePixelRatio$2 = dpr;
config.debugMode = debugMode$1;
config.devicePixelRatio = devicePixelRatio$2;
var _config$2 = config;
var debugMode = _config$2.debugMode;
var logError$1 = function() {
};
if (debugMode === 1) {
  logError$1 = console.error;
}
var _default$6 = logError$1;
var log = _default$6;
var Animatable_1;
var hasRequiredAnimatable;
function requireAnimatable() {
  if (hasRequiredAnimatable) return Animatable_1;
  hasRequiredAnimatable = 1;
  var Animator2 = Animator_1;
  var logError2 = log;
  var _util2 = util$6;
  var isString2 = _util2.isString;
  var isFunction2 = _util2.isFunction;
  var isObject2 = _util2.isObject;
  var isArrayLike2 = _util2.isArrayLike;
  var indexOf2 = _util2.indexOf;
  var Animatable = function() {
    this.animators = [];
  };
  Animatable.prototype = {
    constructor: Animatable,
    /**
     * 动画
     *
     * @param {string} path The path to fetch value from object, like 'a.b.c'.
     * @param {boolean} [loop] Whether to loop animation.
     * @return {module:zrender/animation/Animator}
     * @example:
     *     el.animate('style', false)
     *         .when(1000, {x: 10} )
     *         .done(function(){ // Animation done })
     *         .start()
     */
    animate: function(path2, loop) {
      var target;
      var animatingShape = false;
      var el = this;
      var zr = this.__zr;
      if (path2) {
        var pathSplitted = path2.split(".");
        var prop = el;
        animatingShape = pathSplitted[0] === "shape";
        for (var i = 0, l = pathSplitted.length; i < l; i++) {
          if (!prop) {
            continue;
          }
          prop = prop[pathSplitted[i]];
        }
        if (prop) {
          target = prop;
        }
      } else {
        target = el;
      }
      if (!target) {
        logError2('Property "' + path2 + '" is not existed in element ' + el.id);
        return;
      }
      var animators = el.animators;
      var animator = new Animator2(target, loop);
      animator.during(function(target2) {
        el.dirty(animatingShape);
      }).done(function() {
        animators.splice(indexOf2(animators, animator), 1);
      });
      animators.push(animator);
      if (zr) {
        zr.animation.addAnimator(animator);
      }
      return animator;
    },
    /**
     * 停止动画
     * @param {boolean} forwardToLast If move to last frame before stop
     */
    stopAnimation: function(forwardToLast) {
      var animators = this.animators;
      var len = animators.length;
      for (var i = 0; i < len; i++) {
        animators[i].stop(forwardToLast);
      }
      animators.length = 0;
      return this;
    },
    /**
     * Caution: this method will stop previous animation.
     * So do not use this method to one element twice before
     * animation starts, unless you know what you are doing.
     * @param {Object} target
     * @param {number} [time=500] Time in ms
     * @param {string} [easing='linear']
     * @param {number} [delay=0]
     * @param {Function} [callback]
     * @param {Function} [forceAnimate] Prevent stop animation and callback
     *        immediently when target values are the same as current values.
     *
     * @example
     *  // Animate position
     *  el.animateTo({
     *      position: [10, 10]
     *  }, function () { // done })
     *
     *  // Animate shape, style and position in 100ms, delayed 100ms, with cubicOut easing
     *  el.animateTo({
     *      shape: {
     *          width: 500
     *      },
     *      style: {
     *          fill: 'red'
     *      }
     *      position: [10, 10]
     *  }, 100, 100, 'cubicOut', function () { // done })
     */
    // TODO Return animation key
    animateTo: function(target, time, delay, easing2, callback, forceAnimate) {
      animateTo(this, target, time, delay, easing2, callback, forceAnimate);
    },
    /**
     * Animate from the target state to current state.
     * The params and the return value are the same as `this.animateTo`.
     */
    animateFrom: function(target, time, delay, easing2, callback, forceAnimate) {
      animateTo(this, target, time, delay, easing2, callback, forceAnimate, true);
    }
  };
  function animateTo(animatable, target, time, delay, easing2, callback, forceAnimate, reverse) {
    if (isString2(delay)) {
      callback = easing2;
      easing2 = delay;
      delay = 0;
    } else if (isFunction2(easing2)) {
      callback = easing2;
      easing2 = "linear";
      delay = 0;
    } else if (isFunction2(delay)) {
      callback = delay;
      delay = 0;
    } else if (isFunction2(time)) {
      callback = time;
      time = 500;
    } else if (!time) {
      time = 500;
    }
    animatable.stopAnimation();
    animateToShallow(animatable, "", animatable, target, time, delay, reverse);
    var animators = animatable.animators.slice();
    var count = animators.length;
    function done() {
      count--;
      if (!count) {
        callback && callback();
      }
    }
    if (!count) {
      callback && callback();
    }
    for (var i = 0; i < animators.length; i++) {
      animators[i].done(done).start(easing2, forceAnimate);
    }
  }
  function animateToShallow(animatable, path2, source, target, time, delay, reverse) {
    var objShallow = {};
    var propertyCount = 0;
    for (var name in target) {
      if (!target.hasOwnProperty(name)) {
        continue;
      }
      if (source[name] != null) {
        if (isObject2(target[name]) && !isArrayLike2(target[name])) {
          animateToShallow(animatable, path2 ? path2 + "." + name : name, source[name], target[name], time, delay, reverse);
        } else {
          if (reverse) {
            objShallow[name] = source[name];
            setAttrByPath(animatable, path2, name, target[name]);
          } else {
            objShallow[name] = target[name];
          }
          propertyCount++;
        }
      } else if (target[name] != null && !reverse) {
        setAttrByPath(animatable, path2, name, target[name]);
      }
    }
    if (propertyCount > 0) {
      animatable.animate(path2, false).when(time == null ? 500 : time, objShallow).delay(delay || 0);
    }
  }
  function setAttrByPath(el, path2, name, value) {
    if (!path2) {
      el.attr(name, value);
    } else {
      var props = {};
      props[path2] = {};
      props[path2][name] = value;
      el.attr(props);
    }
  }
  var _default2 = Animatable;
  Animatable_1 = _default2;
  return Animatable_1;
}
var Element_1;
var hasRequiredElement;
function requireElement() {
  if (hasRequiredElement) return Element_1;
  hasRequiredElement = 1;
  var guid2 = guid$1;
  var Eventful2 = Eventful_1;
  var Transformable = requireTransformable();
  var Animatable = requireAnimatable();
  var zrUtil2 = util$6;
  var Element = function(opts) {
    Transformable.call(this, opts);
    Eventful2.call(this, opts);
    Animatable.call(this, opts);
    this.id = opts.id || guid2();
  };
  Element.prototype = {
    /**
     * 元素类型
     * Element type
     * @type {string}
     */
    type: "element",
    /**
     * 元素名字
     * Element name
     * @type {string}
     */
    name: "",
    /**
     * ZRender 实例对象，会在 element 添加到 zrender 实例中后自动赋值
     * ZRender instance will be assigned when element is associated with zrender
     * @name module:/zrender/Element#__zr
     * @type {module:zrender/ZRender}
     */
    __zr: null,
    /**
     * 图形是否忽略，为true时忽略图形的绘制以及事件触发
     * If ignore drawing and events of the element object
     * @name module:/zrender/Element#ignore
     * @type {boolean}
     * @default false
     */
    ignore: false,
    /**
     * 用于裁剪的路径(shape)，所有 Group 内的路径在绘制时都会被这个路径裁剪
     * 该路径会继承被裁减对象的变换
     * @type {module:zrender/graphic/Path}
     * @see http://www.w3.org/TR/2dcontext/#clipping-region
     * @readOnly
     */
    clipPath: null,
    /**
     * 是否是 Group
     * @type {boolean}
     */
    isGroup: false,
    /**
     * Drift element
     * @param  {number} dx dx on the global space
     * @param  {number} dy dy on the global space
     */
    drift: function(dx, dy) {
      switch (this.draggable) {
        case "horizontal":
          dy = 0;
          break;
        case "vertical":
          dx = 0;
          break;
      }
      var m = this.transform;
      if (!m) {
        m = this.transform = [1, 0, 0, 1, 0, 0];
      }
      m[4] += dx;
      m[5] += dy;
      this.decomposeTransform();
      this.dirty(false);
    },
    /**
     * Hook before update
     */
    beforeUpdate: function() {
    },
    /**
     * Hook after update
     */
    afterUpdate: function() {
    },
    /**
     * Update each frame
     */
    update: function() {
      this.updateTransform();
    },
    /**
     * @param  {Function} cb
     * @param  {}   context
     */
    traverse: function(cb, context) {
    },
    /**
     * @protected
     */
    attrKV: function(key, value) {
      if (key === "position" || key === "scale" || key === "origin") {
        if (value) {
          var target = this[key];
          if (!target) {
            target = this[key] = [];
          }
          target[0] = value[0];
          target[1] = value[1];
        }
      } else {
        this[key] = value;
      }
    },
    /**
     * Hide the element
     */
    hide: function() {
      this.ignore = true;
      this.__zr && this.__zr.refresh();
    },
    /**
     * Show the element
     */
    show: function() {
      this.ignore = false;
      this.__zr && this.__zr.refresh();
    },
    /**
     * @param {string|Object} key
     * @param {*} value
     */
    attr: function(key, value) {
      if (typeof key === "string") {
        this.attrKV(key, value);
      } else if (zrUtil2.isObject(key)) {
        for (var name in key) {
          if (key.hasOwnProperty(name)) {
            this.attrKV(name, key[name]);
          }
        }
      }
      this.dirty(false);
      return this;
    },
    /**
     * @param {module:zrender/graphic/Path} clipPath
     */
    setClipPath: function(clipPath) {
      var zr = this.__zr;
      if (zr) {
        clipPath.addSelfToZr(zr);
      }
      if (this.clipPath && this.clipPath !== clipPath) {
        this.removeClipPath();
      }
      this.clipPath = clipPath;
      clipPath.__zr = zr;
      clipPath.__clipTarget = this;
      this.dirty(false);
    },
    /**
     */
    removeClipPath: function() {
      var clipPath = this.clipPath;
      if (clipPath) {
        if (clipPath.__zr) {
          clipPath.removeSelfFromZr(clipPath.__zr);
        }
        clipPath.__zr = null;
        clipPath.__clipTarget = null;
        this.clipPath = null;
        this.dirty(false);
      }
    },
    /**
     * Add self from zrender instance.
     * Not recursively because it will be invoked when element added to storage.
     * @param {module:zrender/ZRender} zr
     */
    addSelfToZr: function(zr) {
      this.__zr = zr;
      var animators = this.animators;
      if (animators) {
        for (var i = 0; i < animators.length; i++) {
          zr.animation.addAnimator(animators[i]);
        }
      }
      if (this.clipPath) {
        this.clipPath.addSelfToZr(zr);
      }
    },
    /**
     * Remove self from zrender instance.
     * Not recursively because it will be invoked when element added to storage.
     * @param {module:zrender/ZRender} zr
     */
    removeSelfFromZr: function(zr) {
      this.__zr = null;
      var animators = this.animators;
      if (animators) {
        for (var i = 0; i < animators.length; i++) {
          zr.animation.removeAnimator(animators[i]);
        }
      }
      if (this.clipPath) {
        this.clipPath.removeSelfFromZr(zr);
      }
    }
  };
  zrUtil2.mixin(Element, Animatable);
  zrUtil2.mixin(Element, Transformable);
  zrUtil2.mixin(Element, Eventful2);
  var _default2 = Element;
  Element_1 = _default2;
  return Element_1;
}
var BoundingRect_1;
var hasRequiredBoundingRect;
function requireBoundingRect() {
  if (hasRequiredBoundingRect) return BoundingRect_1;
  hasRequiredBoundingRect = 1;
  var vec22 = requireVector();
  var matrix2 = requireMatrix();
  var v2ApplyTransform = vec22.applyTransform;
  var mathMin = Math.min;
  var mathMax = Math.max;
  function BoundingRect2(x, y, width, height) {
    if (width < 0) {
      x = x + width;
      width = -width;
    }
    if (height < 0) {
      y = y + height;
      height = -height;
    }
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  BoundingRect2.prototype = {
    constructor: BoundingRect2,
    /**
     * @param {module:echarts/core/BoundingRect} other
     */
    union: function(other) {
      var x = mathMin(other.x, this.x);
      var y = mathMin(other.y, this.y);
      this.width = mathMax(other.x + other.width, this.x + this.width) - x;
      this.height = mathMax(other.y + other.height, this.y + this.height) - y;
      this.x = x;
      this.y = y;
    },
    /**
     * @param {Array.<number>} m
     * @methods
     */
    applyTransform: /* @__PURE__ */ function() {
      var lt = [];
      var rb = [];
      var lb = [];
      var rt = [];
      return function(m) {
        if (!m) {
          return;
        }
        lt[0] = lb[0] = this.x;
        lt[1] = rt[1] = this.y;
        rb[0] = rt[0] = this.x + this.width;
        rb[1] = lb[1] = this.y + this.height;
        v2ApplyTransform(lt, lt, m);
        v2ApplyTransform(rb, rb, m);
        v2ApplyTransform(lb, lb, m);
        v2ApplyTransform(rt, rt, m);
        this.x = mathMin(lt[0], rb[0], lb[0], rt[0]);
        this.y = mathMin(lt[1], rb[1], lb[1], rt[1]);
        var maxX = mathMax(lt[0], rb[0], lb[0], rt[0]);
        var maxY = mathMax(lt[1], rb[1], lb[1], rt[1]);
        this.width = maxX - this.x;
        this.height = maxY - this.y;
      };
    }(),
    /**
     * Calculate matrix of transforming from self to target rect
     * @param  {module:zrender/core/BoundingRect} b
     * @return {Array.<number>}
     */
    calculateTransform: function(b) {
      var a = this;
      var sx = b.width / a.width;
      var sy = b.height / a.height;
      var m = matrix2.create();
      matrix2.translate(m, m, [-a.x, -a.y]);
      matrix2.scale(m, m, [sx, sy]);
      matrix2.translate(m, m, [b.x, b.y]);
      return m;
    },
    /**
     * @param {(module:echarts/core/BoundingRect|Object)} b
     * @return {boolean}
     */
    intersect: function(b) {
      if (!b) {
        return false;
      }
      if (!(b instanceof BoundingRect2)) {
        b = BoundingRect2.create(b);
      }
      var a = this;
      var ax0 = a.x;
      var ax1 = a.x + a.width;
      var ay0 = a.y;
      var ay1 = a.y + a.height;
      var bx0 = b.x;
      var bx1 = b.x + b.width;
      var by0 = b.y;
      var by1 = b.y + b.height;
      return !(ax1 < bx0 || bx1 < ax0 || ay1 < by0 || by1 < ay0);
    },
    contain: function(x, y) {
      var rect = this;
      return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    },
    /**
     * @return {module:echarts/core/BoundingRect}
     */
    clone: function() {
      return new BoundingRect2(this.x, this.y, this.width, this.height);
    },
    /**
     * Copy from another rect
     */
    copy: function(other) {
      this.x = other.x;
      this.y = other.y;
      this.width = other.width;
      this.height = other.height;
    },
    plain: function() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      };
    }
  };
  BoundingRect2.create = function(rect) {
    return new BoundingRect2(rect.x, rect.y, rect.width, rect.height);
  };
  var _default2 = BoundingRect2;
  BoundingRect_1 = _default2;
  return BoundingRect_1;
}
var Group_1;
var hasRequiredGroup;
function requireGroup() {
  if (hasRequiredGroup) return Group_1;
  hasRequiredGroup = 1;
  var zrUtil2 = util$6;
  var Element = requireElement();
  var BoundingRect2 = requireBoundingRect();
  var Group2 = function(opts) {
    opts = opts || {};
    Element.call(this, opts);
    for (var key in opts) {
      if (opts.hasOwnProperty(key)) {
        this[key] = opts[key];
      }
    }
    this._children = [];
    this.__storage = null;
    this.__dirty = true;
  };
  Group2.prototype = {
    constructor: Group2,
    isGroup: true,
    /**
     * @type {string}
     */
    type: "group",
    /**
     * 所有子孙元素是否响应鼠标事件
     * @name module:/zrender/container/Group#silent
     * @type {boolean}
     * @default false
     */
    silent: false,
    /**
     * @return {Array.<module:zrender/Element>}
     */
    children: function() {
      return this._children.slice();
    },
    /**
     * 获取指定 index 的儿子节点
     * @param  {number} idx
     * @return {module:zrender/Element}
     */
    childAt: function(idx) {
      return this._children[idx];
    },
    /**
     * 获取指定名字的儿子节点
     * @param  {string} name
     * @return {module:zrender/Element}
     */
    childOfName: function(name) {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        if (children[i].name === name) {
          return children[i];
        }
      }
    },
    /**
     * @return {number}
     */
    childCount: function() {
      return this._children.length;
    },
    /**
     * 添加子节点到最后
     * @param {module:zrender/Element} child
     */
    add: function(child) {
      if (child && child !== this && child.parent !== this) {
        this._children.push(child);
        this._doAdd(child);
      }
      return this;
    },
    /**
     * 添加子节点在 nextSibling 之前
     * @param {module:zrender/Element} child
     * @param {module:zrender/Element} nextSibling
     */
    addBefore: function(child, nextSibling) {
      if (child && child !== this && child.parent !== this && nextSibling && nextSibling.parent === this) {
        var children = this._children;
        var idx = children.indexOf(nextSibling);
        if (idx >= 0) {
          children.splice(idx, 0, child);
          this._doAdd(child);
        }
      }
      return this;
    },
    _doAdd: function(child) {
      if (child.parent) {
        child.parent.remove(child);
      }
      child.parent = this;
      var storage = this.__storage;
      var zr = this.__zr;
      if (storage && storage !== child.__storage) {
        storage.addToStorage(child);
        if (child instanceof Group2) {
          child.addChildrenToStorage(storage);
        }
      }
      zr && zr.refresh();
    },
    /**
     * 移除子节点
     * @param {module:zrender/Element} child
     */
    remove: function(child) {
      var zr = this.__zr;
      var storage = this.__storage;
      var children = this._children;
      var idx = zrUtil2.indexOf(children, child);
      if (idx < 0) {
        return this;
      }
      children.splice(idx, 1);
      child.parent = null;
      if (storage) {
        storage.delFromStorage(child);
        if (child instanceof Group2) {
          child.delChildrenFromStorage(storage);
        }
      }
      zr && zr.refresh();
      return this;
    },
    /**
     * 移除所有子节点
     */
    removeAll: function() {
      var children = this._children;
      var storage = this.__storage;
      var child;
      var i;
      for (i = 0; i < children.length; i++) {
        child = children[i];
        if (storage) {
          storage.delFromStorage(child);
          if (child instanceof Group2) {
            child.delChildrenFromStorage(storage);
          }
        }
        child.parent = null;
      }
      children.length = 0;
      return this;
    },
    /**
     * 遍历所有子节点
     * @param  {Function} cb
     * @param  {}   context
     */
    eachChild: function(cb, context) {
      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        cb.call(context, child, i);
      }
      return this;
    },
    /**
     * 深度优先遍历所有子孙节点
     * @param  {Function} cb
     * @param  {}   context
     */
    traverse: function(cb, context) {
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        cb.call(context, child);
        if (child.type === "group") {
          child.traverse(cb, context);
        }
      }
      return this;
    },
    addChildrenToStorage: function(storage) {
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        storage.addToStorage(child);
        if (child instanceof Group2) {
          child.addChildrenToStorage(storage);
        }
      }
    },
    delChildrenFromStorage: function(storage) {
      for (var i = 0; i < this._children.length; i++) {
        var child = this._children[i];
        storage.delFromStorage(child);
        if (child instanceof Group2) {
          child.delChildrenFromStorage(storage);
        }
      }
    },
    dirty: function() {
      this.__dirty = true;
      this.__zr && this.__zr.refresh();
      return this;
    },
    /**
     * @return {module:zrender/core/BoundingRect}
     */
    getBoundingRect: function(includeChildren) {
      var rect = null;
      var tmpRect2 = new BoundingRect2(0, 0, 0, 0);
      var children = includeChildren || this._children;
      var tmpMat = [];
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.ignore || child.invisible) {
          continue;
        }
        var childRect = child.getBoundingRect();
        var transform = child.getLocalTransform(tmpMat);
        if (transform) {
          tmpRect2.copy(childRect);
          tmpRect2.applyTransform(transform);
          rect = rect || tmpRect2.clone();
          rect.union(tmpRect2);
        } else {
          rect = rect || childRect.clone();
          rect.union(childRect);
        }
      }
      return rect || tmpRect2;
    }
  };
  zrUtil2.inherits(Group2, Element);
  var _default2 = Group2;
  Group_1 = _default2;
  return Group_1;
}
var DEFAULT_MIN_MERGE = 32;
var DEFAULT_MIN_GALLOPING = 7;
function minRunLength(n) {
  var r = 0;
  while (n >= DEFAULT_MIN_MERGE) {
    r |= n & 1;
    n >>= 1;
  }
  return n + r;
}
function makeAscendingRun(array, lo, hi, compare) {
  var runHi = lo + 1;
  if (runHi === hi) {
    return 1;
  }
  if (compare(array[runHi++], array[lo]) < 0) {
    while (runHi < hi && compare(array[runHi], array[runHi - 1]) < 0) {
      runHi++;
    }
    reverseRun(array, lo, runHi);
  } else {
    while (runHi < hi && compare(array[runHi], array[runHi - 1]) >= 0) {
      runHi++;
    }
  }
  return runHi - lo;
}
function reverseRun(array, lo, hi) {
  hi--;
  while (lo < hi) {
    var t = array[lo];
    array[lo++] = array[hi];
    array[hi--] = t;
  }
}
function binaryInsertionSort(array, lo, hi, start, compare) {
  if (start === lo) {
    start++;
  }
  for (; start < hi; start++) {
    var pivot = array[start];
    var left = lo;
    var right = start;
    var mid;
    while (left < right) {
      mid = left + right >>> 1;
      if (compare(pivot, array[mid]) < 0) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    var n = start - left;
    switch (n) {
      case 3:
        array[left + 3] = array[left + 2];
      case 2:
        array[left + 2] = array[left + 1];
      case 1:
        array[left + 1] = array[left];
        break;
      default:
        while (n > 0) {
          array[left + n] = array[left + n - 1];
          n--;
        }
    }
    array[left] = pivot;
  }
}
function gallopLeft(value, array, start, length, hint, compare) {
  var lastOffset = 0;
  var maxOffset = 0;
  var offset = 1;
  if (compare(value, array[start + hint]) > 0) {
    maxOffset = length - hint;
    while (offset < maxOffset && compare(value, array[start + hint + offset]) > 0) {
      lastOffset = offset;
      offset = (offset << 1) + 1;
      if (offset <= 0) {
        offset = maxOffset;
      }
    }
    if (offset > maxOffset) {
      offset = maxOffset;
    }
    lastOffset += hint;
    offset += hint;
  } else {
    maxOffset = hint + 1;
    while (offset < maxOffset && compare(value, array[start + hint - offset]) <= 0) {
      lastOffset = offset;
      offset = (offset << 1) + 1;
      if (offset <= 0) {
        offset = maxOffset;
      }
    }
    if (offset > maxOffset) {
      offset = maxOffset;
    }
    var tmp = lastOffset;
    lastOffset = hint - offset;
    offset = hint - tmp;
  }
  lastOffset++;
  while (lastOffset < offset) {
    var m = lastOffset + (offset - lastOffset >>> 1);
    if (compare(value, array[start + m]) > 0) {
      lastOffset = m + 1;
    } else {
      offset = m;
    }
  }
  return offset;
}
function gallopRight(value, array, start, length, hint, compare) {
  var lastOffset = 0;
  var maxOffset = 0;
  var offset = 1;
  if (compare(value, array[start + hint]) < 0) {
    maxOffset = hint + 1;
    while (offset < maxOffset && compare(value, array[start + hint - offset]) < 0) {
      lastOffset = offset;
      offset = (offset << 1) + 1;
      if (offset <= 0) {
        offset = maxOffset;
      }
    }
    if (offset > maxOffset) {
      offset = maxOffset;
    }
    var tmp = lastOffset;
    lastOffset = hint - offset;
    offset = hint - tmp;
  } else {
    maxOffset = length - hint;
    while (offset < maxOffset && compare(value, array[start + hint + offset]) >= 0) {
      lastOffset = offset;
      offset = (offset << 1) + 1;
      if (offset <= 0) {
        offset = maxOffset;
      }
    }
    if (offset > maxOffset) {
      offset = maxOffset;
    }
    lastOffset += hint;
    offset += hint;
  }
  lastOffset++;
  while (lastOffset < offset) {
    var m = lastOffset + (offset - lastOffset >>> 1);
    if (compare(value, array[start + m]) < 0) {
      offset = m;
    } else {
      lastOffset = m + 1;
    }
  }
  return offset;
}
function TimSort(array, compare) {
  var minGallop = DEFAULT_MIN_GALLOPING;
  var runStart;
  var runLength;
  var stackSize = 0;
  array.length;
  var tmp = [];
  runStart = [];
  runLength = [];
  function pushRun(_runStart, _runLength) {
    runStart[stackSize] = _runStart;
    runLength[stackSize] = _runLength;
    stackSize += 1;
  }
  function mergeRuns() {
    while (stackSize > 1) {
      var n = stackSize - 2;
      if (n >= 1 && runLength[n - 1] <= runLength[n] + runLength[n + 1] || n >= 2 && runLength[n - 2] <= runLength[n] + runLength[n - 1]) {
        if (runLength[n - 1] < runLength[n + 1]) {
          n--;
        }
      } else if (runLength[n] > runLength[n + 1]) {
        break;
      }
      mergeAt(n);
    }
  }
  function forceMergeRuns() {
    while (stackSize > 1) {
      var n = stackSize - 2;
      if (n > 0 && runLength[n - 1] < runLength[n + 1]) {
        n--;
      }
      mergeAt(n);
    }
  }
  function mergeAt(i) {
    var start1 = runStart[i];
    var length1 = runLength[i];
    var start2 = runStart[i + 1];
    var length2 = runLength[i + 1];
    runLength[i] = length1 + length2;
    if (i === stackSize - 3) {
      runStart[i + 1] = runStart[i + 2];
      runLength[i + 1] = runLength[i + 2];
    }
    stackSize--;
    var k = gallopRight(array[start2], array, start1, length1, 0, compare);
    start1 += k;
    length1 -= k;
    if (length1 === 0) {
      return;
    }
    length2 = gallopLeft(array[start1 + length1 - 1], array, start2, length2, length2 - 1, compare);
    if (length2 === 0) {
      return;
    }
    if (length1 <= length2) {
      mergeLow(start1, length1, start2, length2);
    } else {
      mergeHigh(start1, length1, start2, length2);
    }
  }
  function mergeLow(start1, length1, start2, length2) {
    var i = 0;
    for (i = 0; i < length1; i++) {
      tmp[i] = array[start1 + i];
    }
    var cursor1 = 0;
    var cursor2 = start2;
    var dest = start1;
    array[dest++] = array[cursor2++];
    if (--length2 === 0) {
      for (i = 0; i < length1; i++) {
        array[dest + i] = tmp[cursor1 + i];
      }
      return;
    }
    if (length1 === 1) {
      for (i = 0; i < length2; i++) {
        array[dest + i] = array[cursor2 + i];
      }
      array[dest + length2] = tmp[cursor1];
      return;
    }
    var _minGallop = minGallop;
    var count1;
    var count2;
    var exit;
    while (1) {
      count1 = 0;
      count2 = 0;
      exit = false;
      do {
        if (compare(array[cursor2], tmp[cursor1]) < 0) {
          array[dest++] = array[cursor2++];
          count2++;
          count1 = 0;
          if (--length2 === 0) {
            exit = true;
            break;
          }
        } else {
          array[dest++] = tmp[cursor1++];
          count1++;
          count2 = 0;
          if (--length1 === 1) {
            exit = true;
            break;
          }
        }
      } while ((count1 | count2) < _minGallop);
      if (exit) {
        break;
      }
      do {
        count1 = gallopRight(array[cursor2], tmp, cursor1, length1, 0, compare);
        if (count1 !== 0) {
          for (i = 0; i < count1; i++) {
            array[dest + i] = tmp[cursor1 + i];
          }
          dest += count1;
          cursor1 += count1;
          length1 -= count1;
          if (length1 <= 1) {
            exit = true;
            break;
          }
        }
        array[dest++] = array[cursor2++];
        if (--length2 === 0) {
          exit = true;
          break;
        }
        count2 = gallopLeft(tmp[cursor1], array, cursor2, length2, 0, compare);
        if (count2 !== 0) {
          for (i = 0; i < count2; i++) {
            array[dest + i] = array[cursor2 + i];
          }
          dest += count2;
          cursor2 += count2;
          length2 -= count2;
          if (length2 === 0) {
            exit = true;
            break;
          }
        }
        array[dest++] = tmp[cursor1++];
        if (--length1 === 1) {
          exit = true;
          break;
        }
        _minGallop--;
      } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
      if (exit) {
        break;
      }
      if (_minGallop < 0) {
        _minGallop = 0;
      }
      _minGallop += 2;
    }
    minGallop = _minGallop;
    minGallop < 1 && (minGallop = 1);
    if (length1 === 1) {
      for (i = 0; i < length2; i++) {
        array[dest + i] = array[cursor2 + i];
      }
      array[dest + length2] = tmp[cursor1];
    } else if (length1 === 0) {
      throw new Error();
    } else {
      for (i = 0; i < length1; i++) {
        array[dest + i] = tmp[cursor1 + i];
      }
    }
  }
  function mergeHigh(start1, length1, start2, length2) {
    var i = 0;
    for (i = 0; i < length2; i++) {
      tmp[i] = array[start2 + i];
    }
    var cursor1 = start1 + length1 - 1;
    var cursor2 = length2 - 1;
    var dest = start2 + length2 - 1;
    var customCursor = 0;
    var customDest = 0;
    array[dest--] = array[cursor1--];
    if (--length1 === 0) {
      customCursor = dest - (length2 - 1);
      for (i = 0; i < length2; i++) {
        array[customCursor + i] = tmp[i];
      }
      return;
    }
    if (length2 === 1) {
      dest -= length1;
      cursor1 -= length1;
      customDest = dest + 1;
      customCursor = cursor1 + 1;
      for (i = length1 - 1; i >= 0; i--) {
        array[customDest + i] = array[customCursor + i];
      }
      array[dest] = tmp[cursor2];
      return;
    }
    var _minGallop = minGallop;
    while (true) {
      var count1 = 0;
      var count2 = 0;
      var exit = false;
      do {
        if (compare(tmp[cursor2], array[cursor1]) < 0) {
          array[dest--] = array[cursor1--];
          count1++;
          count2 = 0;
          if (--length1 === 0) {
            exit = true;
            break;
          }
        } else {
          array[dest--] = tmp[cursor2--];
          count2++;
          count1 = 0;
          if (--length2 === 1) {
            exit = true;
            break;
          }
        }
      } while ((count1 | count2) < _minGallop);
      if (exit) {
        break;
      }
      do {
        count1 = length1 - gallopRight(tmp[cursor2], array, start1, length1, length1 - 1, compare);
        if (count1 !== 0) {
          dest -= count1;
          cursor1 -= count1;
          length1 -= count1;
          customDest = dest + 1;
          customCursor = cursor1 + 1;
          for (i = count1 - 1; i >= 0; i--) {
            array[customDest + i] = array[customCursor + i];
          }
          if (length1 === 0) {
            exit = true;
            break;
          }
        }
        array[dest--] = tmp[cursor2--];
        if (--length2 === 1) {
          exit = true;
          break;
        }
        count2 = length2 - gallopLeft(array[cursor1], tmp, 0, length2, length2 - 1, compare);
        if (count2 !== 0) {
          dest -= count2;
          cursor2 -= count2;
          length2 -= count2;
          customDest = dest + 1;
          customCursor = cursor2 + 1;
          for (i = 0; i < count2; i++) {
            array[customDest + i] = tmp[customCursor + i];
          }
          if (length2 <= 1) {
            exit = true;
            break;
          }
        }
        array[dest--] = array[cursor1--];
        if (--length1 === 0) {
          exit = true;
          break;
        }
        _minGallop--;
      } while (count1 >= DEFAULT_MIN_GALLOPING || count2 >= DEFAULT_MIN_GALLOPING);
      if (exit) {
        break;
      }
      if (_minGallop < 0) {
        _minGallop = 0;
      }
      _minGallop += 2;
    }
    minGallop = _minGallop;
    if (minGallop < 1) {
      minGallop = 1;
    }
    if (length2 === 1) {
      dest -= length1;
      cursor1 -= length1;
      customDest = dest + 1;
      customCursor = cursor1 + 1;
      for (i = length1 - 1; i >= 0; i--) {
        array[customDest + i] = array[customCursor + i];
      }
      array[dest] = tmp[cursor2];
    } else if (length2 === 0) {
      throw new Error();
    } else {
      customCursor = dest - (length2 - 1);
      for (i = 0; i < length2; i++) {
        array[customCursor + i] = tmp[i];
      }
    }
  }
  this.mergeRuns = mergeRuns;
  this.forceMergeRuns = forceMergeRuns;
  this.pushRun = pushRun;
}
function sort(array, compare, lo, hi) {
  if (!lo) {
    lo = 0;
  }
  if (!hi) {
    hi = array.length;
  }
  var remaining = hi - lo;
  if (remaining < 2) {
    return;
  }
  var runLength = 0;
  if (remaining < DEFAULT_MIN_MERGE) {
    runLength = makeAscendingRun(array, lo, hi, compare);
    binaryInsertionSort(array, lo, hi, lo + runLength, compare);
    return;
  }
  var ts = new TimSort(array, compare);
  var minRun = minRunLength(remaining);
  do {
    runLength = makeAscendingRun(array, lo, hi, compare);
    if (runLength < minRun) {
      var force = remaining;
      if (force > minRun) {
        force = minRun;
      }
      binaryInsertionSort(array, lo, lo + force, lo + runLength, compare);
      runLength = force;
    }
    ts.pushRun(lo, runLength);
    ts.mergeRuns();
    remaining -= runLength;
    lo += runLength;
  } while (remaining !== 0);
  ts.forceMergeRuns();
}
var timsort$2 = sort;
var util$4 = util$6;
var env$3 = env_1;
var Group = requireGroup();
var timsort$1 = timsort$2;
function shapeCompareFunc(a, b) {
  if (a.zlevel === b.zlevel) {
    if (a.z === b.z) {
      return a.z2 - b.z2;
    }
    return a.z - b.z;
  }
  return a.zlevel - b.zlevel;
}
var Storage$1 = function() {
  this._roots = [];
  this._displayList = [];
  this._displayListLen = 0;
};
Storage$1.prototype = {
  constructor: Storage$1,
  /**
   * @param  {Function} cb
   *
   */
  traverse: function(cb, context) {
    for (var i = 0; i < this._roots.length; i++) {
      this._roots[i].traverse(cb, context);
    }
  },
  /**
   * 返回所有图形的绘制队列
   * @param {boolean} [update=false] 是否在返回前更新该数组
   * @param {boolean} [includeIgnore=false] 是否包含 ignore 的数组, 在 update 为 true 的时候有效
   *
   * 详见{@link module:zrender/graphic/Displayable.prototype.updateDisplayList}
   * @return {Array.<module:zrender/graphic/Displayable>}
   */
  getDisplayList: function(update, includeIgnore) {
    includeIgnore = includeIgnore || false;
    if (update) {
      this.updateDisplayList(includeIgnore);
    }
    return this._displayList;
  },
  /**
   * 更新图形的绘制队列。
   * 每次绘制前都会调用，该方法会先深度优先遍历整个树，更新所有Group和Shape的变换并且把所有可见的Shape保存到数组中，
   * 最后根据绘制的优先级（zlevel > z > 插入顺序）排序得到绘制队列
   * @param {boolean} [includeIgnore=false] 是否包含 ignore 的数组
   */
  updateDisplayList: function(includeIgnore) {
    this._displayListLen = 0;
    var roots = this._roots;
    var displayList = this._displayList;
    for (var i = 0, len = roots.length; i < len; i++) {
      this._updateAndAddDisplayable(roots[i], null, includeIgnore);
    }
    displayList.length = this._displayListLen;
    env$3.canvasSupported && timsort$1(displayList, shapeCompareFunc);
  },
  _updateAndAddDisplayable: function(el, clipPaths, includeIgnore) {
    if (el.ignore && !includeIgnore) {
      return;
    }
    el.beforeUpdate();
    if (el.__dirty) {
      el.update();
    }
    el.afterUpdate();
    var userSetClipPath = el.clipPath;
    if (userSetClipPath) {
      if (clipPaths) {
        clipPaths = clipPaths.slice();
      } else {
        clipPaths = [];
      }
      var currentClipPath = userSetClipPath;
      var parentClipPath = el;
      while (currentClipPath) {
        currentClipPath.parent = parentClipPath;
        currentClipPath.updateTransform();
        clipPaths.push(currentClipPath);
        parentClipPath = currentClipPath;
        currentClipPath = currentClipPath.clipPath;
      }
    }
    if (el.isGroup) {
      var children = el._children;
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (el.__dirty) {
          child.__dirty = true;
        }
        this._updateAndAddDisplayable(child, clipPaths, includeIgnore);
      }
      el.__dirty = false;
    } else {
      el.__clipPaths = clipPaths;
      this._displayList[this._displayListLen++] = el;
    }
  },
  /**
   * 添加图形(Shape)或者组(Group)到根节点
   * @param {module:zrender/Element} el
   */
  addRoot: function(el) {
    if (el.__storage === this) {
      return;
    }
    if (el instanceof Group) {
      el.addChildrenToStorage(this);
    }
    this.addToStorage(el);
    this._roots.push(el);
  },
  /**
   * 删除指定的图形(Shape)或者组(Group)
   * @param {string|Array.<string>} [el] 如果为空清空整个Storage
   */
  delRoot: function(el) {
    if (el == null) {
      for (var i = 0; i < this._roots.length; i++) {
        var root = this._roots[i];
        if (root instanceof Group) {
          root.delChildrenFromStorage(this);
        }
      }
      this._roots = [];
      this._displayList = [];
      this._displayListLen = 0;
      return;
    }
    if (el instanceof Array) {
      for (var i = 0, l = el.length; i < l; i++) {
        this.delRoot(el[i]);
      }
      return;
    }
    var idx = util$4.indexOf(this._roots, el);
    if (idx >= 0) {
      this.delFromStorage(el);
      this._roots.splice(idx, 1);
      if (el instanceof Group) {
        el.delChildrenFromStorage(this);
      }
    }
  },
  addToStorage: function(el) {
    if (el) {
      el.__storage = this;
      el.dirty(false);
    }
    return this;
  },
  delFromStorage: function(el) {
    if (el) {
      el.__storage = null;
    }
    return this;
  },
  /**
   * 清空并且释放Storage
   */
  dispose: function() {
    this._renderList = this._roots = null;
  },
  displayableSortFunc: shapeCompareFunc
};
var _default$5 = Storage$1;
var Storage_1 = _default$5;
var fixShadow;
var hasRequiredFixShadow;
function requireFixShadow() {
  if (hasRequiredFixShadow) return fixShadow;
  hasRequiredFixShadow = 1;
  var SHADOW_PROPS = {
    "shadowBlur": 1,
    "shadowOffsetX": 1,
    "shadowOffsetY": 1,
    "textShadowBlur": 1,
    "textShadowOffsetX": 1,
    "textShadowOffsetY": 1,
    "textBoxShadowBlur": 1,
    "textBoxShadowOffsetX": 1,
    "textBoxShadowOffsetY": 1
  };
  function _default2(ctx, propName, value) {
    if (SHADOW_PROPS.hasOwnProperty(propName)) {
      return value *= ctx.dpr;
    }
    return value;
  }
  fixShadow = _default2;
  return fixShadow;
}
var constant = {};
var hasRequiredConstant;
function requireConstant() {
  if (hasRequiredConstant) return constant;
  hasRequiredConstant = 1;
  var ContextCachedBy = {
    NONE: 0,
    STYLE_BIND: 1,
    PLAIN_TEXT: 2
  };
  var WILL_BE_RESTORED = 9;
  constant.ContextCachedBy = ContextCachedBy;
  constant.WILL_BE_RESTORED = WILL_BE_RESTORED;
  return constant;
}
var Style_1;
var hasRequiredStyle;
function requireStyle() {
  if (hasRequiredStyle) return Style_1;
  hasRequiredStyle = 1;
  var fixShadow2 = requireFixShadow();
  var _constant = requireConstant();
  var ContextCachedBy = _constant.ContextCachedBy;
  var STYLE_COMMON_PROPS = [["shadowBlur", 0], ["shadowOffsetX", 0], ["shadowOffsetY", 0], ["shadowColor", "#000"], ["lineCap", "butt"], ["lineJoin", "miter"], ["miterLimit", 10]];
  var Style2 = function(opts) {
    this.extendFrom(opts, false);
  };
  function createLinearGradient(ctx, obj, rect) {
    var x = obj.x == null ? 0 : obj.x;
    var x2 = obj.x2 == null ? 1 : obj.x2;
    var y = obj.y == null ? 0 : obj.y;
    var y2 = obj.y2 == null ? 0 : obj.y2;
    if (!obj.global) {
      x = x * rect.width + rect.x;
      x2 = x2 * rect.width + rect.x;
      y = y * rect.height + rect.y;
      y2 = y2 * rect.height + rect.y;
    }
    x = isNaN(x) ? 0 : x;
    x2 = isNaN(x2) ? 1 : x2;
    y = isNaN(y) ? 0 : y;
    y2 = isNaN(y2) ? 0 : y2;
    var canvasGradient = ctx.createLinearGradient(x, y, x2, y2);
    return canvasGradient;
  }
  function createRadialGradient(ctx, obj, rect) {
    var width = rect.width;
    var height = rect.height;
    var min = Math.min(width, height);
    var x = obj.x == null ? 0.5 : obj.x;
    var y = obj.y == null ? 0.5 : obj.y;
    var r = obj.r == null ? 0.5 : obj.r;
    if (!obj.global) {
      x = x * width + rect.x;
      y = y * height + rect.y;
      r = r * min;
    }
    var canvasGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    return canvasGradient;
  }
  Style2.prototype = {
    constructor: Style2,
    /**
     * @type {string}
     */
    fill: "#000",
    /**
     * @type {string}
     */
    stroke: null,
    /**
     * @type {number}
     */
    opacity: 1,
    /**
     * @type {number}
     */
    fillOpacity: null,
    /**
     * @type {number}
     */
    strokeOpacity: null,
    /**
     * `true` is not supported.
     * `false`/`null`/`undefined` are the same.
     * `false` is used to remove lineDash in some
     * case that `null`/`undefined` can not be set.
     * (e.g., emphasis.lineStyle in echarts)
     * @type {Array.<number>|boolean}
     */
    lineDash: null,
    /**
     * @type {number}
     */
    lineDashOffset: 0,
    /**
     * @type {number}
     */
    shadowBlur: 0,
    /**
     * @type {number}
     */
    shadowOffsetX: 0,
    /**
     * @type {number}
     */
    shadowOffsetY: 0,
    /**
     * @type {number}
     */
    lineWidth: 1,
    /**
     * If stroke ignore scale
     * @type {Boolean}
     */
    strokeNoScale: false,
    // Bounding rect text configuration
    // Not affected by element transform
    /**
     * @type {string}
     */
    text: null,
    /**
     * If `fontSize` or `fontFamily` exists, `font` will be reset by
     * `fontSize`, `fontStyle`, `fontWeight`, `fontFamily`.
     * So do not visit it directly in upper application (like echarts),
     * but use `contain/text#makeFont` instead.
     * @type {string}
     */
    font: null,
    /**
     * The same as font. Use font please.
     * @deprecated
     * @type {string}
     */
    textFont: null,
    /**
     * It helps merging respectively, rather than parsing an entire font string.
     * @type {string}
     */
    fontStyle: null,
    /**
     * It helps merging respectively, rather than parsing an entire font string.
     * @type {string}
     */
    fontWeight: null,
    /**
     * It helps merging respectively, rather than parsing an entire font string.
     * Should be 12 but not '12px'.
     * @type {number}
     */
    fontSize: null,
    /**
     * It helps merging respectively, rather than parsing an entire font string.
     * @type {string}
     */
    fontFamily: null,
    /**
     * Reserved for special functinality, like 'hr'.
     * @type {string}
     */
    textTag: null,
    /**
     * @type {string}
     */
    textFill: "#000",
    /**
     * @type {string}
     */
    textStroke: null,
    /**
     * @type {number}
     */
    textWidth: null,
    /**
     * Only for textBackground.
     * @type {number}
     */
    textHeight: null,
    /**
     * textStroke may be set as some color as a default
     * value in upper applicaion, where the default value
     * of textStrokeWidth should be 0 to make sure that
     * user can choose to do not use text stroke.
     * @type {number}
     */
    textStrokeWidth: 0,
    /**
     * @type {number}
     */
    textLineHeight: null,
    /**
     * 'inside', 'left', 'right', 'top', 'bottom'
     * [x, y]
     * Based on x, y of rect.
     * @type {string|Array.<number>}
     * @default 'inside'
     */
    textPosition: "inside",
    /**
     * If not specified, use the boundingRect of a `displayable`.
     * @type {Object}
     */
    textRect: null,
    /**
     * [x, y]
     * @type {Array.<number>}
     */
    textOffset: null,
    /**
     * @type {string}
     */
    textAlign: null,
    /**
     * @type {string}
     */
    textVerticalAlign: null,
    /**
     * @type {number}
     */
    textDistance: 5,
    /**
     * @type {string}
     */
    textShadowColor: "transparent",
    /**
     * @type {number}
     */
    textShadowBlur: 0,
    /**
     * @type {number}
     */
    textShadowOffsetX: 0,
    /**
     * @type {number}
     */
    textShadowOffsetY: 0,
    /**
     * @type {string}
     */
    textBoxShadowColor: "transparent",
    /**
     * @type {number}
     */
    textBoxShadowBlur: 0,
    /**
     * @type {number}
     */
    textBoxShadowOffsetX: 0,
    /**
     * @type {number}
     */
    textBoxShadowOffsetY: 0,
    /**
     * Whether transform text.
     * Only available in Path and Image element,
     * where the text is called as `RectText`.
     * @type {boolean}
     */
    transformText: false,
    /**
     * Text rotate around position of Path or Image.
     * The origin of the rotation can be specified by `textOrigin`.
     * Only available in Path and Image element,
     * where the text is called as `RectText`.
     */
    textRotation: 0,
    /**
     * Text origin of text rotation.
     * Useful in the case like label rotation of circular symbol.
     * Only available in Path and Image element, where the text is called
     * as `RectText` and the element is called as "host element".
     * The value can be:
     * + If specified as a coordinate like `[10, 40]`, it is the `[x, y]`
     * base on the left-top corner of the rect of its host element.
     * + If specified as a string `center`, it is the center of the rect of
     * its host element.
     * + By default, this origin is the `textPosition`.
     * @type {string|Array.<number>}
     */
    textOrigin: null,
    /**
     * @type {string}
     */
    textBackgroundColor: null,
    /**
     * @type {string}
     */
    textBorderColor: null,
    /**
     * @type {number}
     */
    textBorderWidth: 0,
    /**
     * @type {number}
     */
    textBorderRadius: 0,
    /**
     * Can be `2` or `[2, 4]` or `[2, 3, 4, 5]`
     * @type {number|Array.<number>}
     */
    textPadding: null,
    /**
     * Text styles for rich text.
     * @type {Object}
     */
    rich: null,
    /**
     * {outerWidth, outerHeight, ellipsis, placeholder}
     * @type {Object}
     */
    truncate: null,
    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
     * @type {string}
     */
    blend: null,
    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    bind: function(ctx, el, prevEl) {
      var style = this;
      var prevStyle = prevEl && prevEl.style;
      var notCheckCache = !prevStyle || ctx.__attrCachedBy !== ContextCachedBy.STYLE_BIND;
      ctx.__attrCachedBy = ContextCachedBy.STYLE_BIND;
      for (var i2 = 0; i2 < STYLE_COMMON_PROPS.length; i2++) {
        var prop2 = STYLE_COMMON_PROPS[i2];
        var styleName = prop2[0];
        if (notCheckCache || style[styleName] !== prevStyle[styleName]) {
          ctx[styleName] = fixShadow2(ctx, styleName, style[styleName] || prop2[1]);
        }
      }
      if (notCheckCache || style.fill !== prevStyle.fill) {
        ctx.fillStyle = style.fill;
      }
      if (notCheckCache || style.stroke !== prevStyle.stroke) {
        ctx.strokeStyle = style.stroke;
      }
      if (notCheckCache || style.opacity !== prevStyle.opacity) {
        ctx.globalAlpha = style.opacity == null ? 1 : style.opacity;
      }
      if (notCheckCache || style.blend !== prevStyle.blend) {
        ctx.globalCompositeOperation = style.blend || "source-over";
      }
      if (this.hasStroke()) {
        var lineWidth = style.lineWidth;
        ctx.lineWidth = lineWidth / (this.strokeNoScale && el && el.getLineScale ? el.getLineScale() : 1);
      }
    },
    hasFill: function() {
      var fill = this.fill;
      return fill != null && fill !== "none";
    },
    hasStroke: function() {
      var stroke = this.stroke;
      return stroke != null && stroke !== "none" && this.lineWidth > 0;
    },
    /**
     * Extend from other style
     * @param {zrender/graphic/Style} otherStyle
     * @param {boolean} overwrite true: overwrirte any way.
     *                            false: overwrite only when !target.hasOwnProperty
     *                            others: overwrite when property is not null/undefined.
     */
    extendFrom: function(otherStyle, overwrite) {
      if (otherStyle) {
        for (var name in otherStyle) {
          if (otherStyle.hasOwnProperty(name) && (overwrite === true || (overwrite === false ? !this.hasOwnProperty(name) : otherStyle[name] != null))) {
            this[name] = otherStyle[name];
          }
        }
      }
    },
    /**
     * Batch setting style with a given object
     * @param {Object|string} obj
     * @param {*} [obj]
     */
    set: function(obj, value) {
      if (typeof obj === "string") {
        this[obj] = value;
      } else {
        this.extendFrom(obj, true);
      }
    },
    /**
     * Clone
     * @return {zrender/graphic/Style} [description]
     */
    clone: function() {
      var newStyle = new this.constructor();
      newStyle.extendFrom(this, true);
      return newStyle;
    },
    getGradient: function(ctx, obj, rect) {
      var method = obj.type === "radial" ? createRadialGradient : createLinearGradient;
      var canvasGradient = method(ctx, obj, rect);
      var colorStops = obj.colorStops;
      for (var i2 = 0; i2 < colorStops.length; i2++) {
        canvasGradient.addColorStop(colorStops[i2].offset, colorStops[i2].color);
      }
      return canvasGradient;
    }
  };
  var styleProto = Style2.prototype;
  for (var i = 0; i < STYLE_COMMON_PROPS.length; i++) {
    var prop = STYLE_COMMON_PROPS[i];
    if (!(prop[0] in styleProto)) {
      styleProto[prop[0]] = prop[1];
    }
  }
  Style2.getGradient = styleProto.getGradient;
  var _default2 = Style2;
  Style_1 = _default2;
  return Style_1;
}
var Pattern_1;
var hasRequiredPattern;
function requirePattern() {
  if (hasRequiredPattern) return Pattern_1;
  hasRequiredPattern = 1;
  var Pattern2 = function(image2, repeat) {
    this.image = image2;
    this.repeat = repeat;
    this.type = "pattern";
  };
  Pattern2.prototype.getCanvasPattern = function(ctx) {
    return ctx.createPattern(this.image, this.repeat || "repeat");
  };
  var _default2 = Pattern2;
  Pattern_1 = _default2;
  return Pattern_1;
}
var util$3 = util$6;
var _config$1 = config;
var devicePixelRatio$1 = _config$1.devicePixelRatio;
var Style = requireStyle();
var Pattern = requirePattern();
function returnFalse() {
  return false;
}
function createDom(id, painter, dpr2) {
  var newDom = util$3.createCanvas();
  var width = painter.getWidth();
  var height = painter.getHeight();
  var newDomStyle = newDom.style;
  if (newDomStyle) {
    newDomStyle.position = "absolute";
    newDomStyle.left = 0;
    newDomStyle.top = 0;
    newDomStyle.width = width + "px";
    newDomStyle.height = height + "px";
    newDom.setAttribute("data-zr-dom-id", id);
  }
  newDom.width = width * dpr2;
  newDom.height = height * dpr2;
  return newDom;
}
var Layer$1 = function(id, painter, dpr2) {
  var dom2;
  dpr2 = dpr2 || devicePixelRatio$1;
  if (typeof id === "string") {
    dom2 = createDom(id, painter, dpr2);
  } else if (util$3.isObject(id)) {
    dom2 = id;
    id = dom2.id;
  }
  this.id = id;
  this.dom = dom2;
  var domStyle = dom2.style;
  if (domStyle) {
    dom2.onselectstart = returnFalse;
    domStyle["-webkit-user-select"] = "none";
    domStyle["user-select"] = "none";
    domStyle["-webkit-touch-callout"] = "none";
    domStyle["-webkit-tap-highlight-color"] = "rgba(0,0,0,0)";
    domStyle["padding"] = 0;
    domStyle["margin"] = 0;
    domStyle["border-width"] = 0;
  }
  this.domBack = null;
  this.ctxBack = null;
  this.painter = painter;
  this.config = null;
  this.clearColor = 0;
  this.motionBlur = false;
  this.lastFrameAlpha = 0.7;
  this.dpr = dpr2;
};
Layer$1.prototype = {
  constructor: Layer$1,
  __dirty: true,
  __used: false,
  __drawIndex: 0,
  __startIndex: 0,
  __endIndex: 0,
  incremental: false,
  getElementCount: function() {
    return this.__endIndex - this.__startIndex;
  },
  initContext: function() {
    this.ctx = this.dom.getContext("2d");
    this.ctx.dpr = this.dpr;
  },
  createBackBuffer: function() {
    var dpr2 = this.dpr;
    this.domBack = createDom("back-" + this.id, this.painter, dpr2);
    this.ctxBack = this.domBack.getContext("2d");
    if (dpr2 !== 1) {
      this.ctxBack.scale(dpr2, dpr2);
    }
  },
  /**
   * @param  {number} width
   * @param  {number} height
   */
  resize: function(width, height) {
    var dpr2 = this.dpr;
    var dom2 = this.dom;
    var domStyle = dom2.style;
    var domBack = this.domBack;
    if (domStyle) {
      domStyle.width = width + "px";
      domStyle.height = height + "px";
    }
    dom2.width = width * dpr2;
    dom2.height = height * dpr2;
    if (domBack) {
      domBack.width = width * dpr2;
      domBack.height = height * dpr2;
      if (dpr2 !== 1) {
        this.ctxBack.scale(dpr2, dpr2);
      }
    }
  },
  /**
   * 清空该层画布
   * @param {boolean} [clearAll]=false Clear all with out motion blur
   * @param {Color} [clearColor]
   */
  clear: function(clearAll, clearColor) {
    var dom2 = this.dom;
    var ctx = this.ctx;
    var width = dom2.width;
    var height = dom2.height;
    var clearColor = clearColor || this.clearColor;
    var haveMotionBLur = this.motionBlur && !clearAll;
    var lastFrameAlpha = this.lastFrameAlpha;
    var dpr2 = this.dpr;
    if (haveMotionBLur) {
      if (!this.domBack) {
        this.createBackBuffer();
      }
      this.ctxBack.globalCompositeOperation = "copy";
      this.ctxBack.drawImage(dom2, 0, 0, width / dpr2, height / dpr2);
    }
    ctx.clearRect(0, 0, width, height);
    if (clearColor && clearColor !== "transparent") {
      var clearColorGradientOrPattern;
      if (clearColor.colorStops) {
        clearColorGradientOrPattern = clearColor.__canvasGradient || Style.getGradient(ctx, clearColor, {
          x: 0,
          y: 0,
          width,
          height
        });
        clearColor.__canvasGradient = clearColorGradientOrPattern;
      } else if (clearColor.image) {
        clearColorGradientOrPattern = Pattern.prototype.getCanvasPattern.call(clearColor, ctx);
      }
      ctx.save();
      ctx.fillStyle = clearColorGradientOrPattern || clearColor;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
    if (haveMotionBLur) {
      var domBack = this.domBack;
      ctx.save();
      ctx.globalAlpha = lastFrameAlpha;
      ctx.drawImage(domBack, 0, 0, width, height);
      ctx.restore();
    }
  }
};
var _default$4 = Layer$1;
var Layer_1 = _default$4;
var _default$3 = typeof window !== "undefined" && (window.requestAnimationFrame && window.requestAnimationFrame.bind(window) || // https://github.com/ecomfe/zrender/issues/189#issuecomment-224919809
window.msRequestAnimationFrame && window.msRequestAnimationFrame.bind(window) || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame) || function(func) {
  setTimeout(func, 16);
};
var requestAnimationFrame$2 = _default$3;
var text$1 = {};
var text = {};
var image = {};
var hasRequiredImage$1;
function requireImage$1() {
  if (hasRequiredImage$1) return image;
  hasRequiredImage$1 = 1;
  var LRU = requireLRU();
  var globalImageCache = new LRU(50);
  function findExistImage(newImageOrSrc) {
    if (typeof newImageOrSrc === "string") {
      var cachedImgObj = globalImageCache.get(newImageOrSrc);
      return cachedImgObj && cachedImgObj.image;
    } else {
      return newImageOrSrc;
    }
  }
  function createOrUpdateImage(newImageOrSrc, image2, hostEl, cb, cbPayload) {
    if (!newImageOrSrc) {
      return image2;
    } else if (typeof newImageOrSrc === "string") {
      if (image2 && image2.__zrImageSrc === newImageOrSrc || !hostEl) {
        return image2;
      }
      var cachedImgObj = globalImageCache.get(newImageOrSrc);
      var pendingWrap = {
        hostEl,
        cb,
        cbPayload
      };
      if (cachedImgObj) {
        image2 = cachedImgObj.image;
        !isImageReady(image2) && cachedImgObj.pending.push(pendingWrap);
      } else {
        image2 = new Image();
        image2.onload = image2.onerror = imageOnLoad;
        globalImageCache.put(newImageOrSrc, image2.__cachedImgObj = {
          image: image2,
          pending: [pendingWrap]
        });
        image2.src = image2.__zrImageSrc = newImageOrSrc;
      }
      return image2;
    } else {
      return newImageOrSrc;
    }
  }
  function imageOnLoad() {
    var cachedImgObj = this.__cachedImgObj;
    this.onload = this.onerror = this.__cachedImgObj = null;
    for (var i = 0; i < cachedImgObj.pending.length; i++) {
      var pendingWrap = cachedImgObj.pending[i];
      var cb = pendingWrap.cb;
      cb && cb(this, pendingWrap.cbPayload);
      pendingWrap.hostEl.dirty();
    }
    cachedImgObj.pending.length = 0;
  }
  function isImageReady(image2) {
    return image2 && image2.width && image2.height;
  }
  image.findExistImage = findExistImage;
  image.createOrUpdateImage = createOrUpdateImage;
  image.isImageReady = isImageReady;
  return image;
}
var hasRequiredText$2;
function requireText$2() {
  if (hasRequiredText$2) return text;
  hasRequiredText$2 = 1;
  var BoundingRect2 = requireBoundingRect();
  var imageHelper = requireImage$1();
  var _util2 = util$6;
  var getContext2 = _util2.getContext;
  var extend2 = _util2.extend;
  var retrieve22 = _util2.retrieve2;
  var retrieve32 = _util2.retrieve3;
  var trim2 = _util2.trim;
  var textWidthCache = {};
  var textWidthCacheCounter = 0;
  var TEXT_CACHE_MAX = 5e3;
  var STYLE_REG = /\{([a-zA-Z0-9_]+)\|([^}]*)\}/g;
  var DEFAULT_FONT = "12px sans-serif";
  var methods2 = {};
  function $override2(name, fn) {
    methods2[name] = fn;
  }
  function getWidth(text2, font) {
    font = font || DEFAULT_FONT;
    var key = text2 + ":" + font;
    if (textWidthCache[key]) {
      return textWidthCache[key];
    }
    var textLines = (text2 + "").split("\n");
    var width = 0;
    for (var i = 0, l = textLines.length; i < l; i++) {
      width = Math.max(measureText(textLines[i], font).width, width);
    }
    if (textWidthCacheCounter > TEXT_CACHE_MAX) {
      textWidthCacheCounter = 0;
      textWidthCache = {};
    }
    textWidthCacheCounter++;
    textWidthCache[key] = width;
    return width;
  }
  function getBoundingRect(text2, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate) {
    return rich ? getRichTextRect(text2, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate) : getPlainTextRect(text2, font, textAlign, textVerticalAlign, textPadding, textLineHeight, truncate);
  }
  function getPlainTextRect(text2, font, textAlign, textVerticalAlign, textPadding, textLineHeight, truncate) {
    var contentBlock = parsePlainText(text2, font, textPadding, textLineHeight, truncate);
    var outerWidth = getWidth(text2, font);
    if (textPadding) {
      outerWidth += textPadding[1] + textPadding[3];
    }
    var outerHeight = contentBlock.outerHeight;
    var x = adjustTextX(0, outerWidth, textAlign);
    var y = adjustTextY(0, outerHeight, textVerticalAlign);
    var rect = new BoundingRect2(x, y, outerWidth, outerHeight);
    rect.lineHeight = contentBlock.lineHeight;
    return rect;
  }
  function getRichTextRect(text2, font, textAlign, textVerticalAlign, textPadding, textLineHeight, rich, truncate) {
    var contentBlock = parseRichText(text2, {
      rich,
      truncate,
      font,
      textAlign,
      textPadding,
      textLineHeight
    });
    var outerWidth = contentBlock.outerWidth;
    var outerHeight = contentBlock.outerHeight;
    var x = adjustTextX(0, outerWidth, textAlign);
    var y = adjustTextY(0, outerHeight, textVerticalAlign);
    return new BoundingRect2(x, y, outerWidth, outerHeight);
  }
  function adjustTextX(x, width, textAlign) {
    if (textAlign === "right") {
      x -= width;
    } else if (textAlign === "center") {
      x -= width / 2;
    }
    return x;
  }
  function adjustTextY(y, height, textVerticalAlign) {
    if (textVerticalAlign === "middle") {
      y -= height / 2;
    } else if (textVerticalAlign === "bottom") {
      y -= height;
    }
    return y;
  }
  function calculateTextPosition(out, style, rect) {
    var textPosition = style.textPosition;
    var distance = style.textDistance;
    var x = rect.x;
    var y = rect.y;
    distance = distance || 0;
    var height = rect.height;
    var width = rect.width;
    var halfHeight = height / 2;
    var textAlign = "left";
    var textVerticalAlign = "top";
    switch (textPosition) {
      case "left":
        x -= distance;
        y += halfHeight;
        textAlign = "right";
        textVerticalAlign = "middle";
        break;
      case "right":
        x += distance + width;
        y += halfHeight;
        textVerticalAlign = "middle";
        break;
      case "top":
        x += width / 2;
        y -= distance;
        textAlign = "center";
        textVerticalAlign = "bottom";
        break;
      case "bottom":
        x += width / 2;
        y += height + distance;
        textAlign = "center";
        break;
      case "inside":
        x += width / 2;
        y += halfHeight;
        textAlign = "center";
        textVerticalAlign = "middle";
        break;
      case "insideLeft":
        x += distance;
        y += halfHeight;
        textVerticalAlign = "middle";
        break;
      case "insideRight":
        x += width - distance;
        y += halfHeight;
        textAlign = "right";
        textVerticalAlign = "middle";
        break;
      case "insideTop":
        x += width / 2;
        y += distance;
        textAlign = "center";
        break;
      case "insideBottom":
        x += width / 2;
        y += height - distance;
        textAlign = "center";
        textVerticalAlign = "bottom";
        break;
      case "insideTopLeft":
        x += distance;
        y += distance;
        break;
      case "insideTopRight":
        x += width - distance;
        y += distance;
        textAlign = "right";
        break;
      case "insideBottomLeft":
        x += distance;
        y += height - distance;
        textVerticalAlign = "bottom";
        break;
      case "insideBottomRight":
        x += width - distance;
        y += height - distance;
        textAlign = "right";
        textVerticalAlign = "bottom";
        break;
    }
    out = out || {};
    out.x = x;
    out.y = y;
    out.textAlign = textAlign;
    out.textVerticalAlign = textVerticalAlign;
    return out;
  }
  function adjustTextPositionOnRect(textPosition, rect, distance) {
    var dummyStyle = {
      textPosition,
      textDistance: distance
    };
    return calculateTextPosition({}, dummyStyle, rect);
  }
  function truncateText(text2, containerWidth, font, ellipsis, options) {
    if (!containerWidth) {
      return "";
    }
    var textLines = (text2 + "").split("\n");
    options = prepareTruncateOptions(containerWidth, font, ellipsis, options);
    for (var i = 0, len = textLines.length; i < len; i++) {
      textLines[i] = truncateSingleLine(textLines[i], options);
    }
    return textLines.join("\n");
  }
  function prepareTruncateOptions(containerWidth, font, ellipsis, options) {
    options = extend2({}, options);
    options.font = font;
    var ellipsis = retrieve22(ellipsis, "...");
    options.maxIterations = retrieve22(options.maxIterations, 2);
    var minChar = options.minChar = retrieve22(options.minChar, 0);
    options.cnCharWidth = getWidth("国", font);
    var ascCharWidth = options.ascCharWidth = getWidth("a", font);
    options.placeholder = retrieve22(options.placeholder, "");
    var contentWidth = containerWidth = Math.max(0, containerWidth - 1);
    for (var i = 0; i < minChar && contentWidth >= ascCharWidth; i++) {
      contentWidth -= ascCharWidth;
    }
    var ellipsisWidth = getWidth(ellipsis, font);
    if (ellipsisWidth > contentWidth) {
      ellipsis = "";
      ellipsisWidth = 0;
    }
    contentWidth = containerWidth - ellipsisWidth;
    options.ellipsis = ellipsis;
    options.ellipsisWidth = ellipsisWidth;
    options.contentWidth = contentWidth;
    options.containerWidth = containerWidth;
    return options;
  }
  function truncateSingleLine(textLine, options) {
    var containerWidth = options.containerWidth;
    var font = options.font;
    var contentWidth = options.contentWidth;
    if (!containerWidth) {
      return "";
    }
    var lineWidth = getWidth(textLine, font);
    if (lineWidth <= containerWidth) {
      return textLine;
    }
    for (var j = 0; ; j++) {
      if (lineWidth <= contentWidth || j >= options.maxIterations) {
        textLine += options.ellipsis;
        break;
      }
      var subLength = j === 0 ? estimateLength(textLine, contentWidth, options.ascCharWidth, options.cnCharWidth) : lineWidth > 0 ? Math.floor(textLine.length * contentWidth / lineWidth) : 0;
      textLine = textLine.substr(0, subLength);
      lineWidth = getWidth(textLine, font);
    }
    if (textLine === "") {
      textLine = options.placeholder;
    }
    return textLine;
  }
  function estimateLength(text2, contentWidth, ascCharWidth, cnCharWidth) {
    var width = 0;
    var i = 0;
    for (var len = text2.length; i < len && width < contentWidth; i++) {
      var charCode = text2.charCodeAt(i);
      width += 0 <= charCode && charCode <= 127 ? ascCharWidth : cnCharWidth;
    }
    return i;
  }
  function getLineHeight(font) {
    return getWidth("国", font);
  }
  function measureText(text2, font) {
    return methods2.measureText(text2, font);
  }
  methods2.measureText = function(text2, font) {
    var ctx = getContext2();
    ctx.font = font || DEFAULT_FONT;
    return ctx.measureText(text2);
  };
  function parsePlainText(text2, font, padding, textLineHeight, truncate) {
    text2 != null && (text2 += "");
    var lineHeight = retrieve22(textLineHeight, getLineHeight(font));
    var lines = text2 ? text2.split("\n") : [];
    var height = lines.length * lineHeight;
    var outerHeight = height;
    var canCacheByTextString = true;
    if (padding) {
      outerHeight += padding[0] + padding[2];
    }
    if (text2 && truncate) {
      canCacheByTextString = false;
      var truncOuterHeight = truncate.outerHeight;
      var truncOuterWidth = truncate.outerWidth;
      if (truncOuterHeight != null && outerHeight > truncOuterHeight) {
        text2 = "";
        lines = [];
      } else if (truncOuterWidth != null) {
        var options = prepareTruncateOptions(truncOuterWidth - (padding ? padding[1] + padding[3] : 0), font, truncate.ellipsis, {
          minChar: truncate.minChar,
          placeholder: truncate.placeholder
        });
        for (var i = 0, len = lines.length; i < len; i++) {
          lines[i] = truncateSingleLine(lines[i], options);
        }
      }
    }
    return {
      lines,
      height,
      outerHeight,
      lineHeight,
      canCacheByTextString
    };
  }
  function parseRichText(text2, style) {
    var contentBlock = {
      lines: [],
      width: 0,
      height: 0
    };
    text2 != null && (text2 += "");
    if (!text2) {
      return contentBlock;
    }
    var lastIndex = STYLE_REG.lastIndex = 0;
    var result;
    while ((result = STYLE_REG.exec(text2)) != null) {
      var matchedIndex = result.index;
      if (matchedIndex > lastIndex) {
        pushTokens(contentBlock, text2.substring(lastIndex, matchedIndex));
      }
      pushTokens(contentBlock, result[2], result[1]);
      lastIndex = STYLE_REG.lastIndex;
    }
    if (lastIndex < text2.length) {
      pushTokens(contentBlock, text2.substring(lastIndex, text2.length));
    }
    var lines = contentBlock.lines;
    var contentHeight = 0;
    var contentWidth = 0;
    var pendingList = [];
    var stlPadding = style.textPadding;
    var truncate = style.truncate;
    var truncateWidth = truncate && truncate.outerWidth;
    var truncateHeight = truncate && truncate.outerHeight;
    if (stlPadding) {
      truncateWidth != null && (truncateWidth -= stlPadding[1] + stlPadding[3]);
      truncateHeight != null && (truncateHeight -= stlPadding[0] + stlPadding[2]);
    }
    for (var i = 0; i < lines.length; i++) {
      var line2 = lines[i];
      var lineHeight = 0;
      var lineWidth = 0;
      for (var j = 0; j < line2.tokens.length; j++) {
        var token = line2.tokens[j];
        var tokenStyle = token.styleName && style.rich[token.styleName] || {};
        var textPadding = token.textPadding = tokenStyle.textPadding;
        var font = token.font = tokenStyle.font || style.font;
        var tokenHeight = token.textHeight = retrieve22(
          // textHeight should not be inherited, consider it can be specified
          // as box height of the block.
          tokenStyle.textHeight,
          getLineHeight(font)
        );
        textPadding && (tokenHeight += textPadding[0] + textPadding[2]);
        token.height = tokenHeight;
        token.lineHeight = retrieve32(tokenStyle.textLineHeight, style.textLineHeight, tokenHeight);
        token.textAlign = tokenStyle && tokenStyle.textAlign || style.textAlign;
        token.textVerticalAlign = tokenStyle && tokenStyle.textVerticalAlign || "middle";
        if (truncateHeight != null && contentHeight + token.lineHeight > truncateHeight) {
          return {
            lines: [],
            width: 0,
            height: 0
          };
        }
        token.textWidth = getWidth(token.text, font);
        var tokenWidth = tokenStyle.textWidth;
        var tokenWidthNotSpecified = tokenWidth == null || tokenWidth === "auto";
        if (typeof tokenWidth === "string" && tokenWidth.charAt(tokenWidth.length - 1) === "%") {
          token.percentWidth = tokenWidth;
          pendingList.push(token);
          tokenWidth = 0;
        } else {
          if (tokenWidthNotSpecified) {
            tokenWidth = token.textWidth;
            var textBackgroundColor = tokenStyle.textBackgroundColor;
            var bgImg = textBackgroundColor && textBackgroundColor.image;
            if (bgImg) {
              bgImg = imageHelper.findExistImage(bgImg);
              if (imageHelper.isImageReady(bgImg)) {
                tokenWidth = Math.max(tokenWidth, bgImg.width * tokenHeight / bgImg.height);
              }
            }
          }
          var paddingW = textPadding ? textPadding[1] + textPadding[3] : 0;
          tokenWidth += paddingW;
          var remianTruncWidth = truncateWidth != null ? truncateWidth - lineWidth : null;
          if (remianTruncWidth != null && remianTruncWidth < tokenWidth) {
            if (!tokenWidthNotSpecified || remianTruncWidth < paddingW) {
              token.text = "";
              token.textWidth = tokenWidth = 0;
            } else {
              token.text = truncateText(token.text, remianTruncWidth - paddingW, font, truncate.ellipsis, {
                minChar: truncate.minChar
              });
              token.textWidth = getWidth(token.text, font);
              tokenWidth = token.textWidth + paddingW;
            }
          }
        }
        lineWidth += token.width = tokenWidth;
        tokenStyle && (lineHeight = Math.max(lineHeight, token.lineHeight));
      }
      line2.width = lineWidth;
      line2.lineHeight = lineHeight;
      contentHeight += lineHeight;
      contentWidth = Math.max(contentWidth, lineWidth);
    }
    contentBlock.outerWidth = contentBlock.width = retrieve22(style.textWidth, contentWidth);
    contentBlock.outerHeight = contentBlock.height = retrieve22(style.textHeight, contentHeight);
    if (stlPadding) {
      contentBlock.outerWidth += stlPadding[1] + stlPadding[3];
      contentBlock.outerHeight += stlPadding[0] + stlPadding[2];
    }
    for (var i = 0; i < pendingList.length; i++) {
      var token = pendingList[i];
      var percentWidth = token.percentWidth;
      token.width = parseInt(percentWidth, 10) / 100 * contentWidth;
    }
    return contentBlock;
  }
  function pushTokens(block, str, styleName) {
    var isEmptyStr = str === "";
    var strs = str.split("\n");
    var lines = block.lines;
    for (var i = 0; i < strs.length; i++) {
      var text2 = strs[i];
      var token = {
        styleName,
        text: text2,
        isLineHolder: !text2 && !isEmptyStr
      };
      if (!i) {
        var tokens = (lines[lines.length - 1] || (lines[0] = {
          tokens: []
        })).tokens;
        var tokensLen = tokens.length;
        tokensLen === 1 && tokens[0].isLineHolder ? tokens[0] = token : (
          // Consider text is '', only insert when it is the "lineHolder" or
          // "emptyStr". Otherwise a redundant '' will affect textAlign in line.
          (text2 || !tokensLen || isEmptyStr) && tokens.push(token)
        );
      } else {
        lines.push({
          tokens: [token]
        });
      }
    }
  }
  function makeFont(style) {
    var font = (style.fontSize || style.fontFamily) && [
      style.fontStyle,
      style.fontWeight,
      (style.fontSize || 12) + "px",
      // If font properties are defined, `fontFamily` should not be ignored.
      style.fontFamily || "sans-serif"
    ].join(" ");
    return font && trim2(font) || style.textFont || style.font;
  }
  text.DEFAULT_FONT = DEFAULT_FONT;
  text.$override = $override2;
  text.getWidth = getWidth;
  text.getBoundingRect = getBoundingRect;
  text.adjustTextX = adjustTextX;
  text.adjustTextY = adjustTextY;
  text.calculateTextPosition = calculateTextPosition;
  text.adjustTextPositionOnRect = adjustTextPositionOnRect;
  text.truncateText = truncateText;
  text.getLineHeight = getLineHeight;
  text.measureText = measureText;
  text.parsePlainText = parsePlainText;
  text.parseRichText = parseRichText;
  text.makeFont = makeFont;
  return text;
}
var roundRect = {};
var hasRequiredRoundRect;
function requireRoundRect() {
  if (hasRequiredRoundRect) return roundRect;
  hasRequiredRoundRect = 1;
  function buildPath(ctx, shape) {
    var x = shape.x;
    var y = shape.y;
    var width = shape.width;
    var height = shape.height;
    var r = shape.r;
    var r1;
    var r2;
    var r3;
    var r4;
    if (width < 0) {
      x = x + width;
      width = -width;
    }
    if (height < 0) {
      y = y + height;
      height = -height;
    }
    if (typeof r === "number") {
      r1 = r2 = r3 = r4 = r;
    } else if (r instanceof Array) {
      if (r.length === 1) {
        r1 = r2 = r3 = r4 = r[0];
      } else if (r.length === 2) {
        r1 = r3 = r[0];
        r2 = r4 = r[1];
      } else if (r.length === 3) {
        r1 = r[0];
        r2 = r4 = r[1];
        r3 = r[2];
      } else {
        r1 = r[0];
        r2 = r[1];
        r3 = r[2];
        r4 = r[3];
      }
    } else {
      r1 = r2 = r3 = r4 = 0;
    }
    var total;
    if (r1 + r2 > width) {
      total = r1 + r2;
      r1 *= width / total;
      r2 *= width / total;
    }
    if (r3 + r4 > width) {
      total = r3 + r4;
      r3 *= width / total;
      r4 *= width / total;
    }
    if (r2 + r3 > height) {
      total = r2 + r3;
      r2 *= height / total;
      r3 *= height / total;
    }
    if (r1 + r4 > height) {
      total = r1 + r4;
      r1 *= height / total;
      r4 *= height / total;
    }
    ctx.moveTo(x + r1, y);
    ctx.lineTo(x + width - r2, y);
    r2 !== 0 && ctx.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
    ctx.lineTo(x + width, y + height - r3);
    r3 !== 0 && ctx.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
    ctx.lineTo(x + r4, y + height);
    r4 !== 0 && ctx.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + r1);
    r1 !== 0 && ctx.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
  }
  roundRect.buildPath = buildPath;
  return roundRect;
}
var hasRequiredText$1;
function requireText$1() {
  if (hasRequiredText$1) return text$1;
  hasRequiredText$1 = 1;
  var _util2 = util$6;
  var retrieve22 = _util2.retrieve2;
  var retrieve32 = _util2.retrieve3;
  var each2 = _util2.each;
  var normalizeCssArray2 = _util2.normalizeCssArray;
  var isString2 = _util2.isString;
  var isObject2 = _util2.isObject;
  var textContain = requireText$2();
  var roundRectHelper = requireRoundRect();
  var imageHelper = requireImage$1();
  var fixShadow2 = requireFixShadow();
  var _constant = requireConstant();
  var ContextCachedBy = _constant.ContextCachedBy;
  var WILL_BE_RESTORED = _constant.WILL_BE_RESTORED;
  var DEFAULT_FONT = textContain.DEFAULT_FONT;
  var VALID_TEXT_ALIGN = {
    left: 1,
    right: 1,
    center: 1
  };
  var VALID_TEXT_VERTICAL_ALIGN = {
    top: 1,
    bottom: 1,
    middle: 1
  };
  var SHADOW_STYLE_COMMON_PROPS = [["textShadowBlur", "shadowBlur", 0], ["textShadowOffsetX", "shadowOffsetX", 0], ["textShadowOffsetY", "shadowOffsetY", 0], ["textShadowColor", "shadowColor", "transparent"]];
  var _tmpTextPositionResult = {};
  var _tmpBoxPositionResult = {};
  function normalizeTextStyle(style) {
    normalizeStyle(style);
    each2(style.rich, normalizeStyle);
    return style;
  }
  function normalizeStyle(style) {
    if (style) {
      style.font = textContain.makeFont(style);
      var textAlign = style.textAlign;
      textAlign === "middle" && (textAlign = "center");
      style.textAlign = textAlign == null || VALID_TEXT_ALIGN[textAlign] ? textAlign : "left";
      var textVerticalAlign = style.textVerticalAlign || style.textBaseline;
      textVerticalAlign === "center" && (textVerticalAlign = "middle");
      style.textVerticalAlign = textVerticalAlign == null || VALID_TEXT_VERTICAL_ALIGN[textVerticalAlign] ? textVerticalAlign : "top";
      var textPadding = style.textPadding;
      if (textPadding) {
        style.textPadding = normalizeCssArray2(style.textPadding);
      }
    }
  }
  function renderText(hostEl, ctx, text2, style, rect, prevEl) {
    style.rich ? renderRichText(hostEl, ctx, text2, style, rect, prevEl) : renderPlainText(hostEl, ctx, text2, style, rect, prevEl);
  }
  function renderPlainText(hostEl, ctx, text2, style, rect, prevEl) {
    var needDrawBg = needDrawBackground(style);
    var prevStyle;
    var checkCache = false;
    var cachedByMe = ctx.__attrCachedBy === ContextCachedBy.PLAIN_TEXT;
    if (prevEl !== WILL_BE_RESTORED) {
      if (prevEl) {
        prevStyle = prevEl.style;
        checkCache = !needDrawBg && cachedByMe && prevStyle;
      }
      ctx.__attrCachedBy = needDrawBg ? ContextCachedBy.NONE : ContextCachedBy.PLAIN_TEXT;
    } else if (cachedByMe) {
      ctx.__attrCachedBy = ContextCachedBy.NONE;
    }
    var styleFont = style.font || DEFAULT_FONT;
    if (!checkCache || styleFont !== (prevStyle.font || DEFAULT_FONT)) {
      ctx.font = styleFont;
    }
    var computedFont = hostEl.__computedFont;
    if (hostEl.__styleFont !== styleFont) {
      hostEl.__styleFont = styleFont;
      computedFont = hostEl.__computedFont = ctx.font;
    }
    var textPadding = style.textPadding;
    var textLineHeight = style.textLineHeight;
    var contentBlock = hostEl.__textCotentBlock;
    if (!contentBlock || hostEl.__dirtyText) {
      contentBlock = hostEl.__textCotentBlock = textContain.parsePlainText(text2, computedFont, textPadding, textLineHeight, style.truncate);
    }
    var outerHeight = contentBlock.outerHeight;
    var textLines = contentBlock.lines;
    var lineHeight = contentBlock.lineHeight;
    var boxPos = getBoxPosition(_tmpBoxPositionResult, hostEl, style, rect);
    var baseX = boxPos.baseX;
    var baseY = boxPos.baseY;
    var textAlign = boxPos.textAlign || "left";
    var textVerticalAlign = boxPos.textVerticalAlign;
    applyTextRotation(ctx, style, rect, baseX, baseY);
    var boxY = textContain.adjustTextY(baseY, outerHeight, textVerticalAlign);
    var textX = baseX;
    var textY = boxY;
    if (needDrawBg || textPadding) {
      var textWidth = textContain.getWidth(text2, computedFont);
      var outerWidth = textWidth;
      textPadding && (outerWidth += textPadding[1] + textPadding[3]);
      var boxX = textContain.adjustTextX(baseX, outerWidth, textAlign);
      needDrawBg && drawBackground(hostEl, ctx, style, boxX, boxY, outerWidth, outerHeight);
      if (textPadding) {
        textX = getTextXForPadding(baseX, textAlign, textPadding);
        textY += textPadding[0];
      }
    }
    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    ctx.globalAlpha = style.opacity || 1;
    for (var i = 0; i < SHADOW_STYLE_COMMON_PROPS.length; i++) {
      var propItem = SHADOW_STYLE_COMMON_PROPS[i];
      var styleProp = propItem[0];
      var ctxProp = propItem[1];
      var val = style[styleProp];
      if (!checkCache || val !== prevStyle[styleProp]) {
        ctx[ctxProp] = fixShadow2(ctx, ctxProp, val || propItem[2]);
      }
    }
    textY += lineHeight / 2;
    var textStrokeWidth = style.textStrokeWidth;
    var textStrokeWidthPrev = checkCache ? prevStyle.textStrokeWidth : null;
    var strokeWidthChanged = !checkCache || textStrokeWidth !== textStrokeWidthPrev;
    var strokeChanged = !checkCache || strokeWidthChanged || style.textStroke !== prevStyle.textStroke;
    var textStroke = getStroke(style.textStroke, textStrokeWidth);
    var textFill = getFill(style.textFill);
    if (textStroke) {
      if (strokeWidthChanged) {
        ctx.lineWidth = textStrokeWidth;
      }
      if (strokeChanged) {
        ctx.strokeStyle = textStroke;
      }
    }
    if (textFill) {
      if (!checkCache || style.textFill !== prevStyle.textFill) {
        ctx.fillStyle = textFill;
      }
    }
    if (textLines.length === 1) {
      textStroke && ctx.strokeText(textLines[0], textX, textY);
      textFill && ctx.fillText(textLines[0], textX, textY);
    } else {
      for (var i = 0; i < textLines.length; i++) {
        textStroke && ctx.strokeText(textLines[i], textX, textY);
        textFill && ctx.fillText(textLines[i], textX, textY);
        textY += lineHeight;
      }
    }
  }
  function renderRichText(hostEl, ctx, text2, style, rect, prevEl) {
    if (prevEl !== WILL_BE_RESTORED) {
      ctx.__attrCachedBy = ContextCachedBy.NONE;
    }
    var contentBlock = hostEl.__textCotentBlock;
    if (!contentBlock || hostEl.__dirtyText) {
      contentBlock = hostEl.__textCotentBlock = textContain.parseRichText(text2, style);
    }
    drawRichText(hostEl, ctx, contentBlock, style, rect);
  }
  function drawRichText(hostEl, ctx, contentBlock, style, rect) {
    var contentWidth = contentBlock.width;
    var outerWidth = contentBlock.outerWidth;
    var outerHeight = contentBlock.outerHeight;
    var textPadding = style.textPadding;
    var boxPos = getBoxPosition(_tmpBoxPositionResult, hostEl, style, rect);
    var baseX = boxPos.baseX;
    var baseY = boxPos.baseY;
    var textAlign = boxPos.textAlign;
    var textVerticalAlign = boxPos.textVerticalAlign;
    applyTextRotation(ctx, style, rect, baseX, baseY);
    var boxX = textContain.adjustTextX(baseX, outerWidth, textAlign);
    var boxY = textContain.adjustTextY(baseY, outerHeight, textVerticalAlign);
    var xLeft = boxX;
    var lineTop = boxY;
    if (textPadding) {
      xLeft += textPadding[3];
      lineTop += textPadding[0];
    }
    var xRight = xLeft + contentWidth;
    needDrawBackground(style) && drawBackground(hostEl, ctx, style, boxX, boxY, outerWidth, outerHeight);
    for (var i = 0; i < contentBlock.lines.length; i++) {
      var line2 = contentBlock.lines[i];
      var tokens = line2.tokens;
      var tokenCount = tokens.length;
      var lineHeight = line2.lineHeight;
      var usedWidth = line2.width;
      var leftIndex = 0;
      var lineXLeft = xLeft;
      var lineXRight = xRight;
      var rightIndex = tokenCount - 1;
      var token;
      while (leftIndex < tokenCount && (token = tokens[leftIndex], !token.textAlign || token.textAlign === "left")) {
        placeToken(hostEl, ctx, token, style, lineHeight, lineTop, lineXLeft, "left");
        usedWidth -= token.width;
        lineXLeft += token.width;
        leftIndex++;
      }
      while (rightIndex >= 0 && (token = tokens[rightIndex], token.textAlign === "right")) {
        placeToken(hostEl, ctx, token, style, lineHeight, lineTop, lineXRight, "right");
        usedWidth -= token.width;
        lineXRight -= token.width;
        rightIndex--;
      }
      lineXLeft += (contentWidth - (lineXLeft - xLeft) - (xRight - lineXRight) - usedWidth) / 2;
      while (leftIndex <= rightIndex) {
        token = tokens[leftIndex];
        placeToken(hostEl, ctx, token, style, lineHeight, lineTop, lineXLeft + token.width / 2, "center");
        lineXLeft += token.width;
        leftIndex++;
      }
      lineTop += lineHeight;
    }
  }
  function applyTextRotation(ctx, style, rect, x, y) {
    if (rect && style.textRotation) {
      var origin = style.textOrigin;
      if (origin === "center") {
        x = rect.width / 2 + rect.x;
        y = rect.height / 2 + rect.y;
      } else if (origin) {
        x = origin[0] + rect.x;
        y = origin[1] + rect.y;
      }
      ctx.translate(x, y);
      ctx.rotate(-style.textRotation);
      ctx.translate(-x, -y);
    }
  }
  function placeToken(hostEl, ctx, token, style, lineHeight, lineTop, x, textAlign) {
    var tokenStyle = style.rich[token.styleName] || {};
    tokenStyle.text = token.text;
    var textVerticalAlign = token.textVerticalAlign;
    var y = lineTop + lineHeight / 2;
    if (textVerticalAlign === "top") {
      y = lineTop + token.height / 2;
    } else if (textVerticalAlign === "bottom") {
      y = lineTop + lineHeight - token.height / 2;
    }
    !token.isLineHolder && needDrawBackground(tokenStyle) && drawBackground(hostEl, ctx, tokenStyle, textAlign === "right" ? x - token.width : textAlign === "center" ? x - token.width / 2 : x, y - token.height / 2, token.width, token.height);
    var textPadding = token.textPadding;
    if (textPadding) {
      x = getTextXForPadding(x, textAlign, textPadding);
      y -= token.height / 2 - textPadding[2] - token.textHeight / 2;
    }
    setCtx(ctx, "shadowBlur", retrieve32(tokenStyle.textShadowBlur, style.textShadowBlur, 0));
    setCtx(ctx, "shadowColor", tokenStyle.textShadowColor || style.textShadowColor || "transparent");
    setCtx(ctx, "shadowOffsetX", retrieve32(tokenStyle.textShadowOffsetX, style.textShadowOffsetX, 0));
    setCtx(ctx, "shadowOffsetY", retrieve32(tokenStyle.textShadowOffsetY, style.textShadowOffsetY, 0));
    setCtx(ctx, "textAlign", textAlign);
    setCtx(ctx, "textBaseline", "middle");
    setCtx(ctx, "font", token.font || DEFAULT_FONT);
    var textStroke = getStroke(tokenStyle.textStroke || style.textStroke, textStrokeWidth);
    var textFill = getFill(tokenStyle.textFill || style.textFill);
    var textStrokeWidth = retrieve22(tokenStyle.textStrokeWidth, style.textStrokeWidth);
    if (textStroke) {
      setCtx(ctx, "lineWidth", textStrokeWidth);
      setCtx(ctx, "strokeStyle", textStroke);
      ctx.strokeText(token.text, x, y);
    }
    if (textFill) {
      setCtx(ctx, "fillStyle", textFill);
      ctx.fillText(token.text, x, y);
    }
  }
  function needDrawBackground(style) {
    return !!(style.textBackgroundColor || style.textBorderWidth && style.textBorderColor);
  }
  function drawBackground(hostEl, ctx, style, x, y, width, height) {
    var textBackgroundColor = style.textBackgroundColor;
    var textBorderWidth = style.textBorderWidth;
    var textBorderColor = style.textBorderColor;
    var isPlainBg = isString2(textBackgroundColor);
    setCtx(ctx, "shadowBlur", style.textBoxShadowBlur || 0);
    setCtx(ctx, "shadowColor", style.textBoxShadowColor || "transparent");
    setCtx(ctx, "shadowOffsetX", style.textBoxShadowOffsetX || 0);
    setCtx(ctx, "shadowOffsetY", style.textBoxShadowOffsetY || 0);
    if (isPlainBg || textBorderWidth && textBorderColor) {
      ctx.beginPath();
      var textBorderRadius = style.textBorderRadius;
      if (!textBorderRadius) {
        ctx.rect(x, y, width, height);
      } else {
        roundRectHelper.buildPath(ctx, {
          x,
          y,
          width,
          height,
          r: textBorderRadius
        });
      }
      ctx.closePath();
    }
    if (isPlainBg) {
      setCtx(ctx, "fillStyle", textBackgroundColor);
      if (style.fillOpacity != null) {
        var originalGlobalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = style.fillOpacity * style.opacity;
        ctx.fill();
        ctx.globalAlpha = originalGlobalAlpha;
      } else {
        ctx.fill();
      }
    } else if (isObject2(textBackgroundColor)) {
      var image2 = textBackgroundColor.image;
      image2 = imageHelper.createOrUpdateImage(image2, null, hostEl, onBgImageLoaded, textBackgroundColor);
      if (image2 && imageHelper.isImageReady(image2)) {
        ctx.drawImage(image2, x, y, width, height);
      }
    }
    if (textBorderWidth && textBorderColor) {
      setCtx(ctx, "lineWidth", textBorderWidth);
      setCtx(ctx, "strokeStyle", textBorderColor);
      if (style.strokeOpacity != null) {
        var originalGlobalAlpha = ctx.globalAlpha;
        ctx.globalAlpha = style.strokeOpacity * style.opacity;
        ctx.stroke();
        ctx.globalAlpha = originalGlobalAlpha;
      } else {
        ctx.stroke();
      }
    }
  }
  function onBgImageLoaded(image2, textBackgroundColor) {
    textBackgroundColor.image = image2;
  }
  function getBoxPosition(out, hostEl, style, rect) {
    var baseX = style.x || 0;
    var baseY = style.y || 0;
    var textAlign = style.textAlign;
    var textVerticalAlign = style.textVerticalAlign;
    if (rect) {
      var textPosition = style.textPosition;
      if (textPosition instanceof Array) {
        baseX = rect.x + parsePercent(textPosition[0], rect.width);
        baseY = rect.y + parsePercent(textPosition[1], rect.height);
      } else {
        var res = hostEl && hostEl.calculateTextPosition ? hostEl.calculateTextPosition(_tmpTextPositionResult, style, rect) : textContain.calculateTextPosition(_tmpTextPositionResult, style, rect);
        baseX = res.x;
        baseY = res.y;
        textAlign = textAlign || res.textAlign;
        textVerticalAlign = textVerticalAlign || res.textVerticalAlign;
      }
      var textOffset = style.textOffset;
      if (textOffset) {
        baseX += textOffset[0];
        baseY += textOffset[1];
      }
    }
    out = out || {};
    out.baseX = baseX;
    out.baseY = baseY;
    out.textAlign = textAlign;
    out.textVerticalAlign = textVerticalAlign;
    return out;
  }
  function setCtx(ctx, prop, value) {
    ctx[prop] = fixShadow2(ctx, prop, value);
    return ctx[prop];
  }
  function getStroke(stroke, lineWidth) {
    return stroke == null || lineWidth <= 0 || stroke === "transparent" || stroke === "none" ? null : stroke.image || stroke.colorStops ? "#000" : stroke;
  }
  function getFill(fill) {
    return fill == null || fill === "none" ? null : fill.image || fill.colorStops ? "#000" : fill;
  }
  function parsePercent(value, maxValue) {
    if (typeof value === "string") {
      if (value.lastIndexOf("%") >= 0) {
        return parseFloat(value) / 100 * maxValue;
      }
      return parseFloat(value);
    }
    return value;
  }
  function getTextXForPadding(x, textAlign, textPadding) {
    return textAlign === "right" ? x - textPadding[1] : textAlign === "center" ? x + textPadding[3] / 2 - textPadding[1] / 2 : x + textPadding[3];
  }
  function needDrawText(text2, style) {
    return text2 != null && (text2 || style.textBackgroundColor || style.textBorderWidth && style.textBorderColor || style.textPadding);
  }
  text$1.normalizeTextStyle = normalizeTextStyle;
  text$1.renderText = renderText;
  text$1.getBoxPosition = getBoxPosition;
  text$1.getStroke = getStroke;
  text$1.getFill = getFill;
  text$1.parsePercent = parsePercent;
  text$1.needDrawText = needDrawText;
  return text$1;
}
var RectText_1;
var hasRequiredRectText;
function requireRectText() {
  if (hasRequiredRectText) return RectText_1;
  hasRequiredRectText = 1;
  var textHelper = requireText$1();
  var BoundingRect2 = requireBoundingRect();
  var _constant = requireConstant();
  var WILL_BE_RESTORED = _constant.WILL_BE_RESTORED;
  var tmpRect2 = new BoundingRect2();
  var RectText = function() {
  };
  RectText.prototype = {
    constructor: RectText,
    /**
     * Draw text in a rect with specified position.
     * @param  {CanvasRenderingContext2D} ctx
     * @param  {Object} rect Displayable rect
     */
    drawRectText: function(ctx, rect) {
      var style = this.style;
      rect = style.textRect || rect;
      this.__dirty && textHelper.normalizeTextStyle(style, true);
      var text2 = style.text;
      text2 != null && (text2 += "");
      if (!textHelper.needDrawText(text2, style)) {
        return;
      }
      ctx.save();
      var transform = this.transform;
      if (!style.transformText) {
        if (transform) {
          tmpRect2.copy(rect);
          tmpRect2.applyTransform(transform);
          rect = tmpRect2;
        }
      } else {
        this.setTransform(ctx);
      }
      textHelper.renderText(this, ctx, text2, style, rect, WILL_BE_RESTORED);
      ctx.restore();
    }
  };
  var _default2 = RectText;
  RectText_1 = _default2;
  return RectText_1;
}
var Displayable_1;
var hasRequiredDisplayable;
function requireDisplayable() {
  if (hasRequiredDisplayable) return Displayable_1;
  hasRequiredDisplayable = 1;
  var zrUtil2 = util$6;
  var Style2 = requireStyle();
  var Element = requireElement();
  var RectText = requireRectText();
  function Displayable(opts) {
    opts = opts || {};
    Element.call(this, opts);
    for (var name in opts) {
      if (opts.hasOwnProperty(name) && name !== "style") {
        this[name] = opts[name];
      }
    }
    this.style = new Style2(opts.style, this);
    this._rect = null;
    this.__clipPaths = null;
  }
  Displayable.prototype = {
    constructor: Displayable,
    type: "displayable",
    /**
     * Dirty flag. From which painter will determine if this displayable object needs brush.
     * @name module:zrender/graphic/Displayable#__dirty
     * @type {boolean}
     */
    __dirty: true,
    /**
     * Whether the displayable object is visible. when it is true, the displayable object
     * is not drawn, but the mouse event can still trigger the object.
     * @name module:/zrender/graphic/Displayable#invisible
     * @type {boolean}
     * @default false
     */
    invisible: false,
    /**
     * @name module:/zrender/graphic/Displayable#z
     * @type {number}
     * @default 0
     */
    z: 0,
    /**
     * @name module:/zrender/graphic/Displayable#z
     * @type {number}
     * @default 0
     */
    z2: 0,
    /**
     * The z level determines the displayable object can be drawn in which layer canvas.
     * @name module:/zrender/graphic/Displayable#zlevel
     * @type {number}
     * @default 0
     */
    zlevel: 0,
    /**
     * Whether it can be dragged.
     * @name module:/zrender/graphic/Displayable#draggable
     * @type {boolean}
     * @default false
     */
    draggable: false,
    /**
     * Whether is it dragging.
     * @name module:/zrender/graphic/Displayable#draggable
     * @type {boolean}
     * @default false
     */
    dragging: false,
    /**
     * Whether to respond to mouse events.
     * @name module:/zrender/graphic/Displayable#silent
     * @type {boolean}
     * @default false
     */
    silent: false,
    /**
     * If enable culling
     * @type {boolean}
     * @default false
     */
    culling: false,
    /**
     * Mouse cursor when hovered
     * @name module:/zrender/graphic/Displayable#cursor
     * @type {string}
     */
    cursor: "pointer",
    /**
     * If hover area is bounding rect
     * @name module:/zrender/graphic/Displayable#rectHover
     * @type {string}
     */
    rectHover: false,
    /**
     * Render the element progressively when the value >= 0,
     * usefull for large data.
     * @type {boolean}
     */
    progressive: false,
    /**
     * @type {boolean}
     */
    incremental: false,
    /**
     * Scale ratio for global scale.
     * @type {boolean}
     */
    globalScaleRatio: 1,
    beforeBrush: function(ctx) {
    },
    afterBrush: function(ctx) {
    },
    /**
     * Graphic drawing method.
     * @param {CanvasRenderingContext2D} ctx
     */
    // Interface
    brush: function(ctx, prevEl) {
    },
    /**
     * Get the minimum bounding box.
     * @return {module:zrender/core/BoundingRect}
     */
    // Interface
    getBoundingRect: function() {
    },
    /**
     * If displayable element contain coord x, y
     * @param  {number} x
     * @param  {number} y
     * @return {boolean}
     */
    contain: function(x, y) {
      return this.rectContain(x, y);
    },
    /**
     * @param  {Function} cb
     * @param  {}   context
     */
    traverse: function(cb, context) {
      cb.call(context, this);
    },
    /**
     * If bounding rect of element contain coord x, y
     * @param  {number} x
     * @param  {number} y
     * @return {boolean}
     */
    rectContain: function(x, y) {
      var coord = this.transformCoordToLocal(x, y);
      var rect = this.getBoundingRect();
      return rect.contain(coord[0], coord[1]);
    },
    /**
     * Mark displayable element dirty and refresh next frame
     */
    dirty: function() {
      this.__dirty = this.__dirtyText = true;
      this._rect = null;
      this.__zr && this.__zr.refresh();
    },
    /**
     * If displayable object binded any event
     * @return {boolean}
     */
    // TODO, events bound by bind
    // isSilent: function () {
    //     return !(
    //         this.hoverable || this.draggable
    //         || this.onmousemove || this.onmouseover || this.onmouseout
    //         || this.onmousedown || this.onmouseup || this.onclick
    //         || this.ondragenter || this.ondragover || this.ondragleave
    //         || this.ondrop
    //     );
    // },
    /**
     * Alias for animate('style')
     * @param {boolean} loop
     */
    animateStyle: function(loop) {
      return this.animate("style", loop);
    },
    attrKV: function(key, value) {
      if (key !== "style") {
        Element.prototype.attrKV.call(this, key, value);
      } else {
        this.style.set(value);
      }
    },
    /**
     * @param {Object|string} key
     * @param {*} value
     */
    setStyle: function(key, value) {
      this.style.set(key, value);
      this.dirty(false);
      return this;
    },
    /**
     * Use given style object
     * @param  {Object} obj
     */
    useStyle: function(obj) {
      this.style = new Style2(obj, this);
      this.dirty(false);
      return this;
    },
    /**
     * The string value of `textPosition` needs to be calculated to a real postion.
     * For example, `'inside'` is calculated to `[rect.width/2, rect.height/2]`
     * by default. See `contain/text.js#calculateTextPosition` for more details.
     * But some coutom shapes like "pin", "flag" have center that is not exactly
     * `[width/2, height/2]`. So we provide this hook to customize the calculation
     * for those shapes. It will be called if the `style.textPosition` is a string.
     * @param {Obejct} [out] Prepared out object. If not provided, this method should
     *        be responsible for creating one.
     * @param {module:zrender/graphic/Style} style
     * @param {Object} rect {x, y, width, height}
     * @return {Obejct} out The same as the input out.
     *         {
     *             x: number. mandatory.
     *             y: number. mandatory.
     *             textAlign: string. optional. use style.textAlign by default.
     *             textVerticalAlign: string. optional. use style.textVerticalAlign by default.
     *         }
     */
    calculateTextPosition: null
  };
  zrUtil2.inherits(Displayable, Element);
  zrUtil2.mixin(Displayable, RectText);
  var _default2 = Displayable;
  Displayable_1 = _default2;
  return Displayable_1;
}
var Image$2;
var hasRequiredImage;
function requireImage() {
  if (hasRequiredImage) return Image$2;
  hasRequiredImage = 1;
  var Displayable = requireDisplayable();
  var BoundingRect2 = requireBoundingRect();
  var zrUtil2 = util$6;
  var imageHelper = requireImage$1();
  function ZImage(opts) {
    Displayable.call(this, opts);
  }
  ZImage.prototype = {
    constructor: ZImage,
    type: "image",
    brush: function(ctx, prevEl) {
      var style = this.style;
      var src = style.image;
      style.bind(ctx, this, prevEl);
      var image2 = this._image = imageHelper.createOrUpdateImage(src, this._image, this, this.onload);
      if (!image2 || !imageHelper.isImageReady(image2)) {
        return;
      }
      var x = style.x || 0;
      var y = style.y || 0;
      var width = style.width;
      var height = style.height;
      var aspect = image2.width / image2.height;
      if (width == null && height != null) {
        width = height * aspect;
      } else if (height == null && width != null) {
        height = width / aspect;
      } else if (width == null && height == null) {
        width = image2.width;
        height = image2.height;
      }
      this.setTransform(ctx);
      if (style.sWidth && style.sHeight) {
        var sx = style.sx || 0;
        var sy = style.sy || 0;
        ctx.drawImage(image2, sx, sy, style.sWidth, style.sHeight, x, y, width, height);
      } else if (style.sx && style.sy) {
        var sx = style.sx;
        var sy = style.sy;
        var sWidth = width - sx;
        var sHeight = height - sy;
        ctx.drawImage(image2, sx, sy, sWidth, sHeight, x, y, width, height);
      } else {
        ctx.drawImage(image2, x, y, width, height);
      }
      if (style.text != null) {
        this.restoreTransform(ctx);
        this.drawRectText(ctx, this.getBoundingRect());
      }
    },
    getBoundingRect: function() {
      var style = this.style;
      if (!this._rect) {
        this._rect = new BoundingRect2(style.x || 0, style.y || 0, style.width || 0, style.height || 0);
      }
      return this._rect;
    }
  };
  zrUtil2.inherits(ZImage, Displayable);
  var _default2 = ZImage;
  Image$2 = _default2;
  return Image$2;
}
var _config = config;
var devicePixelRatio = _config.devicePixelRatio;
var util$2 = util$6;
var logError = log;
var BoundingRect = requireBoundingRect();
var timsort = timsort$2;
var Layer = Layer_1;
var requestAnimationFrame$1 = requestAnimationFrame$2;
var Image$1 = requireImage();
var env$2 = env_1;
var HOVER_LAYER_ZLEVEL = 1e5;
var CANVAS_ZLEVEL = 314159;
var EL_AFTER_INCREMENTAL_INC = 0.01;
var INCREMENTAL_INC = 1e-3;
function parseInt10(val) {
  return parseInt(val, 10);
}
function isLayerValid(layer) {
  if (!layer) {
    return false;
  }
  if (layer.__builtin__) {
    return true;
  }
  if (typeof layer.resize !== "function" || typeof layer.refresh !== "function") {
    return false;
  }
  return true;
}
var tmpRect = new BoundingRect(0, 0, 0, 0);
var viewRect = new BoundingRect(0, 0, 0, 0);
function isDisplayableCulled(el, width, height) {
  tmpRect.copy(el.getBoundingRect());
  if (el.transform) {
    tmpRect.applyTransform(el.transform);
  }
  viewRect.width = width;
  viewRect.height = height;
  return !tmpRect.intersect(viewRect);
}
function isClipPathChanged(clipPaths, prevClipPaths) {
  if (clipPaths === prevClipPaths) {
    return false;
  }
  if (!clipPaths || !prevClipPaths || clipPaths.length !== prevClipPaths.length) {
    return true;
  }
  for (var i = 0; i < clipPaths.length; i++) {
    if (clipPaths[i] !== prevClipPaths[i]) {
      return true;
    }
  }
  return false;
}
function doClip(clipPaths, ctx) {
  for (var i = 0; i < clipPaths.length; i++) {
    var clipPath = clipPaths[i];
    clipPath.setTransform(ctx);
    ctx.beginPath();
    clipPath.buildPath(ctx, clipPath.shape);
    ctx.clip();
    clipPath.restoreTransform(ctx);
  }
}
function createRoot(width, height) {
  var domRoot = document.createElement("div");
  domRoot.style.cssText = [
    "position:relative",
    // IOS13 safari probably has a compositing bug (z order of the canvas and the consequent
    // dom does not act as expected) when some of the parent dom has
    // `-webkit-overflow-scrolling: touch;` and the webpage is longer than one screen and
    // the canvas is not at the top part of the page.
    // Check `https://bugs.webkit.org/show_bug.cgi?id=203681` for more details. We remove
    // this `overflow:hidden` to avoid the bug.
    // 'overflow:hidden',
    "width:" + width + "px",
    "height:" + height + "px",
    "padding:0",
    "margin:0",
    "border-width:0"
  ].join(";") + ";";
  return domRoot;
}
var Painter$3 = function(root, storage, opts) {
  this.type = "canvas";
  var singleCanvas = !root.nodeName || root.nodeName.toUpperCase() === "CANVAS";
  this._opts = opts = util$2.extend({}, opts || {});
  this.dpr = opts.devicePixelRatio || devicePixelRatio;
  this._singleCanvas = singleCanvas;
  this.root = root;
  var rootStyle = root.style;
  if (rootStyle) {
    rootStyle["-webkit-tap-highlight-color"] = "transparent";
    rootStyle["-webkit-user-select"] = rootStyle["user-select"] = rootStyle["-webkit-touch-callout"] = "none";
    root.innerHTML = "";
  }
  this.storage = storage;
  var zlevelList = this._zlevelList = [];
  var layers = this._layers = {};
  this._layerConfig = {};
  this._needsManuallyCompositing = false;
  if (!singleCanvas) {
    this._width = this._getSize(0);
    this._height = this._getSize(1);
    var domRoot = this._domRoot = createRoot(this._width, this._height);
    root.appendChild(domRoot);
  } else {
    var width = root.width;
    var height = root.height;
    if (opts.width != null) {
      width = opts.width;
    }
    if (opts.height != null) {
      height = opts.height;
    }
    this.dpr = opts.devicePixelRatio || 1;
    root.width = width * this.dpr;
    root.height = height * this.dpr;
    this._width = width;
    this._height = height;
    var mainLayer = new Layer(root, this, this.dpr);
    mainLayer.__builtin__ = true;
    mainLayer.initContext();
    layers[CANVAS_ZLEVEL] = mainLayer;
    mainLayer.zlevel = CANVAS_ZLEVEL;
    zlevelList.push(CANVAS_ZLEVEL);
    this._domRoot = root;
  }
  this._hoverlayer = null;
  this._hoverElements = [];
};
Painter$3.prototype = {
  constructor: Painter$3,
  getType: function() {
    return "canvas";
  },
  /**
   * If painter use a single canvas
   * @return {boolean}
   */
  isSingleCanvas: function() {
    return this._singleCanvas;
  },
  /**
   * @return {HTMLDivElement}
   */
  getViewportRoot: function() {
    return this._domRoot;
  },
  getViewportRootOffset: function() {
    var viewportRoot = this.getViewportRoot();
    if (viewportRoot) {
      return {
        offsetLeft: viewportRoot.offsetLeft || 0,
        offsetTop: viewportRoot.offsetTop || 0
      };
    }
  },
  /**
   * 刷新
   * @param {boolean} [paintAll=false] 强制绘制所有displayable
   */
  refresh: function(paintAll) {
    var list = this.storage.getDisplayList(true);
    var zlevelList = this._zlevelList;
    this._redrawId = Math.random();
    this._paintList(list, paintAll, this._redrawId);
    for (var i = 0; i < zlevelList.length; i++) {
      var z = zlevelList[i];
      var layer = this._layers[z];
      if (!layer.__builtin__ && layer.refresh) {
        var clearColor = i === 0 ? this._backgroundColor : null;
        layer.refresh(clearColor);
      }
    }
    this.refreshHover();
    return this;
  },
  addHover: function(el, hoverStyle) {
    if (el.__hoverMir) {
      return;
    }
    var elMirror = new el.constructor({
      style: el.style,
      shape: el.shape,
      z: el.z,
      z2: el.z2,
      silent: el.silent
    });
    elMirror.__from = el;
    el.__hoverMir = elMirror;
    hoverStyle && elMirror.setStyle(hoverStyle);
    this._hoverElements.push(elMirror);
    return elMirror;
  },
  removeHover: function(el) {
    var elMirror = el.__hoverMir;
    var hoverElements = this._hoverElements;
    var idx = util$2.indexOf(hoverElements, elMirror);
    if (idx >= 0) {
      hoverElements.splice(idx, 1);
    }
    el.__hoverMir = null;
  },
  clearHover: function(el) {
    var hoverElements = this._hoverElements;
    for (var i = 0; i < hoverElements.length; i++) {
      var from = hoverElements[i].__from;
      if (from) {
        from.__hoverMir = null;
      }
    }
    hoverElements.length = 0;
  },
  refreshHover: function() {
    var hoverElements = this._hoverElements;
    var len = hoverElements.length;
    var hoverLayer = this._hoverlayer;
    hoverLayer && hoverLayer.clear();
    if (!len) {
      return;
    }
    timsort(hoverElements, this.storage.displayableSortFunc);
    if (!hoverLayer) {
      hoverLayer = this._hoverlayer = this.getLayer(HOVER_LAYER_ZLEVEL);
    }
    var scope = {};
    hoverLayer.ctx.save();
    for (var i = 0; i < len; ) {
      var el = hoverElements[i];
      var originalEl = el.__from;
      if (!(originalEl && originalEl.__zr)) {
        hoverElements.splice(i, 1);
        originalEl.__hoverMir = null;
        len--;
        continue;
      }
      i++;
      if (!originalEl.invisible) {
        el.transform = originalEl.transform;
        el.invTransform = originalEl.invTransform;
        el.__clipPaths = originalEl.__clipPaths;
        this._doPaintEl(el, hoverLayer, true, scope);
      }
    }
    hoverLayer.ctx.restore();
  },
  getHoverLayer: function() {
    return this.getLayer(HOVER_LAYER_ZLEVEL);
  },
  _paintList: function(list, paintAll, redrawId) {
    if (this._redrawId !== redrawId) {
      return;
    }
    paintAll = paintAll || false;
    this._updateLayerStatus(list);
    var finished = this._doPaintList(list, paintAll);
    if (this._needsManuallyCompositing) {
      this._compositeManually();
    }
    if (!finished) {
      var self2 = this;
      requestAnimationFrame$1(function() {
        self2._paintList(list, paintAll, redrawId);
      });
    }
  },
  _compositeManually: function() {
    var ctx = this.getLayer(CANVAS_ZLEVEL).ctx;
    var width = this._domRoot.width;
    var height = this._domRoot.height;
    ctx.clearRect(0, 0, width, height);
    this.eachBuiltinLayer(function(layer) {
      if (layer.virtual) {
        ctx.drawImage(layer.dom, 0, 0, width, height);
      }
    });
  },
  _doPaintList: function(list, paintAll) {
    var layerList = [];
    for (var zi = 0; zi < this._zlevelList.length; zi++) {
      var zlevel = this._zlevelList[zi];
      var layer = this._layers[zlevel];
      if (layer.__builtin__ && layer !== this._hoverlayer && (layer.__dirty || paintAll)) {
        layerList.push(layer);
      }
    }
    var finished = true;
    for (var k = 0; k < layerList.length; k++) {
      var layer = layerList[k];
      var ctx = layer.ctx;
      var scope = {};
      ctx.save();
      var start = paintAll ? layer.__startIndex : layer.__drawIndex;
      var useTimer = !paintAll && layer.incremental && Date.now;
      var startTime = useTimer && Date.now();
      var clearColor = layer.zlevel === this._zlevelList[0] ? this._backgroundColor : null;
      if (layer.__startIndex === layer.__endIndex) {
        layer.clear(false, clearColor);
      } else if (start === layer.__startIndex) {
        var firstEl = list[start];
        if (!firstEl.incremental || !firstEl.notClear || paintAll) {
          layer.clear(false, clearColor);
        }
      }
      if (start === -1) {
        console.error("For some unknown reason. drawIndex is -1");
        start = layer.__startIndex;
      }
      for (var i = start; i < layer.__endIndex; i++) {
        var el = list[i];
        this._doPaintEl(el, layer, paintAll, scope);
        el.__dirty = el.__dirtyText = false;
        if (useTimer) {
          var dTime = Date.now() - startTime;
          if (dTime > 15) {
            break;
          }
        }
      }
      layer.__drawIndex = i;
      if (layer.__drawIndex < layer.__endIndex) {
        finished = false;
      }
      if (scope.prevElClipPaths) {
        ctx.restore();
      }
      ctx.restore();
    }
    if (env$2.wxa) {
      util$2.each(this._layers, function(layer2) {
        if (layer2 && layer2.ctx && layer2.ctx.draw) {
          layer2.ctx.draw();
        }
      });
    }
    return finished;
  },
  _doPaintEl: function(el, currentLayer, forcePaint, scope) {
    var ctx = currentLayer.ctx;
    var m = el.transform;
    if ((currentLayer.__dirty || forcePaint) && // Ignore invisible element
    !el.invisible && el.style.opacity !== 0 && !(m && !m[0] && !m[3]) && !(el.culling && isDisplayableCulled(el, this._width, this._height))) {
      var clipPaths = el.__clipPaths;
      var prevElClipPaths = scope.prevElClipPaths;
      if (!prevElClipPaths || isClipPathChanged(clipPaths, prevElClipPaths)) {
        if (prevElClipPaths) {
          ctx.restore();
          scope.prevElClipPaths = null;
          scope.prevEl = null;
        }
        if (clipPaths) {
          ctx.save();
          doClip(clipPaths, ctx);
          scope.prevElClipPaths = clipPaths;
        }
      }
      el.beforeBrush && el.beforeBrush(ctx);
      el.brush(ctx, scope.prevEl || null);
      scope.prevEl = el;
      el.afterBrush && el.afterBrush(ctx);
    }
  },
  /**
   * 获取 zlevel 所在层，如果不存在则会创建一个新的层
   * @param {number} zlevel
   * @param {boolean} virtual Virtual layer will not be inserted into dom.
   * @return {module:zrender/Layer}
   */
  getLayer: function(zlevel, virtual) {
    if (this._singleCanvas && !this._needsManuallyCompositing) {
      zlevel = CANVAS_ZLEVEL;
    }
    var layer = this._layers[zlevel];
    if (!layer) {
      layer = new Layer("zr_" + zlevel, this, this.dpr);
      layer.zlevel = zlevel;
      layer.__builtin__ = true;
      if (this._layerConfig[zlevel]) {
        util$2.merge(layer, this._layerConfig[zlevel], true);
      } else if (this._layerConfig[zlevel - EL_AFTER_INCREMENTAL_INC]) {
        util$2.merge(layer, this._layerConfig[zlevel - EL_AFTER_INCREMENTAL_INC], true);
      }
      if (virtual) {
        layer.virtual = virtual;
      }
      this.insertLayer(zlevel, layer);
      layer.initContext();
    }
    return layer;
  },
  insertLayer: function(zlevel, layer) {
    var layersMap = this._layers;
    var zlevelList = this._zlevelList;
    var len = zlevelList.length;
    var prevLayer = null;
    var i = -1;
    var domRoot = this._domRoot;
    if (layersMap[zlevel]) {
      logError("ZLevel " + zlevel + " has been used already");
      return;
    }
    if (!isLayerValid(layer)) {
      logError("Layer of zlevel " + zlevel + " is not valid");
      return;
    }
    if (len > 0 && zlevel > zlevelList[0]) {
      for (i = 0; i < len - 1; i++) {
        if (zlevelList[i] < zlevel && zlevelList[i + 1] > zlevel) {
          break;
        }
      }
      prevLayer = layersMap[zlevelList[i]];
    }
    zlevelList.splice(i + 1, 0, zlevel);
    layersMap[zlevel] = layer;
    if (!layer.virtual) {
      if (prevLayer) {
        var prevDom = prevLayer.dom;
        if (prevDom.nextSibling) {
          domRoot.insertBefore(layer.dom, prevDom.nextSibling);
        } else {
          domRoot.appendChild(layer.dom);
        }
      } else {
        if (domRoot.firstChild) {
          domRoot.insertBefore(layer.dom, domRoot.firstChild);
        } else {
          domRoot.appendChild(layer.dom);
        }
      }
    }
  },
  // Iterate each layer
  eachLayer: function(cb, context) {
    var zlevelList = this._zlevelList;
    var z;
    var i;
    for (i = 0; i < zlevelList.length; i++) {
      z = zlevelList[i];
      cb.call(context, this._layers[z], z);
    }
  },
  // Iterate each buildin layer
  eachBuiltinLayer: function(cb, context) {
    var zlevelList = this._zlevelList;
    var layer;
    var z;
    var i;
    for (i = 0; i < zlevelList.length; i++) {
      z = zlevelList[i];
      layer = this._layers[z];
      if (layer.__builtin__) {
        cb.call(context, layer, z);
      }
    }
  },
  // Iterate each other layer except buildin layer
  eachOtherLayer: function(cb, context) {
    var zlevelList = this._zlevelList;
    var layer;
    var z;
    var i;
    for (i = 0; i < zlevelList.length; i++) {
      z = zlevelList[i];
      layer = this._layers[z];
      if (!layer.__builtin__) {
        cb.call(context, layer, z);
      }
    }
  },
  /**
   * 获取所有已创建的层
   * @param {Array.<module:zrender/Layer>} [prevLayer]
   */
  getLayers: function() {
    return this._layers;
  },
  _updateLayerStatus: function(list) {
    this.eachBuiltinLayer(function(layer2, z) {
      layer2.__dirty = layer2.__used = false;
    });
    function updatePrevLayer(idx) {
      if (prevLayer) {
        if (prevLayer.__endIndex !== idx) {
          prevLayer.__dirty = true;
        }
        prevLayer.__endIndex = idx;
      }
    }
    if (this._singleCanvas) {
      for (var i = 1; i < list.length; i++) {
        var el = list[i];
        if (el.zlevel !== list[i - 1].zlevel || el.incremental) {
          this._needsManuallyCompositing = true;
          break;
        }
      }
    }
    var prevLayer = null;
    var incrementalLayerCount = 0;
    var prevZlevel;
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var zlevel = el.zlevel;
      var layer;
      if (prevZlevel !== zlevel) {
        prevZlevel = zlevel;
        incrementalLayerCount = 0;
      }
      if (el.incremental) {
        layer = this.getLayer(zlevel + INCREMENTAL_INC, this._needsManuallyCompositing);
        layer.incremental = true;
        incrementalLayerCount = 1;
      } else {
        layer = this.getLayer(zlevel + (incrementalLayerCount > 0 ? EL_AFTER_INCREMENTAL_INC : 0), this._needsManuallyCompositing);
      }
      if (!layer.__builtin__) {
        logError("ZLevel " + zlevel + " has been used by unkown layer " + layer.id);
      }
      if (layer !== prevLayer) {
        layer.__used = true;
        if (layer.__startIndex !== i) {
          layer.__dirty = true;
        }
        layer.__startIndex = i;
        if (!layer.incremental) {
          layer.__drawIndex = i;
        } else {
          layer.__drawIndex = -1;
        }
        updatePrevLayer(i);
        prevLayer = layer;
      }
      if (el.__dirty) {
        layer.__dirty = true;
        if (layer.incremental && layer.__drawIndex < 0) {
          layer.__drawIndex = i;
        }
      }
    }
    updatePrevLayer(i);
    this.eachBuiltinLayer(function(layer2, z) {
      if (!layer2.__used && layer2.getElementCount() > 0) {
        layer2.__dirty = true;
        layer2.__startIndex = layer2.__endIndex = layer2.__drawIndex = 0;
      }
      if (layer2.__dirty && layer2.__drawIndex < 0) {
        layer2.__drawIndex = layer2.__startIndex;
      }
    });
  },
  /**
   * 清除hover层外所有内容
   */
  clear: function() {
    this.eachBuiltinLayer(this._clearLayer);
    return this;
  },
  _clearLayer: function(layer) {
    layer.clear();
  },
  setBackgroundColor: function(backgroundColor) {
    this._backgroundColor = backgroundColor;
  },
  /**
   * 修改指定zlevel的绘制参数
   *
   * @param {string} zlevel
   * @param {Object} config 配置对象
   * @param {string} [config.clearColor=0] 每次清空画布的颜色
   * @param {string} [config.motionBlur=false] 是否开启动态模糊
   * @param {number} [config.lastFrameAlpha=0.7]
   *                 在开启动态模糊的时候使用，与上一帧混合的alpha值，值越大尾迹越明显
   */
  configLayer: function(zlevel, config2) {
    if (config2) {
      var layerConfig = this._layerConfig;
      if (!layerConfig[zlevel]) {
        layerConfig[zlevel] = config2;
      } else {
        util$2.merge(layerConfig[zlevel], config2, true);
      }
      for (var i = 0; i < this._zlevelList.length; i++) {
        var _zlevel = this._zlevelList[i];
        if (_zlevel === zlevel || _zlevel === zlevel + EL_AFTER_INCREMENTAL_INC) {
          var layer = this._layers[_zlevel];
          util$2.merge(layer, layerConfig[zlevel], true);
        }
      }
    }
  },
  /**
   * 删除指定层
   * @param {number} zlevel 层所在的zlevel
   */
  delLayer: function(zlevel) {
    var layers = this._layers;
    var zlevelList = this._zlevelList;
    var layer = layers[zlevel];
    if (!layer) {
      return;
    }
    layer.dom.parentNode.removeChild(layer.dom);
    delete layers[zlevel];
    zlevelList.splice(util$2.indexOf(zlevelList, zlevel), 1);
  },
  /**
   * 区域大小变化后重绘
   */
  resize: function(width, height) {
    if (!this._domRoot.style) {
      if (width == null || height == null) {
        return;
      }
      this._width = width;
      this._height = height;
      this.getLayer(CANVAS_ZLEVEL).resize(width, height);
    } else {
      var domRoot = this._domRoot;
      domRoot.style.display = "none";
      var opts = this._opts;
      width != null && (opts.width = width);
      height != null && (opts.height = height);
      width = this._getSize(0);
      height = this._getSize(1);
      domRoot.style.display = "";
      if (this._width !== width || height !== this._height) {
        domRoot.style.width = width + "px";
        domRoot.style.height = height + "px";
        for (var id in this._layers) {
          if (this._layers.hasOwnProperty(id)) {
            this._layers[id].resize(width, height);
          }
        }
        util$2.each(this._progressiveLayers, function(layer) {
          layer.resize(width, height);
        });
        this.refresh(true);
      }
      this._width = width;
      this._height = height;
    }
    return this;
  },
  /**
   * 清除单独的一个层
   * @param {number} zlevel
   */
  clearLayer: function(zlevel) {
    var layer = this._layers[zlevel];
    if (layer) {
      layer.clear();
    }
  },
  /**
   * 释放
   */
  dispose: function() {
    this.root.innerHTML = "";
    this.root = this.storage = this._domRoot = this._layers = null;
  },
  /**
   * Get canvas which has all thing rendered
   * @param {Object} opts
   * @param {string} [opts.backgroundColor]
   * @param {number} [opts.pixelRatio]
   */
  getRenderedCanvas: function(opts) {
    opts = opts || {};
    if (this._singleCanvas && !this._compositeManually) {
      return this._layers[CANVAS_ZLEVEL].dom;
    }
    var imageLayer = new Layer("image", this, opts.pixelRatio || this.dpr);
    imageLayer.initContext();
    imageLayer.clear(false, opts.backgroundColor || this._backgroundColor);
    if (opts.pixelRatio <= this.dpr) {
      this.refresh();
      var width = imageLayer.dom.width;
      var height = imageLayer.dom.height;
      var ctx = imageLayer.ctx;
      this.eachLayer(function(layer) {
        if (layer.__builtin__) {
          ctx.drawImage(layer.dom, 0, 0, width, height);
        } else if (layer.renderToCanvas) {
          imageLayer.ctx.save();
          layer.renderToCanvas(imageLayer.ctx);
          imageLayer.ctx.restore();
        }
      });
    } else {
      var scope = {};
      var displayList = this.storage.getDisplayList(true);
      for (var i = 0; i < displayList.length; i++) {
        var el = displayList[i];
        this._doPaintEl(el, imageLayer, true, scope);
      }
    }
    return imageLayer.dom;
  },
  /**
   * 获取绘图区域宽度
   */
  getWidth: function() {
    return this._width;
  },
  /**
   * 获取绘图区域高度
   */
  getHeight: function() {
    return this._height;
  },
  _getSize: function(whIdx) {
    var opts = this._opts;
    var wh = ["width", "height"][whIdx];
    var cwh = ["clientWidth", "clientHeight"][whIdx];
    var plt = ["paddingLeft", "paddingTop"][whIdx];
    var prb = ["paddingRight", "paddingBottom"][whIdx];
    if (opts[wh] != null && opts[wh] !== "auto") {
      return parseFloat(opts[wh]);
    }
    var root = this.root;
    var stl = document.defaultView.getComputedStyle(root);
    return (root[cwh] || parseInt10(stl[wh]) || parseInt10(root.style[wh])) - (parseInt10(stl[plt]) || 0) - (parseInt10(stl[prb]) || 0) | 0;
  },
  pathToImage: function(path2, dpr2) {
    dpr2 = dpr2 || this.dpr;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var rect = path2.getBoundingRect();
    var style = path2.style;
    var shadowBlurSize = style.shadowBlur * dpr2;
    var shadowOffsetX = style.shadowOffsetX * dpr2;
    var shadowOffsetY = style.shadowOffsetY * dpr2;
    var lineWidth = style.hasStroke() ? style.lineWidth : 0;
    var leftMargin = Math.max(lineWidth / 2, -shadowOffsetX + shadowBlurSize);
    var rightMargin = Math.max(lineWidth / 2, shadowOffsetX + shadowBlurSize);
    var topMargin = Math.max(lineWidth / 2, -shadowOffsetY + shadowBlurSize);
    var bottomMargin = Math.max(lineWidth / 2, shadowOffsetY + shadowBlurSize);
    var width = rect.width + leftMargin + rightMargin;
    var height = rect.height + topMargin + bottomMargin;
    canvas.width = width * dpr2;
    canvas.height = height * dpr2;
    ctx.scale(dpr2, dpr2);
    ctx.clearRect(0, 0, width, height);
    ctx.dpr = dpr2;
    var pathTransform = {
      position: path2.position,
      rotation: path2.rotation,
      scale: path2.scale
    };
    path2.position = [leftMargin - rect.x, topMargin - rect.y];
    path2.rotation = 0;
    path2.scale = [1, 1];
    path2.updateTransform();
    if (path2) {
      path2.brush(ctx);
    }
    var ImageShape = Image$1;
    var imgShape = new ImageShape({
      style: {
        x: 0,
        y: 0,
        image: canvas
      }
    });
    if (pathTransform.position != null) {
      imgShape.position = path2.position = pathTransform.position;
    }
    if (pathTransform.rotation != null) {
      imgShape.rotation = path2.rotation = pathTransform.rotation;
    }
    if (pathTransform.scale != null) {
      imgShape.scale = path2.scale = pathTransform.scale;
    }
    return imgShape;
  }
};
var _default$2 = Painter$3;
var Painter_1 = _default$2;
var util$1 = util$6;
var _event$1 = event;
var Dispatcher = _event$1.Dispatcher;
var requestAnimationFrame = requestAnimationFrame$2;
var Animator = Animator_1;
var Animation$1 = function(options) {
  options = options || {};
  this.stage = options.stage || {};
  this.onframe = options.onframe || function() {
  };
  this._clips = [];
  this._running = false;
  this._time;
  this._pausedTime;
  this._pauseStart;
  this._paused = false;
  Dispatcher.call(this);
};
Animation$1.prototype = {
  constructor: Animation$1,
  /**
   * Add clip
   * @param {module:zrender/animation/Clip} clip
   */
  addClip: function(clip) {
    this._clips.push(clip);
  },
  /**
   * Add animator
   * @param {module:zrender/animation/Animator} animator
   */
  addAnimator: function(animator) {
    animator.animation = this;
    var clips = animator.getClips();
    for (var i = 0; i < clips.length; i++) {
      this.addClip(clips[i]);
    }
  },
  /**
   * Delete animation clip
   * @param {module:zrender/animation/Clip} clip
   */
  removeClip: function(clip) {
    var idx = util$1.indexOf(this._clips, clip);
    if (idx >= 0) {
      this._clips.splice(idx, 1);
    }
  },
  /**
   * Delete animation clip
   * @param {module:zrender/animation/Animator} animator
   */
  removeAnimator: function(animator) {
    var clips = animator.getClips();
    for (var i = 0; i < clips.length; i++) {
      this.removeClip(clips[i]);
    }
    animator.animation = null;
  },
  _update: function() {
    var time = (/* @__PURE__ */ new Date()).getTime() - this._pausedTime;
    var delta = time - this._time;
    var clips = this._clips;
    var len = clips.length;
    var deferredEvents = [];
    var deferredClips = [];
    for (var i = 0; i < len; i++) {
      var clip = clips[i];
      var e = clip.step(time, delta);
      if (e) {
        deferredEvents.push(e);
        deferredClips.push(clip);
      }
    }
    for (var i = 0; i < len; ) {
      if (clips[i]._needsRemove) {
        clips[i] = clips[len - 1];
        clips.pop();
        len--;
      } else {
        i++;
      }
    }
    len = deferredEvents.length;
    for (var i = 0; i < len; i++) {
      deferredClips[i].fire(deferredEvents[i]);
    }
    this._time = time;
    this.onframe(delta);
    this.trigger("frame", delta);
    if (this.stage.update) {
      this.stage.update();
    }
  },
  _startLoop: function() {
    var self2 = this;
    this._running = true;
    function step() {
      if (self2._running) {
        requestAnimationFrame(step);
        !self2._paused && self2._update();
      }
    }
    requestAnimationFrame(step);
  },
  /**
   * Start animation.
   */
  start: function() {
    this._time = (/* @__PURE__ */ new Date()).getTime();
    this._pausedTime = 0;
    this._startLoop();
  },
  /**
   * Stop animation.
   */
  stop: function() {
    this._running = false;
  },
  /**
   * Pause animation.
   */
  pause: function() {
    if (!this._paused) {
      this._pauseStart = (/* @__PURE__ */ new Date()).getTime();
      this._paused = true;
    }
  },
  /**
   * Resume animation.
   */
  resume: function() {
    if (this._paused) {
      this._pausedTime += (/* @__PURE__ */ new Date()).getTime() - this._pauseStart;
      this._paused = false;
    }
  },
  /**
   * Clear animation.
   */
  clear: function() {
    this._clips = [];
  },
  /**
   * Whether animation finished.
   */
  isFinished: function() {
    return !this._clips.length;
  },
  /**
   * Creat animator for a target, whose props can be animated.
   *
   * @param  {Object} target
   * @param  {Object} options
   * @param  {boolean} [options.loop=false] Whether loop animation.
   * @param  {Function} [options.getter=null] Get value from target.
   * @param  {Function} [options.setter=null] Set value to target.
   * @return {module:zrender/animation/Animation~Animator}
   */
  // TODO Gap
  animate: function(target, options) {
    options = options || {};
    var animator = new Animator(target, options.loop, options.getter, options.setter);
    this.addAnimator(animator);
    return animator;
  }
};
util$1.mixin(Animation$1, Dispatcher);
var _default$1 = Animation$1;
var Animation_1 = _default$1;
var _event = event;
var addEventListener = _event.addEventListener;
var removeEventListener = _event.removeEventListener;
var normalizeEvent = _event.normalizeEvent;
var getNativeEvent = _event.getNativeEvent;
var zrUtil$1 = util$6;
var Eventful = Eventful_1;
var env$1 = env_1;
var TOUCH_CLICK_DELAY = 300;
var globalEventSupported = env$1.domSupported;
var localNativeListenerNames = function() {
  var mouseHandlerNames = ["click", "dblclick", "mousewheel", "mouseout", "mouseup", "mousedown", "mousemove", "contextmenu"];
  var touchHandlerNames = ["touchstart", "touchend", "touchmove"];
  var pointerEventNameMap = {
    pointerdown: 1,
    pointerup: 1,
    pointermove: 1,
    pointerout: 1
  };
  var pointerHandlerNames = zrUtil$1.map(mouseHandlerNames, function(name) {
    var nm = name.replace("mouse", "pointer");
    return pointerEventNameMap.hasOwnProperty(nm) ? nm : name;
  });
  return {
    mouse: mouseHandlerNames,
    touch: touchHandlerNames,
    pointer: pointerHandlerNames
  };
}();
var globalNativeListenerNames = {
  mouse: ["mousemove", "mouseup"],
  pointer: ["pointermove", "pointerup"]
};
function eventNameFix(name) {
  return name === "mousewheel" && env$1.browser.firefox ? "DOMMouseScroll" : name;
}
function isPointerFromTouch(event2) {
  var pointerType = event2.pointerType;
  return pointerType === "pen" || pointerType === "touch";
}
function setTouchTimer(scope) {
  scope.touching = true;
  if (scope.touchTimer != null) {
    clearTimeout(scope.touchTimer);
    scope.touchTimer = null;
  }
  scope.touchTimer = setTimeout(function() {
    scope.touching = false;
    scope.touchTimer = null;
  }, 700);
}
function markTouch(event2) {
  event2 && (event2.zrByTouch = true);
}
function normalizeGlobalEvent(instance, event2) {
  return normalizeEvent(instance.dom, new FakeGlobalEvent(instance, event2), true);
}
function isLocalEl(instance, el) {
  var elTmp = el;
  var isLocal = false;
  while (elTmp && elTmp.nodeType !== 9 && !(isLocal = elTmp.domBelongToZr || elTmp !== el && elTmp === instance.painterRoot)) {
    elTmp = elTmp.parentNode;
  }
  return isLocal;
}
function FakeGlobalEvent(instance, event2) {
  this.type = event2.type;
  this.target = this.currentTarget = instance.dom;
  this.pointerType = event2.pointerType;
  this.clientX = event2.clientX;
  this.clientY = event2.clientY;
}
var fakeGlobalEventProto = FakeGlobalEvent.prototype;
fakeGlobalEventProto.stopPropagation = fakeGlobalEventProto.stopImmediatePropagation = fakeGlobalEventProto.preventDefault = zrUtil$1.noop;
var localDOMHandlers = {
  mousedown: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    this._mayPointerCapture = [event2.zrX, event2.zrY];
    this.trigger("mousedown", event2);
  },
  mousemove: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    var downPoint = this._mayPointerCapture;
    if (downPoint && (event2.zrX !== downPoint[0] || event2.zrY !== downPoint[1])) {
      togglePointerCapture(this, true);
    }
    this.trigger("mousemove", event2);
  },
  mouseup: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    togglePointerCapture(this, false);
    this.trigger("mouseup", event2);
  },
  mouseout: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    if (this._pointerCapturing) {
      event2.zrEventControl = "no_globalout";
    }
    var element = event2.toElement || event2.relatedTarget;
    event2.zrIsToLocalDOM = isLocalEl(this, element);
    this.trigger("mouseout", event2);
  },
  touchstart: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    markTouch(event2);
    this._lastTouchMoment = /* @__PURE__ */ new Date();
    this.handler.processGesture(event2, "start");
    localDOMHandlers.mousemove.call(this, event2);
    localDOMHandlers.mousedown.call(this, event2);
  },
  touchmove: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    markTouch(event2);
    this.handler.processGesture(event2, "change");
    localDOMHandlers.mousemove.call(this, event2);
  },
  touchend: function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    markTouch(event2);
    this.handler.processGesture(event2, "end");
    localDOMHandlers.mouseup.call(this, event2);
    if (+/* @__PURE__ */ new Date() - this._lastTouchMoment < TOUCH_CLICK_DELAY) {
      localDOMHandlers.click.call(this, event2);
    }
  },
  pointerdown: function(event2) {
    localDOMHandlers.mousedown.call(this, event2);
  },
  pointermove: function(event2) {
    if (!isPointerFromTouch(event2)) {
      localDOMHandlers.mousemove.call(this, event2);
    }
  },
  pointerup: function(event2) {
    localDOMHandlers.mouseup.call(this, event2);
  },
  pointerout: function(event2) {
    if (!isPointerFromTouch(event2)) {
      localDOMHandlers.mouseout.call(this, event2);
    }
  }
};
zrUtil$1.each(["click", "mousewheel", "dblclick", "contextmenu"], function(name) {
  localDOMHandlers[name] = function(event2) {
    event2 = normalizeEvent(this.dom, event2);
    this.trigger(name, event2);
  };
});
var globalDOMHandlers = {
  pointermove: function(event2) {
    if (!isPointerFromTouch(event2)) {
      globalDOMHandlers.mousemove.call(this, event2);
    }
  },
  pointerup: function(event2) {
    globalDOMHandlers.mouseup.call(this, event2);
  },
  mousemove: function(event2) {
    this.trigger("mousemove", event2);
  },
  mouseup: function(event2) {
    var pointerCaptureReleasing = this._pointerCapturing;
    togglePointerCapture(this, false);
    this.trigger("mouseup", event2);
    if (pointerCaptureReleasing) {
      event2.zrEventControl = "only_globalout";
      this.trigger("mouseout", event2);
    }
  }
};
function mountLocalDOMEventListeners(instance, scope) {
  var domHandlers = scope.domHandlers;
  if (env$1.pointerEventsSupported) {
    zrUtil$1.each(localNativeListenerNames.pointer, function(nativeEventName) {
      mountSingleDOMEventListener(scope, nativeEventName, function(event2) {
        domHandlers[nativeEventName].call(instance, event2);
      });
    });
  } else {
    if (env$1.touchEventsSupported) {
      zrUtil$1.each(localNativeListenerNames.touch, function(nativeEventName) {
        mountSingleDOMEventListener(scope, nativeEventName, function(event2) {
          domHandlers[nativeEventName].call(instance, event2);
          setTouchTimer(scope);
        });
      });
    }
    zrUtil$1.each(localNativeListenerNames.mouse, function(nativeEventName) {
      mountSingleDOMEventListener(scope, nativeEventName, function(event2) {
        event2 = getNativeEvent(event2);
        if (!scope.touching) {
          domHandlers[nativeEventName].call(instance, event2);
        }
      });
    });
  }
}
function mountGlobalDOMEventListeners(instance, scope) {
  if (env$1.pointerEventsSupported) {
    zrUtil$1.each(globalNativeListenerNames.pointer, mount);
  } else if (!env$1.touchEventsSupported) {
    zrUtil$1.each(globalNativeListenerNames.mouse, mount);
  }
  function mount(nativeEventName) {
    function nativeEventListener(event2) {
      event2 = getNativeEvent(event2);
      if (!isLocalEl(instance, event2.target)) {
        event2 = normalizeGlobalEvent(instance, event2);
        scope.domHandlers[nativeEventName].call(instance, event2);
      }
    }
    mountSingleDOMEventListener(
      scope,
      nativeEventName,
      nativeEventListener,
      {
        capture: true
      }
      // See [Drag Outside] in `Handler.js`
    );
  }
}
function mountSingleDOMEventListener(scope, nativeEventName, listener, opt) {
  scope.mounted[nativeEventName] = listener;
  scope.listenerOpts[nativeEventName] = opt;
  addEventListener(scope.domTarget, eventNameFix(nativeEventName), listener, opt);
}
function unmountDOMEventListeners(scope) {
  var mounted = scope.mounted;
  for (var nativeEventName in mounted) {
    if (mounted.hasOwnProperty(nativeEventName)) {
      removeEventListener(scope.domTarget, eventNameFix(nativeEventName), mounted[nativeEventName], scope.listenerOpts[nativeEventName]);
    }
  }
  scope.mounted = {};
}
function togglePointerCapture(instance, isPointerCapturing) {
  instance._mayPointerCapture = null;
  if (globalEventSupported && instance._pointerCapturing ^ isPointerCapturing) {
    instance._pointerCapturing = isPointerCapturing;
    var globalHandlerScope = instance._globalHandlerScope;
    isPointerCapturing ? mountGlobalDOMEventListeners(instance, globalHandlerScope) : unmountDOMEventListeners(globalHandlerScope);
  }
}
function DOMHandlerScope(domTarget, domHandlers) {
  this.domTarget = domTarget;
  this.domHandlers = domHandlers;
  this.mounted = {};
  this.listenerOpts = {};
  this.touchTimer = null;
  this.touching = false;
}
function HandlerDomProxy(dom2, painterRoot) {
  Eventful.call(this);
  this.dom = dom2;
  this.painterRoot = painterRoot;
  this._localHandlerScope = new DOMHandlerScope(dom2, localDOMHandlers);
  if (globalEventSupported) {
    this._globalHandlerScope = new DOMHandlerScope(document, globalDOMHandlers);
  }
  this._pointerCapturing = false;
  this._mayPointerCapture = null;
  mountLocalDOMEventListeners(this, this._localHandlerScope);
}
var handlerDomProxyProto = HandlerDomProxy.prototype;
handlerDomProxyProto.dispose = function() {
  unmountDOMEventListeners(this._localHandlerScope);
  if (globalEventSupported) {
    unmountDOMEventListeners(this._globalHandlerScope);
  }
};
handlerDomProxyProto.setCursor = function(cursorStyle) {
  this.dom.style && (this.dom.style.cursor = cursorStyle || "default");
};
zrUtil$1.mixin(HandlerDomProxy, Eventful);
var _default = HandlerDomProxy;
var HandlerProxy$1 = _default;
var guid = guid$1;
var env = env_1;
var zrUtil = util$6;
var Handler = Handler_1;
var Storage = Storage_1;
var Painter$2 = Painter_1;
var Animation = Animation_1;
var HandlerProxy = HandlerProxy$1;
/*!
* ZRender, a high performance 2d drawing library.
*
* Copyright (c) 2013, Baidu Inc.
* All rights reserved.
*
* LICENSE
* https://github.com/ecomfe/zrender/blob/master/LICENSE.txt
*/
var useVML = !env.canvasSupported;
var painterCtors = {
  canvas: Painter$2
};
var instances = {};
var version = "4.3.2";
function init(dom2, opts) {
  var zr = new ZRender(guid(), dom2, opts);
  instances[zr.id] = zr;
  return zr;
}
function dispose(zr) {
  if (zr) {
    zr.dispose();
  } else {
    for (var key in instances) {
      if (instances.hasOwnProperty(key)) {
        instances[key].dispose();
      }
    }
    instances = {};
  }
  return this;
}
function getInstance(id) {
  return instances[id];
}
function registerPainter(name, Ctor) {
  painterCtors[name] = Ctor;
}
function delInstance(id) {
  delete instances[id];
}
var ZRender = function(id, dom2, opts) {
  opts = opts || {};
  this.dom = dom2;
  this.id = id;
  var self2 = this;
  var storage = new Storage();
  var rendererType = opts.renderer;
  if (useVML) {
    if (!painterCtors.vml) {
      throw new Error("You need to require 'zrender/vml/vml' to support IE8");
    }
    rendererType = "vml";
  } else if (!rendererType || !painterCtors[rendererType]) {
    rendererType = "canvas";
  }
  var painter = new painterCtors[rendererType](dom2, storage, opts, id);
  this.storage = storage;
  this.painter = painter;
  var handerProxy = !env.node && !env.worker ? new HandlerProxy(painter.getViewportRoot(), painter.root) : null;
  this.handler = new Handler(storage, painter, handerProxy, painter.root);
  this.animation = new Animation({
    stage: {
      update: zrUtil.bind(this.flush, this)
    }
  });
  this.animation.start();
  this._needsRefresh;
  var oldDelFromStorage = storage.delFromStorage;
  var oldAddToStorage = storage.addToStorage;
  storage.delFromStorage = function(el) {
    oldDelFromStorage.call(storage, el);
    el && el.removeSelfFromZr(self2);
  };
  storage.addToStorage = function(el) {
    oldAddToStorage.call(storage, el);
    el.addSelfToZr(self2);
  };
};
ZRender.prototype = {
  constructor: ZRender,
  /**
   * 获取实例唯一标识
   * @return {string}
   */
  getId: function() {
    return this.id;
  },
  /**
   * 添加元素
   * @param  {module:zrender/Element} el
   */
  add: function(el) {
    this.storage.addRoot(el);
    this._needsRefresh = true;
  },
  /**
   * 删除元素
   * @param  {module:zrender/Element} el
   */
  remove: function(el) {
    this.storage.delRoot(el);
    this._needsRefresh = true;
  },
  /**
   * Change configuration of layer
   * @param {string} zLevel
   * @param {Object} config
   * @param {string} [config.clearColor=0] Clear color
   * @param {string} [config.motionBlur=false] If enable motion blur
   * @param {number} [config.lastFrameAlpha=0.7] Motion blur factor. Larger value cause longer trailer
  */
  configLayer: function(zLevel, config2) {
    if (this.painter.configLayer) {
      this.painter.configLayer(zLevel, config2);
    }
    this._needsRefresh = true;
  },
  /**
   * Set background color
   * @param {string} backgroundColor
   */
  setBackgroundColor: function(backgroundColor) {
    if (this.painter.setBackgroundColor) {
      this.painter.setBackgroundColor(backgroundColor);
    }
    this._needsRefresh = true;
  },
  /**
   * Repaint the canvas immediately
   */
  refreshImmediately: function() {
    this._needsRefresh = this._needsRefreshHover = false;
    this.painter.refresh();
    this._needsRefresh = this._needsRefreshHover = false;
  },
  /**
   * Mark and repaint the canvas in the next frame of browser
   */
  refresh: function() {
    this._needsRefresh = true;
  },
  /**
   * Perform all refresh
   */
  flush: function() {
    var triggerRendered;
    if (this._needsRefresh) {
      triggerRendered = true;
      this.refreshImmediately();
    }
    if (this._needsRefreshHover) {
      triggerRendered = true;
      this.refreshHoverImmediately();
    }
    triggerRendered && this.trigger("rendered");
  },
  /**
   * Add element to hover layer
   * @param  {module:zrender/Element} el
   * @param {Object} style
   */
  addHover: function(el, style) {
    if (this.painter.addHover) {
      var elMirror = this.painter.addHover(el, style);
      this.refreshHover();
      return elMirror;
    }
  },
  /**
   * Add element from hover layer
   * @param  {module:zrender/Element} el
   */
  removeHover: function(el) {
    if (this.painter.removeHover) {
      this.painter.removeHover(el);
      this.refreshHover();
    }
  },
  /**
   * Clear all hover elements in hover layer
   * @param  {module:zrender/Element} el
   */
  clearHover: function() {
    if (this.painter.clearHover) {
      this.painter.clearHover();
      this.refreshHover();
    }
  },
  /**
   * Refresh hover in next frame
   */
  refreshHover: function() {
    this._needsRefreshHover = true;
  },
  /**
   * Refresh hover immediately
   */
  refreshHoverImmediately: function() {
    this._needsRefreshHover = false;
    this.painter.refreshHover && this.painter.refreshHover();
  },
  /**
   * Resize the canvas.
   * Should be invoked when container size is changed
   * @param {Object} [opts]
   * @param {number|string} [opts.width] Can be 'auto' (the same as null/undefined)
   * @param {number|string} [opts.height] Can be 'auto' (the same as null/undefined)
   */
  resize: function(opts) {
    opts = opts || {};
    this.painter.resize(opts.width, opts.height);
    this.handler.resize();
  },
  /**
   * Stop and clear all animation immediately
   */
  clearAnimation: function() {
    this.animation.clear();
  },
  /**
   * Get container width
   */
  getWidth: function() {
    return this.painter.getWidth();
  },
  /**
   * Get container height
   */
  getHeight: function() {
    return this.painter.getHeight();
  },
  /**
   * Export the canvas as Base64 URL
   * @param {string} type
   * @param {string} [backgroundColor='#fff']
   * @return {string} Base64 URL
   */
  // toDataURL: function(type, backgroundColor) {
  //     return this.painter.getRenderedCanvas({
  //         backgroundColor: backgroundColor
  //     }).toDataURL(type);
  // },
  /**
   * Converting a path to image.
   * It has much better performance of drawing image rather than drawing a vector path.
   * @param {module:zrender/graphic/Path} e
   * @param {number} width
   * @param {number} height
   */
  pathToImage: function(e, dpr2) {
    return this.painter.pathToImage(e, dpr2);
  },
  /**
   * Set default cursor
   * @param {string} [cursorStyle='default'] 例如 crosshair
   */
  setCursorStyle: function(cursorStyle) {
    this.handler.setCursorStyle(cursorStyle);
  },
  /**
   * Find hovered element
   * @param {number} x
   * @param {number} y
   * @return {Object} {target, topTarget}
   */
  findHover: function(x, y) {
    return this.handler.findHover(x, y);
  },
  /**
   * Bind event
   *
   * @param {string} eventName Event name
   * @param {Function} eventHandler Handler function
   * @param {Object} [context] Context object
   */
  on: function(eventName, eventHandler, context) {
    this.handler.on(eventName, eventHandler, context);
  },
  /**
   * Unbind event
   * @param {string} eventName Event name
   * @param {Function} [eventHandler] Handler function
   */
  off: function(eventName, eventHandler) {
    this.handler.off(eventName, eventHandler);
  },
  /**
   * Trigger event manually
   *
   * @param {string} eventName Event name
   * @param {event=} event Event object
   */
  trigger: function(eventName, event2) {
    this.handler.trigger(eventName, event2);
  },
  /**
   * Clear all objects and the canvas.
   */
  clear: function() {
    this.storage.delRoot();
    this.painter.clear();
  },
  /**
   * Dispose self.
   */
  dispose: function() {
    this.animation.stop();
    this.clear();
    this.storage.dispose();
    this.painter.dispose();
    this.handler.dispose();
    this.animation = this.storage = this.painter = this.handler = null;
    delInstance(this.id);
  }
};
zrender.version = version;
zrender.init = init;
zrender.dispose = dispose;
zrender.getInstance = getInstance;
zrender.registerPainter = registerPainter;
var _export = {};
var path$1 = {};
var curve = {};
var hasRequiredCurve;
function requireCurve() {
  if (hasRequiredCurve) return curve;
  hasRequiredCurve = 1;
  var _vector = requireVector();
  var v2Create = _vector.create;
  var v2DistSquare = _vector.distSquare;
  var mathPow = Math.pow;
  var mathSqrt = Math.sqrt;
  var EPSILON = 1e-8;
  var EPSILON_NUMERIC = 1e-4;
  var THREE_SQRT = mathSqrt(3);
  var ONE_THIRD = 1 / 3;
  var _v0 = v2Create();
  var _v1 = v2Create();
  var _v2 = v2Create();
  function isAroundZero(val) {
    return val > -EPSILON && val < EPSILON;
  }
  function isNotAroundZero(val) {
    return val > EPSILON || val < -EPSILON;
  }
  function cubicAt(p0, p1, p2, p3, t) {
    var onet = 1 - t;
    return onet * onet * (onet * p0 + 3 * t * p1) + t * t * (t * p3 + 3 * onet * p2);
  }
  function cubicDerivativeAt(p0, p1, p2, p3, t) {
    var onet = 1 - t;
    return 3 * (((p1 - p0) * onet + 2 * (p2 - p1) * t) * onet + (p3 - p2) * t * t);
  }
  function cubicRootAt(p0, p1, p2, p3, val, roots) {
    var a = p3 + 3 * (p1 - p2) - p0;
    var b = 3 * (p2 - p1 * 2 + p0);
    var c = 3 * (p1 - p0);
    var d = p0 - val;
    var A = b * b - 3 * a * c;
    var B = b * c - 9 * a * d;
    var C = c * c - 3 * b * d;
    var n = 0;
    if (isAroundZero(A) && isAroundZero(B)) {
      if (isAroundZero(b)) {
        roots[0] = 0;
      } else {
        var t1 = -c / b;
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
      }
    } else {
      var disc = B * B - 4 * A * C;
      if (isAroundZero(disc)) {
        var K = B / A;
        var t1 = -b / a + K;
        var t2 = -K / 2;
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
        if (t2 >= 0 && t2 <= 1) {
          roots[n++] = t2;
        }
      } else if (disc > 0) {
        var discSqrt = mathSqrt(disc);
        var Y1 = A * b + 1.5 * a * (-B + discSqrt);
        var Y2 = A * b + 1.5 * a * (-B - discSqrt);
        if (Y1 < 0) {
          Y1 = -mathPow(-Y1, ONE_THIRD);
        } else {
          Y1 = mathPow(Y1, ONE_THIRD);
        }
        if (Y2 < 0) {
          Y2 = -mathPow(-Y2, ONE_THIRD);
        } else {
          Y2 = mathPow(Y2, ONE_THIRD);
        }
        var t1 = (-b - (Y1 + Y2)) / (3 * a);
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
      } else {
        var T = (2 * A * b - 3 * a * B) / (2 * mathSqrt(A * A * A));
        var theta = Math.acos(T) / 3;
        var ASqrt = mathSqrt(A);
        var tmp = Math.cos(theta);
        var t1 = (-b - 2 * ASqrt * tmp) / (3 * a);
        var t2 = (-b + ASqrt * (tmp + THREE_SQRT * Math.sin(theta))) / (3 * a);
        var t3 = (-b + ASqrt * (tmp - THREE_SQRT * Math.sin(theta))) / (3 * a);
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
        if (t2 >= 0 && t2 <= 1) {
          roots[n++] = t2;
        }
        if (t3 >= 0 && t3 <= 1) {
          roots[n++] = t3;
        }
      }
    }
    return n;
  }
  function cubicExtrema(p0, p1, p2, p3, extrema) {
    var b = 6 * p2 - 12 * p1 + 6 * p0;
    var a = 9 * p1 + 3 * p3 - 3 * p0 - 9 * p2;
    var c = 3 * p1 - 3 * p0;
    var n = 0;
    if (isAroundZero(a)) {
      if (isNotAroundZero(b)) {
        var t1 = -c / b;
        if (t1 >= 0 && t1 <= 1) {
          extrema[n++] = t1;
        }
      }
    } else {
      var disc = b * b - 4 * a * c;
      if (isAroundZero(disc)) {
        extrema[0] = -b / (2 * a);
      } else if (disc > 0) {
        var discSqrt = mathSqrt(disc);
        var t1 = (-b + discSqrt) / (2 * a);
        var t2 = (-b - discSqrt) / (2 * a);
        if (t1 >= 0 && t1 <= 1) {
          extrema[n++] = t1;
        }
        if (t2 >= 0 && t2 <= 1) {
          extrema[n++] = t2;
        }
      }
    }
    return n;
  }
  function cubicSubdivide(p0, p1, p2, p3, t, out) {
    var p01 = (p1 - p0) * t + p0;
    var p12 = (p2 - p1) * t + p1;
    var p23 = (p3 - p2) * t + p2;
    var p012 = (p12 - p01) * t + p01;
    var p123 = (p23 - p12) * t + p12;
    var p0123 = (p123 - p012) * t + p012;
    out[0] = p0;
    out[1] = p01;
    out[2] = p012;
    out[3] = p0123;
    out[4] = p0123;
    out[5] = p123;
    out[6] = p23;
    out[7] = p3;
  }
  function cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, out) {
    var t;
    var interval = 5e-3;
    var d = Infinity;
    var prev;
    var next;
    var d1;
    var d2;
    _v0[0] = x;
    _v0[1] = y;
    for (var _t = 0; _t < 1; _t += 0.05) {
      _v1[0] = cubicAt(x0, x1, x2, x3, _t);
      _v1[1] = cubicAt(y0, y1, y2, y3, _t);
      d1 = v2DistSquare(_v0, _v1);
      if (d1 < d) {
        t = _t;
        d = d1;
      }
    }
    d = Infinity;
    for (var i = 0; i < 32; i++) {
      if (interval < EPSILON_NUMERIC) {
        break;
      }
      prev = t - interval;
      next = t + interval;
      _v1[0] = cubicAt(x0, x1, x2, x3, prev);
      _v1[1] = cubicAt(y0, y1, y2, y3, prev);
      d1 = v2DistSquare(_v1, _v0);
      if (prev >= 0 && d1 < d) {
        t = prev;
        d = d1;
      } else {
        _v2[0] = cubicAt(x0, x1, x2, x3, next);
        _v2[1] = cubicAt(y0, y1, y2, y3, next);
        d2 = v2DistSquare(_v2, _v0);
        if (next <= 1 && d2 < d) {
          t = next;
          d = d2;
        } else {
          interval *= 0.5;
        }
      }
    }
    if (out) {
      out[0] = cubicAt(x0, x1, x2, x3, t);
      out[1] = cubicAt(y0, y1, y2, y3, t);
    }
    return mathSqrt(d);
  }
  function quadraticAt(p0, p1, p2, t) {
    var onet = 1 - t;
    return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
  }
  function quadraticDerivativeAt(p0, p1, p2, t) {
    return 2 * ((1 - t) * (p1 - p0) + t * (p2 - p1));
  }
  function quadraticRootAt(p0, p1, p2, val, roots) {
    var a = p0 - 2 * p1 + p2;
    var b = 2 * (p1 - p0);
    var c = p0 - val;
    var n = 0;
    if (isAroundZero(a)) {
      if (isNotAroundZero(b)) {
        var t1 = -c / b;
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
      }
    } else {
      var disc = b * b - 4 * a * c;
      if (isAroundZero(disc)) {
        var t1 = -b / (2 * a);
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
      } else if (disc > 0) {
        var discSqrt = mathSqrt(disc);
        var t1 = (-b + discSqrt) / (2 * a);
        var t2 = (-b - discSqrt) / (2 * a);
        if (t1 >= 0 && t1 <= 1) {
          roots[n++] = t1;
        }
        if (t2 >= 0 && t2 <= 1) {
          roots[n++] = t2;
        }
      }
    }
    return n;
  }
  function quadraticExtremum(p0, p1, p2) {
    var divider = p0 + p2 - 2 * p1;
    if (divider === 0) {
      return 0.5;
    } else {
      return (p0 - p1) / divider;
    }
  }
  function quadraticSubdivide(p0, p1, p2, t, out) {
    var p01 = (p1 - p0) * t + p0;
    var p12 = (p2 - p1) * t + p1;
    var p012 = (p12 - p01) * t + p01;
    out[0] = p0;
    out[1] = p01;
    out[2] = p012;
    out[3] = p012;
    out[4] = p12;
    out[5] = p2;
  }
  function quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, out) {
    var t;
    var interval = 5e-3;
    var d = Infinity;
    _v0[0] = x;
    _v0[1] = y;
    for (var _t = 0; _t < 1; _t += 0.05) {
      _v1[0] = quadraticAt(x0, x1, x2, _t);
      _v1[1] = quadraticAt(y0, y1, y2, _t);
      var d1 = v2DistSquare(_v0, _v1);
      if (d1 < d) {
        t = _t;
        d = d1;
      }
    }
    d = Infinity;
    for (var i = 0; i < 32; i++) {
      if (interval < EPSILON_NUMERIC) {
        break;
      }
      var prev = t - interval;
      var next = t + interval;
      _v1[0] = quadraticAt(x0, x1, x2, prev);
      _v1[1] = quadraticAt(y0, y1, y2, prev);
      var d1 = v2DistSquare(_v1, _v0);
      if (prev >= 0 && d1 < d) {
        t = prev;
        d = d1;
      } else {
        _v2[0] = quadraticAt(x0, x1, x2, next);
        _v2[1] = quadraticAt(y0, y1, y2, next);
        var d2 = v2DistSquare(_v2, _v0);
        if (next <= 1 && d2 < d) {
          t = next;
          d = d2;
        } else {
          interval *= 0.5;
        }
      }
    }
    if (out) {
      out[0] = quadraticAt(x0, x1, x2, t);
      out[1] = quadraticAt(y0, y1, y2, t);
    }
    return mathSqrt(d);
  }
  curve.cubicAt = cubicAt;
  curve.cubicDerivativeAt = cubicDerivativeAt;
  curve.cubicRootAt = cubicRootAt;
  curve.cubicExtrema = cubicExtrema;
  curve.cubicSubdivide = cubicSubdivide;
  curve.cubicProjectPoint = cubicProjectPoint;
  curve.quadraticAt = quadraticAt;
  curve.quadraticDerivativeAt = quadraticDerivativeAt;
  curve.quadraticRootAt = quadraticRootAt;
  curve.quadraticExtremum = quadraticExtremum;
  curve.quadraticSubdivide = quadraticSubdivide;
  curve.quadraticProjectPoint = quadraticProjectPoint;
  return curve;
}
var bbox = {};
var hasRequiredBbox;
function requireBbox() {
  if (hasRequiredBbox) return bbox;
  hasRequiredBbox = 1;
  var vec22 = requireVector();
  var curve2 = requireCurve();
  var mathMin = Math.min;
  var mathMax = Math.max;
  var mathSin = Math.sin;
  var mathCos = Math.cos;
  var PI2 = Math.PI * 2;
  var start = vec22.create();
  var end = vec22.create();
  var extremity = vec22.create();
  function fromPoints(points, min, max) {
    if (points.length === 0) {
      return;
    }
    var p = points[0];
    var left = p[0];
    var right = p[0];
    var top = p[1];
    var bottom = p[1];
    var i;
    for (i = 1; i < points.length; i++) {
      p = points[i];
      left = mathMin(left, p[0]);
      right = mathMax(right, p[0]);
      top = mathMin(top, p[1]);
      bottom = mathMax(bottom, p[1]);
    }
    min[0] = left;
    min[1] = top;
    max[0] = right;
    max[1] = bottom;
  }
  function fromLine(x0, y0, x1, y1, min, max) {
    min[0] = mathMin(x0, x1);
    min[1] = mathMin(y0, y1);
    max[0] = mathMax(x0, x1);
    max[1] = mathMax(y0, y1);
  }
  var xDim = [];
  var yDim = [];
  function fromCubic(x0, y0, x1, y1, x2, y2, x3, y3, min, max) {
    var cubicExtrema = curve2.cubicExtrema;
    var cubicAt = curve2.cubicAt;
    var i;
    var n = cubicExtrema(x0, x1, x2, x3, xDim);
    min[0] = Infinity;
    min[1] = Infinity;
    max[0] = -Infinity;
    max[1] = -Infinity;
    for (i = 0; i < n; i++) {
      var x = cubicAt(x0, x1, x2, x3, xDim[i]);
      min[0] = mathMin(x, min[0]);
      max[0] = mathMax(x, max[0]);
    }
    n = cubicExtrema(y0, y1, y2, y3, yDim);
    for (i = 0; i < n; i++) {
      var y = cubicAt(y0, y1, y2, y3, yDim[i]);
      min[1] = mathMin(y, min[1]);
      max[1] = mathMax(y, max[1]);
    }
    min[0] = mathMin(x0, min[0]);
    max[0] = mathMax(x0, max[0]);
    min[0] = mathMin(x3, min[0]);
    max[0] = mathMax(x3, max[0]);
    min[1] = mathMin(y0, min[1]);
    max[1] = mathMax(y0, max[1]);
    min[1] = mathMin(y3, min[1]);
    max[1] = mathMax(y3, max[1]);
  }
  function fromQuadratic(x0, y0, x1, y1, x2, y2, min, max) {
    var quadraticExtremum = curve2.quadraticExtremum;
    var quadraticAt = curve2.quadraticAt;
    var tx = mathMax(mathMin(quadraticExtremum(x0, x1, x2), 1), 0);
    var ty = mathMax(mathMin(quadraticExtremum(y0, y1, y2), 1), 0);
    var x = quadraticAt(x0, x1, x2, tx);
    var y = quadraticAt(y0, y1, y2, ty);
    min[0] = mathMin(x0, x2, x);
    min[1] = mathMin(y0, y2, y);
    max[0] = mathMax(x0, x2, x);
    max[1] = mathMax(y0, y2, y);
  }
  function fromArc(x, y, rx, ry, startAngle, endAngle, anticlockwise, min, max) {
    var vec2Min = vec22.min;
    var vec2Max = vec22.max;
    var diff = Math.abs(startAngle - endAngle);
    if (diff % PI2 < 1e-4 && diff > 1e-4) {
      min[0] = x - rx;
      min[1] = y - ry;
      max[0] = x + rx;
      max[1] = y + ry;
      return;
    }
    start[0] = mathCos(startAngle) * rx + x;
    start[1] = mathSin(startAngle) * ry + y;
    end[0] = mathCos(endAngle) * rx + x;
    end[1] = mathSin(endAngle) * ry + y;
    vec2Min(min, start, end);
    vec2Max(max, start, end);
    startAngle = startAngle % PI2;
    if (startAngle < 0) {
      startAngle = startAngle + PI2;
    }
    endAngle = endAngle % PI2;
    if (endAngle < 0) {
      endAngle = endAngle + PI2;
    }
    if (startAngle > endAngle && !anticlockwise) {
      endAngle += PI2;
    } else if (startAngle < endAngle && anticlockwise) {
      startAngle += PI2;
    }
    if (anticlockwise) {
      var tmp = endAngle;
      endAngle = startAngle;
      startAngle = tmp;
    }
    for (var angle = 0; angle < endAngle; angle += Math.PI / 2) {
      if (angle > startAngle) {
        extremity[0] = mathCos(angle) * rx + x;
        extremity[1] = mathSin(angle) * ry + y;
        vec2Min(min, extremity, min);
        vec2Max(max, extremity, max);
      }
    }
  }
  bbox.fromPoints = fromPoints;
  bbox.fromLine = fromLine;
  bbox.fromCubic = fromCubic;
  bbox.fromQuadratic = fromQuadratic;
  bbox.fromArc = fromArc;
  return bbox;
}
var PathProxy_1;
var hasRequiredPathProxy;
function requirePathProxy() {
  if (hasRequiredPathProxy) return PathProxy_1;
  hasRequiredPathProxy = 1;
  var curve2 = requireCurve();
  var vec22 = requireVector();
  var bbox2 = requireBbox();
  var BoundingRect2 = requireBoundingRect();
  var _config2 = config;
  var dpr2 = _config2.devicePixelRatio;
  var CMD = {
    M: 1,
    L: 2,
    C: 3,
    Q: 4,
    A: 5,
    Z: 6,
    // Rect
    R: 7
  };
  var min = [];
  var max = [];
  var min2 = [];
  var max2 = [];
  var mathMin = Math.min;
  var mathMax = Math.max;
  var mathCos = Math.cos;
  var mathSin = Math.sin;
  var mathSqrt = Math.sqrt;
  var mathAbs = Math.abs;
  var hasTypedArray = typeof Float32Array !== "undefined";
  var PathProxy = function(notSaveData) {
    this._saveData = !(notSaveData || false);
    if (this._saveData) {
      this.data = [];
    }
    this._ctx = null;
  };
  PathProxy.prototype = {
    constructor: PathProxy,
    _xi: 0,
    _yi: 0,
    _x0: 0,
    _y0: 0,
    // Unit x, Unit y. Provide for avoiding drawing that too short line segment
    _ux: 0,
    _uy: 0,
    _len: 0,
    _lineDash: null,
    _dashOffset: 0,
    _dashIdx: 0,
    _dashSum: 0,
    /**
     * @readOnly
     */
    setScale: function(sx, sy, segmentIgnoreThreshold) {
      segmentIgnoreThreshold = segmentIgnoreThreshold || 0;
      this._ux = mathAbs(segmentIgnoreThreshold / dpr2 / sx) || 0;
      this._uy = mathAbs(segmentIgnoreThreshold / dpr2 / sy) || 0;
    },
    getContext: function() {
      return this._ctx;
    },
    /**
     * @param  {CanvasRenderingContext2D} ctx
     * @return {module:zrender/core/PathProxy}
     */
    beginPath: function(ctx) {
      this._ctx = ctx;
      ctx && ctx.beginPath();
      ctx && (this.dpr = ctx.dpr);
      if (this._saveData) {
        this._len = 0;
      }
      if (this._lineDash) {
        this._lineDash = null;
        this._dashOffset = 0;
      }
      return this;
    },
    /**
     * @param  {number} x
     * @param  {number} y
     * @return {module:zrender/core/PathProxy}
     */
    moveTo: function(x, y) {
      this.addData(CMD.M, x, y);
      this._ctx && this._ctx.moveTo(x, y);
      this._x0 = x;
      this._y0 = y;
      this._xi = x;
      this._yi = y;
      return this;
    },
    /**
     * @param  {number} x
     * @param  {number} y
     * @return {module:zrender/core/PathProxy}
     */
    lineTo: function(x, y) {
      var exceedUnit = mathAbs(x - this._xi) > this._ux || mathAbs(y - this._yi) > this._uy || this._len < 5;
      this.addData(CMD.L, x, y);
      if (this._ctx && exceedUnit) {
        this._needsDash() ? this._dashedLineTo(x, y) : this._ctx.lineTo(x, y);
      }
      if (exceedUnit) {
        this._xi = x;
        this._yi = y;
      }
      return this;
    },
    /**
     * @param  {number} x1
     * @param  {number} y1
     * @param  {number} x2
     * @param  {number} y2
     * @param  {number} x3
     * @param  {number} y3
     * @return {module:zrender/core/PathProxy}
     */
    bezierCurveTo: function(x1, y1, x2, y2, x3, y3) {
      this.addData(CMD.C, x1, y1, x2, y2, x3, y3);
      if (this._ctx) {
        this._needsDash() ? this._dashedBezierTo(x1, y1, x2, y2, x3, y3) : this._ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      }
      this._xi = x3;
      this._yi = y3;
      return this;
    },
    /**
     * @param  {number} x1
     * @param  {number} y1
     * @param  {number} x2
     * @param  {number} y2
     * @return {module:zrender/core/PathProxy}
     */
    quadraticCurveTo: function(x1, y1, x2, y2) {
      this.addData(CMD.Q, x1, y1, x2, y2);
      if (this._ctx) {
        this._needsDash() ? this._dashedQuadraticTo(x1, y1, x2, y2) : this._ctx.quadraticCurveTo(x1, y1, x2, y2);
      }
      this._xi = x2;
      this._yi = y2;
      return this;
    },
    /**
     * @param  {number} cx
     * @param  {number} cy
     * @param  {number} r
     * @param  {number} startAngle
     * @param  {number} endAngle
     * @param  {boolean} anticlockwise
     * @return {module:zrender/core/PathProxy}
     */
    arc: function(cx, cy, r, startAngle, endAngle, anticlockwise) {
      this.addData(CMD.A, cx, cy, r, r, startAngle, endAngle - startAngle, 0, anticlockwise ? 0 : 1);
      this._ctx && this._ctx.arc(cx, cy, r, startAngle, endAngle, anticlockwise);
      this._xi = mathCos(endAngle) * r + cx;
      this._yi = mathSin(endAngle) * r + cy;
      return this;
    },
    // TODO
    arcTo: function(x1, y1, x2, y2, radius) {
      if (this._ctx) {
        this._ctx.arcTo(x1, y1, x2, y2, radius);
      }
      return this;
    },
    // TODO
    rect: function(x, y, w, h) {
      this._ctx && this._ctx.rect(x, y, w, h);
      this.addData(CMD.R, x, y, w, h);
      return this;
    },
    /**
     * @return {module:zrender/core/PathProxy}
     */
    closePath: function() {
      this.addData(CMD.Z);
      var ctx = this._ctx;
      var x0 = this._x0;
      var y0 = this._y0;
      if (ctx) {
        this._needsDash() && this._dashedLineTo(x0, y0);
        ctx.closePath();
      }
      this._xi = x0;
      this._yi = y0;
      return this;
    },
    /**
     * Context 从外部传入，因为有可能是 rebuildPath 完之后再 fill。
     * stroke 同样
     * @param {CanvasRenderingContext2D} ctx
     * @return {module:zrender/core/PathProxy}
     */
    fill: function(ctx) {
      ctx && ctx.fill();
      this.toStatic();
    },
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @return {module:zrender/core/PathProxy}
     */
    stroke: function(ctx) {
      ctx && ctx.stroke();
      this.toStatic();
    },
    /**
     * 必须在其它绘制命令前调用
     * Must be invoked before all other path drawing methods
     * @return {module:zrender/core/PathProxy}
     */
    setLineDash: function(lineDash) {
      if (lineDash instanceof Array) {
        this._lineDash = lineDash;
        this._dashIdx = 0;
        var lineDashSum = 0;
        for (var i = 0; i < lineDash.length; i++) {
          lineDashSum += lineDash[i];
        }
        this._dashSum = lineDashSum;
      }
      return this;
    },
    /**
     * 必须在其它绘制命令前调用
     * Must be invoked before all other path drawing methods
     * @return {module:zrender/core/PathProxy}
     */
    setLineDashOffset: function(offset) {
      this._dashOffset = offset;
      return this;
    },
    /**
     *
     * @return {boolean}
     */
    len: function() {
      return this._len;
    },
    /**
     * 直接设置 Path 数据
     */
    setData: function(data) {
      var len = data.length;
      if (!(this.data && this.data.length === len) && hasTypedArray) {
        this.data = new Float32Array(len);
      }
      for (var i = 0; i < len; i++) {
        this.data[i] = data[i];
      }
      this._len = len;
    },
    /**
     * 添加子路径
     * @param {module:zrender/core/PathProxy|Array.<module:zrender/core/PathProxy>} path
     */
    appendPath: function(path2) {
      if (!(path2 instanceof Array)) {
        path2 = [path2];
      }
      var len = path2.length;
      var appendSize = 0;
      var offset = this._len;
      for (var i = 0; i < len; i++) {
        appendSize += path2[i].len();
      }
      if (hasTypedArray && this.data instanceof Float32Array) {
        this.data = new Float32Array(offset + appendSize);
      }
      for (var i = 0; i < len; i++) {
        var appendPathData = path2[i].data;
        for (var k = 0; k < appendPathData.length; k++) {
          this.data[offset++] = appendPathData[k];
        }
      }
      this._len = offset;
    },
    /**
     * 填充 Path 数据。
     * 尽量复用而不申明新的数组。大部分图形重绘的指令数据长度都是不变的。
     */
    addData: function(cmd) {
      if (!this._saveData) {
        return;
      }
      var data = this.data;
      if (this._len + arguments.length > data.length) {
        this._expandData();
        data = this.data;
      }
      for (var i = 0; i < arguments.length; i++) {
        data[this._len++] = arguments[i];
      }
      this._prevCmd = cmd;
    },
    _expandData: function() {
      if (!(this.data instanceof Array)) {
        var newData = [];
        for (var i = 0; i < this._len; i++) {
          newData[i] = this.data[i];
        }
        this.data = newData;
      }
    },
    /**
     * If needs js implemented dashed line
     * @return {boolean}
     * @private
     */
    _needsDash: function() {
      return this._lineDash;
    },
    _dashedLineTo: function(x1, y1) {
      var dashSum = this._dashSum;
      var offset = this._dashOffset;
      var lineDash = this._lineDash;
      var ctx = this._ctx;
      var x0 = this._xi;
      var y0 = this._yi;
      var dx = x1 - x0;
      var dy = y1 - y0;
      var dist2 = mathSqrt(dx * dx + dy * dy);
      var x = x0;
      var y = y0;
      var dash;
      var nDash = lineDash.length;
      var idx;
      dx /= dist2;
      dy /= dist2;
      if (offset < 0) {
        offset = dashSum + offset;
      }
      offset %= dashSum;
      x -= offset * dx;
      y -= offset * dy;
      while (dx > 0 && x <= x1 || dx < 0 && x >= x1 || dx === 0 && (dy > 0 && y <= y1 || dy < 0 && y >= y1)) {
        idx = this._dashIdx;
        dash = lineDash[idx];
        x += dx * dash;
        y += dy * dash;
        this._dashIdx = (idx + 1) % nDash;
        if (dx > 0 && x < x0 || dx < 0 && x > x0 || dy > 0 && y < y0 || dy < 0 && y > y0) {
          continue;
        }
        ctx[idx % 2 ? "moveTo" : "lineTo"](dx >= 0 ? mathMin(x, x1) : mathMax(x, x1), dy >= 0 ? mathMin(y, y1) : mathMax(y, y1));
      }
      dx = x - x1;
      dy = y - y1;
      this._dashOffset = -mathSqrt(dx * dx + dy * dy);
    },
    // Not accurate dashed line to
    _dashedBezierTo: function(x1, y1, x2, y2, x3, y3) {
      var dashSum = this._dashSum;
      var offset = this._dashOffset;
      var lineDash = this._lineDash;
      var ctx = this._ctx;
      var x0 = this._xi;
      var y0 = this._yi;
      var t;
      var dx;
      var dy;
      var cubicAt = curve2.cubicAt;
      var bezierLen = 0;
      var idx = this._dashIdx;
      var nDash = lineDash.length;
      var x;
      var y;
      var tmpLen = 0;
      if (offset < 0) {
        offset = dashSum + offset;
      }
      offset %= dashSum;
      for (t = 0; t < 1; t += 0.1) {
        dx = cubicAt(x0, x1, x2, x3, t + 0.1) - cubicAt(x0, x1, x2, x3, t);
        dy = cubicAt(y0, y1, y2, y3, t + 0.1) - cubicAt(y0, y1, y2, y3, t);
        bezierLen += mathSqrt(dx * dx + dy * dy);
      }
      for (; idx < nDash; idx++) {
        tmpLen += lineDash[idx];
        if (tmpLen > offset) {
          break;
        }
      }
      t = (tmpLen - offset) / bezierLen;
      while (t <= 1) {
        x = cubicAt(x0, x1, x2, x3, t);
        y = cubicAt(y0, y1, y2, y3, t);
        idx % 2 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        t += lineDash[idx] / bezierLen;
        idx = (idx + 1) % nDash;
      }
      idx % 2 !== 0 && ctx.lineTo(x3, y3);
      dx = x3 - x;
      dy = y3 - y;
      this._dashOffset = -mathSqrt(dx * dx + dy * dy);
    },
    _dashedQuadraticTo: function(x1, y1, x2, y2) {
      var x3 = x2;
      var y3 = y2;
      x2 = (x2 + 2 * x1) / 3;
      y2 = (y2 + 2 * y1) / 3;
      x1 = (this._xi + 2 * x1) / 3;
      y1 = (this._yi + 2 * y1) / 3;
      this._dashedBezierTo(x1, y1, x2, y2, x3, y3);
    },
    /**
     * 转成静态的 Float32Array 减少堆内存占用
     * Convert dynamic array to static Float32Array
     */
    toStatic: function() {
      var data = this.data;
      if (data instanceof Array) {
        data.length = this._len;
        if (hasTypedArray) {
          this.data = new Float32Array(data);
        }
      }
    },
    /**
     * @return {module:zrender/core/BoundingRect}
     */
    getBoundingRect: function() {
      min[0] = min[1] = min2[0] = min2[1] = Number.MAX_VALUE;
      max[0] = max[1] = max2[0] = max2[1] = -Number.MAX_VALUE;
      var data = this.data;
      var xi = 0;
      var yi = 0;
      var x0 = 0;
      var y0 = 0;
      for (var i = 0; i < data.length; ) {
        var cmd = data[i++];
        if (i === 1) {
          xi = data[i];
          yi = data[i + 1];
          x0 = xi;
          y0 = yi;
        }
        switch (cmd) {
          case CMD.M:
            x0 = data[i++];
            y0 = data[i++];
            xi = x0;
            yi = y0;
            min2[0] = x0;
            min2[1] = y0;
            max2[0] = x0;
            max2[1] = y0;
            break;
          case CMD.L:
            bbox2.fromLine(xi, yi, data[i], data[i + 1], min2, max2);
            xi = data[i++];
            yi = data[i++];
            break;
          case CMD.C:
            bbox2.fromCubic(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], min2, max2);
            xi = data[i++];
            yi = data[i++];
            break;
          case CMD.Q:
            bbox2.fromQuadratic(xi, yi, data[i++], data[i++], data[i], data[i + 1], min2, max2);
            xi = data[i++];
            yi = data[i++];
            break;
          case CMD.A:
            var cx = data[i++];
            var cy = data[i++];
            var rx = data[i++];
            var ry = data[i++];
            var startAngle = data[i++];
            var endAngle = data[i++] + startAngle;
            i += 1;
            var anticlockwise = 1 - data[i++];
            if (i === 1) {
              x0 = mathCos(startAngle) * rx + cx;
              y0 = mathSin(startAngle) * ry + cy;
            }
            bbox2.fromArc(cx, cy, rx, ry, startAngle, endAngle, anticlockwise, min2, max2);
            xi = mathCos(endAngle) * rx + cx;
            yi = mathSin(endAngle) * ry + cy;
            break;
          case CMD.R:
            x0 = xi = data[i++];
            y0 = yi = data[i++];
            var width = data[i++];
            var height = data[i++];
            bbox2.fromLine(x0, y0, x0 + width, y0 + height, min2, max2);
            break;
          case CMD.Z:
            xi = x0;
            yi = y0;
            break;
        }
        vec22.min(min, min, min2);
        vec22.max(max, max, max2);
      }
      if (i === 0) {
        min[0] = min[1] = max[0] = max[1] = 0;
      }
      return new BoundingRect2(min[0], min[1], max[0] - min[0], max[1] - min[1]);
    },
    /**
     * Rebuild path from current data
     * Rebuild path will not consider javascript implemented line dash.
     * @param {CanvasRenderingContext2D} ctx
     */
    rebuildPath: function(ctx) {
      var d = this.data;
      var x0;
      var y0;
      var xi;
      var yi;
      var x;
      var y;
      var ux = this._ux;
      var uy = this._uy;
      var len = this._len;
      for (var i = 0; i < len; ) {
        var cmd = d[i++];
        if (i === 1) {
          xi = d[i];
          yi = d[i + 1];
          x0 = xi;
          y0 = yi;
        }
        switch (cmd) {
          case CMD.M:
            x0 = xi = d[i++];
            y0 = yi = d[i++];
            ctx.moveTo(xi, yi);
            break;
          case CMD.L:
            x = d[i++];
            y = d[i++];
            if (mathAbs(x - xi) > ux || mathAbs(y - yi) > uy || i === len - 1) {
              ctx.lineTo(x, y);
              xi = x;
              yi = y;
            }
            break;
          case CMD.C:
            ctx.bezierCurveTo(d[i++], d[i++], d[i++], d[i++], d[i++], d[i++]);
            xi = d[i - 2];
            yi = d[i - 1];
            break;
          case CMD.Q:
            ctx.quadraticCurveTo(d[i++], d[i++], d[i++], d[i++]);
            xi = d[i - 2];
            yi = d[i - 1];
            break;
          case CMD.A:
            var cx = d[i++];
            var cy = d[i++];
            var rx = d[i++];
            var ry = d[i++];
            var theta = d[i++];
            var dTheta = d[i++];
            var psi = d[i++];
            var fs = d[i++];
            var r = rx > ry ? rx : ry;
            var scaleX = rx > ry ? 1 : rx / ry;
            var scaleY = rx > ry ? ry / rx : 1;
            var isEllipse = Math.abs(rx - ry) > 1e-3;
            var endAngle = theta + dTheta;
            if (isEllipse) {
              ctx.translate(cx, cy);
              ctx.rotate(psi);
              ctx.scale(scaleX, scaleY);
              ctx.arc(0, 0, r, theta, endAngle, 1 - fs);
              ctx.scale(1 / scaleX, 1 / scaleY);
              ctx.rotate(-psi);
              ctx.translate(-cx, -cy);
            } else {
              ctx.arc(cx, cy, r, theta, endAngle, 1 - fs);
            }
            if (i === 1) {
              x0 = mathCos(theta) * rx + cx;
              y0 = mathSin(theta) * ry + cy;
            }
            xi = mathCos(endAngle) * rx + cx;
            yi = mathSin(endAngle) * ry + cy;
            break;
          case CMD.R:
            x0 = xi = d[i];
            y0 = yi = d[i + 1];
            ctx.rect(d[i++], d[i++], d[i++], d[i++]);
            break;
          case CMD.Z:
            ctx.closePath();
            xi = x0;
            yi = y0;
        }
      }
    }
  };
  PathProxy.CMD = CMD;
  var _default2 = PathProxy;
  PathProxy_1 = _default2;
  return PathProxy_1;
}
var path = {};
var line = {};
var hasRequiredLine$1;
function requireLine$1() {
  if (hasRequiredLine$1) return line;
  hasRequiredLine$1 = 1;
  function containStroke(x0, y0, x1, y1, lineWidth, x, y) {
    if (lineWidth === 0) {
      return false;
    }
    var _l = lineWidth;
    var _a = 0;
    var _b = x0;
    if (y > y0 + _l && y > y1 + _l || y < y0 - _l && y < y1 - _l || x > x0 + _l && x > x1 + _l || x < x0 - _l && x < x1 - _l) {
      return false;
    }
    if (x0 !== x1) {
      _a = (y0 - y1) / (x0 - x1);
      _b = (x0 * y1 - x1 * y0) / (x0 - x1);
    } else {
      return Math.abs(x - x0) <= _l / 2;
    }
    var tmp = _a * x - y + _b;
    var _s = tmp * tmp / (_a * _a + 1);
    return _s <= _l / 2 * _l / 2;
  }
  line.containStroke = containStroke;
  return line;
}
var cubic = {};
var hasRequiredCubic;
function requireCubic() {
  if (hasRequiredCubic) return cubic;
  hasRequiredCubic = 1;
  var curve2 = requireCurve();
  function containStroke(x0, y0, x1, y1, x2, y2, x3, y3, lineWidth, x, y) {
    if (lineWidth === 0) {
      return false;
    }
    var _l = lineWidth;
    if (y > y0 + _l && y > y1 + _l && y > y2 + _l && y > y3 + _l || y < y0 - _l && y < y1 - _l && y < y2 - _l && y < y3 - _l || x > x0 + _l && x > x1 + _l && x > x2 + _l && x > x3 + _l || x < x0 - _l && x < x1 - _l && x < x2 - _l && x < x3 - _l) {
      return false;
    }
    var d = curve2.cubicProjectPoint(x0, y0, x1, y1, x2, y2, x3, y3, x, y, null);
    return d <= _l / 2;
  }
  cubic.containStroke = containStroke;
  return cubic;
}
var quadratic = {};
var hasRequiredQuadratic;
function requireQuadratic() {
  if (hasRequiredQuadratic) return quadratic;
  hasRequiredQuadratic = 1;
  var _curve = requireCurve();
  var quadraticProjectPoint = _curve.quadraticProjectPoint;
  function containStroke(x0, y0, x1, y1, x2, y2, lineWidth, x, y) {
    if (lineWidth === 0) {
      return false;
    }
    var _l = lineWidth;
    if (y > y0 + _l && y > y1 + _l && y > y2 + _l || y < y0 - _l && y < y1 - _l && y < y2 - _l || x > x0 + _l && x > x1 + _l && x > x2 + _l || x < x0 - _l && x < x1 - _l && x < x2 - _l) {
      return false;
    }
    var d = quadraticProjectPoint(x0, y0, x1, y1, x2, y2, x, y, null);
    return d <= _l / 2;
  }
  quadratic.containStroke = containStroke;
  return quadratic;
}
var arc = {};
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  var PI2 = Math.PI * 2;
  function normalizeRadian(angle) {
    angle %= PI2;
    if (angle < 0) {
      angle += PI2;
    }
    return angle;
  }
  util.normalizeRadian = normalizeRadian;
  return util;
}
var hasRequiredArc$1;
function requireArc$1() {
  if (hasRequiredArc$1) return arc;
  hasRequiredArc$1 = 1;
  var _util2 = requireUtil();
  var normalizeRadian = _util2.normalizeRadian;
  var PI2 = Math.PI * 2;
  function containStroke(cx, cy, r, startAngle, endAngle, anticlockwise, lineWidth, x, y) {
    if (lineWidth === 0) {
      return false;
    }
    var _l = lineWidth;
    x -= cx;
    y -= cy;
    var d = Math.sqrt(x * x + y * y);
    if (d - _l > r || d + _l < r) {
      return false;
    }
    if (Math.abs(startAngle - endAngle) % PI2 < 1e-4) {
      return true;
    }
    if (anticlockwise) {
      var tmp = startAngle;
      startAngle = normalizeRadian(endAngle);
      endAngle = normalizeRadian(tmp);
    } else {
      startAngle = normalizeRadian(startAngle);
      endAngle = normalizeRadian(endAngle);
    }
    if (startAngle > endAngle) {
      endAngle += PI2;
    }
    var angle = Math.atan2(y, x);
    if (angle < 0) {
      angle += PI2;
    }
    return angle >= startAngle && angle <= endAngle || angle + PI2 >= startAngle && angle + PI2 <= endAngle;
  }
  arc.containStroke = containStroke;
  return arc;
}
var windingLine_1;
var hasRequiredWindingLine;
function requireWindingLine() {
  if (hasRequiredWindingLine) return windingLine_1;
  hasRequiredWindingLine = 1;
  function windingLine(x0, y0, x1, y1, x, y) {
    if (y > y0 && y > y1 || y < y0 && y < y1) {
      return 0;
    }
    if (y1 === y0) {
      return 0;
    }
    var dir = y1 < y0 ? 1 : -1;
    var t = (y - y0) / (y1 - y0);
    if (t === 1 || t === 0) {
      dir = y1 < y0 ? 0.5 : -0.5;
    }
    var x_ = t * (x1 - x0) + x0;
    return x_ === x ? Infinity : x_ > x ? dir : 0;
  }
  windingLine_1 = windingLine;
  return windingLine_1;
}
var hasRequiredPath$2;
function requirePath$2() {
  if (hasRequiredPath$2) return path;
  hasRequiredPath$2 = 1;
  var PathProxy = requirePathProxy();
  var line2 = requireLine$1();
  var cubic2 = requireCubic();
  var quadratic2 = requireQuadratic();
  var arc2 = requireArc$1();
  var _util2 = requireUtil();
  var normalizeRadian = _util2.normalizeRadian;
  var curve2 = requireCurve();
  var windingLine = requireWindingLine();
  var CMD = PathProxy.CMD;
  var PI2 = Math.PI * 2;
  var EPSILON = 1e-4;
  function isAroundEqual(a, b) {
    return Math.abs(a - b) < EPSILON;
  }
  var roots = [-1, -1, -1];
  var extrema = [-1, -1];
  function swapExtrema() {
    var tmp = extrema[0];
    extrema[0] = extrema[1];
    extrema[1] = tmp;
  }
  function windingCubic(x0, y0, x1, y1, x2, y2, x3, y3, x, y) {
    if (y > y0 && y > y1 && y > y2 && y > y3 || y < y0 && y < y1 && y < y2 && y < y3) {
      return 0;
    }
    var nRoots = curve2.cubicRootAt(y0, y1, y2, y3, y, roots);
    if (nRoots === 0) {
      return 0;
    } else {
      var w = 0;
      var nExtrema = -1;
      var y0_;
      var y1_;
      for (var i = 0; i < nRoots; i++) {
        var t = roots[i];
        var unit = t === 0 || t === 1 ? 0.5 : 1;
        var x_ = curve2.cubicAt(x0, x1, x2, x3, t);
        if (x_ < x) {
          continue;
        }
        if (nExtrema < 0) {
          nExtrema = curve2.cubicExtrema(y0, y1, y2, y3, extrema);
          if (extrema[1] < extrema[0] && nExtrema > 1) {
            swapExtrema();
          }
          y0_ = curve2.cubicAt(y0, y1, y2, y3, extrema[0]);
          if (nExtrema > 1) {
            y1_ = curve2.cubicAt(y0, y1, y2, y3, extrema[1]);
          }
        }
        if (nExtrema === 2) {
          if (t < extrema[0]) {
            w += y0_ < y0 ? unit : -unit;
          } else if (t < extrema[1]) {
            w += y1_ < y0_ ? unit : -unit;
          } else {
            w += y3 < y1_ ? unit : -unit;
          }
        } else {
          if (t < extrema[0]) {
            w += y0_ < y0 ? unit : -unit;
          } else {
            w += y3 < y0_ ? unit : -unit;
          }
        }
      }
      return w;
    }
  }
  function windingQuadratic(x0, y0, x1, y1, x2, y2, x, y) {
    if (y > y0 && y > y1 && y > y2 || y < y0 && y < y1 && y < y2) {
      return 0;
    }
    var nRoots = curve2.quadraticRootAt(y0, y1, y2, y, roots);
    if (nRoots === 0) {
      return 0;
    } else {
      var t = curve2.quadraticExtremum(y0, y1, y2);
      if (t >= 0 && t <= 1) {
        var w = 0;
        var y_ = curve2.quadraticAt(y0, y1, y2, t);
        for (var i = 0; i < nRoots; i++) {
          var unit = roots[i] === 0 || roots[i] === 1 ? 0.5 : 1;
          var x_ = curve2.quadraticAt(x0, x1, x2, roots[i]);
          if (x_ < x) {
            continue;
          }
          if (roots[i] < t) {
            w += y_ < y0 ? unit : -unit;
          } else {
            w += y2 < y_ ? unit : -unit;
          }
        }
        return w;
      } else {
        var unit = roots[0] === 0 || roots[0] === 1 ? 0.5 : 1;
        var x_ = curve2.quadraticAt(x0, x1, x2, roots[0]);
        if (x_ < x) {
          return 0;
        }
        return y2 < y0 ? unit : -unit;
      }
    }
  }
  function windingArc(cx, cy, r, startAngle, endAngle, anticlockwise, x, y) {
    y -= cy;
    if (y > r || y < -r) {
      return 0;
    }
    var tmp = Math.sqrt(r * r - y * y);
    roots[0] = -tmp;
    roots[1] = tmp;
    var diff = Math.abs(startAngle - endAngle);
    if (diff < 1e-4) {
      return 0;
    }
    if (diff % PI2 < 1e-4) {
      startAngle = 0;
      endAngle = PI2;
      var dir = anticlockwise ? 1 : -1;
      if (x >= roots[0] + cx && x <= roots[1] + cx) {
        return dir;
      } else {
        return 0;
      }
    }
    if (anticlockwise) {
      var tmp = startAngle;
      startAngle = normalizeRadian(endAngle);
      endAngle = normalizeRadian(tmp);
    } else {
      startAngle = normalizeRadian(startAngle);
      endAngle = normalizeRadian(endAngle);
    }
    if (startAngle > endAngle) {
      endAngle += PI2;
    }
    var w = 0;
    for (var i = 0; i < 2; i++) {
      var x_ = roots[i];
      if (x_ + cx > x) {
        var angle = Math.atan2(y, x_);
        var dir = anticlockwise ? 1 : -1;
        if (angle < 0) {
          angle = PI2 + angle;
        }
        if (angle >= startAngle && angle <= endAngle || angle + PI2 >= startAngle && angle + PI2 <= endAngle) {
          if (angle > Math.PI / 2 && angle < Math.PI * 1.5) {
            dir = -dir;
          }
          w += dir;
        }
      }
    }
    return w;
  }
  function containPath(data, lineWidth, isStroke, x, y) {
    var w = 0;
    var xi = 0;
    var yi = 0;
    var x0 = 0;
    var y0 = 0;
    for (var i = 0; i < data.length; ) {
      var cmd = data[i++];
      if (cmd === CMD.M && i > 1) {
        if (!isStroke) {
          w += windingLine(xi, yi, x0, y0, x, y);
        }
      }
      if (i === 1) {
        xi = data[i];
        yi = data[i + 1];
        x0 = xi;
        y0 = yi;
      }
      switch (cmd) {
        case CMD.M:
          x0 = data[i++];
          y0 = data[i++];
          xi = x0;
          yi = y0;
          break;
        case CMD.L:
          if (isStroke) {
            if (line2.containStroke(xi, yi, data[i], data[i + 1], lineWidth, x, y)) {
              return true;
            }
          } else {
            w += windingLine(xi, yi, data[i], data[i + 1], x, y) || 0;
          }
          xi = data[i++];
          yi = data[i++];
          break;
        case CMD.C:
          if (isStroke) {
            if (cubic2.containStroke(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], lineWidth, x, y)) {
              return true;
            }
          } else {
            w += windingCubic(xi, yi, data[i++], data[i++], data[i++], data[i++], data[i], data[i + 1], x, y) || 0;
          }
          xi = data[i++];
          yi = data[i++];
          break;
        case CMD.Q:
          if (isStroke) {
            if (quadratic2.containStroke(xi, yi, data[i++], data[i++], data[i], data[i + 1], lineWidth, x, y)) {
              return true;
            }
          } else {
            w += windingQuadratic(xi, yi, data[i++], data[i++], data[i], data[i + 1], x, y) || 0;
          }
          xi = data[i++];
          yi = data[i++];
          break;
        case CMD.A:
          var cx = data[i++];
          var cy = data[i++];
          var rx = data[i++];
          var ry = data[i++];
          var theta = data[i++];
          var dTheta = data[i++];
          i += 1;
          var anticlockwise = 1 - data[i++];
          var x1 = Math.cos(theta) * rx + cx;
          var y1 = Math.sin(theta) * ry + cy;
          if (i > 1) {
            w += windingLine(xi, yi, x1, y1, x, y);
          } else {
            x0 = x1;
            y0 = y1;
          }
          var _x = (x - cx) * ry / rx + cx;
          if (isStroke) {
            if (arc2.containStroke(cx, cy, ry, theta, theta + dTheta, anticlockwise, lineWidth, _x, y)) {
              return true;
            }
          } else {
            w += windingArc(cx, cy, ry, theta, theta + dTheta, anticlockwise, _x, y);
          }
          xi = Math.cos(theta + dTheta) * rx + cx;
          yi = Math.sin(theta + dTheta) * ry + cy;
          break;
        case CMD.R:
          x0 = xi = data[i++];
          y0 = yi = data[i++];
          var width = data[i++];
          var height = data[i++];
          var x1 = x0 + width;
          var y1 = y0 + height;
          if (isStroke) {
            if (line2.containStroke(x0, y0, x1, y0, lineWidth, x, y) || line2.containStroke(x1, y0, x1, y1, lineWidth, x, y) || line2.containStroke(x1, y1, x0, y1, lineWidth, x, y) || line2.containStroke(x0, y1, x0, y0, lineWidth, x, y)) {
              return true;
            }
          } else {
            w += windingLine(x1, y0, x1, y1, x, y);
            w += windingLine(x0, y1, x0, y0, x, y);
          }
          break;
        case CMD.Z:
          if (isStroke) {
            if (line2.containStroke(xi, yi, x0, y0, lineWidth, x, y)) {
              return true;
            }
          } else {
            w += windingLine(xi, yi, x0, y0, x, y);
          }
          xi = x0;
          yi = y0;
          break;
      }
    }
    if (!isStroke && !isAroundEqual(yi, y0)) {
      w += windingLine(xi, yi, x0, y0, x, y) || 0;
    }
    return w !== 0;
  }
  function contain(pathData, x, y) {
    return containPath(pathData, 0, false, x, y);
  }
  function containStroke(pathData, lineWidth, x, y) {
    return containPath(pathData, lineWidth, true, x, y);
  }
  path.contain = contain;
  path.containStroke = containStroke;
  return path;
}
var Path_1;
var hasRequiredPath$1;
function requirePath$1() {
  if (hasRequiredPath$1) return Path_1;
  hasRequiredPath$1 = 1;
  var Displayable = requireDisplayable();
  var zrUtil2 = util$6;
  var PathProxy = requirePathProxy();
  var pathContain = requirePath$2();
  var Pattern2 = requirePattern();
  var getCanvasPattern = Pattern2.prototype.getCanvasPattern;
  var abs = Math.abs;
  var pathProxyForDraw = new PathProxy(true);
  function Path(opts) {
    Displayable.call(this, opts);
    this.path = null;
  }
  Path.prototype = {
    constructor: Path,
    type: "path",
    __dirtyPath: true,
    strokeContainThreshold: 5,
    // This item default to be false. But in map series in echarts,
    // in order to improve performance, it should be set to true,
    // so the shorty segment won't draw.
    segmentIgnoreThreshold: 0,
    /**
     * See `module:zrender/src/graphic/helper/subPixelOptimize`.
     * @type {boolean}
     */
    subPixelOptimize: false,
    brush: function(ctx, prevEl) {
      var style = this.style;
      var path2 = this.path || pathProxyForDraw;
      var hasStroke = style.hasStroke();
      var hasFill = style.hasFill();
      var fill = style.fill;
      var stroke = style.stroke;
      var hasFillGradient = hasFill && !!fill.colorStops;
      var hasStrokeGradient = hasStroke && !!stroke.colorStops;
      var hasFillPattern = hasFill && !!fill.image;
      var hasStrokePattern = hasStroke && !!stroke.image;
      style.bind(ctx, this, prevEl);
      this.setTransform(ctx);
      if (this.__dirty) {
        var rect;
        if (hasFillGradient) {
          rect = rect || this.getBoundingRect();
          this._fillGradient = style.getGradient(ctx, fill, rect);
        }
        if (hasStrokeGradient) {
          rect = rect || this.getBoundingRect();
          this._strokeGradient = style.getGradient(ctx, stroke, rect);
        }
      }
      if (hasFillGradient) {
        ctx.fillStyle = this._fillGradient;
      } else if (hasFillPattern) {
        ctx.fillStyle = getCanvasPattern.call(fill, ctx);
      }
      if (hasStrokeGradient) {
        ctx.strokeStyle = this._strokeGradient;
      } else if (hasStrokePattern) {
        ctx.strokeStyle = getCanvasPattern.call(stroke, ctx);
      }
      var lineDash = style.lineDash;
      var lineDashOffset = style.lineDashOffset;
      var ctxLineDash = !!ctx.setLineDash;
      var scale = this.getGlobalScale();
      path2.setScale(scale[0], scale[1], this.segmentIgnoreThreshold);
      if (this.__dirtyPath || lineDash && !ctxLineDash && hasStroke) {
        path2.beginPath(ctx);
        if (lineDash && !ctxLineDash) {
          path2.setLineDash(lineDash);
          path2.setLineDashOffset(lineDashOffset);
        }
        this.buildPath(path2, this.shape, false);
        if (this.path) {
          this.__dirtyPath = false;
        }
      } else {
        ctx.beginPath();
        this.path.rebuildPath(ctx);
      }
      if (hasFill) {
        if (style.fillOpacity != null) {
          var originalGlobalAlpha = ctx.globalAlpha;
          ctx.globalAlpha = style.fillOpacity * style.opacity;
          path2.fill(ctx);
          ctx.globalAlpha = originalGlobalAlpha;
        } else {
          path2.fill(ctx);
        }
      }
      if (lineDash && ctxLineDash) {
        ctx.setLineDash(lineDash);
        ctx.lineDashOffset = lineDashOffset;
      }
      if (hasStroke) {
        if (style.strokeOpacity != null) {
          var originalGlobalAlpha = ctx.globalAlpha;
          ctx.globalAlpha = style.strokeOpacity * style.opacity;
          path2.stroke(ctx);
          ctx.globalAlpha = originalGlobalAlpha;
        } else {
          path2.stroke(ctx);
        }
      }
      if (lineDash && ctxLineDash) {
        ctx.setLineDash([]);
      }
      if (style.text != null) {
        this.restoreTransform(ctx);
        this.drawRectText(ctx, this.getBoundingRect());
      }
    },
    // When bundling path, some shape may decide if use moveTo to begin a new subpath or closePath
    // Like in circle
    buildPath: function(ctx, shapeCfg, inBundle) {
    },
    createPathProxy: function() {
      this.path = new PathProxy();
    },
    getBoundingRect: function() {
      var rect = this._rect;
      var style = this.style;
      var needsUpdateRect = !rect;
      if (needsUpdateRect) {
        var path2 = this.path;
        if (!path2) {
          path2 = this.path = new PathProxy();
        }
        if (this.__dirtyPath) {
          path2.beginPath();
          this.buildPath(path2, this.shape, false);
        }
        rect = path2.getBoundingRect();
      }
      this._rect = rect;
      if (style.hasStroke()) {
        var rectWithStroke = this._rectWithStroke || (this._rectWithStroke = rect.clone());
        if (this.__dirty || needsUpdateRect) {
          rectWithStroke.copy(rect);
          var w = style.lineWidth;
          var lineScale = style.strokeNoScale ? this.getLineScale() : 1;
          if (!style.hasFill()) {
            w = Math.max(w, this.strokeContainThreshold || 4);
          }
          if (lineScale > 1e-10) {
            rectWithStroke.width += w / lineScale;
            rectWithStroke.height += w / lineScale;
            rectWithStroke.x -= w / lineScale / 2;
            rectWithStroke.y -= w / lineScale / 2;
          }
        }
        return rectWithStroke;
      }
      return rect;
    },
    contain: function(x, y) {
      var localPos = this.transformCoordToLocal(x, y);
      var rect = this.getBoundingRect();
      var style = this.style;
      x = localPos[0];
      y = localPos[1];
      if (rect.contain(x, y)) {
        var pathData = this.path.data;
        if (style.hasStroke()) {
          var lineWidth = style.lineWidth;
          var lineScale = style.strokeNoScale ? this.getLineScale() : 1;
          if (lineScale > 1e-10) {
            if (!style.hasFill()) {
              lineWidth = Math.max(lineWidth, this.strokeContainThreshold);
            }
            if (pathContain.containStroke(pathData, lineWidth / lineScale, x, y)) {
              return true;
            }
          }
        }
        if (style.hasFill()) {
          return pathContain.contain(pathData, x, y);
        }
      }
      return false;
    },
    /**
     * @param  {boolean} dirtyPath
     */
    dirty: function(dirtyPath) {
      if (dirtyPath == null) {
        dirtyPath = true;
      }
      if (dirtyPath) {
        this.__dirtyPath = dirtyPath;
        this._rect = null;
      }
      this.__dirty = this.__dirtyText = true;
      this.__zr && this.__zr.refresh();
      if (this.__clipTarget) {
        this.__clipTarget.dirty();
      }
    },
    /**
     * Alias for animate('shape')
     * @param {boolean} loop
     */
    animateShape: function(loop) {
      return this.animate("shape", loop);
    },
    // Overwrite attrKV
    attrKV: function(key, value) {
      if (key === "shape") {
        this.setShape(value);
        this.__dirtyPath = true;
        this._rect = null;
      } else {
        Displayable.prototype.attrKV.call(this, key, value);
      }
    },
    /**
     * @param {Object|string} key
     * @param {*} value
     */
    setShape: function(key, value) {
      var shape = this.shape;
      if (shape) {
        if (zrUtil2.isObject(key)) {
          for (var name in key) {
            if (key.hasOwnProperty(name)) {
              shape[name] = key[name];
            }
          }
        } else {
          shape[key] = value;
        }
        this.dirty(true);
      }
      return this;
    },
    getLineScale: function() {
      var m = this.transform;
      return m && abs(m[0] - 1) > 1e-10 && abs(m[3] - 1) > 1e-10 ? Math.sqrt(abs(m[0] * m[3] - m[2] * m[1])) : 1;
    }
  };
  Path.extend = function(defaults2) {
    var Sub = function(opts) {
      Path.call(this, opts);
      if (defaults2.style) {
        this.style.extendFrom(defaults2.style, false);
      }
      var defaultShape = defaults2.shape;
      if (defaultShape) {
        this.shape = this.shape || {};
        var thisShape = this.shape;
        for (var name2 in defaultShape) {
          if (!thisShape.hasOwnProperty(name2) && defaultShape.hasOwnProperty(name2)) {
            thisShape[name2] = defaultShape[name2];
          }
        }
      }
      defaults2.init && defaults2.init.call(this, opts);
    };
    zrUtil2.inherits(Sub, Path);
    for (var name in defaults2) {
      if (name !== "style" && name !== "shape") {
        Sub.prototype[name] = defaults2[name];
      }
    }
    return Sub;
  };
  zrUtil2.inherits(Path, Displayable);
  var _default2 = Path;
  Path_1 = _default2;
  return Path_1;
}
var transformPath;
var hasRequiredTransformPath;
function requireTransformPath() {
  if (hasRequiredTransformPath) return transformPath;
  hasRequiredTransformPath = 1;
  var PathProxy = requirePathProxy();
  var _vector = requireVector();
  var v2ApplyTransform = _vector.applyTransform;
  var CMD = PathProxy.CMD;
  var points = [[], [], []];
  var mathSqrt = Math.sqrt;
  var mathAtan2 = Math.atan2;
  function _default2(path2, m) {
    var data = path2.data;
    var cmd;
    var nPoint;
    var i;
    var j;
    var k;
    var p;
    var M = CMD.M;
    var C = CMD.C;
    var L = CMD.L;
    var R = CMD.R;
    var A = CMD.A;
    var Q = CMD.Q;
    for (i = 0, j = 0; i < data.length; ) {
      cmd = data[i++];
      j = i;
      nPoint = 0;
      switch (cmd) {
        case M:
          nPoint = 1;
          break;
        case L:
          nPoint = 1;
          break;
        case C:
          nPoint = 3;
          break;
        case Q:
          nPoint = 2;
          break;
        case A:
          var x = m[4];
          var y = m[5];
          var sx = mathSqrt(m[0] * m[0] + m[1] * m[1]);
          var sy = mathSqrt(m[2] * m[2] + m[3] * m[3]);
          var angle = mathAtan2(-m[1] / sy, m[0] / sx);
          data[i] *= sx;
          data[i++] += x;
          data[i] *= sy;
          data[i++] += y;
          data[i++] *= sx;
          data[i++] *= sy;
          data[i++] += angle;
          data[i++] += angle;
          i += 2;
          j = i;
          break;
        case R:
          p[0] = data[i++];
          p[1] = data[i++];
          v2ApplyTransform(p, p, m);
          data[j++] = p[0];
          data[j++] = p[1];
          p[0] += data[i++];
          p[1] += data[i++];
          v2ApplyTransform(p, p, m);
          data[j++] = p[0];
          data[j++] = p[1];
      }
      for (k = 0; k < nPoint; k++) {
        var p = points[k];
        p[0] = data[i++];
        p[1] = data[i++];
        v2ApplyTransform(p, p, m);
        data[j++] = p[0];
        data[j++] = p[1];
      }
    }
  }
  transformPath = _default2;
  return transformPath;
}
var hasRequiredPath;
function requirePath() {
  if (hasRequiredPath) return path$1;
  hasRequiredPath = 1;
  var Path = requirePath$1();
  var PathProxy = requirePathProxy();
  var transformPath2 = requireTransformPath();
  var mathSqrt = Math.sqrt;
  var mathSin = Math.sin;
  var mathCos = Math.cos;
  var PI = Math.PI;
  var vMag = function(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  };
  var vRatio = function(u, v) {
    return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
  };
  var vAngle = function(u, v) {
    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
  };
  function processArc(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg, cmd, path2) {
    var psi = psiDeg * (PI / 180);
    var xp = mathCos(psi) * (x1 - x2) / 2 + mathSin(psi) * (y1 - y2) / 2;
    var yp = -1 * mathSin(psi) * (x1 - x2) / 2 + mathCos(psi) * (y1 - y2) / 2;
    var lambda = xp * xp / (rx * rx) + yp * yp / (ry * ry);
    if (lambda > 1) {
      rx *= mathSqrt(lambda);
      ry *= mathSqrt(lambda);
    }
    var f = (fa === fs ? -1 : 1) * mathSqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) / (rx * rx * (yp * yp) + ry * ry * (xp * xp))) || 0;
    var cxp = f * rx * yp / ry;
    var cyp = f * -ry * xp / rx;
    var cx = (x1 + x2) / 2 + mathCos(psi) * cxp - mathSin(psi) * cyp;
    var cy = (y1 + y2) / 2 + mathSin(psi) * cxp + mathCos(psi) * cyp;
    var theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
    var u = [(xp - cxp) / rx, (yp - cyp) / ry];
    var v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
    var dTheta = vAngle(u, v);
    if (vRatio(u, v) <= -1) {
      dTheta = PI;
    }
    if (vRatio(u, v) >= 1) {
      dTheta = 0;
    }
    if (fs === 0 && dTheta > 0) {
      dTheta = dTheta - 2 * PI;
    }
    if (fs === 1 && dTheta < 0) {
      dTheta = dTheta + 2 * PI;
    }
    path2.addData(cmd, cx, cy, rx, ry, theta, dTheta, psi, fs);
  }
  var commandReg = /([mlvhzcqtsa])([^mlvhzcqtsa]*)/ig;
  var numberReg = /-?([0-9]*\.)?[0-9]+([eE]-?[0-9]+)?/g;
  function createPathProxyFromString(data) {
    if (!data) {
      return new PathProxy();
    }
    var cpx = 0;
    var cpy = 0;
    var subpathX = cpx;
    var subpathY = cpy;
    var prevCmd;
    var path2 = new PathProxy();
    var CMD = PathProxy.CMD;
    var cmdList = data.match(commandReg);
    for (var l = 0; l < cmdList.length; l++) {
      var cmdText = cmdList[l];
      var cmdStr = cmdText.charAt(0);
      var cmd;
      var p = cmdText.match(numberReg) || [];
      var pLen = p.length;
      for (var i = 0; i < pLen; i++) {
        p[i] = parseFloat(p[i]);
      }
      var off = 0;
      while (off < pLen) {
        var ctlPtx;
        var ctlPty;
        var rx;
        var ry;
        var psi;
        var fa;
        var fs;
        var x1 = cpx;
        var y1 = cpy;
        switch (cmdStr) {
          case "l":
            cpx += p[off++];
            cpy += p[off++];
            cmd = CMD.L;
            path2.addData(cmd, cpx, cpy);
            break;
          case "L":
            cpx = p[off++];
            cpy = p[off++];
            cmd = CMD.L;
            path2.addData(cmd, cpx, cpy);
            break;
          case "m":
            cpx += p[off++];
            cpy += p[off++];
            cmd = CMD.M;
            path2.addData(cmd, cpx, cpy);
            subpathX = cpx;
            subpathY = cpy;
            cmdStr = "l";
            break;
          case "M":
            cpx = p[off++];
            cpy = p[off++];
            cmd = CMD.M;
            path2.addData(cmd, cpx, cpy);
            subpathX = cpx;
            subpathY = cpy;
            cmdStr = "L";
            break;
          case "h":
            cpx += p[off++];
            cmd = CMD.L;
            path2.addData(cmd, cpx, cpy);
            break;
          case "H":
            cpx = p[off++];
            cmd = CMD.L;
            path2.addData(cmd, cpx, cpy);
            break;
          case "v":
            cpy += p[off++];
            cmd = CMD.L;
            path2.addData(cmd, cpx, cpy);
            break;
          case "V":
            cpy = p[off++];
            cmd = CMD.L;
            path2.addData(cmd, cpx, cpy);
            break;
          case "C":
            cmd = CMD.C;
            path2.addData(cmd, p[off++], p[off++], p[off++], p[off++], p[off++], p[off++]);
            cpx = p[off - 2];
            cpy = p[off - 1];
            break;
          case "c":
            cmd = CMD.C;
            path2.addData(cmd, p[off++] + cpx, p[off++] + cpy, p[off++] + cpx, p[off++] + cpy, p[off++] + cpx, p[off++] + cpy);
            cpx += p[off - 2];
            cpy += p[off - 1];
            break;
          case "S":
            ctlPtx = cpx;
            ctlPty = cpy;
            var len = path2.len();
            var pathData = path2.data;
            if (prevCmd === CMD.C) {
              ctlPtx += cpx - pathData[len - 4];
              ctlPty += cpy - pathData[len - 3];
            }
            cmd = CMD.C;
            x1 = p[off++];
            y1 = p[off++];
            cpx = p[off++];
            cpy = p[off++];
            path2.addData(cmd, ctlPtx, ctlPty, x1, y1, cpx, cpy);
            break;
          case "s":
            ctlPtx = cpx;
            ctlPty = cpy;
            var len = path2.len();
            var pathData = path2.data;
            if (prevCmd === CMD.C) {
              ctlPtx += cpx - pathData[len - 4];
              ctlPty += cpy - pathData[len - 3];
            }
            cmd = CMD.C;
            x1 = cpx + p[off++];
            y1 = cpy + p[off++];
            cpx += p[off++];
            cpy += p[off++];
            path2.addData(cmd, ctlPtx, ctlPty, x1, y1, cpx, cpy);
            break;
          case "Q":
            x1 = p[off++];
            y1 = p[off++];
            cpx = p[off++];
            cpy = p[off++];
            cmd = CMD.Q;
            path2.addData(cmd, x1, y1, cpx, cpy);
            break;
          case "q":
            x1 = p[off++] + cpx;
            y1 = p[off++] + cpy;
            cpx += p[off++];
            cpy += p[off++];
            cmd = CMD.Q;
            path2.addData(cmd, x1, y1, cpx, cpy);
            break;
          case "T":
            ctlPtx = cpx;
            ctlPty = cpy;
            var len = path2.len();
            var pathData = path2.data;
            if (prevCmd === CMD.Q) {
              ctlPtx += cpx - pathData[len - 4];
              ctlPty += cpy - pathData[len - 3];
            }
            cpx = p[off++];
            cpy = p[off++];
            cmd = CMD.Q;
            path2.addData(cmd, ctlPtx, ctlPty, cpx, cpy);
            break;
          case "t":
            ctlPtx = cpx;
            ctlPty = cpy;
            var len = path2.len();
            var pathData = path2.data;
            if (prevCmd === CMD.Q) {
              ctlPtx += cpx - pathData[len - 4];
              ctlPty += cpy - pathData[len - 3];
            }
            cpx += p[off++];
            cpy += p[off++];
            cmd = CMD.Q;
            path2.addData(cmd, ctlPtx, ctlPty, cpx, cpy);
            break;
          case "A":
            rx = p[off++];
            ry = p[off++];
            psi = p[off++];
            fa = p[off++];
            fs = p[off++];
            x1 = cpx, y1 = cpy;
            cpx = p[off++];
            cpy = p[off++];
            cmd = CMD.A;
            processArc(x1, y1, cpx, cpy, fa, fs, rx, ry, psi, cmd, path2);
            break;
          case "a":
            rx = p[off++];
            ry = p[off++];
            psi = p[off++];
            fa = p[off++];
            fs = p[off++];
            x1 = cpx, y1 = cpy;
            cpx += p[off++];
            cpy += p[off++];
            cmd = CMD.A;
            processArc(x1, y1, cpx, cpy, fa, fs, rx, ry, psi, cmd, path2);
            break;
        }
      }
      if (cmdStr === "z" || cmdStr === "Z") {
        cmd = CMD.Z;
        path2.addData(cmd);
        cpx = subpathX;
        cpy = subpathY;
      }
      prevCmd = cmd;
    }
    path2.toStatic();
    return path2;
  }
  function createPathOptions(str, opts) {
    var pathProxy = createPathProxyFromString(str);
    opts = opts || {};
    opts.buildPath = function(path2) {
      if (path2.setData) {
        path2.setData(pathProxy.data);
        var ctx = path2.getContext();
        if (ctx) {
          path2.rebuildPath(ctx);
        }
      } else {
        var ctx = path2;
        pathProxy.rebuildPath(ctx);
      }
    };
    opts.applyTransform = function(m) {
      transformPath2(pathProxy, m);
      this.dirty(true);
    };
    return opts;
  }
  function createFromString(str, opts) {
    return new Path(createPathOptions(str, opts));
  }
  function extendFromString(str, opts) {
    return Path.extend(createPathOptions(str, opts));
  }
  function mergePath(pathEls, opts) {
    var pathList = [];
    var len = pathEls.length;
    for (var i = 0; i < len; i++) {
      var pathEl = pathEls[i];
      if (!pathEl.path) {
        pathEl.createPathProxy();
      }
      if (pathEl.__dirtyPath) {
        pathEl.buildPath(pathEl.path, pathEl.shape, true);
      }
      pathList.push(pathEl.path);
    }
    var pathBundle = new Path(opts);
    pathBundle.createPathProxy();
    pathBundle.buildPath = function(path2) {
      path2.appendPath(pathList);
      var ctx = path2.getContext();
      if (ctx) {
        path2.rebuildPath(ctx);
      }
    };
    return pathBundle;
  }
  path$1.createFromString = createFromString;
  path$1.extendFromString = extendFromString;
  path$1.mergePath = mergePath;
  return path$1;
}
var parseSVG = {};
var Text_1;
var hasRequiredText;
function requireText() {
  if (hasRequiredText) return Text_1;
  hasRequiredText = 1;
  var Displayable = requireDisplayable();
  var zrUtil2 = util$6;
  var textContain = requireText$2();
  var textHelper = requireText$1();
  var _constant = requireConstant();
  var ContextCachedBy = _constant.ContextCachedBy;
  var Text = function(opts) {
    Displayable.call(this, opts);
  };
  Text.prototype = {
    constructor: Text,
    type: "text",
    brush: function(ctx, prevEl) {
      var style = this.style;
      this.__dirty && textHelper.normalizeTextStyle(style, true);
      style.fill = style.stroke = style.shadowBlur = style.shadowColor = style.shadowOffsetX = style.shadowOffsetY = null;
      var text2 = style.text;
      text2 != null && (text2 += "");
      if (!textHelper.needDrawText(text2, style)) {
        ctx.__attrCachedBy = ContextCachedBy.NONE;
        return;
      }
      this.setTransform(ctx);
      textHelper.renderText(this, ctx, text2, style, null, prevEl);
      this.restoreTransform(ctx);
    },
    getBoundingRect: function() {
      var style = this.style;
      this.__dirty && textHelper.normalizeTextStyle(style, true);
      if (!this._rect) {
        style.text;
        var rect = textContain.getBoundingRect(style.text + "", style.font, style.textAlign, style.textVerticalAlign, style.textPadding, style.textLineHeight, style.rich);
        rect.x += style.x || 0;
        rect.y += style.y || 0;
        if (textHelper.getStroke(style.textStroke, style.textStrokeWidth)) {
          var w = style.textStrokeWidth;
          rect.x -= w / 2;
          rect.y -= w / 2;
          rect.width += w;
          rect.height += w;
        }
        this._rect = rect;
      }
      return this._rect;
    }
  };
  zrUtil2.inherits(Text, Displayable);
  var _default2 = Text;
  Text_1 = _default2;
  return Text_1;
}
var Circle;
var hasRequiredCircle;
function requireCircle() {
  if (hasRequiredCircle) return Circle;
  hasRequiredCircle = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "circle",
    shape: {
      cx: 0,
      cy: 0,
      r: 0
    },
    buildPath: function(ctx, shape, inBundle) {
      if (inBundle) {
        ctx.moveTo(shape.cx + shape.r, shape.cy);
      }
      ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2, true);
    }
  });
  Circle = _default2;
  return Circle;
}
var subPixelOptimize = {};
var hasRequiredSubPixelOptimize;
function requireSubPixelOptimize() {
  if (hasRequiredSubPixelOptimize) return subPixelOptimize;
  hasRequiredSubPixelOptimize = 1;
  var round = Math.round;
  function subPixelOptimizeLine(outputShape, inputShape, style) {
    if (!inputShape) {
      return;
    }
    var x1 = inputShape.x1;
    var x2 = inputShape.x2;
    var y1 = inputShape.y1;
    var y2 = inputShape.y2;
    outputShape.x1 = x1;
    outputShape.x2 = x2;
    outputShape.y1 = y1;
    outputShape.y2 = y2;
    var lineWidth = style && style.lineWidth;
    if (!lineWidth) {
      return;
    }
    if (round(x1 * 2) === round(x2 * 2)) {
      outputShape.x1 = outputShape.x2 = subPixelOptimize$1(x1, lineWidth, true);
    }
    if (round(y1 * 2) === round(y2 * 2)) {
      outputShape.y1 = outputShape.y2 = subPixelOptimize$1(y1, lineWidth, true);
    }
  }
  function subPixelOptimizeRect(outputShape, inputShape, style) {
    if (!inputShape) {
      return;
    }
    var originX = inputShape.x;
    var originY = inputShape.y;
    var originWidth = inputShape.width;
    var originHeight = inputShape.height;
    outputShape.x = originX;
    outputShape.y = originY;
    outputShape.width = originWidth;
    outputShape.height = originHeight;
    var lineWidth = style && style.lineWidth;
    if (!lineWidth) {
      return;
    }
    outputShape.x = subPixelOptimize$1(originX, lineWidth, true);
    outputShape.y = subPixelOptimize$1(originY, lineWidth, true);
    outputShape.width = Math.max(subPixelOptimize$1(originX + originWidth, lineWidth, false) - outputShape.x, originWidth === 0 ? 0 : 1);
    outputShape.height = Math.max(subPixelOptimize$1(originY + originHeight, lineWidth, false) - outputShape.y, originHeight === 0 ? 0 : 1);
  }
  function subPixelOptimize$1(position, lineWidth, positiveOrNegative) {
    if (!lineWidth) {
      return position;
    }
    var doubledPosition = round(position * 2);
    return (doubledPosition + round(lineWidth)) % 2 === 0 ? doubledPosition / 2 : (doubledPosition + (positiveOrNegative ? 1 : -1)) / 2;
  }
  subPixelOptimize.subPixelOptimizeLine = subPixelOptimizeLine;
  subPixelOptimize.subPixelOptimizeRect = subPixelOptimizeRect;
  subPixelOptimize.subPixelOptimize = subPixelOptimize$1;
  return subPixelOptimize;
}
var Rect;
var hasRequiredRect;
function requireRect() {
  if (hasRequiredRect) return Rect;
  hasRequiredRect = 1;
  var Path = requirePath$1();
  var roundRectHelper = requireRoundRect();
  var _subPixelOptimize = requireSubPixelOptimize();
  var subPixelOptimizeRect = _subPixelOptimize.subPixelOptimizeRect;
  var subPixelOptimizeOutputShape = {};
  var _default2 = Path.extend({
    type: "rect",
    shape: {
      // 左上、右上、右下、左下角的半径依次为r1、r2、r3、r4
      // r缩写为1         相当于 [1, 1, 1, 1]
      // r缩写为[1]       相当于 [1, 1, 1, 1]
      // r缩写为[1, 2]    相当于 [1, 2, 1, 2]
      // r缩写为[1, 2, 3] 相当于 [1, 2, 3, 2]
      r: 0,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    },
    buildPath: function(ctx, shape) {
      var x;
      var y;
      var width;
      var height;
      if (this.subPixelOptimize) {
        subPixelOptimizeRect(subPixelOptimizeOutputShape, shape, this.style);
        x = subPixelOptimizeOutputShape.x;
        y = subPixelOptimizeOutputShape.y;
        width = subPixelOptimizeOutputShape.width;
        height = subPixelOptimizeOutputShape.height;
        subPixelOptimizeOutputShape.r = shape.r;
        shape = subPixelOptimizeOutputShape;
      } else {
        x = shape.x;
        y = shape.y;
        width = shape.width;
        height = shape.height;
      }
      if (!shape.r) {
        ctx.rect(x, y, width, height);
      } else {
        roundRectHelper.buildPath(ctx, shape);
      }
      ctx.closePath();
      return;
    }
  });
  Rect = _default2;
  return Rect;
}
var Ellipse;
var hasRequiredEllipse;
function requireEllipse() {
  if (hasRequiredEllipse) return Ellipse;
  hasRequiredEllipse = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "ellipse",
    shape: {
      cx: 0,
      cy: 0,
      rx: 0,
      ry: 0
    },
    buildPath: function(ctx, shape) {
      var k = 0.5522848;
      var x = shape.cx;
      var y = shape.cy;
      var a = shape.rx;
      var b = shape.ry;
      var ox = a * k;
      var oy = b * k;
      ctx.moveTo(x - a, y);
      ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
      ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
      ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
      ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
      ctx.closePath();
    }
  });
  Ellipse = _default2;
  return Ellipse;
}
var Line$1;
var hasRequiredLine;
function requireLine() {
  if (hasRequiredLine) return Line$1;
  hasRequiredLine = 1;
  var Path = requirePath$1();
  var _subPixelOptimize = requireSubPixelOptimize();
  var subPixelOptimizeLine = _subPixelOptimize.subPixelOptimizeLine;
  var subPixelOptimizeOutputShape = {};
  var _default2 = Path.extend({
    type: "line",
    shape: {
      // Start point
      x1: 0,
      y1: 0,
      // End point
      x2: 0,
      y2: 0,
      percent: 1
    },
    style: {
      stroke: "#000",
      fill: null
    },
    buildPath: function(ctx, shape) {
      var x1;
      var y1;
      var x2;
      var y2;
      if (this.subPixelOptimize) {
        subPixelOptimizeLine(subPixelOptimizeOutputShape, shape, this.style);
        x1 = subPixelOptimizeOutputShape.x1;
        y1 = subPixelOptimizeOutputShape.y1;
        x2 = subPixelOptimizeOutputShape.x2;
        y2 = subPixelOptimizeOutputShape.y2;
      } else {
        x1 = shape.x1;
        y1 = shape.y1;
        x2 = shape.x2;
        y2 = shape.y2;
      }
      var percent = shape.percent;
      if (percent === 0) {
        return;
      }
      ctx.moveTo(x1, y1);
      if (percent < 1) {
        x2 = x1 * (1 - percent) + x2 * percent;
        y2 = y1 * (1 - percent) + y2 * percent;
      }
      ctx.lineTo(x2, y2);
    },
    /**
     * Get point at percent
     * @param  {number} percent
     * @return {Array.<number>}
     */
    pointAt: function(p) {
      var shape = this.shape;
      return [shape.x1 * (1 - p) + shape.x2 * p, shape.y1 * (1 - p) + shape.y2 * p];
    }
  });
  Line$1 = _default2;
  return Line$1;
}
var poly = {};
var smoothSpline;
var hasRequiredSmoothSpline;
function requireSmoothSpline() {
  if (hasRequiredSmoothSpline) return smoothSpline;
  hasRequiredSmoothSpline = 1;
  var _vector = requireVector();
  var v2Distance = _vector.distance;
  function interpolate(p0, p1, p2, p3, t, t2, t3) {
    var v0 = (p2 - p0) * 0.5;
    var v1 = (p3 - p1) * 0.5;
    return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
  }
  function _default2(points, isLoop) {
    var len = points.length;
    var ret = [];
    var distance = 0;
    for (var i = 1; i < len; i++) {
      distance += v2Distance(points[i - 1], points[i]);
    }
    var segs = distance / 2;
    segs = segs < len ? len : segs;
    for (var i = 0; i < segs; i++) {
      var pos = i / (segs - 1) * (isLoop ? len : len - 1);
      var idx = Math.floor(pos);
      var w = pos - idx;
      var p0;
      var p1 = points[idx % len];
      var p2;
      var p3;
      if (!isLoop) {
        p0 = points[idx === 0 ? idx : idx - 1];
        p2 = points[idx > len - 2 ? len - 1 : idx + 1];
        p3 = points[idx > len - 3 ? len - 1 : idx + 2];
      } else {
        p0 = points[(idx - 1 + len) % len];
        p2 = points[(idx + 1) % len];
        p3 = points[(idx + 2) % len];
      }
      var w2 = w * w;
      var w3 = w * w2;
      ret.push([interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3), interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)]);
    }
    return ret;
  }
  smoothSpline = _default2;
  return smoothSpline;
}
var smoothBezier;
var hasRequiredSmoothBezier;
function requireSmoothBezier() {
  if (hasRequiredSmoothBezier) return smoothBezier;
  hasRequiredSmoothBezier = 1;
  var _vector = requireVector();
  var v2Min = _vector.min;
  var v2Max = _vector.max;
  var v2Scale = _vector.scale;
  var v2Distance = _vector.distance;
  var v2Add = _vector.add;
  var v2Clone = _vector.clone;
  var v2Sub = _vector.sub;
  function _default2(points, smooth, isLoop, constraint) {
    var cps = [];
    var v = [];
    var v1 = [];
    var v2 = [];
    var prevPoint;
    var nextPoint;
    var min;
    var max;
    if (constraint) {
      min = [Infinity, Infinity];
      max = [-Infinity, -Infinity];
      for (var i = 0, len = points.length; i < len; i++) {
        v2Min(min, min, points[i]);
        v2Max(max, max, points[i]);
      }
      v2Min(min, min, constraint[0]);
      v2Max(max, max, constraint[1]);
    }
    for (var i = 0, len = points.length; i < len; i++) {
      var point = points[i];
      if (isLoop) {
        prevPoint = points[i ? i - 1 : len - 1];
        nextPoint = points[(i + 1) % len];
      } else {
        if (i === 0 || i === len - 1) {
          cps.push(v2Clone(points[i]));
          continue;
        } else {
          prevPoint = points[i - 1];
          nextPoint = points[i + 1];
        }
      }
      v2Sub(v, nextPoint, prevPoint);
      v2Scale(v, v, smooth);
      var d0 = v2Distance(point, prevPoint);
      var d1 = v2Distance(point, nextPoint);
      var sum = d0 + d1;
      if (sum !== 0) {
        d0 /= sum;
        d1 /= sum;
      }
      v2Scale(v1, v, -d0);
      v2Scale(v2, v, d1);
      var cp0 = v2Add([], point, v1);
      var cp1 = v2Add([], point, v2);
      if (constraint) {
        v2Max(cp0, cp0, min);
        v2Min(cp0, cp0, max);
        v2Max(cp1, cp1, min);
        v2Min(cp1, cp1, max);
      }
      cps.push(cp0);
      cps.push(cp1);
    }
    if (isLoop) {
      cps.push(cps.shift());
    }
    return cps;
  }
  smoothBezier = _default2;
  return smoothBezier;
}
var hasRequiredPoly;
function requirePoly() {
  if (hasRequiredPoly) return poly;
  hasRequiredPoly = 1;
  var smoothSpline2 = requireSmoothSpline();
  var smoothBezier2 = requireSmoothBezier();
  function buildPath(ctx, shape, closePath) {
    var points = shape.points;
    var smooth = shape.smooth;
    if (points && points.length >= 2) {
      if (smooth && smooth !== "spline") {
        var controlPoints = smoothBezier2(points, smooth, closePath, shape.smoothConstraint);
        ctx.moveTo(points[0][0], points[0][1]);
        var len = points.length;
        for (var i = 0; i < (closePath ? len : len - 1); i++) {
          var cp1 = controlPoints[i * 2];
          var cp2 = controlPoints[i * 2 + 1];
          var p = points[(i + 1) % len];
          ctx.bezierCurveTo(cp1[0], cp1[1], cp2[0], cp2[1], p[0], p[1]);
        }
      } else {
        if (smooth === "spline") {
          points = smoothSpline2(points, closePath);
        }
        ctx.moveTo(points[0][0], points[0][1]);
        for (var i = 1, l = points.length; i < l; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
      }
      closePath && ctx.closePath();
    }
  }
  poly.buildPath = buildPath;
  return poly;
}
var Polygon;
var hasRequiredPolygon;
function requirePolygon() {
  if (hasRequiredPolygon) return Polygon;
  hasRequiredPolygon = 1;
  var Path = requirePath$1();
  var polyHelper = requirePoly();
  var _default2 = Path.extend({
    type: "polygon",
    shape: {
      points: null,
      smooth: false,
      smoothConstraint: null
    },
    buildPath: function(ctx, shape) {
      polyHelper.buildPath(ctx, shape, true);
    }
  });
  Polygon = _default2;
  return Polygon;
}
var Polyline;
var hasRequiredPolyline;
function requirePolyline() {
  if (hasRequiredPolyline) return Polyline;
  hasRequiredPolyline = 1;
  var Path = requirePath$1();
  var polyHelper = requirePoly();
  var _default2 = Path.extend({
    type: "polyline",
    shape: {
      points: null,
      smooth: false,
      smoothConstraint: null
    },
    style: {
      stroke: "#000",
      fill: null
    },
    buildPath: function(ctx, shape) {
      polyHelper.buildPath(ctx, shape, false);
    }
  });
  Polyline = _default2;
  return Polyline;
}
var Gradient_1;
var hasRequiredGradient;
function requireGradient() {
  if (hasRequiredGradient) return Gradient_1;
  hasRequiredGradient = 1;
  var Gradient = function(colorStops) {
    this.colorStops = colorStops || [];
  };
  Gradient.prototype = {
    constructor: Gradient,
    addColorStop: function(offset, color2) {
      this.colorStops.push({
        offset,
        color: color2
      });
    }
  };
  var _default2 = Gradient;
  Gradient_1 = _default2;
  return Gradient_1;
}
var LinearGradient_1;
var hasRequiredLinearGradient;
function requireLinearGradient() {
  if (hasRequiredLinearGradient) return LinearGradient_1;
  hasRequiredLinearGradient = 1;
  var zrUtil2 = util$6;
  var Gradient = requireGradient();
  var LinearGradient = function(x, y, x2, y2, colorStops, globalCoord) {
    this.x = x == null ? 0 : x;
    this.y = y == null ? 0 : y;
    this.x2 = x2 == null ? 1 : x2;
    this.y2 = y2 == null ? 0 : y2;
    this.type = "linear";
    this.global = globalCoord || false;
    Gradient.call(this, colorStops);
  };
  LinearGradient.prototype = {
    constructor: LinearGradient
  };
  zrUtil2.inherits(LinearGradient, Gradient);
  var _default2 = LinearGradient;
  LinearGradient_1 = _default2;
  return LinearGradient_1;
}
var hasRequiredParseSVG;
function requireParseSVG() {
  if (hasRequiredParseSVG) return parseSVG;
  hasRequiredParseSVG = 1;
  var Group2 = requireGroup();
  var ZImage = requireImage();
  var Text = requireText();
  var Circle2 = requireCircle();
  var Rect2 = requireRect();
  var Ellipse2 = requireEllipse();
  var Line2 = requireLine();
  var Path = requirePath$1();
  var Polygon2 = requirePolygon();
  var Polyline2 = requirePolyline();
  var LinearGradient = requireLinearGradient();
  var Style2 = requireStyle();
  var matrix2 = requireMatrix();
  var _path = requirePath();
  var createFromString = _path.createFromString;
  var _util2 = util$6;
  var isString2 = _util2.isString;
  var extend2 = _util2.extend;
  var defaults2 = _util2.defaults;
  var trim2 = _util2.trim;
  var each2 = _util2.each;
  var DILIMITER_REG = /[\s,]+/;
  function parseXML(svg2) {
    if (isString2(svg2)) {
      var parser = new DOMParser();
      svg2 = parser.parseFromString(svg2, "text/xml");
    }
    if (svg2.nodeType === 9) {
      svg2 = svg2.firstChild;
    }
    while (svg2.nodeName.toLowerCase() !== "svg" || svg2.nodeType !== 1) {
      svg2 = svg2.nextSibling;
    }
    return svg2;
  }
  function SVGParser() {
    this._defs = {};
    this._root = null;
    this._isDefine = false;
    this._isText = false;
  }
  SVGParser.prototype.parse = function(xml, opt) {
    opt = opt || {};
    var svg2 = parseXML(xml);
    if (!svg2) {
      throw new Error("Illegal svg");
    }
    var root = new Group2();
    this._root = root;
    var viewBox = svg2.getAttribute("viewBox") || "";
    var width = parseFloat(svg2.getAttribute("width") || opt.width);
    var height = parseFloat(svg2.getAttribute("height") || opt.height);
    isNaN(width) && (width = null);
    isNaN(height) && (height = null);
    parseAttributes(svg2, root, null, true);
    var child = svg2.firstChild;
    while (child) {
      this._parseNode(child, root);
      child = child.nextSibling;
    }
    var viewBoxRect;
    var viewBoxTransform;
    if (viewBox) {
      var viewBoxArr = trim2(viewBox).split(DILIMITER_REG);
      if (viewBoxArr.length >= 4) {
        viewBoxRect = {
          x: parseFloat(viewBoxArr[0] || 0),
          y: parseFloat(viewBoxArr[1] || 0),
          width: parseFloat(viewBoxArr[2]),
          height: parseFloat(viewBoxArr[3])
        };
      }
    }
    if (viewBoxRect && width != null && height != null) {
      viewBoxTransform = makeViewBoxTransform(viewBoxRect, width, height);
      if (!opt.ignoreViewBox) {
        var elRoot = root;
        root = new Group2();
        root.add(elRoot);
        elRoot.scale = viewBoxTransform.scale.slice();
        elRoot.position = viewBoxTransform.position.slice();
      }
    }
    if (!opt.ignoreRootClip && width != null && height != null) {
      root.setClipPath(new Rect2({
        shape: {
          x: 0,
          y: 0,
          width,
          height
        }
      }));
    }
    return {
      root,
      width,
      height,
      viewBoxRect,
      viewBoxTransform
    };
  };
  SVGParser.prototype._parseNode = function(xmlNode, parentGroup) {
    var nodeName = xmlNode.nodeName.toLowerCase();
    if (nodeName === "defs") {
      this._isDefine = true;
    } else if (nodeName === "text") {
      this._isText = true;
    }
    var el;
    if (this._isDefine) {
      var parser = defineParsers[nodeName];
      if (parser) {
        var def = parser.call(this, xmlNode);
        var id = xmlNode.getAttribute("id");
        if (id) {
          this._defs[id] = def;
        }
      }
    } else {
      var parser = nodeParsers[nodeName];
      if (parser) {
        el = parser.call(this, xmlNode, parentGroup);
        parentGroup.add(el);
      }
    }
    var child = xmlNode.firstChild;
    while (child) {
      if (child.nodeType === 1) {
        this._parseNode(child, el);
      }
      if (child.nodeType === 3 && this._isText) {
        this._parseText(child, el);
      }
      child = child.nextSibling;
    }
    if (nodeName === "defs") {
      this._isDefine = false;
    } else if (nodeName === "text") {
      this._isText = false;
    }
  };
  SVGParser.prototype._parseText = function(xmlNode, parentGroup) {
    if (xmlNode.nodeType === 1) {
      var dx = xmlNode.getAttribute("dx") || 0;
      var dy = xmlNode.getAttribute("dy") || 0;
      this._textX += parseFloat(dx);
      this._textY += parseFloat(dy);
    }
    var text2 = new Text({
      style: {
        text: xmlNode.textContent,
        transformText: true
      },
      position: [this._textX || 0, this._textY || 0]
    });
    inheritStyle(parentGroup, text2);
    parseAttributes(xmlNode, text2, this._defs);
    var fontSize = text2.style.fontSize;
    if (fontSize && fontSize < 9) {
      text2.style.fontSize = 9;
      text2.scale = text2.scale || [1, 1];
      text2.scale[0] *= fontSize / 9;
      text2.scale[1] *= fontSize / 9;
    }
    var rect = text2.getBoundingRect();
    this._textX += rect.width;
    parentGroup.add(text2);
    return text2;
  };
  var nodeParsers = {
    "g": function(xmlNode, parentGroup) {
      var g = new Group2();
      inheritStyle(parentGroup, g);
      parseAttributes(xmlNode, g, this._defs);
      return g;
    },
    "rect": function(xmlNode, parentGroup) {
      var rect = new Rect2();
      inheritStyle(parentGroup, rect);
      parseAttributes(xmlNode, rect, this._defs);
      rect.setShape({
        x: parseFloat(xmlNode.getAttribute("x") || 0),
        y: parseFloat(xmlNode.getAttribute("y") || 0),
        width: parseFloat(xmlNode.getAttribute("width") || 0),
        height: parseFloat(xmlNode.getAttribute("height") || 0)
      });
      return rect;
    },
    "circle": function(xmlNode, parentGroup) {
      var circle = new Circle2();
      inheritStyle(parentGroup, circle);
      parseAttributes(xmlNode, circle, this._defs);
      circle.setShape({
        cx: parseFloat(xmlNode.getAttribute("cx") || 0),
        cy: parseFloat(xmlNode.getAttribute("cy") || 0),
        r: parseFloat(xmlNode.getAttribute("r") || 0)
      });
      return circle;
    },
    "line": function(xmlNode, parentGroup) {
      var line2 = new Line2();
      inheritStyle(parentGroup, line2);
      parseAttributes(xmlNode, line2, this._defs);
      line2.setShape({
        x1: parseFloat(xmlNode.getAttribute("x1") || 0),
        y1: parseFloat(xmlNode.getAttribute("y1") || 0),
        x2: parseFloat(xmlNode.getAttribute("x2") || 0),
        y2: parseFloat(xmlNode.getAttribute("y2") || 0)
      });
      return line2;
    },
    "ellipse": function(xmlNode, parentGroup) {
      var ellipse = new Ellipse2();
      inheritStyle(parentGroup, ellipse);
      parseAttributes(xmlNode, ellipse, this._defs);
      ellipse.setShape({
        cx: parseFloat(xmlNode.getAttribute("cx") || 0),
        cy: parseFloat(xmlNode.getAttribute("cy") || 0),
        rx: parseFloat(xmlNode.getAttribute("rx") || 0),
        ry: parseFloat(xmlNode.getAttribute("ry") || 0)
      });
      return ellipse;
    },
    "polygon": function(xmlNode, parentGroup) {
      var points = xmlNode.getAttribute("points");
      if (points) {
        points = parsePoints(points);
      }
      var polygon = new Polygon2({
        shape: {
          points: points || []
        }
      });
      inheritStyle(parentGroup, polygon);
      parseAttributes(xmlNode, polygon, this._defs);
      return polygon;
    },
    "polyline": function(xmlNode, parentGroup) {
      var path2 = new Path();
      inheritStyle(parentGroup, path2);
      parseAttributes(xmlNode, path2, this._defs);
      var points = xmlNode.getAttribute("points");
      if (points) {
        points = parsePoints(points);
      }
      var polyline = new Polyline2({
        shape: {
          points: points || []
        }
      });
      return polyline;
    },
    "image": function(xmlNode, parentGroup) {
      var img = new ZImage();
      inheritStyle(parentGroup, img);
      parseAttributes(xmlNode, img, this._defs);
      img.setStyle({
        image: xmlNode.getAttribute("xlink:href"),
        x: xmlNode.getAttribute("x"),
        y: xmlNode.getAttribute("y"),
        width: xmlNode.getAttribute("width"),
        height: xmlNode.getAttribute("height")
      });
      return img;
    },
    "text": function(xmlNode, parentGroup) {
      var x = xmlNode.getAttribute("x") || 0;
      var y = xmlNode.getAttribute("y") || 0;
      var dx = xmlNode.getAttribute("dx") || 0;
      var dy = xmlNode.getAttribute("dy") || 0;
      this._textX = parseFloat(x) + parseFloat(dx);
      this._textY = parseFloat(y) + parseFloat(dy);
      var g = new Group2();
      inheritStyle(parentGroup, g);
      parseAttributes(xmlNode, g, this._defs);
      return g;
    },
    "tspan": function(xmlNode, parentGroup) {
      var x = xmlNode.getAttribute("x");
      var y = xmlNode.getAttribute("y");
      if (x != null) {
        this._textX = parseFloat(x);
      }
      if (y != null) {
        this._textY = parseFloat(y);
      }
      var dx = xmlNode.getAttribute("dx") || 0;
      var dy = xmlNode.getAttribute("dy") || 0;
      var g = new Group2();
      inheritStyle(parentGroup, g);
      parseAttributes(xmlNode, g, this._defs);
      this._textX += dx;
      this._textY += dy;
      return g;
    },
    "path": function(xmlNode, parentGroup) {
      var d = xmlNode.getAttribute("d") || "";
      var path2 = createFromString(d);
      inheritStyle(parentGroup, path2);
      parseAttributes(xmlNode, path2, this._defs);
      return path2;
    }
  };
  var defineParsers = {
    "lineargradient": function(xmlNode) {
      var x1 = parseInt(xmlNode.getAttribute("x1") || 0, 10);
      var y1 = parseInt(xmlNode.getAttribute("y1") || 0, 10);
      var x2 = parseInt(xmlNode.getAttribute("x2") || 10, 10);
      var y2 = parseInt(xmlNode.getAttribute("y2") || 0, 10);
      var gradient = new LinearGradient(x1, y1, x2, y2);
      _parseGradientColorStops(xmlNode, gradient);
      return gradient;
    },
    "radialgradient": function(xmlNode) {
    }
  };
  function _parseGradientColorStops(xmlNode, gradient) {
    var stop2 = xmlNode.firstChild;
    while (stop2) {
      if (stop2.nodeType === 1) {
        var offset = stop2.getAttribute("offset");
        if (offset.indexOf("%") > 0) {
          offset = parseInt(offset, 10) / 100;
        } else if (offset) {
          offset = parseFloat(offset);
        } else {
          offset = 0;
        }
        var stopColor = stop2.getAttribute("stop-color") || "#000000";
        gradient.addColorStop(offset, stopColor);
      }
      stop2 = stop2.nextSibling;
    }
  }
  function inheritStyle(parent, child) {
    if (parent && parent.__inheritedStyle) {
      if (!child.__inheritedStyle) {
        child.__inheritedStyle = {};
      }
      defaults2(child.__inheritedStyle, parent.__inheritedStyle);
    }
  }
  function parsePoints(pointsString) {
    var list = trim2(pointsString).split(DILIMITER_REG);
    var points = [];
    for (var i = 0; i < list.length; i += 2) {
      var x = parseFloat(list[i]);
      var y = parseFloat(list[i + 1]);
      points.push([x, y]);
    }
    return points;
  }
  var attributesMap = {
    "fill": "fill",
    "stroke": "stroke",
    "stroke-width": "lineWidth",
    "opacity": "opacity",
    "fill-opacity": "fillOpacity",
    "stroke-opacity": "strokeOpacity",
    "stroke-dasharray": "lineDash",
    "stroke-dashoffset": "lineDashOffset",
    "stroke-linecap": "lineCap",
    "stroke-linejoin": "lineJoin",
    "stroke-miterlimit": "miterLimit",
    "font-family": "fontFamily",
    "font-size": "fontSize",
    "font-style": "fontStyle",
    "font-weight": "fontWeight",
    "text-align": "textAlign",
    "alignment-baseline": "textBaseline"
  };
  function parseAttributes(xmlNode, el, defs, onlyInlineStyle) {
    var zrStyle = el.__inheritedStyle || {};
    var isTextEl = el.type === "text";
    if (xmlNode.nodeType === 1) {
      parseTransformAttribute(xmlNode, el);
      extend2(zrStyle, parseStyleAttribute(xmlNode));
      if (!onlyInlineStyle) {
        for (var svgAttrName in attributesMap) {
          if (attributesMap.hasOwnProperty(svgAttrName)) {
            var attrValue = xmlNode.getAttribute(svgAttrName);
            if (attrValue != null) {
              zrStyle[attributesMap[svgAttrName]] = attrValue;
            }
          }
        }
      }
    }
    var elFillProp = isTextEl ? "textFill" : "fill";
    var elStrokeProp = isTextEl ? "textStroke" : "stroke";
    el.style = el.style || new Style2();
    var elStyle = el.style;
    zrStyle.fill != null && elStyle.set(elFillProp, getPaint(zrStyle.fill, defs));
    zrStyle.stroke != null && elStyle.set(elStrokeProp, getPaint(zrStyle.stroke, defs));
    each2(["lineWidth", "opacity", "fillOpacity", "strokeOpacity", "miterLimit", "fontSize"], function(propName) {
      var elPropName = propName === "lineWidth" && isTextEl ? "textStrokeWidth" : propName;
      zrStyle[propName] != null && elStyle.set(elPropName, parseFloat(zrStyle[propName]));
    });
    if (!zrStyle.textBaseline || zrStyle.textBaseline === "auto") {
      zrStyle.textBaseline = "alphabetic";
    }
    if (zrStyle.textBaseline === "alphabetic") {
      zrStyle.textBaseline = "bottom";
    }
    if (zrStyle.textAlign === "start") {
      zrStyle.textAlign = "left";
    }
    if (zrStyle.textAlign === "end") {
      zrStyle.textAlign = "right";
    }
    each2(["lineDashOffset", "lineCap", "lineJoin", "fontWeight", "fontFamily", "fontStyle", "textAlign", "textBaseline"], function(propName) {
      zrStyle[propName] != null && elStyle.set(propName, zrStyle[propName]);
    });
    if (zrStyle.lineDash) {
      el.style.lineDash = trim2(zrStyle.lineDash).split(DILIMITER_REG);
    }
    if (elStyle[elStrokeProp] && elStyle[elStrokeProp] !== "none") {
      el[elStrokeProp] = true;
    }
    el.__inheritedStyle = zrStyle;
  }
  var urlRegex = /url\(\s*#(.*?)\)/;
  function getPaint(str, defs) {
    var urlMatch = defs && str && str.match(urlRegex);
    if (urlMatch) {
      var url = trim2(urlMatch[1]);
      var def = defs[url];
      return def;
    }
    return str;
  }
  var transformRegex = /(translate|scale|rotate|skewX|skewY|matrix)\(([\-\s0-9\.e,]*)\)/g;
  function parseTransformAttribute(xmlNode, node) {
    var transform = xmlNode.getAttribute("transform");
    if (transform) {
      transform = transform.replace(/,/g, " ");
      var m = null;
      var transformOps = [];
      transform.replace(transformRegex, function(str, type2, value2) {
        transformOps.push(type2, value2);
      });
      for (var i = transformOps.length - 1; i > 0; i -= 2) {
        var value = transformOps[i];
        var type = transformOps[i - 1];
        m = m || matrix2.create();
        switch (type) {
          case "translate":
            value = trim2(value).split(DILIMITER_REG);
            matrix2.translate(m, m, [parseFloat(value[0]), parseFloat(value[1] || 0)]);
            break;
          case "scale":
            value = trim2(value).split(DILIMITER_REG);
            matrix2.scale(m, m, [parseFloat(value[0]), parseFloat(value[1] || value[0])]);
            break;
          case "rotate":
            value = trim2(value).split(DILIMITER_REG);
            matrix2.rotate(m, m, parseFloat(value[0]));
            break;
          case "skew":
            value = trim2(value).split(DILIMITER_REG);
            console.warn("Skew transform is not supported yet");
            break;
          case "matrix":
            var value = trim2(value).split(DILIMITER_REG);
            m[0] = parseFloat(value[0]);
            m[1] = parseFloat(value[1]);
            m[2] = parseFloat(value[2]);
            m[3] = parseFloat(value[3]);
            m[4] = parseFloat(value[4]);
            m[5] = parseFloat(value[5]);
            break;
        }
      }
      node.setLocalTransform(m);
    }
  }
  var styleRegex = /([^\s:;]+)\s*:\s*([^:;]+)/g;
  function parseStyleAttribute(xmlNode) {
    var style = xmlNode.getAttribute("style");
    var result = {};
    if (!style) {
      return result;
    }
    var styleList = {};
    styleRegex.lastIndex = 0;
    var styleRegResult;
    while ((styleRegResult = styleRegex.exec(style)) != null) {
      styleList[styleRegResult[1]] = styleRegResult[2];
    }
    for (var svgAttrName in attributesMap) {
      if (attributesMap.hasOwnProperty(svgAttrName) && styleList[svgAttrName] != null) {
        result[attributesMap[svgAttrName]] = styleList[svgAttrName];
      }
    }
    return result;
  }
  function makeViewBoxTransform(viewBoxRect, width, height) {
    var scaleX = width / viewBoxRect.width;
    var scaleY = height / viewBoxRect.height;
    var scale = Math.min(scaleX, scaleY);
    var viewBoxScale = [scale, scale];
    var viewBoxPosition = [-(viewBoxRect.x + viewBoxRect.width / 2) * scale + width / 2, -(viewBoxRect.y + viewBoxRect.height / 2) * scale + height / 2];
    return {
      scale: viewBoxScale,
      position: viewBoxPosition
    };
  }
  function parseSVG$1(xml, opt) {
    var parser = new SVGParser();
    return parser.parse(xml, opt);
  }
  parseSVG.parseXML = parseXML;
  parseSVG.makeViewBoxTransform = makeViewBoxTransform;
  parseSVG.parseSVG = parseSVG$1;
  return parseSVG;
}
var CompoundPath;
var hasRequiredCompoundPath;
function requireCompoundPath() {
  if (hasRequiredCompoundPath) return CompoundPath;
  hasRequiredCompoundPath = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "compound",
    shape: {
      paths: null
    },
    _updatePathDirty: function() {
      var dirtyPath = this.__dirtyPath;
      var paths = this.shape.paths;
      for (var i = 0; i < paths.length; i++) {
        dirtyPath = dirtyPath || paths[i].__dirtyPath;
      }
      this.__dirtyPath = dirtyPath;
      this.__dirty = this.__dirty || dirtyPath;
    },
    beforeBrush: function() {
      this._updatePathDirty();
      var paths = this.shape.paths || [];
      var scale = this.getGlobalScale();
      for (var i = 0; i < paths.length; i++) {
        if (!paths[i].path) {
          paths[i].createPathProxy();
        }
        paths[i].path.setScale(scale[0], scale[1], paths[i].segmentIgnoreThreshold);
      }
    },
    buildPath: function(ctx, shape) {
      var paths = shape.paths || [];
      for (var i = 0; i < paths.length; i++) {
        paths[i].buildPath(ctx, paths[i].shape, true);
      }
    },
    afterBrush: function() {
      var paths = this.shape.paths || [];
      for (var i = 0; i < paths.length; i++) {
        paths[i].__dirtyPath = false;
      }
    },
    getBoundingRect: function() {
      this._updatePathDirty();
      return Path.prototype.getBoundingRect.call(this);
    }
  });
  CompoundPath = _default2;
  return CompoundPath;
}
var IncrementalDisplayable;
var hasRequiredIncrementalDisplayable;
function requireIncrementalDisplayable() {
  if (hasRequiredIncrementalDisplayable) return IncrementalDisplayable;
  hasRequiredIncrementalDisplayable = 1;
  var _util2 = util$6;
  var inherits2 = _util2.inherits;
  var Displayble = requireDisplayable();
  var BoundingRect2 = requireBoundingRect();
  function IncrementalDisplayble(opts) {
    Displayble.call(this, opts);
    this._displayables = [];
    this._temporaryDisplayables = [];
    this._cursor = 0;
    this.notClear = true;
  }
  IncrementalDisplayble.prototype.incremental = true;
  IncrementalDisplayble.prototype.clearDisplaybles = function() {
    this._displayables = [];
    this._temporaryDisplayables = [];
    this._cursor = 0;
    this.dirty();
    this.notClear = false;
  };
  IncrementalDisplayble.prototype.addDisplayable = function(displayable, notPersistent) {
    if (notPersistent) {
      this._temporaryDisplayables.push(displayable);
    } else {
      this._displayables.push(displayable);
    }
    this.dirty();
  };
  IncrementalDisplayble.prototype.addDisplayables = function(displayables, notPersistent) {
    notPersistent = notPersistent || false;
    for (var i = 0; i < displayables.length; i++) {
      this.addDisplayable(displayables[i], notPersistent);
    }
  };
  IncrementalDisplayble.prototype.eachPendingDisplayable = function(cb) {
    for (var i = this._cursor; i < this._displayables.length; i++) {
      cb && cb(this._displayables[i]);
    }
    for (var i = 0; i < this._temporaryDisplayables.length; i++) {
      cb && cb(this._temporaryDisplayables[i]);
    }
  };
  IncrementalDisplayble.prototype.update = function() {
    this.updateTransform();
    for (var i = this._cursor; i < this._displayables.length; i++) {
      var displayable = this._displayables[i];
      displayable.parent = this;
      displayable.update();
      displayable.parent = null;
    }
    for (var i = 0; i < this._temporaryDisplayables.length; i++) {
      var displayable = this._temporaryDisplayables[i];
      displayable.parent = this;
      displayable.update();
      displayable.parent = null;
    }
  };
  IncrementalDisplayble.prototype.brush = function(ctx, prevEl) {
    for (var i = this._cursor; i < this._displayables.length; i++) {
      var displayable = this._displayables[i];
      displayable.beforeBrush && displayable.beforeBrush(ctx);
      displayable.brush(ctx, i === this._cursor ? null : this._displayables[i - 1]);
      displayable.afterBrush && displayable.afterBrush(ctx);
    }
    this._cursor = i;
    for (var i = 0; i < this._temporaryDisplayables.length; i++) {
      var displayable = this._temporaryDisplayables[i];
      displayable.beforeBrush && displayable.beforeBrush(ctx);
      displayable.brush(ctx, i === 0 ? null : this._temporaryDisplayables[i - 1]);
      displayable.afterBrush && displayable.afterBrush(ctx);
    }
    this._temporaryDisplayables = [];
    this.notClear = true;
  };
  var m = [];
  IncrementalDisplayble.prototype.getBoundingRect = function() {
    if (!this._rect) {
      var rect = new BoundingRect2(Infinity, Infinity, -Infinity, -Infinity);
      for (var i = 0; i < this._displayables.length; i++) {
        var displayable = this._displayables[i];
        var childRect = displayable.getBoundingRect().clone();
        if (displayable.needLocalTransform()) {
          childRect.applyTransform(displayable.getLocalTransform(m));
        }
        rect.union(childRect);
      }
      this._rect = rect;
    }
    return this._rect;
  };
  IncrementalDisplayble.prototype.contain = function(x, y) {
    var localPos = this.transformCoordToLocal(x, y);
    var rect = this.getBoundingRect();
    if (rect.contain(localPos[0], localPos[1])) {
      for (var i = 0; i < this._displayables.length; i++) {
        var displayable = this._displayables[i];
        if (displayable.contain(x, y)) {
          return true;
        }
      }
    }
    return false;
  };
  inherits2(IncrementalDisplayble, Displayble);
  var _default2 = IncrementalDisplayble;
  IncrementalDisplayable = _default2;
  return IncrementalDisplayable;
}
var Arc;
var hasRequiredArc;
function requireArc() {
  if (hasRequiredArc) return Arc;
  hasRequiredArc = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "arc",
    shape: {
      cx: 0,
      cy: 0,
      r: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      clockwise: true
    },
    style: {
      stroke: "#000",
      fill: null
    },
    buildPath: function(ctx, shape) {
      var x = shape.cx;
      var y = shape.cy;
      var r = Math.max(shape.r, 0);
      var startAngle = shape.startAngle;
      var endAngle = shape.endAngle;
      var clockwise = shape.clockwise;
      var unitX = Math.cos(startAngle);
      var unitY = Math.sin(startAngle);
      ctx.moveTo(unitX * r + x, unitY * r + y);
      ctx.arc(x, y, r, startAngle, endAngle, !clockwise);
    }
  });
  Arc = _default2;
  return Arc;
}
var BezierCurve;
var hasRequiredBezierCurve;
function requireBezierCurve() {
  if (hasRequiredBezierCurve) return BezierCurve;
  hasRequiredBezierCurve = 1;
  var Path = requirePath$1();
  var vec22 = requireVector();
  var _curve = requireCurve();
  var quadraticSubdivide = _curve.quadraticSubdivide;
  var cubicSubdivide = _curve.cubicSubdivide;
  var quadraticAt = _curve.quadraticAt;
  var cubicAt = _curve.cubicAt;
  var quadraticDerivativeAt = _curve.quadraticDerivativeAt;
  var cubicDerivativeAt = _curve.cubicDerivativeAt;
  var out = [];
  function someVectorAt(shape, t, isTangent) {
    var cpx2 = shape.cpx2;
    var cpy2 = shape.cpy2;
    if (cpx2 === null || cpy2 === null) {
      return [(isTangent ? cubicDerivativeAt : cubicAt)(shape.x1, shape.cpx1, shape.cpx2, shape.x2, t), (isTangent ? cubicDerivativeAt : cubicAt)(shape.y1, shape.cpy1, shape.cpy2, shape.y2, t)];
    } else {
      return [(isTangent ? quadraticDerivativeAt : quadraticAt)(shape.x1, shape.cpx1, shape.x2, t), (isTangent ? quadraticDerivativeAt : quadraticAt)(shape.y1, shape.cpy1, shape.y2, t)];
    }
  }
  var _default2 = Path.extend({
    type: "bezier-curve",
    shape: {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      cpx1: 0,
      cpy1: 0,
      // cpx2: 0,
      // cpy2: 0
      // Curve show percent, for animating
      percent: 1
    },
    style: {
      stroke: "#000",
      fill: null
    },
    buildPath: function(ctx, shape) {
      var x1 = shape.x1;
      var y1 = shape.y1;
      var x2 = shape.x2;
      var y2 = shape.y2;
      var cpx1 = shape.cpx1;
      var cpy1 = shape.cpy1;
      var cpx2 = shape.cpx2;
      var cpy2 = shape.cpy2;
      var percent = shape.percent;
      if (percent === 0) {
        return;
      }
      ctx.moveTo(x1, y1);
      if (cpx2 == null || cpy2 == null) {
        if (percent < 1) {
          quadraticSubdivide(x1, cpx1, x2, percent, out);
          cpx1 = out[1];
          x2 = out[2];
          quadraticSubdivide(y1, cpy1, y2, percent, out);
          cpy1 = out[1];
          y2 = out[2];
        }
        ctx.quadraticCurveTo(cpx1, cpy1, x2, y2);
      } else {
        if (percent < 1) {
          cubicSubdivide(x1, cpx1, cpx2, x2, percent, out);
          cpx1 = out[1];
          cpx2 = out[2];
          x2 = out[3];
          cubicSubdivide(y1, cpy1, cpy2, y2, percent, out);
          cpy1 = out[1];
          cpy2 = out[2];
          y2 = out[3];
        }
        ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      }
    },
    /**
     * Get point at percent
     * @param  {number} t
     * @return {Array.<number>}
     */
    pointAt: function(t) {
      return someVectorAt(this.shape, t, false);
    },
    /**
     * Get tangent at percent
     * @param  {number} t
     * @return {Array.<number>}
     */
    tangentAt: function(t) {
      var p = someVectorAt(this.shape, t, true);
      return vec22.normalize(p, p);
    }
  });
  BezierCurve = _default2;
  return BezierCurve;
}
var Droplet;
var hasRequiredDroplet;
function requireDroplet() {
  if (hasRequiredDroplet) return Droplet;
  hasRequiredDroplet = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "droplet",
    shape: {
      cx: 0,
      cy: 0,
      width: 0,
      height: 0
    },
    buildPath: function(ctx, shape) {
      var x = shape.cx;
      var y = shape.cy;
      var a = shape.width;
      var b = shape.height;
      ctx.moveTo(x, y + a);
      ctx.bezierCurveTo(x + a, y + a, x + a * 3 / 2, y - a / 3, x, y - b);
      ctx.bezierCurveTo(x - a * 3 / 2, y - a / 3, x - a, y + a, x, y + a);
      ctx.closePath();
    }
  });
  Droplet = _default2;
  return Droplet;
}
var Heart;
var hasRequiredHeart;
function requireHeart() {
  if (hasRequiredHeart) return Heart;
  hasRequiredHeart = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "heart",
    shape: {
      cx: 0,
      cy: 0,
      width: 0,
      height: 0
    },
    buildPath: function(ctx, shape) {
      var x = shape.cx;
      var y = shape.cy;
      var a = shape.width;
      var b = shape.height;
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + a / 2, y - b * 2 / 3, x + a * 2, y + b / 3, x, y + b);
      ctx.bezierCurveTo(x - a * 2, y + b / 3, x - a / 2, y - b * 2 / 3, x, y);
    }
  });
  Heart = _default2;
  return Heart;
}
var Isogon;
var hasRequiredIsogon;
function requireIsogon() {
  if (hasRequiredIsogon) return Isogon;
  hasRequiredIsogon = 1;
  var Path = requirePath$1();
  var PI = Math.PI;
  var sin = Math.sin;
  var cos = Math.cos;
  var _default2 = Path.extend({
    type: "isogon",
    shape: {
      x: 0,
      y: 0,
      r: 0,
      n: 0
    },
    buildPath: function(ctx, shape) {
      var n = shape.n;
      if (!n || n < 2) {
        return;
      }
      var x = shape.x;
      var y = shape.y;
      var r = shape.r;
      var dStep = 2 * PI / n;
      var deg = -PI / 2;
      ctx.moveTo(x + r * cos(deg), y + r * sin(deg));
      for (var i = 0, end = n - 1; i < end; i++) {
        deg += dStep;
        ctx.lineTo(x + r * cos(deg), y + r * sin(deg));
      }
      ctx.closePath();
      return;
    }
  });
  Isogon = _default2;
  return Isogon;
}
var Ring;
var hasRequiredRing;
function requireRing() {
  if (hasRequiredRing) return Ring;
  hasRequiredRing = 1;
  var Path = requirePath$1();
  var _default2 = Path.extend({
    type: "ring",
    shape: {
      cx: 0,
      cy: 0,
      r: 0,
      r0: 0
    },
    buildPath: function(ctx, shape) {
      var x = shape.cx;
      var y = shape.cy;
      var PI2 = Math.PI * 2;
      ctx.moveTo(x + shape.r, y);
      ctx.arc(x, y, shape.r, 0, PI2, false);
      ctx.moveTo(x + shape.r0, y);
      ctx.arc(x, y, shape.r0, 0, PI2, true);
    }
  });
  Ring = _default2;
  return Ring;
}
var Rose;
var hasRequiredRose;
function requireRose() {
  if (hasRequiredRose) return Rose;
  hasRequiredRose = 1;
  var Path = requirePath$1();
  var sin = Math.sin;
  var cos = Math.cos;
  var radian = Math.PI / 180;
  var _default2 = Path.extend({
    type: "rose",
    shape: {
      cx: 0,
      cy: 0,
      r: [],
      k: 0,
      n: 1
    },
    style: {
      stroke: "#000",
      fill: null
    },
    buildPath: function(ctx, shape) {
      var x;
      var y;
      var R = shape.r;
      var r;
      var k = shape.k;
      var n = shape.n;
      var x0 = shape.cx;
      var y0 = shape.cy;
      ctx.moveTo(x0, y0);
      for (var i = 0, len = R.length; i < len; i++) {
        r = R[i];
        for (var j = 0; j <= 360 * n; j++) {
          x = r * sin(k / n * j % 360 * radian) * cos(j * radian) + x0;
          y = r * sin(k / n * j % 360 * radian) * sin(j * radian) + y0;
          ctx.lineTo(x, y);
        }
      }
    }
  });
  Rose = _default2;
  return Rose;
}
var fixClipWithShadow;
var hasRequiredFixClipWithShadow;
function requireFixClipWithShadow() {
  if (hasRequiredFixClipWithShadow) return fixClipWithShadow;
  hasRequiredFixClipWithShadow = 1;
  var env2 = env_1;
  var shadowTemp = [["shadowBlur", 0], ["shadowColor", "#000"], ["shadowOffsetX", 0], ["shadowOffsetY", 0]];
  function _default2(orignalBrush) {
    return env2.browser.ie && env2.browser.version >= 11 ? function() {
      var clipPaths = this.__clipPaths;
      var style = this.style;
      var modified;
      if (clipPaths) {
        for (var i = 0; i < clipPaths.length; i++) {
          var clipPath = clipPaths[i];
          var shape = clipPath && clipPath.shape;
          var type = clipPath && clipPath.type;
          if (shape && (type === "sector" && shape.startAngle === shape.endAngle || type === "rect" && (!shape.width || !shape.height))) {
            for (var j = 0; j < shadowTemp.length; j++) {
              shadowTemp[j][2] = style[shadowTemp[j][0]];
              style[shadowTemp[j][0]] = shadowTemp[j][1];
            }
            modified = true;
            break;
          }
        }
      }
      orignalBrush.apply(this, arguments);
      if (modified) {
        for (var j = 0; j < shadowTemp.length; j++) {
          style[shadowTemp[j][0]] = shadowTemp[j][2];
        }
      }
    } : orignalBrush;
  }
  fixClipWithShadow = _default2;
  return fixClipWithShadow;
}
var Sector;
var hasRequiredSector;
function requireSector() {
  if (hasRequiredSector) return Sector;
  hasRequiredSector = 1;
  var Path = requirePath$1();
  var fixClipWithShadow2 = requireFixClipWithShadow();
  var _default2 = Path.extend({
    type: "sector",
    shape: {
      cx: 0,
      cy: 0,
      r0: 0,
      r: 0,
      startAngle: 0,
      endAngle: Math.PI * 2,
      clockwise: true
    },
    brush: fixClipWithShadow2(Path.prototype.brush),
    buildPath: function(ctx, shape) {
      var x = shape.cx;
      var y = shape.cy;
      var r0 = Math.max(shape.r0 || 0, 0);
      var r = Math.max(shape.r, 0);
      var startAngle = shape.startAngle;
      var endAngle = shape.endAngle;
      var clockwise = shape.clockwise;
      var unitX = Math.cos(startAngle);
      var unitY = Math.sin(startAngle);
      ctx.moveTo(unitX * r0 + x, unitY * r0 + y);
      ctx.lineTo(unitX * r + x, unitY * r + y);
      ctx.arc(x, y, r, startAngle, endAngle, !clockwise);
      ctx.lineTo(Math.cos(endAngle) * r0 + x, Math.sin(endAngle) * r0 + y);
      if (r0 !== 0) {
        ctx.arc(x, y, r0, endAngle, startAngle, clockwise);
      }
      ctx.closePath();
    }
  });
  Sector = _default2;
  return Sector;
}
var Star;
var hasRequiredStar;
function requireStar() {
  if (hasRequiredStar) return Star;
  hasRequiredStar = 1;
  var Path = requirePath$1();
  var PI = Math.PI;
  var cos = Math.cos;
  var sin = Math.sin;
  var _default2 = Path.extend({
    type: "star",
    shape: {
      cx: 0,
      cy: 0,
      n: 3,
      r0: null,
      r: 0
    },
    buildPath: function(ctx, shape) {
      var n = shape.n;
      if (!n || n < 2) {
        return;
      }
      var x = shape.cx;
      var y = shape.cy;
      var r = shape.r;
      var r0 = shape.r0;
      if (r0 == null) {
        r0 = n > 4 ? r * cos(2 * PI / n) / cos(PI / n) : r / 3;
      }
      var dStep = PI / n;
      var deg = -PI / 2;
      var xStart = x + r * cos(deg);
      var yStart = y + r * sin(deg);
      deg += dStep;
      ctx.moveTo(xStart, yStart);
      for (var i = 0, end = n * 2 - 1, ri; i < end; i++) {
        ri = i % 2 === 0 ? r0 : r;
        ctx.lineTo(x + ri * cos(deg), y + ri * sin(deg));
        deg += dStep;
      }
      ctx.closePath();
    }
  });
  Star = _default2;
  return Star;
}
var Trochoid;
var hasRequiredTrochoid;
function requireTrochoid() {
  if (hasRequiredTrochoid) return Trochoid;
  hasRequiredTrochoid = 1;
  var Path = requirePath$1();
  var cos = Math.cos;
  var sin = Math.sin;
  var _default2 = Path.extend({
    type: "trochoid",
    shape: {
      cx: 0,
      cy: 0,
      r: 0,
      r0: 0,
      d: 0,
      location: "out"
    },
    style: {
      stroke: "#000",
      fill: null
    },
    buildPath: function(ctx, shape) {
      var x1;
      var y1;
      var x2;
      var y2;
      var R = shape.r;
      var r = shape.r0;
      var d = shape.d;
      var offsetX = shape.cx;
      var offsetY = shape.cy;
      var delta = shape.location === "out" ? 1 : -1;
      if (shape.location && R <= r) {
        return;
      }
      var num = 0;
      var i = 1;
      var theta;
      x1 = (R + delta * r) * cos(0) - delta * d * cos(0) + offsetX;
      y1 = (R + delta * r) * sin(0) - d * sin(0) + offsetY;
      ctx.moveTo(x1, y1);
      do {
        num++;
      } while (r * num % (R + delta * r) !== 0);
      do {
        theta = Math.PI / 180 * i;
        x2 = (R + delta * r) * cos(theta) - delta * d * cos((R / r + delta) * theta) + offsetX;
        y2 = (R + delta * r) * sin(theta) - d * sin((R / r + delta) * theta) + offsetY;
        ctx.lineTo(x2, y2);
        i++;
      } while (i <= r * num / (R + delta * r) * 360);
    }
  });
  Trochoid = _default2;
  return Trochoid;
}
var RadialGradient_1;
var hasRequiredRadialGradient;
function requireRadialGradient() {
  if (hasRequiredRadialGradient) return RadialGradient_1;
  hasRequiredRadialGradient = 1;
  var zrUtil2 = util$6;
  var Gradient = requireGradient();
  var RadialGradient = function(x, y, r, colorStops, globalCoord) {
    this.x = x == null ? 0.5 : x;
    this.y = y == null ? 0.5 : y;
    this.r = r == null ? 0.5 : r;
    this.type = "radial";
    this.global = globalCoord || false;
    Gradient.call(this, colorStops);
  };
  RadialGradient.prototype = {
    constructor: RadialGradient
  };
  zrUtil2.inherits(RadialGradient, Gradient);
  var _default2 = RadialGradient;
  RadialGradient_1 = _default2;
  return RadialGradient_1;
}
var hasRequired_export;
function require_export() {
  if (hasRequired_export) return _export;
  hasRequired_export = 1;
  var zrUtil2 = util$6;
  _export.util = zrUtil2;
  var matrix2 = requireMatrix();
  _export.matrix = matrix2;
  var vector2 = requireVector();
  _export.vector = vector2;
  var colorTool = requireColor();
  _export.color = colorTool;
  var pathTool = requirePath();
  _export.path = pathTool;
  var _parseSVG = requireParseSVG();
  _parseSVG.parseSVG;
  _export.parseSVG = _parseSVG.parseSVG;
  var _Group = requireGroup();
  _export.Group = _Group;
  var _Path = requirePath$1();
  _export.Path = _Path;
  var _Image = requireImage();
  _export.Image = _Image;
  var _CompoundPath = requireCompoundPath();
  _export.CompoundPath = _CompoundPath;
  var _Text = requireText();
  _export.Text = _Text;
  var _IncrementalDisplayable = requireIncrementalDisplayable();
  _export.IncrementalDisplayable = _IncrementalDisplayable;
  var _Arc = requireArc();
  _export.Arc = _Arc;
  var _BezierCurve = requireBezierCurve();
  _export.BezierCurve = _BezierCurve;
  var _Circle = requireCircle();
  _export.Circle = _Circle;
  var _Droplet = requireDroplet();
  _export.Droplet = _Droplet;
  var _Ellipse = requireEllipse();
  _export.Ellipse = _Ellipse;
  var _Heart = requireHeart();
  _export.Heart = _Heart;
  var _Isogon = requireIsogon();
  _export.Isogon = _Isogon;
  var _Line = requireLine();
  _export.Line = _Line;
  var _Polygon = requirePolygon();
  _export.Polygon = _Polygon;
  var _Polyline = requirePolyline();
  _export.Polyline = _Polyline;
  var _Rect = requireRect();
  _export.Rect = _Rect;
  var _Ring = requireRing();
  _export.Ring = _Ring;
  var _Rose = requireRose();
  _export.Rose = _Rose;
  var _Sector = requireSector();
  _export.Sector = _Sector;
  var _Star = requireStar();
  _export.Star = _Star;
  var _Trochoid = requireTrochoid();
  _export.Trochoid = _Trochoid;
  var _LinearGradient = requireLinearGradient();
  _export.LinearGradient = _LinearGradient;
  var _RadialGradient = requireRadialGradient();
  _export.RadialGradient = _RadialGradient;
  var _Pattern = requirePattern();
  _export.Pattern = _Pattern;
  var _BoundingRect = requireBoundingRect();
  _export.BoundingRect = _BoundingRect;
  return _export;
}
var svg = {};
var graphic$1 = {};
var core$1 = {};
var hasRequiredCore$1;
function requireCore$1() {
  if (hasRequiredCore$1) return core$1;
  hasRequiredCore$1 = 1;
  var svgURI = "http://www.w3.org/2000/svg";
  function createElement(name) {
    return document.createElementNS(svgURI, name);
  }
  core$1.createElement = createElement;
  return core$1;
}
var hasRequiredGraphic$1;
function requireGraphic$1() {
  if (hasRequiredGraphic$1) return graphic$1;
  hasRequiredGraphic$1 = 1;
  var _core = requireCore$1();
  var createElement = _core.createElement;
  var PathProxy = requirePathProxy();
  var BoundingRect2 = requireBoundingRect();
  var matrix2 = requireMatrix();
  var textContain = requireText$2();
  var textHelper = requireText$1();
  var Text = requireText();
  var CMD = PathProxy.CMD;
  var arrayJoin = Array.prototype.join;
  var NONE = "none";
  var mathRound = Math.round;
  var mathSin = Math.sin;
  var mathCos = Math.cos;
  var PI = Math.PI;
  var PI2 = Math.PI * 2;
  var degree = 180 / PI;
  var EPSILON = 1e-4;
  function round4(val) {
    return mathRound(val * 1e4) / 1e4;
  }
  function isAroundZero(val) {
    return val < EPSILON && val > -EPSILON;
  }
  function pathHasFill(style, isText) {
    var fill = isText ? style.textFill : style.fill;
    return fill != null && fill !== NONE;
  }
  function pathHasStroke(style, isText) {
    var stroke = isText ? style.textStroke : style.stroke;
    return stroke != null && stroke !== NONE;
  }
  function setTransform(svgEl, m) {
    if (m) {
      attr(svgEl, "transform", "matrix(" + arrayJoin.call(m, ",") + ")");
    }
  }
  function attr(el, key, val) {
    if (!val || val.type !== "linear" && val.type !== "radial") {
      el.setAttribute(key, val);
    }
  }
  function attrXLink(el, key, val) {
    el.setAttributeNS("http://www.w3.org/1999/xlink", key, val);
  }
  function bindStyle(svgEl, style, isText, el) {
    if (pathHasFill(style, isText)) {
      var fill = isText ? style.textFill : style.fill;
      fill = fill === "transparent" ? NONE : fill;
      attr(svgEl, "fill", fill);
      attr(svgEl, "fill-opacity", style.fillOpacity != null ? style.fillOpacity * style.opacity : style.opacity);
    } else {
      attr(svgEl, "fill", NONE);
    }
    if (pathHasStroke(style, isText)) {
      var stroke = isText ? style.textStroke : style.stroke;
      stroke = stroke === "transparent" ? NONE : stroke;
      attr(svgEl, "stroke", stroke);
      var strokeWidth = isText ? style.textStrokeWidth : style.lineWidth;
      var strokeScale = !isText && style.strokeNoScale ? el.getLineScale() : 1;
      attr(svgEl, "stroke-width", strokeWidth / strokeScale);
      attr(svgEl, "paint-order", isText ? "stroke" : "fill");
      attr(svgEl, "stroke-opacity", style.strokeOpacity != null ? style.strokeOpacity : style.opacity);
      var lineDash = style.lineDash;
      if (lineDash) {
        attr(svgEl, "stroke-dasharray", style.lineDash.join(","));
        attr(svgEl, "stroke-dashoffset", mathRound(style.lineDashOffset || 0));
      } else {
        attr(svgEl, "stroke-dasharray", "");
      }
      style.lineCap && attr(svgEl, "stroke-linecap", style.lineCap);
      style.lineJoin && attr(svgEl, "stroke-linejoin", style.lineJoin);
      style.miterLimit && attr(svgEl, "stroke-miterlimit", style.miterLimit);
    } else {
      attr(svgEl, "stroke", NONE);
    }
  }
  function pathDataToString(path2) {
    var str = [];
    var data = path2.data;
    var dataLength = path2.len();
    for (var i = 0; i < dataLength; ) {
      var cmd = data[i++];
      var cmdStr = "";
      var nData = 0;
      switch (cmd) {
        case CMD.M:
          cmdStr = "M";
          nData = 2;
          break;
        case CMD.L:
          cmdStr = "L";
          nData = 2;
          break;
        case CMD.Q:
          cmdStr = "Q";
          nData = 4;
          break;
        case CMD.C:
          cmdStr = "C";
          nData = 6;
          break;
        case CMD.A:
          var cx = data[i++];
          var cy = data[i++];
          var rx = data[i++];
          var ry = data[i++];
          var theta = data[i++];
          var dTheta = data[i++];
          var psi = data[i++];
          var clockwise = data[i++];
          var dThetaPositive = Math.abs(dTheta);
          var isCircle = isAroundZero(dThetaPositive - PI2) || (clockwise ? dTheta >= PI2 : -dTheta >= PI2);
          var unifiedTheta = dTheta > 0 ? dTheta % PI2 : dTheta % PI2 + PI2;
          var large = false;
          if (isCircle) {
            large = true;
          } else if (isAroundZero(dThetaPositive)) {
            large = false;
          } else {
            large = unifiedTheta >= PI === !!clockwise;
          }
          var x0 = round4(cx + rx * mathCos(theta));
          var y0 = round4(cy + ry * mathSin(theta));
          if (isCircle) {
            if (clockwise) {
              dTheta = PI2 - 1e-4;
            } else {
              dTheta = -PI2 + 1e-4;
            }
            large = true;
            if (i === 9) {
              str.push("M", x0, y0);
            }
          }
          var x = round4(cx + rx * mathCos(theta + dTheta));
          var y = round4(cy + ry * mathSin(theta + dTheta));
          str.push("A", round4(rx), round4(ry), mathRound(psi * degree), +large, +clockwise, x, y);
          break;
        case CMD.Z:
          cmdStr = "Z";
          break;
        case CMD.R:
          var x = round4(data[i++]);
          var y = round4(data[i++]);
          var w = round4(data[i++]);
          var h = round4(data[i++]);
          str.push("M", x, y, "L", x + w, y, "L", x + w, y + h, "L", x, y + h, "L", x, y);
          break;
      }
      cmdStr && str.push(cmdStr);
      for (var j = 0; j < nData; j++) {
        str.push(round4(data[i++]));
      }
    }
    return str.join(" ");
  }
  var svgPath = {};
  svgPath.brush = function(el) {
    var style = el.style;
    var svgEl = el.__svgEl;
    if (!svgEl) {
      svgEl = createElement("path");
      el.__svgEl = svgEl;
    }
    if (!el.path) {
      el.createPathProxy();
    }
    var path2 = el.path;
    if (el.__dirtyPath) {
      path2.beginPath();
      path2.subPixelOptimize = false;
      el.buildPath(path2, el.shape);
      el.__dirtyPath = false;
      var pathStr = pathDataToString(path2);
      if (pathStr.indexOf("NaN") < 0) {
        attr(svgEl, "d", pathStr);
      }
    }
    bindStyle(svgEl, style, false, el);
    setTransform(svgEl, el.transform);
    if (style.text != null) {
      svgTextDrawRectText(el, el.getBoundingRect());
    } else {
      removeOldTextNode(el);
    }
  };
  var svgImage = {};
  svgImage.brush = function(el) {
    var style = el.style;
    var image2 = style.image;
    if (image2 instanceof HTMLImageElement) {
      var src = image2.src;
      image2 = src;
    }
    if (!image2) {
      return;
    }
    var x = style.x || 0;
    var y = style.y || 0;
    var dw = style.width;
    var dh = style.height;
    var svgEl = el.__svgEl;
    if (!svgEl) {
      svgEl = createElement("image");
      el.__svgEl = svgEl;
    }
    if (image2 !== el.__imageSrc) {
      attrXLink(svgEl, "href", image2);
      el.__imageSrc = image2;
    }
    attr(svgEl, "width", dw);
    attr(svgEl, "height", dh);
    attr(svgEl, "x", x);
    attr(svgEl, "y", y);
    setTransform(svgEl, el.transform);
    if (style.text != null) {
      svgTextDrawRectText(el, el.getBoundingRect());
    } else {
      removeOldTextNode(el);
    }
  };
  var svgText = {};
  var _tmpTextHostRect = new BoundingRect2();
  var _tmpTextBoxPos = {};
  var _tmpTextTransform = [];
  var TEXT_ALIGN_TO_ANCHRO = {
    left: "start",
    right: "end",
    center: "middle",
    middle: "middle"
  };
  var svgTextDrawRectText = function(el, hostRect) {
    var style = el.style;
    var elTransform = el.transform;
    var needTransformTextByHostEl = el instanceof Text || style.transformText;
    el.__dirty && textHelper.normalizeTextStyle(style, true);
    var text2 = style.text;
    text2 != null && (text2 += "");
    if (!textHelper.needDrawText(text2, style)) {
      return;
    }
    text2 == null && (text2 = "");
    if (!needTransformTextByHostEl && elTransform) {
      _tmpTextHostRect.copy(hostRect);
      _tmpTextHostRect.applyTransform(elTransform);
      hostRect = _tmpTextHostRect;
    }
    var textSvgEl = el.__textSvgEl;
    if (!textSvgEl) {
      textSvgEl = createElement("text");
      el.__textSvgEl = textSvgEl;
    }
    var textSvgElStyle = textSvgEl.style;
    var font = style.font || textContain.DEFAULT_FONT;
    var computedFont = textSvgEl.__computedFont;
    if (font !== textSvgEl.__styleFont) {
      textSvgElStyle.font = textSvgEl.__styleFont = font;
      computedFont = textSvgEl.__computedFont = textSvgElStyle.font;
    }
    var textPadding = style.textPadding;
    var textLineHeight = style.textLineHeight;
    var contentBlock = el.__textCotentBlock;
    if (!contentBlock || el.__dirtyText) {
      contentBlock = el.__textCotentBlock = textContain.parsePlainText(text2, computedFont, textPadding, textLineHeight, style.truncate);
    }
    var outerHeight = contentBlock.outerHeight;
    var lineHeight = contentBlock.lineHeight;
    textHelper.getBoxPosition(_tmpTextBoxPos, el, style, hostRect);
    var baseX = _tmpTextBoxPos.baseX;
    var baseY = _tmpTextBoxPos.baseY;
    var textAlign = _tmpTextBoxPos.textAlign || "left";
    var textVerticalAlign = _tmpTextBoxPos.textVerticalAlign;
    setTextTransform(textSvgEl, needTransformTextByHostEl, elTransform, style, hostRect, baseX, baseY);
    var boxY = textContain.adjustTextY(baseY, outerHeight, textVerticalAlign);
    var textX = baseX;
    var textY = boxY;
    if (textPadding) {
      textX = getTextXForPadding(baseX, textAlign, textPadding);
      textY += textPadding[0];
    }
    textY += lineHeight / 2;
    bindStyle(textSvgEl, style, true, el);
    var canCacheByTextString = contentBlock.canCacheByTextString;
    var tspanList = el.__tspanList || (el.__tspanList = []);
    var tspanOriginLen = tspanList.length;
    if (canCacheByTextString && el.__canCacheByTextString && el.__text === text2) {
      if (el.__dirtyText && tspanOriginLen) {
        for (var idx = 0; idx < tspanOriginLen; ++idx) {
          updateTextLocation(tspanList[idx], textAlign, textX, textY + idx * lineHeight);
        }
      }
    } else {
      el.__text = text2;
      el.__canCacheByTextString = canCacheByTextString;
      var textLines = contentBlock.lines;
      var nTextLines = textLines.length;
      var idx = 0;
      for (; idx < nTextLines; idx++) {
        var tspan = tspanList[idx];
        var singleLineText = textLines[idx];
        if (!tspan) {
          tspan = tspanList[idx] = createElement("tspan");
          textSvgEl.appendChild(tspan);
          tspan.appendChild(document.createTextNode(singleLineText));
        } else if (tspan.__zrText !== singleLineText) {
          tspan.innerHTML = "";
          tspan.appendChild(document.createTextNode(singleLineText));
        }
        updateTextLocation(tspan, textAlign, textX, textY + idx * lineHeight);
      }
      if (tspanOriginLen > nTextLines) {
        for (; idx < tspanOriginLen; idx++) {
          textSvgEl.removeChild(tspanList[idx]);
        }
        tspanList.length = nTextLines;
      }
    }
  };
  function setTextTransform(textSvgEl, needTransformTextByHostEl, elTransform, style, hostRect, baseX, baseY) {
    matrix2.identity(_tmpTextTransform);
    if (needTransformTextByHostEl && elTransform) {
      matrix2.copy(_tmpTextTransform, elTransform);
    }
    var textRotation = style.textRotation;
    if (hostRect && textRotation) {
      var origin = style.textOrigin;
      if (origin === "center") {
        baseX = hostRect.width / 2 + hostRect.x;
        baseY = hostRect.height / 2 + hostRect.y;
      } else if (origin) {
        baseX = origin[0] + hostRect.x;
        baseY = origin[1] + hostRect.y;
      }
      _tmpTextTransform[4] -= baseX;
      _tmpTextTransform[5] -= baseY;
      matrix2.rotate(_tmpTextTransform, _tmpTextTransform, textRotation);
      _tmpTextTransform[4] += baseX;
      _tmpTextTransform[5] += baseY;
    }
    setTransform(textSvgEl, _tmpTextTransform);
  }
  function getTextXForPadding(x, textAlign, textPadding) {
    return textAlign === "right" ? x - textPadding[1] : textAlign === "center" ? x + textPadding[3] / 2 - textPadding[1] / 2 : x + textPadding[3];
  }
  function updateTextLocation(tspan, textAlign, x, y) {
    attr(tspan, "dominant-baseline", "middle");
    attr(tspan, "text-anchor", TEXT_ALIGN_TO_ANCHRO[textAlign]);
    attr(tspan, "x", x);
    attr(tspan, "y", y);
  }
  function removeOldTextNode(el) {
    if (el && el.__textSvgEl) {
      if (el.__textSvgEl.parentNode) {
        el.__textSvgEl.parentNode.removeChild(el.__textSvgEl);
      }
      el.__textSvgEl = null;
      el.__tspanList = [];
      el.__text = null;
    }
  }
  svgText.drawRectText = svgTextDrawRectText;
  svgText.brush = function(el) {
    var style = el.style;
    if (style.text != null) {
      svgTextDrawRectText(el, false);
    } else {
      removeOldTextNode(el);
    }
  };
  graphic$1.path = svgPath;
  graphic$1.image = svgImage;
  graphic$1.text = svgText;
  return graphic$1;
}
var arrayDiff2;
var hasRequiredArrayDiff2;
function requireArrayDiff2() {
  if (hasRequiredArrayDiff2) return arrayDiff2;
  hasRequiredArrayDiff2 = 1;
  function Diff() {
  }
  Diff.prototype = {
    diff: function(oldArr, newArr, equals) {
      if (!equals) {
        equals = function(a, b) {
          return a === b;
        };
      }
      this.equals = equals;
      var self2 = this;
      oldArr = oldArr.slice();
      newArr = newArr.slice();
      var newLen = newArr.length;
      var oldLen = oldArr.length;
      var editLength = 1;
      var maxEditLength = newLen + oldLen;
      var bestPath = [{
        newPos: -1,
        components: []
      }];
      var oldPos = this.extractCommon(bestPath[0], newArr, oldArr, 0);
      if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
        var indices = [];
        for (var i = 0; i < newArr.length; i++) {
          indices.push(i);
        }
        return [{
          indices,
          count: newArr.length
        }];
      }
      function execEditLength() {
        for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
          var basePath;
          var addPath = bestPath[diagonalPath - 1];
          var removePath = bestPath[diagonalPath + 1];
          var oldPos2 = (removePath ? removePath.newPos : 0) - diagonalPath;
          if (addPath) {
            bestPath[diagonalPath - 1] = void 0;
          }
          var canAdd = addPath && addPath.newPos + 1 < newLen;
          var canRemove = removePath && 0 <= oldPos2 && oldPos2 < oldLen;
          if (!canAdd && !canRemove) {
            bestPath[diagonalPath] = void 0;
            continue;
          }
          if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
            basePath = clonePath(removePath);
            self2.pushComponent(basePath.components, void 0, true);
          } else {
            basePath = addPath;
            basePath.newPos++;
            self2.pushComponent(basePath.components, true, void 0);
          }
          oldPos2 = self2.extractCommon(basePath, newArr, oldArr, diagonalPath);
          if (basePath.newPos + 1 >= newLen && oldPos2 + 1 >= oldLen) {
            return buildValues(self2, basePath.components);
          } else {
            bestPath[diagonalPath] = basePath;
          }
        }
        editLength++;
      }
      while (editLength <= maxEditLength) {
        var ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    },
    pushComponent: function(components, added, removed) {
      var last = components[components.length - 1];
      if (last && last.added === added && last.removed === removed) {
        components[components.length - 1] = {
          count: last.count + 1,
          added,
          removed
        };
      } else {
        components.push({
          count: 1,
          added,
          removed
        });
      }
    },
    extractCommon: function(basePath, newArr, oldArr, diagonalPath) {
      var newLen = newArr.length;
      var oldLen = oldArr.length;
      var newPos = basePath.newPos;
      var oldPos = newPos - diagonalPath;
      var commonCount = 0;
      while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newArr[newPos + 1], oldArr[oldPos + 1])) {
        newPos++;
        oldPos++;
        commonCount++;
      }
      if (commonCount) {
        basePath.components.push({
          count: commonCount
        });
      }
      basePath.newPos = newPos;
      return oldPos;
    },
    tokenize: function(value) {
      return value.slice();
    },
    join: function(value) {
      return value.slice();
    }
  };
  function buildValues(diff, components, newArr, oldArr) {
    var componentPos = 0;
    var componentLen = components.length;
    var newPos = 0;
    var oldPos = 0;
    for (; componentPos < componentLen; componentPos++) {
      var component = components[componentPos];
      if (!component.removed) {
        var indices = [];
        for (var i = newPos; i < newPos + component.count; i++) {
          indices.push(i);
        }
        component.indices = indices;
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        var indices = [];
        for (var i = oldPos; i < oldPos + component.count; i++) {
          indices.push(i);
        }
        component.indices = indices;
        oldPos += component.count;
      }
    }
    return components;
  }
  function clonePath(path2) {
    return {
      newPos: path2.newPos,
      components: path2.components.slice(0)
    };
  }
  var arrayDiff = new Diff();
  function _default2(oldArr, newArr, callback) {
    return arrayDiff.diff(oldArr, newArr, callback);
  }
  arrayDiff2 = _default2;
  return arrayDiff2;
}
var Definable_1;
var hasRequiredDefinable;
function requireDefinable() {
  if (hasRequiredDefinable) return Definable_1;
  hasRequiredDefinable = 1;
  var _core = requireCore$1();
  var createElement = _core.createElement;
  var zrUtil2 = util$6;
  var Path = requirePath$1();
  var ZImage = requireImage();
  var ZText = requireText();
  var _graphic = requireGraphic$1();
  var svgPath = _graphic.path;
  var svgImage = _graphic.image;
  var svgText = _graphic.text;
  var MARK_UNUSED = "0";
  var MARK_USED = "1";
  function Definable(zrId, svgRoot, tagNames, markLabel, domName) {
    this._zrId = zrId;
    this._svgRoot = svgRoot;
    this._tagNames = typeof tagNames === "string" ? [tagNames] : tagNames;
    this._markLabel = markLabel;
    this._domName = domName || "_dom";
    this.nextId = 0;
  }
  Definable.prototype.createElement = createElement;
  Definable.prototype.getDefs = function(isForceCreating) {
    var svgRoot = this._svgRoot;
    var defs = this._svgRoot.getElementsByTagName("defs");
    if (defs.length === 0) {
      if (isForceCreating) {
        defs = svgRoot.insertBefore(
          this.createElement("defs"),
          // Create new tag
          svgRoot.firstChild
          // Insert in the front of svg
        );
        if (!defs.contains) {
          defs.contains = function(el) {
            var children = defs.children;
            if (!children) {
              return false;
            }
            for (var i = children.length - 1; i >= 0; --i) {
              if (children[i] === el) {
                return true;
              }
            }
            return false;
          };
        }
        return defs;
      } else {
        return null;
      }
    } else {
      return defs[0];
    }
  };
  Definable.prototype.update = function(element, onUpdate) {
    if (!element) {
      return;
    }
    var defs = this.getDefs(false);
    if (element[this._domName] && defs.contains(element[this._domName])) {
      if (typeof onUpdate === "function") {
        onUpdate(element);
      }
    } else {
      var dom2 = this.add(element);
      if (dom2) {
        element[this._domName] = dom2;
      }
    }
  };
  Definable.prototype.addDom = function(dom2) {
    var defs = this.getDefs(true);
    defs.appendChild(dom2);
  };
  Definable.prototype.removeDom = function(element) {
    var defs = this.getDefs(false);
    if (defs && element[this._domName]) {
      defs.removeChild(element[this._domName]);
      element[this._domName] = null;
    }
  };
  Definable.prototype.getDoms = function() {
    var defs = this.getDefs(false);
    if (!defs) {
      return [];
    }
    var doms = [];
    zrUtil2.each(this._tagNames, function(tagName) {
      var tags = defs.getElementsByTagName(tagName);
      doms = doms.concat([].slice.call(tags));
    });
    return doms;
  };
  Definable.prototype.markAllUnused = function() {
    var doms = this.getDoms();
    var that = this;
    zrUtil2.each(doms, function(dom2) {
      dom2[that._markLabel] = MARK_UNUSED;
    });
  };
  Definable.prototype.markUsed = function(dom2) {
    if (dom2) {
      dom2[this._markLabel] = MARK_USED;
    }
  };
  Definable.prototype.removeUnused = function() {
    var defs = this.getDefs(false);
    if (!defs) {
      return;
    }
    var doms = this.getDoms();
    var that = this;
    zrUtil2.each(doms, function(dom2) {
      if (dom2[that._markLabel] !== MARK_USED) {
        defs.removeChild(dom2);
      }
    });
  };
  Definable.prototype.getSvgProxy = function(displayable) {
    if (displayable instanceof Path) {
      return svgPath;
    } else if (displayable instanceof ZImage) {
      return svgImage;
    } else if (displayable instanceof ZText) {
      return svgText;
    } else {
      return svgPath;
    }
  };
  Definable.prototype.getTextSvgElement = function(displayable) {
    return displayable.__textSvgEl;
  };
  Definable.prototype.getSvgElement = function(displayable) {
    return displayable.__svgEl;
  };
  var _default2 = Definable;
  Definable_1 = _default2;
  return Definable_1;
}
var GradientManager_1;
var hasRequiredGradientManager;
function requireGradientManager() {
  if (hasRequiredGradientManager) return GradientManager_1;
  hasRequiredGradientManager = 1;
  var Definable = requireDefinable();
  var zrUtil2 = util$6;
  var logError2 = log;
  var colorTool = requireColor();
  function GradientManager(zrId, svgRoot) {
    Definable.call(this, zrId, svgRoot, ["linearGradient", "radialGradient"], "__gradient_in_use__");
  }
  zrUtil2.inherits(GradientManager, Definable);
  GradientManager.prototype.addWithoutUpdate = function(svgElement, displayable) {
    if (displayable && displayable.style) {
      var that = this;
      zrUtil2.each(["fill", "stroke"], function(fillOrStroke) {
        if (displayable.style[fillOrStroke] && (displayable.style[fillOrStroke].type === "linear" || displayable.style[fillOrStroke].type === "radial")) {
          var gradient = displayable.style[fillOrStroke];
          var defs = that.getDefs(true);
          var dom2;
          if (gradient._dom) {
            dom2 = gradient._dom;
            if (!defs.contains(gradient._dom)) {
              that.addDom(dom2);
            }
          } else {
            dom2 = that.add(gradient);
          }
          that.markUsed(displayable);
          var id = dom2.getAttribute("id");
          svgElement.setAttribute(fillOrStroke, "url(#" + id + ")");
        }
      });
    }
  };
  GradientManager.prototype.add = function(gradient) {
    var dom2;
    if (gradient.type === "linear") {
      dom2 = this.createElement("linearGradient");
    } else if (gradient.type === "radial") {
      dom2 = this.createElement("radialGradient");
    } else {
      logError2("Illegal gradient type.");
      return null;
    }
    gradient.id = gradient.id || this.nextId++;
    dom2.setAttribute("id", "zr" + this._zrId + "-gradient-" + gradient.id);
    this.updateDom(gradient, dom2);
    this.addDom(dom2);
    return dom2;
  };
  GradientManager.prototype.update = function(gradient) {
    var that = this;
    Definable.prototype.update.call(this, gradient, function() {
      var type = gradient.type;
      var tagName = gradient._dom.tagName;
      if (type === "linear" && tagName === "linearGradient" || type === "radial" && tagName === "radialGradient") {
        that.updateDom(gradient, gradient._dom);
      } else {
        that.removeDom(gradient);
        that.add(gradient);
      }
    });
  };
  GradientManager.prototype.updateDom = function(gradient, dom2) {
    if (gradient.type === "linear") {
      dom2.setAttribute("x1", gradient.x);
      dom2.setAttribute("y1", gradient.y);
      dom2.setAttribute("x2", gradient.x2);
      dom2.setAttribute("y2", gradient.y2);
    } else if (gradient.type === "radial") {
      dom2.setAttribute("cx", gradient.x);
      dom2.setAttribute("cy", gradient.y);
      dom2.setAttribute("r", gradient.r);
    } else {
      logError2("Illegal gradient type.");
      return;
    }
    if (gradient.global) {
      dom2.setAttribute("gradientUnits", "userSpaceOnUse");
    } else {
      dom2.setAttribute("gradientUnits", "objectBoundingBox");
    }
    dom2.innerHTML = "";
    var colors = gradient.colorStops;
    for (var i = 0, len = colors.length; i < len; ++i) {
      var stop2 = this.createElement("stop");
      stop2.setAttribute("offset", colors[i].offset * 100 + "%");
      var color2 = colors[i].color;
      if (color2.indexOf("rgba") > -1) {
        var opacity = colorTool.parse(color2)[3];
        var hex = colorTool.toHex(color2);
        stop2.setAttribute("stop-color", "#" + hex);
        stop2.setAttribute("stop-opacity", opacity);
      } else {
        stop2.setAttribute("stop-color", colors[i].color);
      }
      dom2.appendChild(stop2);
    }
    gradient._dom = dom2;
  };
  GradientManager.prototype.markUsed = function(displayable) {
    if (displayable.style) {
      var gradient = displayable.style.fill;
      if (gradient && gradient._dom) {
        Definable.prototype.markUsed.call(this, gradient._dom);
      }
      gradient = displayable.style.stroke;
      if (gradient && gradient._dom) {
        Definable.prototype.markUsed.call(this, gradient._dom);
      }
    }
  };
  var _default2 = GradientManager;
  GradientManager_1 = _default2;
  return GradientManager_1;
}
var ClippathManager_1;
var hasRequiredClippathManager;
function requireClippathManager() {
  if (hasRequiredClippathManager) return ClippathManager_1;
  hasRequiredClippathManager = 1;
  var Definable = requireDefinable();
  var zrUtil2 = util$6;
  var matrix2 = requireMatrix();
  function ClippathManager(zrId, svgRoot) {
    Definable.call(this, zrId, svgRoot, "clipPath", "__clippath_in_use__");
  }
  zrUtil2.inherits(ClippathManager, Definable);
  ClippathManager.prototype.update = function(displayable) {
    var svgEl = this.getSvgElement(displayable);
    if (svgEl) {
      this.updateDom(svgEl, displayable.__clipPaths, false);
    }
    var textEl = this.getTextSvgElement(displayable);
    if (textEl) {
      this.updateDom(textEl, displayable.__clipPaths, true);
    }
    this.markUsed(displayable);
  };
  ClippathManager.prototype.updateDom = function(parentEl, clipPaths, isText) {
    if (clipPaths && clipPaths.length > 0) {
      var defs = this.getDefs(true);
      var clipPath = clipPaths[0];
      var clipPathEl;
      var id;
      var dom2 = isText ? "_textDom" : "_dom";
      if (clipPath[dom2]) {
        id = clipPath[dom2].getAttribute("id");
        clipPathEl = clipPath[dom2];
        if (!defs.contains(clipPathEl)) {
          defs.appendChild(clipPathEl);
        }
      } else {
        id = "zr" + this._zrId + "-clip-" + this.nextId;
        ++this.nextId;
        clipPathEl = this.createElement("clipPath");
        clipPathEl.setAttribute("id", id);
        defs.appendChild(clipPathEl);
        clipPath[dom2] = clipPathEl;
      }
      var svgProxy = this.getSvgProxy(clipPath);
      if (clipPath.transform && clipPath.parent.invTransform && !isText) {
        var transform = Array.prototype.slice.call(clipPath.transform);
        matrix2.mul(clipPath.transform, clipPath.parent.invTransform, clipPath.transform);
        svgProxy.brush(clipPath);
        clipPath.transform = transform;
      } else {
        svgProxy.brush(clipPath);
      }
      var pathEl = this.getSvgElement(clipPath);
      clipPathEl.innerHTML = "";
      clipPathEl.appendChild(pathEl.cloneNode());
      parentEl.setAttribute("clip-path", "url(#" + id + ")");
      if (clipPaths.length > 1) {
        this.updateDom(clipPathEl, clipPaths.slice(1), isText);
      }
    } else {
      if (parentEl) {
        parentEl.setAttribute("clip-path", "none");
      }
    }
  };
  ClippathManager.prototype.markUsed = function(displayable) {
    var that = this;
    if (displayable.__clipPaths) {
      zrUtil2.each(displayable.__clipPaths, function(clipPath) {
        if (clipPath._dom) {
          Definable.prototype.markUsed.call(that, clipPath._dom);
        }
        if (clipPath._textDom) {
          Definable.prototype.markUsed.call(that, clipPath._textDom);
        }
      });
    }
  };
  var _default2 = ClippathManager;
  ClippathManager_1 = _default2;
  return ClippathManager_1;
}
var ShadowManager_1;
var hasRequiredShadowManager;
function requireShadowManager() {
  if (hasRequiredShadowManager) return ShadowManager_1;
  hasRequiredShadowManager = 1;
  var Definable = requireDefinable();
  var zrUtil2 = util$6;
  function ShadowManager(zrId, svgRoot) {
    Definable.call(this, zrId, svgRoot, ["filter"], "__filter_in_use__", "_shadowDom");
  }
  zrUtil2.inherits(ShadowManager, Definable);
  ShadowManager.prototype.addWithoutUpdate = function(svgElement, displayable) {
    if (displayable && hasShadow(displayable.style)) {
      var dom2;
      if (displayable._shadowDom) {
        dom2 = displayable._shadowDom;
        var defs = this.getDefs(true);
        if (!defs.contains(displayable._shadowDom)) {
          this.addDom(dom2);
        }
      } else {
        dom2 = this.add(displayable);
      }
      this.markUsed(displayable);
      var id = dom2.getAttribute("id");
      svgElement.style.filter = "url(#" + id + ")";
    }
  };
  ShadowManager.prototype.add = function(displayable) {
    var dom2 = this.createElement("filter");
    displayable._shadowDomId = displayable._shadowDomId || this.nextId++;
    dom2.setAttribute("id", "zr" + this._zrId + "-shadow-" + displayable._shadowDomId);
    this.updateDom(displayable, dom2);
    this.addDom(dom2);
    return dom2;
  };
  ShadowManager.prototype.update = function(svgElement, displayable) {
    var style = displayable.style;
    if (hasShadow(style)) {
      var that = this;
      Definable.prototype.update.call(this, displayable, function() {
        that.updateDom(displayable, displayable._shadowDom);
      });
    } else {
      this.remove(svgElement, displayable);
    }
  };
  ShadowManager.prototype.remove = function(svgElement, displayable) {
    if (displayable._shadowDomId != null) {
      this.removeDom(svgElement);
      svgElement.style.filter = "";
    }
  };
  ShadowManager.prototype.updateDom = function(displayable, dom2) {
    var domChild = dom2.getElementsByTagName("feDropShadow");
    if (domChild.length === 0) {
      domChild = this.createElement("feDropShadow");
    } else {
      domChild = domChild[0];
    }
    var style = displayable.style;
    var scaleX = displayable.scale ? displayable.scale[0] || 1 : 1;
    var scaleY = displayable.scale ? displayable.scale[1] || 1 : 1;
    var offsetX;
    var offsetY;
    var blur;
    var color2;
    if (style.shadowBlur || style.shadowOffsetX || style.shadowOffsetY) {
      offsetX = style.shadowOffsetX || 0;
      offsetY = style.shadowOffsetY || 0;
      blur = style.shadowBlur;
      color2 = style.shadowColor;
    } else if (style.textShadowBlur) {
      offsetX = style.textShadowOffsetX || 0;
      offsetY = style.textShadowOffsetY || 0;
      blur = style.textShadowBlur;
      color2 = style.textShadowColor;
    } else {
      this.removeDom(dom2, style);
      return;
    }
    domChild.setAttribute("dx", offsetX / scaleX);
    domChild.setAttribute("dy", offsetY / scaleY);
    domChild.setAttribute("flood-color", color2);
    var stdDx = blur / 2 / scaleX;
    var stdDy = blur / 2 / scaleY;
    var stdDeviation = stdDx + " " + stdDy;
    domChild.setAttribute("stdDeviation", stdDeviation);
    dom2.setAttribute("x", "-100%");
    dom2.setAttribute("y", "-100%");
    dom2.setAttribute("width", Math.ceil(blur / 2 * 200) + "%");
    dom2.setAttribute("height", Math.ceil(blur / 2 * 200) + "%");
    dom2.appendChild(domChild);
    displayable._shadowDom = dom2;
  };
  ShadowManager.prototype.markUsed = function(displayable) {
    if (displayable._shadowDom) {
      Definable.prototype.markUsed.call(this, displayable._shadowDom);
    }
  };
  function hasShadow(style) {
    return style && (style.shadowBlur || style.shadowOffsetX || style.shadowOffsetY || style.textShadowBlur || style.textShadowOffsetX || style.textShadowOffsetY);
  }
  var _default2 = ShadowManager;
  ShadowManager_1 = _default2;
  return ShadowManager_1;
}
var Painter$1;
var hasRequiredPainter$1;
function requirePainter$1() {
  if (hasRequiredPainter$1) return Painter$1;
  hasRequiredPainter$1 = 1;
  var _core = requireCore$1();
  var createElement = _core.createElement;
  var util2 = util$6;
  var logError2 = log;
  var Path = requirePath$1();
  var ZImage = requireImage();
  var ZText = requireText();
  var arrayDiff = requireArrayDiff2();
  var GradientManager = requireGradientManager();
  var ClippathManager = requireClippathManager();
  var ShadowManager = requireShadowManager();
  var _graphic = requireGraphic$1();
  var svgPath = _graphic.path;
  var svgImage = _graphic.image;
  var svgText = _graphic.text;
  function parseInt102(val) {
    return parseInt(val, 10);
  }
  function getSvgProxy(el) {
    if (el instanceof Path) {
      return svgPath;
    } else if (el instanceof ZImage) {
      return svgImage;
    } else if (el instanceof ZText) {
      return svgText;
    } else {
      return svgPath;
    }
  }
  function checkParentAvailable(parent, child) {
    return child && parent && child.parentNode !== parent;
  }
  function insertAfter(parent, child, prevSibling) {
    if (checkParentAvailable(parent, child) && prevSibling) {
      var nextSibling = prevSibling.nextSibling;
      nextSibling ? parent.insertBefore(child, nextSibling) : parent.appendChild(child);
    }
  }
  function prepend(parent, child) {
    if (checkParentAvailable(parent, child)) {
      var firstChild = parent.firstChild;
      firstChild ? parent.insertBefore(child, firstChild) : parent.appendChild(child);
    }
  }
  function remove(parent, child) {
    if (child && parent && child.parentNode === parent) {
      parent.removeChild(child);
    }
  }
  function getTextSvgElement(displayable) {
    return displayable.__textSvgEl;
  }
  function getSvgElement(displayable) {
    return displayable.__svgEl;
  }
  var SVGPainter = function(root, storage, opts, zrId) {
    this.root = root;
    this.storage = storage;
    this._opts = opts = util2.extend({}, opts || {});
    var svgDom = createElement("svg");
    svgDom.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgDom.setAttribute("version", "1.1");
    svgDom.setAttribute("baseProfile", "full");
    svgDom.style.cssText = "user-select:none;position:absolute;left:0;top:0;";
    var bgRoot = createElement("g");
    svgDom.appendChild(bgRoot);
    var svgRoot = createElement("g");
    svgDom.appendChild(svgRoot);
    this.gradientManager = new GradientManager(zrId, svgRoot);
    this.clipPathManager = new ClippathManager(zrId, svgRoot);
    this.shadowManager = new ShadowManager(zrId, svgRoot);
    var viewport2 = document.createElement("div");
    viewport2.style.cssText = "overflow:hidden;position:relative";
    this._svgDom = svgDom;
    this._svgRoot = svgRoot;
    this._backgroundRoot = bgRoot;
    this._viewport = viewport2;
    root.appendChild(viewport2);
    viewport2.appendChild(svgDom);
    this.resize(opts.width, opts.height);
    this._visibleList = [];
  };
  SVGPainter.prototype = {
    constructor: SVGPainter,
    getType: function() {
      return "svg";
    },
    getViewportRoot: function() {
      return this._viewport;
    },
    getSvgDom: function() {
      return this._svgDom;
    },
    getSvgRoot: function() {
      return this._svgRoot;
    },
    getViewportRootOffset: function() {
      var viewportRoot = this.getViewportRoot();
      if (viewportRoot) {
        return {
          offsetLeft: viewportRoot.offsetLeft || 0,
          offsetTop: viewportRoot.offsetTop || 0
        };
      }
    },
    refresh: function() {
      var list = this.storage.getDisplayList(true);
      this._paintList(list);
    },
    setBackgroundColor: function(backgroundColor) {
      if (this._backgroundRoot && this._backgroundNode) {
        this._backgroundRoot.removeChild(this._backgroundNode);
      }
      var bgNode = createElement("rect");
      bgNode.setAttribute("width", this.getWidth());
      bgNode.setAttribute("height", this.getHeight());
      bgNode.setAttribute("x", 0);
      bgNode.setAttribute("y", 0);
      bgNode.setAttribute("id", 0);
      bgNode.style.fill = backgroundColor;
      this._backgroundRoot.appendChild(bgNode);
      this._backgroundNode = bgNode;
    },
    _paintList: function(list) {
      this.gradientManager.markAllUnused();
      this.clipPathManager.markAllUnused();
      this.shadowManager.markAllUnused();
      var svgRoot = this._svgRoot;
      var visibleList = this._visibleList;
      var listLen = list.length;
      var newVisibleList = [];
      var i;
      for (i = 0; i < listLen; i++) {
        var displayable = list[i];
        var svgProxy = getSvgProxy(displayable);
        var svgElement = getSvgElement(displayable) || getTextSvgElement(displayable);
        if (!displayable.invisible) {
          if (displayable.__dirty) {
            svgProxy && svgProxy.brush(displayable);
            this.clipPathManager.update(displayable);
            if (displayable.style) {
              this.gradientManager.update(displayable.style.fill);
              this.gradientManager.update(displayable.style.stroke);
              this.shadowManager.update(svgElement, displayable);
            }
            displayable.__dirty = false;
          }
          newVisibleList.push(displayable);
        }
      }
      var diff = arrayDiff(visibleList, newVisibleList);
      var prevSvgElement;
      for (i = 0; i < diff.length; i++) {
        var item = diff[i];
        if (item.removed) {
          for (var k = 0; k < item.count; k++) {
            var displayable = visibleList[item.indices[k]];
            var svgElement = getSvgElement(displayable);
            var textSvgElement = getTextSvgElement(displayable);
            remove(svgRoot, svgElement);
            remove(svgRoot, textSvgElement);
          }
        }
      }
      for (i = 0; i < diff.length; i++) {
        var item = diff[i];
        if (item.added) {
          for (var k = 0; k < item.count; k++) {
            var displayable = newVisibleList[item.indices[k]];
            var svgElement = getSvgElement(displayable);
            var textSvgElement = getTextSvgElement(displayable);
            prevSvgElement ? insertAfter(svgRoot, svgElement, prevSvgElement) : prepend(svgRoot, svgElement);
            if (svgElement) {
              insertAfter(svgRoot, textSvgElement, svgElement);
            } else if (prevSvgElement) {
              insertAfter(svgRoot, textSvgElement, prevSvgElement);
            } else {
              prepend(svgRoot, textSvgElement);
            }
            insertAfter(svgRoot, textSvgElement, svgElement);
            prevSvgElement = textSvgElement || svgElement || prevSvgElement;
            this.gradientManager.addWithoutUpdate(svgElement || textSvgElement, displayable);
            this.shadowManager.addWithoutUpdate(svgElement || textSvgElement, displayable);
            this.clipPathManager.markUsed(displayable);
          }
        } else if (!item.removed) {
          for (var k = 0; k < item.count; k++) {
            var displayable = newVisibleList[item.indices[k]];
            var svgElement = getSvgElement(displayable);
            var textSvgElement = getTextSvgElement(displayable);
            var svgElement = getSvgElement(displayable);
            var textSvgElement = getTextSvgElement(displayable);
            this.gradientManager.markUsed(displayable);
            this.gradientManager.addWithoutUpdate(svgElement || textSvgElement, displayable);
            this.shadowManager.markUsed(displayable);
            this.shadowManager.addWithoutUpdate(svgElement || textSvgElement, displayable);
            this.clipPathManager.markUsed(displayable);
            if (textSvgElement) {
              insertAfter(svgRoot, textSvgElement, svgElement);
            }
            prevSvgElement = svgElement || textSvgElement || prevSvgElement;
          }
        }
      }
      this.gradientManager.removeUnused();
      this.clipPathManager.removeUnused();
      this.shadowManager.removeUnused();
      this._visibleList = newVisibleList;
    },
    _getDefs: function(isForceCreating) {
      var svgRoot = this._svgDom;
      var defs = svgRoot.getElementsByTagName("defs");
      if (defs.length === 0) {
        if (isForceCreating) {
          var defs = svgRoot.insertBefore(
            createElement("defs"),
            // Create new tag
            svgRoot.firstChild
            // Insert in the front of svg
          );
          if (!defs.contains) {
            defs.contains = function(el) {
              var children = defs.children;
              if (!children) {
                return false;
              }
              for (var i = children.length - 1; i >= 0; --i) {
                if (children[i] === el) {
                  return true;
                }
              }
              return false;
            };
          }
          return defs;
        } else {
          return null;
        }
      } else {
        return defs[0];
      }
    },
    resize: function(width, height) {
      var viewport2 = this._viewport;
      viewport2.style.display = "none";
      var opts = this._opts;
      width != null && (opts.width = width);
      height != null && (opts.height = height);
      width = this._getSize(0);
      height = this._getSize(1);
      viewport2.style.display = "";
      if (this._width !== width || this._height !== height) {
        this._width = width;
        this._height = height;
        var viewportStyle = viewport2.style;
        viewportStyle.width = width + "px";
        viewportStyle.height = height + "px";
        var svgRoot = this._svgDom;
        svgRoot.setAttribute("width", width);
        svgRoot.setAttribute("height", height);
      }
      if (this._backgroundNode) {
        this._backgroundNode.setAttribute("width", width);
        this._backgroundNode.setAttribute("height", height);
      }
    },
    /**
     * 获取绘图区域宽度
     */
    getWidth: function() {
      return this._width;
    },
    /**
     * 获取绘图区域高度
     */
    getHeight: function() {
      return this._height;
    },
    _getSize: function(whIdx) {
      var opts = this._opts;
      var wh = ["width", "height"][whIdx];
      var cwh = ["clientWidth", "clientHeight"][whIdx];
      var plt = ["paddingLeft", "paddingTop"][whIdx];
      var prb = ["paddingRight", "paddingBottom"][whIdx];
      if (opts[wh] != null && opts[wh] !== "auto") {
        return parseFloat(opts[wh]);
      }
      var root = this.root;
      var stl = document.defaultView.getComputedStyle(root);
      return (root[cwh] || parseInt102(stl[wh]) || parseInt102(root.style[wh])) - (parseInt102(stl[plt]) || 0) - (parseInt102(stl[prb]) || 0) | 0;
    },
    dispose: function() {
      this.root.innerHTML = "";
      this._svgRoot = this._backgroundRoot = this._svgDom = this._backgroundNode = this._viewport = this.storage = null;
    },
    clear: function() {
      if (this._viewport) {
        this.root.removeChild(this._viewport);
      }
    },
    toDataURL: function() {
      this.refresh();
      var html = encodeURIComponent(this._svgDom.outerHTML.replace(/></g, ">\n\r<"));
      return "data:image/svg+xml;charset=UTF-8," + html;
    }
  };
  function createMethodNotSupport(method) {
    return function() {
      logError2('In SVG mode painter not support method "' + method + '"');
    };
  }
  util2.each(["getLayer", "insertLayer", "eachLayer", "eachBuiltinLayer", "eachOtherLayer", "getLayers", "modLayer", "delLayer", "clearLayer", "pathToImage"], function(name) {
    SVGPainter.prototype[name] = createMethodNotSupport(name);
  });
  var _default2 = SVGPainter;
  Painter$1 = _default2;
  return Painter$1;
}
var hasRequiredSvg;
function requireSvg() {
  if (hasRequiredSvg) return svg;
  hasRequiredSvg = 1;
  requireGraphic$1();
  var _zrender = zrender;
  var registerPainter2 = _zrender.registerPainter;
  var Painter2 = requirePainter$1();
  registerPainter2("svg", Painter2);
  return svg;
}
var vml = {};
var graphic = {};
var core = {};
var hasRequiredCore;
function requireCore() {
  if (hasRequiredCore) return core;
  hasRequiredCore = 1;
  var env2 = env_1;
  var urn = "urn:schemas-microsoft-com:vml";
  var win = typeof window === "undefined" ? null : window;
  var vmlInited = false;
  var doc = win && win.document;
  function createNode(tagName) {
    return doCreateNode(tagName);
  }
  var doCreateNode;
  if (doc && !env2.canvasSupported) {
    try {
      !doc.namespaces.zrvml && doc.namespaces.add("zrvml", urn);
      doCreateNode = function(tagName) {
        return doc.createElement("<zrvml:" + tagName + ' class="zrvml">');
      };
    } catch (e) {
      doCreateNode = function(tagName) {
        return doc.createElement("<" + tagName + ' xmlns="' + urn + '" class="zrvml">');
      };
    }
  }
  function initVML() {
    if (vmlInited || !doc) {
      return;
    }
    vmlInited = true;
    var styleSheets = doc.styleSheets;
    if (styleSheets.length < 31) {
      doc.createStyleSheet().addRule(".zrvml", "behavior:url(#default#VML)");
    } else {
      styleSheets[0].addRule(".zrvml", "behavior:url(#default#VML)");
    }
  }
  core.doc = doc;
  core.createNode = createNode;
  core.initVML = initVML;
  return core;
}
var hasRequiredGraphic;
function requireGraphic() {
  if (hasRequiredGraphic) return graphic;
  hasRequiredGraphic = 1;
  var env2 = env_1;
  var _vector = requireVector();
  var applyTransform = _vector.applyTransform;
  var BoundingRect2 = requireBoundingRect();
  var colorTool = requireColor();
  var textContain = requireText$2();
  var textHelper = requireText$1();
  var RectText = requireRectText();
  var Displayable = requireDisplayable();
  var ZImage = requireImage();
  var Text = requireText();
  var Path = requirePath$1();
  var PathProxy = requirePathProxy();
  var Gradient = requireGradient();
  var vmlCore = requireCore();
  var CMD = PathProxy.CMD;
  var round = Math.round;
  var sqrt = Math.sqrt;
  var abs = Math.abs;
  var cos = Math.cos;
  var sin = Math.sin;
  var mathMax = Math.max;
  if (!env2.canvasSupported) {
    var comma = ",";
    var imageTransformPrefix = "progid:DXImageTransform.Microsoft";
    var Z = 21600;
    var Z2 = Z / 2;
    var ZLEVEL_BASE = 1e5;
    var Z_BASE = 1e3;
    var initRootElStyle = function(el) {
      el.style.cssText = "position:absolute;left:0;top:0;width:1px;height:1px;";
      el.coordsize = Z + "," + Z;
      el.coordorigin = "0,0";
    };
    var encodeHtmlAttribute = function(s) {
      return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    };
    var rgb2Str = function(r, g, b) {
      return "rgb(" + [r, g, b].join(",") + ")";
    };
    var append = function(parent, child) {
      if (child && parent && child.parentNode !== parent) {
        parent.appendChild(child);
      }
    };
    var remove = function(parent, child) {
      if (child && parent && child.parentNode === parent) {
        parent.removeChild(child);
      }
    };
    var getZIndex = function(zlevel, z, z2) {
      return (parseFloat(zlevel) || 0) * ZLEVEL_BASE + (parseFloat(z) || 0) * Z_BASE + z2;
    };
    var parsePercent = textHelper.parsePercent;
    var setColorAndOpacity = function(el, color2, opacity) {
      var colorArr = colorTool.parse(color2);
      opacity = +opacity;
      if (isNaN(opacity)) {
        opacity = 1;
      }
      if (colorArr) {
        el.color = rgb2Str(colorArr[0], colorArr[1], colorArr[2]);
        el.opacity = opacity * colorArr[3];
      }
    };
    var getColorAndAlpha = function(color2) {
      var colorArr = colorTool.parse(color2);
      return [rgb2Str(colorArr[0], colorArr[1], colorArr[2]), colorArr[3]];
    };
    var updateFillNode = function(el, style, zrEl) {
      var fill = style.fill;
      if (fill != null) {
        if (fill instanceof Gradient) {
          var gradientType;
          var angle = 0;
          var focus = [0, 0];
          var shift = 0;
          var expansion = 1;
          var rect = zrEl.getBoundingRect();
          var rectWidth = rect.width;
          var rectHeight = rect.height;
          if (fill.type === "linear") {
            gradientType = "gradient";
            var transform = zrEl.transform;
            var p0 = [fill.x * rectWidth, fill.y * rectHeight];
            var p1 = [fill.x2 * rectWidth, fill.y2 * rectHeight];
            if (transform) {
              applyTransform(p0, p0, transform);
              applyTransform(p1, p1, transform);
            }
            var dx = p1[0] - p0[0];
            var dy = p1[1] - p0[1];
            angle = Math.atan2(dx, dy) * 180 / Math.PI;
            if (angle < 0) {
              angle += 360;
            }
            if (angle < 1e-6) {
              angle = 0;
            }
          } else {
            gradientType = "gradientradial";
            var p0 = [fill.x * rectWidth, fill.y * rectHeight];
            var transform = zrEl.transform;
            var scale = zrEl.scale;
            var width = rectWidth;
            var height = rectHeight;
            focus = [
              // Percent in bounding rect
              (p0[0] - rect.x) / width,
              (p0[1] - rect.y) / height
            ];
            if (transform) {
              applyTransform(p0, p0, transform);
            }
            width /= scale[0] * Z;
            height /= scale[1] * Z;
            var dimension = mathMax(width, height);
            shift = 2 * 0 / dimension;
            expansion = 2 * fill.r / dimension - shift;
          }
          var stops = fill.colorStops.slice();
          stops.sort(function(cs1, cs2) {
            return cs1.offset - cs2.offset;
          });
          var length = stops.length;
          var colorAndAlphaList = [];
          var colors = [];
          for (var i2 = 0; i2 < length; i2++) {
            var stop2 = stops[i2];
            var colorAndAlpha = getColorAndAlpha(stop2.color);
            colors.push(stop2.offset * expansion + shift + " " + colorAndAlpha[0]);
            if (i2 === 0 || i2 === length - 1) {
              colorAndAlphaList.push(colorAndAlpha);
            }
          }
          if (length >= 2) {
            var color1 = colorAndAlphaList[0][0];
            var color2 = colorAndAlphaList[1][0];
            var opacity1 = colorAndAlphaList[0][1] * style.opacity;
            var opacity2 = colorAndAlphaList[1][1] * style.opacity;
            el.type = gradientType;
            el.method = "none";
            el.focus = "100%";
            el.angle = angle;
            el.color = color1;
            el.color2 = color2;
            el.colors = colors.join(",");
            el.opacity = opacity2;
            el.opacity2 = opacity1;
          }
          if (gradientType === "radial") {
            el.focusposition = focus.join(",");
          }
        } else {
          setColorAndOpacity(el, fill, style.opacity);
        }
      }
    };
    var updateStrokeNode = function(el, style) {
      if (style.lineDash) {
        el.dashstyle = style.lineDash.join(" ");
      }
      if (style.stroke != null && !(style.stroke instanceof Gradient)) {
        setColorAndOpacity(el, style.stroke, style.opacity);
      }
    };
    var updateFillAndStroke = function(vmlEl, type, style, zrEl) {
      var isFill = type === "fill";
      var el = vmlEl.getElementsByTagName(type)[0];
      if (style[type] != null && style[type] !== "none" && (isFill || !isFill && style.lineWidth)) {
        vmlEl[isFill ? "filled" : "stroked"] = "true";
        if (style[type] instanceof Gradient) {
          remove(vmlEl, el);
        }
        if (!el) {
          el = vmlCore.createNode(type);
        }
        isFill ? updateFillNode(el, style, zrEl) : updateStrokeNode(el, style);
        append(vmlEl, el);
      } else {
        vmlEl[isFill ? "filled" : "stroked"] = "false";
        remove(vmlEl, el);
      }
    };
    var points = [[], [], []];
    var pathDataToString = function(path2, m) {
      var M = CMD.M;
      var C = CMD.C;
      var L = CMD.L;
      var A = CMD.A;
      var Q = CMD.Q;
      var str = [];
      var nPoint;
      var cmdStr;
      var cmd;
      var i2;
      var xi;
      var yi;
      var data = path2.data;
      var dataLength = path2.len();
      for (i2 = 0; i2 < dataLength; ) {
        cmd = data[i2++];
        cmdStr = "";
        nPoint = 0;
        switch (cmd) {
          case M:
            cmdStr = " m ";
            nPoint = 1;
            xi = data[i2++];
            yi = data[i2++];
            points[0][0] = xi;
            points[0][1] = yi;
            break;
          case L:
            cmdStr = " l ";
            nPoint = 1;
            xi = data[i2++];
            yi = data[i2++];
            points[0][0] = xi;
            points[0][1] = yi;
            break;
          case Q:
          case C:
            cmdStr = " c ";
            nPoint = 3;
            var x1 = data[i2++];
            var y1 = data[i2++];
            var x2 = data[i2++];
            var y2 = data[i2++];
            var x3;
            var y3;
            if (cmd === Q) {
              x3 = x2;
              y3 = y2;
              x2 = (x2 + 2 * x1) / 3;
              y2 = (y2 + 2 * y1) / 3;
              x1 = (xi + 2 * x1) / 3;
              y1 = (yi + 2 * y1) / 3;
            } else {
              x3 = data[i2++];
              y3 = data[i2++];
            }
            points[0][0] = x1;
            points[0][1] = y1;
            points[1][0] = x2;
            points[1][1] = y2;
            points[2][0] = x3;
            points[2][1] = y3;
            xi = x3;
            yi = y3;
            break;
          case A:
            var x = 0;
            var y = 0;
            var sx = 1;
            var sy = 1;
            var angle = 0;
            if (m) {
              x = m[4];
              y = m[5];
              sx = sqrt(m[0] * m[0] + m[1] * m[1]);
              sy = sqrt(m[2] * m[2] + m[3] * m[3]);
              angle = Math.atan2(-m[1] / sy, m[0] / sx);
            }
            var cx = data[i2++];
            var cy = data[i2++];
            var rx = data[i2++];
            var ry = data[i2++];
            var startAngle = data[i2++] + angle;
            var endAngle = data[i2++] + startAngle + angle;
            i2++;
            var clockwise = data[i2++];
            var x0 = cx + cos(startAngle) * rx;
            var y0 = cy + sin(startAngle) * ry;
            var x1 = cx + cos(endAngle) * rx;
            var y1 = cy + sin(endAngle) * ry;
            var type = clockwise ? " wa " : " at ";
            if (Math.abs(x0 - x1) < 1e-4) {
              if (Math.abs(endAngle - startAngle) > 0.01) {
                if (clockwise) {
                  x0 += 270 / Z;
                }
              } else {
                if (Math.abs(y0 - cy) < 1e-4) {
                  if (clockwise && x0 < cx || !clockwise && x0 > cx) {
                    y1 -= 270 / Z;
                  } else {
                    y1 += 270 / Z;
                  }
                } else if (clockwise && y0 < cy || !clockwise && y0 > cy) {
                  x1 += 270 / Z;
                } else {
                  x1 -= 270 / Z;
                }
              }
            }
            str.push(type, round(((cx - rx) * sx + x) * Z - Z2), comma, round(((cy - ry) * sy + y) * Z - Z2), comma, round(((cx + rx) * sx + x) * Z - Z2), comma, round(((cy + ry) * sy + y) * Z - Z2), comma, round((x0 * sx + x) * Z - Z2), comma, round((y0 * sy + y) * Z - Z2), comma, round((x1 * sx + x) * Z - Z2), comma, round((y1 * sy + y) * Z - Z2));
            xi = x1;
            yi = y1;
            break;
          case CMD.R:
            var p0 = points[0];
            var p1 = points[1];
            p0[0] = data[i2++];
            p0[1] = data[i2++];
            p1[0] = p0[0] + data[i2++];
            p1[1] = p0[1] + data[i2++];
            if (m) {
              applyTransform(p0, p0, m);
              applyTransform(p1, p1, m);
            }
            p0[0] = round(p0[0] * Z - Z2);
            p1[0] = round(p1[0] * Z - Z2);
            p0[1] = round(p0[1] * Z - Z2);
            p1[1] = round(p1[1] * Z - Z2);
            str.push(
              // x0, y0
              " m ",
              p0[0],
              comma,
              p0[1],
              // x1, y0
              " l ",
              p1[0],
              comma,
              p0[1],
              // x1, y1
              " l ",
              p1[0],
              comma,
              p1[1],
              // x0, y1
              " l ",
              p0[0],
              comma,
              p1[1]
            );
            break;
          case CMD.Z:
            str.push(" x ");
        }
        if (nPoint > 0) {
          str.push(cmdStr);
          for (var k = 0; k < nPoint; k++) {
            var p = points[k];
            m && applyTransform(p, p, m);
            str.push(round(p[0] * Z - Z2), comma, round(p[1] * Z - Z2), k < nPoint - 1 ? comma : "");
          }
        }
      }
      return str.join("");
    };
    Path.prototype.brushVML = function(vmlRoot) {
      var style = this.style;
      var vmlEl = this._vmlEl;
      if (!vmlEl) {
        vmlEl = vmlCore.createNode("shape");
        initRootElStyle(vmlEl);
        this._vmlEl = vmlEl;
      }
      updateFillAndStroke(vmlEl, "fill", style, this);
      updateFillAndStroke(vmlEl, "stroke", style, this);
      var m = this.transform;
      var needTransform = m != null;
      var strokeEl = vmlEl.getElementsByTagName("stroke")[0];
      if (strokeEl) {
        var lineWidth = style.lineWidth;
        if (needTransform && !style.strokeNoScale) {
          var det = m[0] * m[3] - m[1] * m[2];
          lineWidth *= sqrt(abs(det));
        }
        strokeEl.weight = lineWidth + "px";
      }
      var path2 = this.path || (this.path = new PathProxy());
      if (this.__dirtyPath) {
        path2.beginPath();
        path2.subPixelOptimize = false;
        this.buildPath(path2, this.shape);
        path2.toStatic();
        this.__dirtyPath = false;
      }
      vmlEl.path = pathDataToString(path2, this.transform);
      vmlEl.style.zIndex = getZIndex(this.zlevel, this.z, this.z2);
      append(vmlRoot, vmlEl);
      if (style.text != null) {
        this.drawRectText(vmlRoot, this.getBoundingRect());
      } else {
        this.removeRectText(vmlRoot);
      }
    };
    Path.prototype.onRemove = function(vmlRoot) {
      remove(vmlRoot, this._vmlEl);
      this.removeRectText(vmlRoot);
    };
    Path.prototype.onAdd = function(vmlRoot) {
      append(vmlRoot, this._vmlEl);
      this.appendRectText(vmlRoot);
    };
    var isImage = function(img) {
      return typeof img === "object" && img.tagName && img.tagName.toUpperCase() === "IMG";
    };
    ZImage.prototype.brushVML = function(vmlRoot) {
      var style = this.style;
      var image2 = style.image;
      var ow;
      var oh;
      if (isImage(image2)) {
        var src = image2.src;
        if (src === this._imageSrc) {
          ow = this._imageWidth;
          oh = this._imageHeight;
        } else {
          var imageRuntimeStyle = image2.runtimeStyle;
          var oldRuntimeWidth = imageRuntimeStyle.width;
          var oldRuntimeHeight = imageRuntimeStyle.height;
          imageRuntimeStyle.width = "auto";
          imageRuntimeStyle.height = "auto";
          ow = image2.width;
          oh = image2.height;
          imageRuntimeStyle.width = oldRuntimeWidth;
          imageRuntimeStyle.height = oldRuntimeHeight;
          this._imageSrc = src;
          this._imageWidth = ow;
          this._imageHeight = oh;
        }
        image2 = src;
      } else {
        if (image2 === this._imageSrc) {
          ow = this._imageWidth;
          oh = this._imageHeight;
        }
      }
      if (!image2) {
        return;
      }
      var x = style.x || 0;
      var y = style.y || 0;
      var dw = style.width;
      var dh = style.height;
      var sw = style.sWidth;
      var sh = style.sHeight;
      var sx = style.sx || 0;
      var sy = style.sy || 0;
      var hasCrop = sw && sh;
      var vmlEl = this._vmlEl;
      if (!vmlEl) {
        vmlEl = vmlCore.doc.createElement("div");
        initRootElStyle(vmlEl);
        this._vmlEl = vmlEl;
      }
      var vmlElStyle = vmlEl.style;
      var hasRotation = false;
      var m;
      var scaleX = 1;
      var scaleY = 1;
      if (this.transform) {
        m = this.transform;
        scaleX = sqrt(m[0] * m[0] + m[1] * m[1]);
        scaleY = sqrt(m[2] * m[2] + m[3] * m[3]);
        hasRotation = m[1] || m[2];
      }
      if (hasRotation) {
        var p0 = [x, y];
        var p1 = [x + dw, y];
        var p2 = [x, y + dh];
        var p3 = [x + dw, y + dh];
        applyTransform(p0, p0, m);
        applyTransform(p1, p1, m);
        applyTransform(p2, p2, m);
        applyTransform(p3, p3, m);
        var maxX = mathMax(p0[0], p1[0], p2[0], p3[0]);
        var maxY = mathMax(p0[1], p1[1], p2[1], p3[1]);
        var transformFilter = [];
        transformFilter.push("M11=", m[0] / scaleX, comma, "M12=", m[2] / scaleY, comma, "M21=", m[1] / scaleX, comma, "M22=", m[3] / scaleY, comma, "Dx=", round(x * scaleX + m[4]), comma, "Dy=", round(y * scaleY + m[5]));
        vmlElStyle.padding = "0 " + round(maxX) + "px " + round(maxY) + "px 0";
        vmlElStyle.filter = imageTransformPrefix + ".Matrix(" + transformFilter.join("") + ", SizingMethod=clip)";
      } else {
        if (m) {
          x = x * scaleX + m[4];
          y = y * scaleY + m[5];
        }
        vmlElStyle.filter = "";
        vmlElStyle.left = round(x) + "px";
        vmlElStyle.top = round(y) + "px";
      }
      var imageEl = this._imageEl;
      var cropEl = this._cropEl;
      if (!imageEl) {
        imageEl = vmlCore.doc.createElement("div");
        this._imageEl = imageEl;
      }
      var imageELStyle = imageEl.style;
      if (hasCrop) {
        if (!(ow && oh)) {
          var tmpImage = new Image();
          var self2 = this;
          tmpImage.onload = function() {
            tmpImage.onload = null;
            ow = tmpImage.width;
            oh = tmpImage.height;
            imageELStyle.width = round(scaleX * ow * dw / sw) + "px";
            imageELStyle.height = round(scaleY * oh * dh / sh) + "px";
            self2._imageWidth = ow;
            self2._imageHeight = oh;
            self2._imageSrc = image2;
          };
          tmpImage.src = image2;
        } else {
          imageELStyle.width = round(scaleX * ow * dw / sw) + "px";
          imageELStyle.height = round(scaleY * oh * dh / sh) + "px";
        }
        if (!cropEl) {
          cropEl = vmlCore.doc.createElement("div");
          cropEl.style.overflow = "hidden";
          this._cropEl = cropEl;
        }
        var cropElStyle = cropEl.style;
        cropElStyle.width = round((dw + sx * dw / sw) * scaleX);
        cropElStyle.height = round((dh + sy * dh / sh) * scaleY);
        cropElStyle.filter = imageTransformPrefix + ".Matrix(Dx=" + -sx * dw / sw * scaleX + ",Dy=" + -sy * dh / sh * scaleY + ")";
        if (!cropEl.parentNode) {
          vmlEl.appendChild(cropEl);
        }
        if (imageEl.parentNode !== cropEl) {
          cropEl.appendChild(imageEl);
        }
      } else {
        imageELStyle.width = round(scaleX * dw) + "px";
        imageELStyle.height = round(scaleY * dh) + "px";
        vmlEl.appendChild(imageEl);
        if (cropEl && cropEl.parentNode) {
          vmlEl.removeChild(cropEl);
          this._cropEl = null;
        }
      }
      var filterStr = "";
      var alpha = style.opacity;
      if (alpha < 1) {
        filterStr += ".Alpha(opacity=" + round(alpha * 100) + ") ";
      }
      filterStr += imageTransformPrefix + ".AlphaImageLoader(src=" + image2 + ", SizingMethod=scale)";
      imageELStyle.filter = filterStr;
      vmlEl.style.zIndex = getZIndex(this.zlevel, this.z, this.z2);
      append(vmlRoot, vmlEl);
      if (style.text != null) {
        this.drawRectText(vmlRoot, this.getBoundingRect());
      }
    };
    ZImage.prototype.onRemove = function(vmlRoot) {
      remove(vmlRoot, this._vmlEl);
      this._vmlEl = null;
      this._cropEl = null;
      this._imageEl = null;
      this.removeRectText(vmlRoot);
    };
    ZImage.prototype.onAdd = function(vmlRoot) {
      append(vmlRoot, this._vmlEl);
      this.appendRectText(vmlRoot);
    };
    var DEFAULT_STYLE_NORMAL = "normal";
    var fontStyleCache = {};
    var fontStyleCacheCount = 0;
    var MAX_FONT_CACHE_SIZE = 100;
    var fontEl = document.createElement("div");
    var getFontStyle = function(fontString) {
      var fontStyle = fontStyleCache[fontString];
      if (!fontStyle) {
        if (fontStyleCacheCount > MAX_FONT_CACHE_SIZE) {
          fontStyleCacheCount = 0;
          fontStyleCache = {};
        }
        var style = fontEl.style;
        var fontFamily;
        try {
          style.font = fontString;
          fontFamily = style.fontFamily.split(",")[0];
        } catch (e) {
        }
        fontStyle = {
          style: style.fontStyle || DEFAULT_STYLE_NORMAL,
          variant: style.fontVariant || DEFAULT_STYLE_NORMAL,
          weight: style.fontWeight || DEFAULT_STYLE_NORMAL,
          size: parseFloat(style.fontSize || 12) | 0,
          family: fontFamily || "Microsoft YaHei"
        };
        fontStyleCache[fontString] = fontStyle;
        fontStyleCacheCount++;
      }
      return fontStyle;
    };
    var textMeasureEl;
    textContain.$override("measureText", function(text2, textFont) {
      var doc = vmlCore.doc;
      if (!textMeasureEl) {
        textMeasureEl = doc.createElement("div");
        textMeasureEl.style.cssText = "position:absolute;top:-20000px;left:0;padding:0;margin:0;border:none;white-space:pre;";
        vmlCore.doc.body.appendChild(textMeasureEl);
      }
      try {
        textMeasureEl.style.font = textFont;
      } catch (ex) {
      }
      textMeasureEl.innerHTML = "";
      textMeasureEl.appendChild(doc.createTextNode(text2));
      return {
        width: textMeasureEl.offsetWidth
      };
    });
    var tmpRect2 = new BoundingRect2();
    var drawRectText = function(vmlRoot, rect, textRect, fromTextEl) {
      var style = this.style;
      this.__dirty && textHelper.normalizeTextStyle(style, true);
      var text2 = style.text;
      text2 != null && (text2 += "");
      if (!text2) {
        return;
      }
      if (style.rich) {
        var contentBlock = textContain.parseRichText(text2, style);
        text2 = [];
        for (var i2 = 0; i2 < contentBlock.lines.length; i2++) {
          var tokens = contentBlock.lines[i2].tokens;
          var textLine = [];
          for (var j = 0; j < tokens.length; j++) {
            textLine.push(tokens[j].text);
          }
          text2.push(textLine.join(""));
        }
        text2 = text2.join("\n");
      }
      var x;
      var y;
      var align = style.textAlign;
      var verticalAlign = style.textVerticalAlign;
      var fontStyle = getFontStyle(style.font);
      var font = fontStyle.style + " " + fontStyle.variant + " " + fontStyle.weight + " " + fontStyle.size + 'px "' + fontStyle.family + '"';
      textRect = textRect || textContain.getBoundingRect(text2, font, align, verticalAlign, style.textPadding, style.textLineHeight);
      var m = this.transform;
      if (m && !fromTextEl) {
        tmpRect2.copy(rect);
        tmpRect2.applyTransform(m);
        rect = tmpRect2;
      }
      if (!fromTextEl) {
        var textPosition = style.textPosition;
        if (textPosition instanceof Array) {
          x = rect.x + parsePercent(textPosition[0], rect.width);
          y = rect.y + parsePercent(textPosition[1], rect.height);
          align = align || "left";
        } else {
          var res = this.calculateTextPosition ? this.calculateTextPosition({}, style, rect) : textContain.calculateTextPosition({}, style, rect);
          x = res.x;
          y = res.y;
          align = align || res.textAlign;
          verticalAlign = verticalAlign || res.textVerticalAlign;
        }
      } else {
        x = rect.x;
        y = rect.y;
      }
      x = textContain.adjustTextX(x, textRect.width, align);
      y = textContain.adjustTextY(y, textRect.height, verticalAlign);
      y += textRect.height / 2;
      var createNode = vmlCore.createNode;
      var textVmlEl = this._textVmlEl;
      var pathEl;
      var textPathEl;
      var skewEl;
      if (!textVmlEl) {
        textVmlEl = createNode("line");
        pathEl = createNode("path");
        textPathEl = createNode("textpath");
        skewEl = createNode("skew");
        textPathEl.style["v-text-align"] = "left";
        initRootElStyle(textVmlEl);
        pathEl.textpathok = true;
        textPathEl.on = true;
        textVmlEl.from = "0 0";
        textVmlEl.to = "1000 0.05";
        append(textVmlEl, skewEl);
        append(textVmlEl, pathEl);
        append(textVmlEl, textPathEl);
        this._textVmlEl = textVmlEl;
      } else {
        skewEl = textVmlEl.firstChild;
        pathEl = skewEl.nextSibling;
        textPathEl = pathEl.nextSibling;
      }
      var coords = [x, y];
      var textVmlElStyle = textVmlEl.style;
      if (m && fromTextEl) {
        applyTransform(coords, coords, m);
        skewEl.on = true;
        skewEl.matrix = m[0].toFixed(3) + comma + m[2].toFixed(3) + comma + m[1].toFixed(3) + comma + m[3].toFixed(3) + ",0,0";
        skewEl.offset = (round(coords[0]) || 0) + "," + (round(coords[1]) || 0);
        skewEl.origin = "0 0";
        textVmlElStyle.left = "0px";
        textVmlElStyle.top = "0px";
      } else {
        skewEl.on = false;
        textVmlElStyle.left = round(x) + "px";
        textVmlElStyle.top = round(y) + "px";
      }
      textPathEl.string = encodeHtmlAttribute(text2);
      try {
        textPathEl.style.font = font;
      } catch (e) {
      }
      updateFillAndStroke(textVmlEl, "fill", {
        fill: style.textFill,
        opacity: style.opacity
      }, this);
      updateFillAndStroke(textVmlEl, "stroke", {
        stroke: style.textStroke,
        opacity: style.opacity,
        lineDash: style.lineDash || null
        // style.lineDash can be `false`.
      }, this);
      textVmlEl.style.zIndex = getZIndex(this.zlevel, this.z, this.z2);
      append(vmlRoot, textVmlEl);
    };
    var removeRectText = function(vmlRoot) {
      remove(vmlRoot, this._textVmlEl);
      this._textVmlEl = null;
    };
    var appendRectText = function(vmlRoot) {
      append(vmlRoot, this._textVmlEl);
    };
    var list = [RectText, Displayable, ZImage, Path, Text];
    for (var i = 0; i < list.length; i++) {
      var proto = list[i].prototype;
      proto.drawRectText = drawRectText;
      proto.removeRectText = removeRectText;
      proto.appendRectText = appendRectText;
    }
    Text.prototype.brushVML = function(vmlRoot) {
      var style = this.style;
      if (style.text != null) {
        this.drawRectText(vmlRoot, {
          x: style.x || 0,
          y: style.y || 0,
          width: 0,
          height: 0
        }, this.getBoundingRect(), true);
      } else {
        this.removeRectText(vmlRoot);
      }
    };
    Text.prototype.onRemove = function(vmlRoot) {
      this.removeRectText(vmlRoot);
    };
    Text.prototype.onAdd = function(vmlRoot) {
      this.appendRectText(vmlRoot);
    };
  }
  return graphic;
}
var Painter;
var hasRequiredPainter;
function requirePainter() {
  if (hasRequiredPainter) return Painter;
  hasRequiredPainter = 1;
  var logError2 = log;
  var vmlCore = requireCore();
  var _util2 = util$6;
  var each2 = _util2.each;
  function parseInt102(val) {
    return parseInt(val, 10);
  }
  function VMLPainter(root, storage) {
    vmlCore.initVML();
    this.root = root;
    this.storage = storage;
    var vmlViewport = document.createElement("div");
    var vmlRoot = document.createElement("div");
    vmlViewport.style.cssText = "display:inline-block;overflow:hidden;position:relative;width:300px;height:150px;";
    vmlRoot.style.cssText = "position:absolute;left:0;top:0;";
    root.appendChild(vmlViewport);
    this._vmlRoot = vmlRoot;
    this._vmlViewport = vmlViewport;
    this.resize();
    var oldDelFromStorage = storage.delFromStorage;
    var oldAddToStorage = storage.addToStorage;
    storage.delFromStorage = function(el) {
      oldDelFromStorage.call(storage, el);
      if (el) {
        el.onRemove && el.onRemove(vmlRoot);
      }
    };
    storage.addToStorage = function(el) {
      el.onAdd && el.onAdd(vmlRoot);
      oldAddToStorage.call(storage, el);
    };
    this._firstPaint = true;
  }
  VMLPainter.prototype = {
    constructor: VMLPainter,
    getType: function() {
      return "vml";
    },
    /**
     * @return {HTMLDivElement}
     */
    getViewportRoot: function() {
      return this._vmlViewport;
    },
    getViewportRootOffset: function() {
      var viewportRoot = this.getViewportRoot();
      if (viewportRoot) {
        return {
          offsetLeft: viewportRoot.offsetLeft || 0,
          offsetTop: viewportRoot.offsetTop || 0
        };
      }
    },
    /**
     * 刷新
     */
    refresh: function() {
      var list = this.storage.getDisplayList(true, true);
      this._paintList(list);
    },
    _paintList: function(list) {
      var vmlRoot = this._vmlRoot;
      for (var i = 0; i < list.length; i++) {
        var el = list[i];
        if (el.invisible || el.ignore) {
          if (!el.__alreadyNotVisible) {
            el.onRemove(vmlRoot);
          }
          el.__alreadyNotVisible = true;
        } else {
          if (el.__alreadyNotVisible) {
            el.onAdd(vmlRoot);
          }
          el.__alreadyNotVisible = false;
          if (el.__dirty) {
            el.beforeBrush && el.beforeBrush();
            (el.brushVML || el.brush).call(el, vmlRoot);
            el.afterBrush && el.afterBrush();
          }
        }
        el.__dirty = false;
      }
      if (this._firstPaint) {
        this._vmlViewport.appendChild(vmlRoot);
        this._firstPaint = false;
      }
    },
    resize: function(width, height) {
      var width = width == null ? this._getWidth() : width;
      var height = height == null ? this._getHeight() : height;
      if (this._width !== width || this._height !== height) {
        this._width = width;
        this._height = height;
        var vmlViewportStyle = this._vmlViewport.style;
        vmlViewportStyle.width = width + "px";
        vmlViewportStyle.height = height + "px";
      }
    },
    dispose: function() {
      this.root.innerHTML = "";
      this._vmlRoot = this._vmlViewport = this.storage = null;
    },
    getWidth: function() {
      return this._width;
    },
    getHeight: function() {
      return this._height;
    },
    clear: function() {
      if (this._vmlViewport) {
        this.root.removeChild(this._vmlViewport);
      }
    },
    _getWidth: function() {
      var root = this.root;
      var stl = root.currentStyle;
      return (root.clientWidth || parseInt102(stl.width)) - parseInt102(stl.paddingLeft) - parseInt102(stl.paddingRight) | 0;
    },
    _getHeight: function() {
      var root = this.root;
      var stl = root.currentStyle;
      return (root.clientHeight || parseInt102(stl.height)) - parseInt102(stl.paddingTop) - parseInt102(stl.paddingBottom) | 0;
    }
  };
  function createMethodNotSupport(method) {
    return function() {
      logError2('In IE8.0 VML mode painter not support method "' + method + '"');
    };
  }
  each2(["getLayer", "insertLayer", "eachLayer", "eachBuiltinLayer", "eachOtherLayer", "getLayers", "modLayer", "delLayer", "clearLayer", "toDataURL", "pathToImage"], function(name) {
    VMLPainter.prototype[name] = createMethodNotSupport(name);
  });
  var _default2 = VMLPainter;
  Painter = _default2;
  return Painter;
}
var hasRequiredVml;
function requireVml() {
  if (hasRequiredVml) return vml;
  hasRequiredVml = 1;
  requireGraphic();
  var _zrender = zrender;
  var registerPainter2 = _zrender.registerPainter;
  var Painter2 = requirePainter();
  registerPainter2("vml", Painter2);
  return vml;
}
(function(exports) {
  var _zrender = zrender;
  (function() {
    for (var key in _zrender) {
      if (_zrender == null || !_zrender.hasOwnProperty(key) || key === "default" || key === "__esModule") return;
      exports[key] = _zrender[key];
    }
  })();
  var _export2 = require_export();
  (function() {
    for (var key in _export2) {
      if (_export2 == null || !_export2.hasOwnProperty(key) || key === "default" || key === "__esModule") return;
      exports[key] = _export2[key];
    }
  })();
  requireSvg();
  requireVml();
})(zrender$1);
class Node {
  constructor({
    container,
    rootGroup,
    x = 0,
    y = 0,
    w = 80,
    h = 40,
    data = {},
    readonly = true,
    config: config2 = {},
    onNodeClick = () => {
    },
    onTextChange = () => {
    },
    onNodeDoubleClick = () => {
    },
    onNodeMouseDown = () => {
    },
    onNodeMouseUp = () => {
    },
    onNodeMouseEnter = () => {
    },
    onNodeMouseLeave = () => {
    }
  }) {
    this.container = container;
    this.rootGroup = rootGroup;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.data = data;
    this.readonly = readonly;
    this.config = config2;
    this.onNodeClick = onNodeClick;
    this.onTextChange = onTextChange;
    this.onNodeDoubleClick = onNodeDoubleClick;
    this.onNodeMouseDown = onNodeMouseDown;
    this.onNodeMouseUp = onNodeMouseUp;
    this.onNodeMouseEnter = onNodeMouseEnter;
    this.onNodeMouseLeave = onNodeMouseLeave;
    this._init();
    this.isSelected = false;
  }
  _init() {
    const { radius, rootRect, normalRect, fontFamily, fontWeight } = this.config;
    this.group = new zrender$1.Group({
      draggable: false
    });
    let textOffset = [0, 0];
    this.rect = new zrender$1.Rect({
      shape: {
        r: radius,
        x: this.x,
        y: this.y,
        width: this.w,
        height: this.h
      },
      style: {
        stroke: this.level === 0 ? rootRect.bg : normalRect.bg,
        lineWidth: this.level === 0 ? rootRect.borderWidth : normalRect.borderWidth,
        fill: this.level === 0 ? rootRect.bg : normalRect.bg,
        text: this.data.name,
        textOffset,
        textFill: this.level === 0 ? rootRect.textColor : normalRect.textColor,
        fontSize: this.level === 0 ? rootRect.fontSize : normalRect.fontSize,
        fontFamily,
        fontWeight,
        transformText: true
        // 跟随group缩放
      },
      z: 10
    });
    this.rect.id = this.data.id;
    this.group.add(this.rect);
    if (this.data.level !== 0) {
      this.placeholderRect = this._getPlaceholderRect();
      this.data.fatherNode.group.add(this.placeholderRect);
      this.placeholderRect.on("mouseup", (e) => {
        this.onMouseUp();
      });
    }
    this.group.on("dblclick", (e) => {
      this.timer && clearTimeout(this.timer);
      this.onNodeDoubleClick(e, this.data);
      e.event.preventDefault();
      e.event.stopPropagation();
      this.editName();
    });
    this.group.on("click", (e) => {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        e.event.preventDefault();
        e.event.stopPropagation();
        this.onNodeClick(e, this.data);
      }, 100);
    });
    this.group.on("mouseover", (e) => {
      if (!this.isSelected) {
        this.rect.attr("style", {
          stroke: this.level === 0 ? rootRect.hoverBorderColor : normalRect.hoverBorderColor
        });
      }
      this.onNodeMouseEnter(e, this.data);
    });
    this.group.on("mouseout", (e) => {
      if (!this.isSelected) {
        this.rect.attr("style", {
          stroke: this.level === 0 ? rootRect.bg : normalRect.bg
        });
      }
      this.onNodeMouseLeave(e, this.data);
    });
    this.group.on("mousedown", (e) => {
      if (this.readonly) {
        return;
      }
      if (this.data.level === 0) {
        return;
      }
      this.moveable = true;
      this.group.attr("draggable", true);
      this.onNodeMouseDown(e, this.data);
    });
    this.group.on("mousemove", (e) => {
      if (this.readonly) {
        return;
      }
      if (!this.moveable) {
        return;
      }
      if (this.data.level === 0) {
        return;
      }
      if (this.rect.z === 10) {
        this.rect.attr("z", 8);
      }
      if (this.data.btn && this.data.btn.type === 1) {
        this.data.btn.setType(0);
      }
      if (this.data.lineBeforeBtn && this.data.lineBeforeBtn.line.style !== rootRect.bg) {
        this.data.lineBeforeBtn.setColor(rootRect.bg);
      }
      if (this.data.lineBeforeNode && this.data.lineBeforeNode.line.z === 1) {
        this.data.lineBeforeNode.line.attr("z", 2);
      }
      if (this.data.lineBeforeNode && this.data.lineBeforeNode.line.style !== rootRect.bg) {
        this.data.lineBeforeNode.setColor(rootRect.bg);
      }
      if (this.placeholderRect && this.placeholderRect.invisible) {
        this.placeholderRect.attr("invisible", false);
      }
    });
    this.group.on("mouseup", (e) => {
      if (this.readonly) {
        return;
      }
      if (this.data.level === 0) {
        return;
      }
      this.group.attr("draggable", false);
      this.onMouseUp();
      this.onNodeMouseUp(e, this.data);
    });
  }
  onMouseUp() {
    const { lineColor } = this.config;
    this.group.attr("position", [0, 0]);
    this.group.attr("scale", [1, 1]);
    this.rect.attr("z", 10);
    if (this.data.btn && this.data.btn.type === 0) {
      this.data.btn.setType(1);
    }
    if (this.data.lineBeforeBtn && this.data.lineBeforeBtn.line.style !== lineColor) {
      this.data.lineBeforeBtn.setColor(lineColor);
    }
    if (this.data.lineBeforeNode && this.data.lineBeforeNode.line.z === 2) {
      this.data.lineBeforeNode.line.attr("z", 1);
    }
    if (this.data.lineBeforeNode && this.data.lineBeforeNode.line.style !== lineColor) {
      this.data.lineBeforeNode.setColor(lineColor);
    }
    if (this.placeholderRect && this.placeholderRect.invisible) {
      this.placeholderRect.attr("invisible", true);
    }
    this.moveable = false;
  }
  _getPlaceholderRect() {
    const { rootRect, radius } = this.config;
    return new zrender$1.Rect({
      shape: {
        r: radius,
        x: this.x,
        y: this.y,
        width: this.w,
        height: this.h
      },
      style: {
        fill: rootRect.bg
      },
      z: 9,
      silent: false,
      invisible: true
    });
  }
  // 双击生成文本输入框
  _generateInputDom({ x, y, w, h }) {
    if (!x || !y || !w || !h) {
      return;
    }
    const { fontSize, fontFamily, radius, normalRect } = this.config;
    let input = document.createElement("input");
    input.style = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            padding: 0 12px;
            width: ${w - 28}px;
            height: ${h - 3}px;
            border-radius: ${radius}px;
            outline: none;
            border: none;
            font-size: ${fontSize};
            font-family: ${fontFamily};
            border-radius: ${normalRect.radius}px;
            border: 2px solid #5CDBD3;
            z-index: 10;
            background: ${normalRect.bg};
        `;
    input.value = this.data.name;
    input.onkeyup = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.keyCode === 13) {
        input.blur();
        return;
      }
      this.data.name = e.target.value;
    };
    input.onblur = (e) => {
      this.onTextChange(this.data);
      input.autofocus = false;
      document.body.removeChild(input);
    };
    document.body.appendChild(input);
    setTimeout(() => {
      input.focus();
    }, 100);
  }
  // 选中节点
  selectNode() {
    const { rootRect, normalRect } = this.config;
    this.isSelected = true;
    this.rect.attr("style", {
      stroke: this.level === 0 ? rootRect.clickBorderColor : normalRect.clickBorderColor
    });
  }
  // 取消选中节点
  cancelNode() {
    const { rootRect, normalRect } = this.config;
    this.isSelected = false;
    this.rect.attr("style", {
      stroke: this.level === 0 ? rootRect.bg : normalRect.bg
    });
  }
  // 移动节点位置
  translate(dx = 0, dy = 0) {
    const { animation } = this.config;
    this.x += dx;
    this.y += dy;
    if (animation.switch) {
      this.rect.animateTo(
        {
          shape: {
            x: this.x,
            y: this.y
          }
        },
        animation.time,
        animation.easing
      );
      this.placeholderRect && this.placeholderRect.animateTo(
        {
          shape: {
            x: this.x,
            y: this.y
          }
        },
        animation.time,
        animation.easing
      );
    } else {
      this.rect.attr("shape", {
        x: this.x,
        y: this.y
      });
      this.placeholderRect && this.placeholderRect.attr("shape", {
        x: this.x,
        y: this.y
      });
    }
  }
  editName() {
    if (this.readonly) {
      return;
    }
    const clientRect = this.container.getBoundingClientRect();
    const { position, scale } = this.rootGroup;
    const [offsetX, offsetY] = position;
    const [scaleX, scaleY] = scale;
    const rect = {
      x: this.x + (clientRect.left + offsetX) * scaleX,
      y: this.y + (clientRect.top + offsetY) * scaleY,
      w: this.w * scaleX,
      h: this.h * scaleY
    };
    this._generateInputDom(rect);
  }
  setName(text2) {
    this.rect.attr("style", {
      text: text2
    });
  }
  setWidth(w) {
    if (this.readonly) {
      return;
    }
    const { animation } = this.config;
    this.w = w;
    if (animation.switch) {
      this.rect.animateTo(
        {
          shape: {
            width: this.w
          }
        },
        animation.time,
        animation.easing
      );
      this.placeholderRect && this.placeholderRect.animateTo(
        {
          shape: {
            width: this.w
          }
        },
        animation.time,
        animation.easing
      );
    } else {
      this.rect.attr("shape", { width: this.w });
      this.placeholderRect && this.placeholderRect.attr("shape", { width: this.w });
    }
  }
  getNode() {
    return this.group;
  }
}
class Line {
  constructor({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, config: config2 = {} }) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.config = config2;
    this._init();
  }
  _init() {
    const { lineWidth, lineColor, radius } = this.config;
    const Line2 = zrender$1.Path.extend({
      shape: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        interval: 0,
        radius: 0
      },
      buildPath: (path2, shape) => {
        const x1 = shape.x1;
        const y1 = shape.y1;
        const x2 = shape.x2;
        const y2 = shape.y2;
        const r = shape.radius;
        path2.moveTo(x1, y1);
        if (y1 > y2) {
          path2.lineTo(x1, y2 + r);
          path2.arc(
            x1 + r,
            y2 + r,
            r,
            Math.PI,
            3 * Math.PI / 2,
            false
          );
        } else if (y1 < y2) {
          path2.lineTo(x1, y2 - r);
          path2.arc(x1 + r, y2 - r, r, Math.PI, Math.PI / 2, true);
        }
        path2.lineTo(x2, y2);
      }
    });
    this.line = new Line2({
      shape: {
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2,
        radius
      },
      style: {
        lineWidth,
        fill: "transparent",
        stroke: lineColor
      },
      z: 1
    });
  }
  setConfig(config2) {
    this.config = config2;
  }
  translate(dx1, dy1, dx2, dy2) {
    const { animation } = this.config;
    this.x1 += dx1;
    this.y1 += dy1;
    this.x2 += dx2;
    this.y2 += dy2;
    if (animation.switch) {
      this.line.animateTo(
        {
          shape: {
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
          }
        },
        animation.time,
        animation.easing
      );
    } else {
      this.line.attr("shape", {
        x1: this.x1,
        y1: this.y1,
        x2: this.x2,
        y2: this.y2
      });
    }
  }
  setColor(color2) {
    this.line.attr("style", {
      stroke: color2
    });
  }
  getLine() {
    return this.line;
  }
}
class Btn {
  constructor({ x, y, data, type = 0, config: config2 }) {
    this.x = x;
    this.y = y;
    this.data = data;
    this.type = type;
    this.config = config2;
    this._init();
  }
  _init() {
    const { symbolLineWidth, symbolRadius, lineColor, normalRect } = this.config;
    const Button = zrender$1.Path.extend({
      shape: {
        x: 0,
        y: 0,
        r: 0,
        type: 0
      },
      buildPath: (path2, shape) => {
        const x = shape.x;
        const y = shape.y;
        const r = shape.r;
        const w = 4;
        const type = shape.type;
        path2.arc(x, y, r, 0, Math.PI * 2, false);
        if (type === 0) {
          path2.moveTo(x - r + w, y);
          path2.lineTo(x + r - w, y);
          path2.moveTo(x, y - r + w);
          path2.lineTo(x, y + r - w);
        } else if (type === 1) {
          path2.moveTo(x - r + w, y);
          path2.lineTo(x + r - w, y);
        }
      }
    });
    this.btn = new Button({
      shape: {
        x: this.x,
        y: this.y,
        r: symbolRadius,
        type: this.type
      },
      style: {
        fill: "#fff",
        stroke: lineColor,
        lineWidth: symbolLineWidth
      },
      z: 5
    });
    this.btn.on("click", (e) => {
      if (e.target.shape.type === 0) {
        if (this.data.group) {
          this.setType(1);
        }
      } else if (e.target.shape.type === 1) {
        this.setType(0);
      }
    });
    this.btn.on("mouseover", () => {
      this.btn.attr("style", {
        stroke: normalRect.clickBorderColor
      });
    });
    this.btn.on("mouseout", () => {
      this.btn.attr("style", {
        stroke: lineColor
      });
    });
  }
  // 修改按钮类型
  setType(type) {
    const { animation } = this.config;
    this.type = type;
    this.btn.attr("shape", { type });
    if (type === 1 && this.data.group && this.data.group.scale && this.data.group.scale.some((s) => s === 0)) {
      if (animation.switch) {
        this.data.group.animateTo(
          {
            scale: [1, 1]
          },
          animation.time,
          animation.easing
        );
      } else {
        this.data.group.attr("scale", [1, 1]);
      }
    } else if (type === 0 && this.data.group.scale && this.data.group.scale && this.data.group.scale.some((s) => s === 1)) {
      if (animation.switch) {
        this.data.group.animateTo(
          {
            scale: [0, 0]
          },
          animation.time,
          animation.easing
        );
      } else {
        this.data.group.attr("scale", [0, 0]);
      }
    }
  }
  translate(dx, dy) {
    const { animation } = this.config;
    this.x += dx;
    this.y += dy;
    if (animation.switch) {
      this.btn.animateTo(
        {
          shape: {
            x: this.x,
            y: this.y
          }
        },
        animation.time,
        animation.easing
      );
    } else {
      this.btn.attr("shape", {
        x: this.x,
        y: this.y
      });
    }
  }
  getBtn() {
    return this.btn;
  }
}
const viewport = ({
  container,
  rootGroup,
  zr,
  onMouseDown,
  onZoom,
  scaleable = false,
  SCALE_STEP = 0.1,
  // 缩放步长
  SCALE_MIN = 0.2,
  // 视野最小缩放
  SCALE_MAX = 3
  // 视野最大缩放
}) => {
  let isHoveringNode = false;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let viewBox = {
    x: 0,
    y: 0,
    scale: 1
  };
  const setViewport = (x, y) => {
    rootGroup.attr("position", [x, y]);
  };
  const setViewportScale = (s) => {
    if (s > SCALE_MAX) {
      s = SCALE_MAX;
    }
    if (s < SCALE_MIN) {
      s = SCALE_MIN;
    }
    rootGroup.attr("scale", [s, s]);
    onZoom((s / (SCALE_MAX - SCALE_MIN)).toFixed(2));
  };
  const mousedown = (e) => {
    if (isHoveringNode) {
      return;
    }
    if (e.button !== 0) {
      return;
    }
    onMouseDown(e);
    lastX = e.layerX;
    lastY = e.layerY;
    dragging = true;
  };
  const mousemove = (e) => {
    if (isHoveringNode) {
      return;
    }
    if (dragging) {
      zr.dom.children[0].children[0].style.cursor = "grabbing";
      viewBox.x += e.layerX - lastX;
      viewBox.y += e.layerY - lastY;
      setViewport(viewBox.x, viewBox.y);
      lastX = e.layerX;
      lastY = e.layerY;
    }
  };
  const mouseup = () => {
    if (isHoveringNode) {
      return;
    }
    dragging = false;
    zr.dom.children[0].children[0].style.cursor = "default";
  };
  const mousewheel = (e) => {
    if (!scaleable) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (isHoveringNode) {
      return;
    }
    if (e.ctrlKey || e.altKey) {
      if (e.wheelDelta < 0) {
        viewBox.scale -= SCALE_STEP;
      } else {
        viewBox.scale += SCALE_STEP;
      }
      setViewportScale(viewBox.scale);
    }
  };
  const resize = () => {
    zr.resize();
  };
  container.addEventListener("mousedown", mousedown);
  container.addEventListener("mousemove", mousemove);
  container.addEventListener("mouseup", mouseup);
  container.addEventListener("mousewheel", mousewheel);
  window.addEventListener("resize", resize);
  const dispose2 = () => {
    container.removeEventListener("mousedown", mousedown);
    container.removeEventListener("mousemove", mousemove);
    container.removeEventListener("mouseup", mouseup);
    container.removeEventListener("mousewheel", mousewheel);
    window.removeEventListener("resize", resize);
  };
  return {
    setIsHoverNode: (isHover2) => {
      isHoveringNode = isHover2;
    },
    zoom: (scale) => {
      setViewportScale(scale * (SCALE_MAX - SCALE_MIN));
    },
    dispose: dispose2
  };
};
const getTextWidth = (text2, font) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text2);
  return Math.round(metrics.width);
};
const getEndNodeNum = (tree) => {
  let num = 0;
  const fn = (t, level) => {
    if (t.children.length === 0) {
      num++;
      return;
    }
    t.children.forEach((t2) => fn(t2));
  };
  fn(tree);
  return num;
};
const uuid = () => (/* @__PURE__ */ new Date()).getTime();
class Mindmap {
  // 视口
  constructor({
    container,
    data,
    readonly = true,
    onNodeClick = () => {
    },
    onZoom = () => {
    },
    onError = () => {
    }
  }) {
    this._onKeyDown = (e) => {
      switch (e.keyCode) {
        case 9:
          if (this.readonly) {
            return;
          }
          this.addChildNode();
          e.preventDefault();
          break;
        case 13:
          if (this.readonly) {
            return;
          }
          if (!this.isEditingText) {
            this.addSilbingNode();
          }
          e.preventDefault();
          break;
        case 8:
        case 46:
          if (this.readonly) {
            return;
          }
          if (!this.isEditingText) {
            this.removeNode();
          }
          break;
      }
    };
    this._onMouseDown = () => {
      this.cancelSelected();
    };
    this.findData = (id) => {
      const fn = (n) => {
        for (let i = 0; i < n.children.length; i++) {
          if (!n.children || n.children.length === 0) {
            continue;
          }
          if (n.children[i].id === id) {
            return n.children[i];
          } else {
            return fn(n.children[i]);
          }
        }
      };
      const d = fn(this.data);
      return d ? d : null;
    };
    this.container = container;
    this.data = data;
    this.readonly = readonly;
    this.onNodeClick = onNodeClick;
    this.onZoom = onZoom;
    this.onError = onError;
    this._setConfig();
    this._init();
    this.selectedNodes = [];
    this.dragSourceNode = null;
    this.dragTargetNode = null;
    this.isEditingText = false;
    this.render();
  }
  _setConfig() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const normalRect = {
      w: 50,
      h: 30,
      bg: "#F3F7F7",
      textColor: "#00474F",
      fontSize: 14,
      borderWidth: 3,
      hoverBorderColor: "#C1F3F0",
      // hover时边框颜色
      clickBorderColor: "#5CDBD3"
      // 点击选中时边框颜色
    };
    const space = {
      x: 80,
      y: 10
    };
    this.config = {
      w,
      h,
      cx: w / 4,
      // 画布中心x坐标
      cy: h / 2,
      // 画布中心y坐标
      textFill: "#fff",
      textPadding: 8,
      fontFamily: "PingFangSC-Semibold PingFang SC",
      fontWeight: 600,
      fontSize: 14,
      rootRect: {
        // 跟节点矩形
        w: 80,
        h: 40,
        bg: "#5CDBD3",
        textColor: "#fff",
        fontSize: 20,
        borderWidth: 4,
        hoverBorderColor: "#C1F3F0",
        // hover时边框颜色
        clickBorderColor: "#13C2C2"
        // 点击选中时边框颜色
      },
      normalRect,
      radius: 20,
      // 节点矩形圆角
      space,
      lineWidth: 4,
      // 节点间线宽
      lineColor: "#006D75",
      // 节点间线颜色
      symbolLineWidth: 2,
      // 展开收起按钮线宽
      symbolRadius: 8,
      // 展开时候按钮半径
      nodeAreaHeight: normalRect.h + space.y * 2,
      // 节点区域高度
      animation: {
        // 动画
        switch: true,
        time: 100,
        easing: "linear"
      }
    };
  }
  _init() {
    const { cx, cy } = this.config;
    this.zr = new zrender$1.init(this.container, {
      // renderer: 'svg',
    });
    this.rootGroup = new zrender$1.Group({
      position: [0, 0],
      origin: [cx, cy]
    });
    this.viewport = viewport({
      container: this.container,
      rootGroup: this.rootGroup,
      zr: this.zr,
      onMouseDown: this._onMouseDown,
      onZoom: this.onZoom
    });
    document.addEventListener("keydown", this._onKeyDown);
  }
  // 递归调整节点及子节点位置
  _resetChildPosition(n, dx, dy, notTrans) {
    n.node.translate(0, dy);
    n.lineBeforeNode && n.lineBeforeNode.translate(dx, notTrans ? 0 : dy, dx, dy);
    n.lineBeforeBtn && n.lineBeforeBtn.translate(dx, dy, dx, dy);
    n.btn && n.btn.translate(dx, dy);
    n.childOrigin[0] += dx;
    n.childOrigin[1] += dy;
    if (n.lineStartPos) {
      n.lineStartPos.x += dx;
      n.lineStartPos.y += dy;
    }
    n.childStartY += dy;
    n.children.forEach((c) => this._resetChildPosition(c, dx, dy, false));
  }
  // 递归调整当前父节点的同级节点的位置
  _resetSlibingPosition(data, dy) {
    if (data.fatherNode) {
      data.fatherNode.children.forEach((n) => {
        if (n.id !== data.id) {
          if (data.node.y < n.node.y) {
            this._resetChildPosition(n, 0, dy, true);
          } else {
            this._resetChildPosition(n, 0, -dy, true);
          }
        } else {
          n.childStartY -= dy;
        }
      });
      this._resetSlibingPosition(data.fatherNode, dy);
    } else {
      data.childStartY -= dy;
    }
  }
  /**
   * 新增节点
   * @param {*} targetData 目标节点信息，要在此节点新增子节点
   * @param {boolean} isSilbing true:新增兄弟节点 false:新增子节点
   * @param {*} newD 将要新增的节点数据
   * @returns 新节点数据
   */
  _addNode(targetData, isSilbing, newD) {
    const { space, normalRect, nodeAreaHeight } = this.config;
    const newLevel = isSilbing ? targetData.level : targetData.level + 1;
    let newData;
    if (newD) {
      newData = {
        id: newD.id,
        name: newD.name,
        children: [],
        level: newLevel,
        isDeleted: false
      };
    } else {
      newData = {
        id: uuid(),
        name: "",
        children: [],
        level: newLevel,
        isDeleted: false
      };
    }
    if (isSilbing) {
      newData.fatherNode = targetData.fatherNode;
      newData.pid = targetData.fatherNode.id;
    } else {
      if (!targetData.group) {
        targetData.group = new zrender$1.Group({
          origin: targetData.childOrigin
        });
      }
      newData.fatherNode = targetData;
      newData.pid = targetData.id;
    }
    const w = this._getTextWidth(newData, newLevel);
    const h = normalRect.h;
    const x = (isSilbing ? targetData.fatherNode.childOrigin[0] : targetData.childOrigin[0]) + space.x / 2;
    let y = isSilbing ? targetData.fatherNode.childStartY - h / 2 : targetData.childStartY;
    if (isSilbing) {
      const i = targetData.fatherNode.children.findIndex(
        (n) => n.id === targetData.id
      ) + 1;
      let silbingNodeNum = 0;
      const silbingNodes = targetData.fatherNode.children.slice(0, i);
      silbingNodes.forEach((n) => {
        silbingNodeNum += getEndNodeNum(n);
      });
      if (silbingNodeNum > 0) {
        y += silbingNodeNum * nodeAreaHeight;
      } else {
        y += nodeAreaHeight * i;
      }
    } else {
      const nodeEndNum = getEndNodeNum(targetData);
      y = targetData.childStartY;
      if (nodeEndNum > 1 || targetData.children.length === 1) {
        y += nodeEndNum * nodeAreaHeight - h / 2;
      } else {
        y += space.y;
      }
    }
    const lineStartPos = {
      x: x + w,
      y: y + h / 2
    };
    newData.lineStartPos = lineStartPos;
    const node = this._getNode({
      x,
      y,
      w,
      h,
      data: newData
    });
    newData.node = node;
    newData.childOrigin = [x + w + space.x / 2, y + h / 2];
    const lineBeforeNode = this._getLine({
      x1: isSilbing ? targetData.fatherNode.childOrigin[0] : targetData.childOrigin[0],
      y1: isSilbing ? targetData.fatherNode.childOrigin[1] : targetData.childOrigin[1],
      x2: x,
      y2: newData.childOrigin[1]
    });
    newData.lineBeforeNode = lineBeforeNode;
    if (newD && newD.children.length > 0) {
      const lineBeforeBtn = this._getLine({
        x1: lineStartPos.x,
        y1: lineStartPos.y,
        x2: lineStartPos.x + space.x / 2,
        y2: lineStartPos.y
      });
      targetData.group.add(lineBeforeBtn.getLine());
      newData.lineBeforeBtn = lineBeforeBtn;
      const unfoldBtn = this._getBtn(
        lineStartPos.x + space.x / 2,
        lineStartPos.y,
        newData,
        0
      );
      targetData.group.add(unfoldBtn.getBtn());
      newData.btn = unfoldBtn;
    }
    if (isSilbing) {
      targetData.fatherNode.group.add(node.getNode());
      targetData.fatherNode.group.add(lineBeforeNode.getLine());
      newData.childStartY = y - space.y + nodeAreaHeight / 2;
    } else {
      if (targetData.btn && targetData.btn.btn.shape.type === 0) {
        targetData.btn.setType(1);
      }
      targetData.group.add(node.getNode());
      targetData.group.add(lineBeforeNode.getLine());
      if (targetData.level === 0) {
        this.rootGroup.add(targetData.group);
      } else {
        targetData.fatherNode.group.add(targetData.group);
      }
      newData.childStartY = y - space.y;
      if (targetData.children.length > 0) {
        newData.childStartY += nodeAreaHeight / 2;
      }
    }
    return newData;
  }
  // 添加同级节点
  addSilbingNode() {
    if (this.readonly) {
      return;
    }
    const { nodeAreaHeight } = this.config;
    const dy = nodeAreaHeight / 2;
    if (this.selectedNodes.length === 0) {
      this.onError("请先选中节点");
    } else if (this.selectedNodes.length === 1) {
      const data = this.selectedNodes[0];
      if (data.level === 0) {
        this.onError("根节点无法新增兄弟节点");
      } else {
        const newData = this._addNode(data, true, null);
        const i = data.fatherNode.children.findIndex(
          (n) => n.id === data.id
        ) + 1;
        data.fatherNode.children.splice(i, 0, newData);
        this._resetSlibingPosition(newData, dy);
        data.node.cancelNode();
        this.selectedNodes = [];
        newData.node.selectNode();
        newData.node.editName();
        this.isEditingText = true;
        this.selectedNodes.push(newData);
      }
    } else {
      this.onError("新增节点, 只能选中一个节点");
    }
  }
  // 添加子节点
  addChildNode() {
    if (this.readonly) {
      return;
    }
    const { nodeAreaHeight } = this.config;
    const data = this.selectedNodes[0];
    if (this.selectedNodes.length === 0) {
      this.onError("请先选中节点");
    } else if (data.children.length > 0 && data.btn && data.btn.type === 0) {
      this.onError("请先展开节点");
    } else if (this.selectedNodes.length === 1) {
      const { space } = this.config;
      if (!data.btn) {
        const foldBtn = this._getBtn(
          data.lineStartPos.x + space.x / 2,
          data.lineStartPos.y,
          data,
          0
        );
        if (data.level === 0) {
          this.rootGroup.add(foldBtn.getBtn());
        } else {
          data.fatherNode.group.add(foldBtn.getBtn());
        }
        data.btn = foldBtn;
      }
      if (!data.lineBeforeBtn) {
        const lineBeforeBtn = this._getLine({
          x1: data.lineStartPos.x,
          y1: data.lineStartPos.y,
          x2: data.lineStartPos.x + space.x / 2,
          y2: data.lineStartPos.y
        });
        if (data.level === 0) {
          this.rootGroup.add(lineBeforeBtn.getLine());
        } else {
          data.fatherNode.group.add(lineBeforeBtn.getLine());
        }
        data.lineBeforeBtn = lineBeforeBtn;
      }
      const newData = this._addNode(data, false, null);
      data.children.push(newData);
      if (data.children.length > 1) {
        const dy = nodeAreaHeight / 2;
        this._resetSlibingPosition(newData, dy);
      }
      data.node.cancelNode();
      this.selectedNodes = [];
      newData.node.selectNode();
      newData.node.editName();
      this.isEditingText = true;
      this.selectedNodes.push(newData);
    } else {
      this.onError("新增节点, 只能选中一个节点");
    }
  }
  /**
   * 删除节点
   * @param {*} nodes 删除节点列表
   * @returns
   */
  removeNode(nodes) {
    if (this.readonly) {
      return;
    }
    let needDeleteNodes = [];
    if (nodes) {
      needDeleteNodes = nodes;
    } else {
      needDeleteNodes = this.selectedNodes;
    }
    if (needDeleteNodes.length === 0) {
      this.onError("请先选中节点");
    } else if (needDeleteNodes.length === 1) {
      const { nodeAreaHeight } = this.config;
      const data = needDeleteNodes[0];
      if (data.level === 0) {
        this.onError("根节点不允许删除!");
        return;
      }
      if (getEndNodeNum(data.fatherNode) > 1) {
        let nodeEndNum = getEndNodeNum(data);
        if (data.fatherNode.children.length === 1) {
          nodeEndNum--;
        }
        const dy = nodeEndNum * nodeAreaHeight / 2;
        this._resetSlibingPosition(data, -dy);
      }
      data.btn && data.fatherNode.group.remove(data.btn.getBtn());
      data.lineBeforeBtn && data.fatherNode.group.remove(data.lineBeforeBtn.getLine());
      data.lineBeforeNode && data.fatherNode.group.remove(data.lineBeforeNode.getLine());
      data.node && data.fatherNode.group.remove(data.node.getNode());
      if (data.group) {
        data.fatherNode.group.remove(data.group);
      }
      if (data.node.placeholderRect) {
        data.fatherNode.group.remove(data.node.placeholderRect);
      }
      const i = data.fatherNode.children.findIndex(
        (n) => n.id === data.id
      );
      data.fatherNode.children.splice(i, 1);
      if (data.fatherNode.children.length === 0) {
        if (data.fatherNode.fatherNode) {
          data.fatherNode.btn && data.fatherNode.fatherNode.group.remove(
            data.fatherNode.btn.getBtn()
          );
          data.fatherNode.lineBeforeBtn && data.fatherNode.fatherNode.group.remove(
            data.fatherNode.lineBeforeBtn.getLine()
          );
        } else {
          data.fatherNode.btn && this.rootGroup.remove(data.fatherNode.btn.getBtn());
          data.fatherNode.lineBeforeBtn && this.rootGroup.remove(
            data.fatherNode.lineBeforeBtn.getLine()
          );
        }
        data.fatherNode.btn = void 0;
        data.fatherNode.lineBeforeBtn = void 0;
      }
      this.selectedNodes = [];
      data.isDeleted = true;
    } else {
      this.onError("一次只能删除一个节点");
    }
  }
  // 点击节点
  onRectNodeClick(e, data) {
    const i = this.selectedNodes.findIndex((n) => n.id === data.id);
    if (i === -1) {
      this.selectedNodes.forEach((n) => {
        n.node.cancelNode();
      });
      data.node.selectNode();
      this.selectedNodes = [data];
    } else {
      data.node.cancelNode();
      this.selectedNodes.splice(i, 1);
    }
    this.onNodeClick(e);
  }
  // 节点文本改变事件
  onTextChange(data) {
    if (this.readonly) {
      return;
    }
    if (data.name === data.node.rect.style.text) {
      return;
    }
    data.node.setName(data.name);
    const w = this._getTextWidth(data, data.level);
    const dw = w - data.node.w;
    data.node.setWidth(w);
    data.lineBeforeBtn && data.lineBeforeBtn.translate(dw, 0, dw, 0);
    data.childOrigin[0] = data.childOrigin[0] + dw;
    data.btn && data.btn.translate(dw, 0);
    if (data.lineStartPos) {
      data.lineStartPos.x += dw;
    }
    const fn = (tree) => {
      tree.children.forEach((t) => {
        t.node.translate(dw, 0);
        t.lineBeforeNode && t.lineBeforeNode.translate(dw, 0, dw, 0);
        t.lineBeforeBtn && t.lineBeforeBtn.translate(dw, 0, dw, 0);
        t.childOrigin[0] = t.childOrigin[0] + dw;
        t.btn && t.btn.translate(dw, 0);
        if (t.lineStartPos) {
          t.lineStartPos.x += dw;
        }
        fn(t);
      });
    };
    fn(data);
    this.isEditingText = false;
  }
  // 鼠标hover节点
  onMouseOver(e, data) {
    this.viewport.setIsHoverNode(true);
    if (this.dragSourceNode && this.dragSourceNode.id !== data.id) {
      this.dragTargetNode = data;
    }
  }
  // 鼠标离开节点
  onMouseOut() {
    this.viewport.setIsHoverNode(false);
    this.dragTargetNode = null;
  }
  // 鼠标点击节点
  onNodeMouseDown(e, data) {
    this.dragSourceNode = data;
  }
  // 按下的鼠标抬起事件
  onNodeMouseUp(data) {
    if (this.readonly) {
      return;
    }
    if (this.dragSourceNode && this.dragTargetNode) {
      const i = this.dragTargetNode.children.findIndex(
        (n) => n.id === this.dragSourceNode.id
      );
      if (i > -1) {
        this.dragSourceNode.node.onMouseUp();
        return;
      }
      this.addNode(this.dragSourceNode, this.dragTargetNode);
      this.removeNode([this.dragSourceNode]);
    }
    this.dragSourceNode = null;
    this.dragTargetNode = null;
  }
  // 拖动添加节点
  addNode(source, target) {
    if (this.readonly) {
      return;
    }
    const { nodeAreaHeight } = this.config;
    const { space } = this.config;
    if (!target.btn) {
      const foldBtn = this._getBtn(
        target.lineStartPos.x + space.x / 2,
        target.lineStartPos.y,
        target,
        0
      );
      target.fatherNode.group.add(foldBtn.getBtn());
      target.btn = foldBtn;
    }
    if (!target.lineBeforeBtn) {
      const lineBeforeBtn = this._getLine({
        x1: target.lineStartPos.x,
        y1: target.lineStartPos.y,
        x2: target.lineStartPos.x + space.x / 2,
        y2: target.lineStartPos.y
      });
      target.fatherNode.group.add(lineBeforeBtn.getLine());
      target.lineBeforeBtn = lineBeforeBtn;
    }
    const fn = (sou, tar) => {
      const newData = this._addNode(tar, false, sou);
      tar.children.push(newData);
      if (tar.children.length > 1) {
        const dy = nodeAreaHeight / 2;
        this._resetSlibingPosition(newData, dy);
      }
      sou.children.forEach((s) => fn(s, newData));
    };
    fn(source, target);
  }
  _onNodeDoubleClick(e, data) {
    this.isEditingText = true;
  }
  // 节点
  _getNode({ x, y, w, h, data }) {
    const node = new Node({
      container: this.container,
      rootGroup: this.rootGroup,
      x,
      y,
      w,
      h,
      data,
      readonly: this.readonly,
      config: this.config,
      onNodeClick: this.onRectNodeClick.bind(this),
      onTextChange: this.onTextChange.bind(this),
      onNodeDoubleClick: this._onNodeDoubleClick.bind(this),
      onNodeMouseDown: this.onNodeMouseDown.bind(this),
      onNodeMouseUp: this.onNodeMouseUp.bind(this),
      onNodeMouseEnter: this.onMouseOver.bind(this),
      onNodeMouseLeave: this.onMouseOut.bind(this)
    });
    return node;
  }
  // 展开收起按钮 type 0 展开 1 收起
  _getBtn(x, y, data, type = 0) {
    const btn = new Btn({
      x,
      y,
      data,
      type,
      config: this.config
    });
    return btn;
  }
  // 节点之间连线
  _getLine({ x1, y1, x2, y2 }) {
    return new Line({ x1, y1, x2, y2, config: this.config });
  }
  // 计算文字宽度
  _getTextWidth(data, level) {
    const { fontFamily, rootRect, normalRect, textPadding } = this.config;
    const w = (getTextWidth(
      data.name,
      `${level === 0 ? rootRect.fontSize : normalRect.fontSize}px ${fontFamily}`
    ) || normalRect.w) + textPadding * 2;
    return w;
  }
  // 生成脑图
  _generateMap() {
    const {
      cx,
      cy,
      rootRect,
      normalRect,
      space,
      nodeAreaHeight,
      animation
    } = this.config;
    const rootW = this._getTextWidth(this.data, 0);
    this.data.level = 0;
    const rootR = this._getNode({
      x: cx - rootW / 2,
      y: cy - rootRect.h / 2,
      w: rootW,
      h: rootRect.h,
      data: this.data
    });
    this.data.node = rootR;
    this.rootGroup.add(rootR.getNode());
    this.data.childOrigin = [cx + rootW / 2 + space.x / 2, cy];
    const lineBeforeBtn = this._getLine({
      x1: cx + rootW / 2,
      y1: cy,
      x2: this.data.childOrigin[0],
      y2: this.data.childOrigin[1]
    });
    this.rootGroup.add(lineBeforeBtn.getLine());
    this.data.lineBeforeBtn = lineBeforeBtn;
    this.data.group = new zrender$1.Group({
      scale: animation.switch ? [0, 0] : [1, 1],
      origin: this.data.childOrigin
    });
    const btn = this._getBtn(
      this.data.childOrigin[0],
      this.data.childOrigin[1],
      this.data,
      this.data.children && this.data.children.length > 0 ? 1 : 0
    );
    this.rootGroup.add(btn.getBtn());
    this.data.btn = btn;
    this.data.lineStartPos = { x: cx + rootW / 2, y: cy };
    this.data.childStartY = cy - getEndNodeNum(this.data) * nodeAreaHeight / 2;
    const traverseNode = (fatherNode) => {
      const level = fatherNode.level + 1;
      fatherNode.children.forEach((n, i) => {
        n.level = level;
        n.fatherNode = fatherNode;
        const text2 = n.name;
        const w = text2 && text2 !== "" ? this._getTextWidth(n, level) : normalRect.w;
        const h = normalRect.h;
        let x = fatherNode.node.x + fatherNode.node.w + space.x;
        let y = fatherNode.childStartY;
        let silbingNodeNum = 0;
        const silbingNodes = fatherNode.children.slice(0, i);
        silbingNodes.forEach((n2) => {
          silbingNodeNum += getEndNodeNum(n2);
        });
        if (silbingNodeNum > 0) {
          y += silbingNodeNum * nodeAreaHeight;
        } else {
          y += nodeAreaHeight * i;
        }
        const nodeEndNum = getEndNodeNum(n);
        y += nodeEndNum * nodeAreaHeight / 2 - h / 2;
        const rect = this._getNode({
          x,
          y,
          w,
          h,
          data: n
        });
        fatherNode.group.add(rect.getNode());
        n.node = rect;
        const lineStartPos = {
          x: x + w,
          y: y + h / 2
        };
        n.lineStartPos = lineStartPos;
        const lineBeforeNode = this._getLine({
          x1: fatherNode.lineStartPos.x + space.x / 2,
          y1: fatherNode.lineStartPos.y,
          x2: lineStartPos.x,
          y2: lineStartPos.y
        });
        fatherNode.group.add(lineBeforeNode.getLine());
        n.lineBeforeNode = lineBeforeNode;
        if (n.children.length > 0) {
          const lineBeforeBtn2 = this._getLine({
            x1: lineStartPos.x,
            y1: lineStartPos.y,
            x2: lineStartPos.x + space.x / 2,
            y2: lineStartPos.y
          });
          fatherNode.group.add(lineBeforeBtn2.getLine());
          n.lineBeforeBtn = lineBeforeBtn2;
        }
        n.childOrigin = [lineStartPos.x + space.x / 2, lineStartPos.y];
        n.childStartY = y + h / 2 - nodeEndNum * nodeAreaHeight / 2;
        if (n.children.length > 0) {
          const branchGroup = new zrender$1.Group({
            // scale: animation.switch ? [0, 0] : [1, 1],
            origin: n.childOrigin
          });
          n.group = branchGroup;
          traverseNode(n);
          fatherNode.group.add(branchGroup);
          const unfoldBtn = this._getBtn(
            lineStartPos.x + space.x / 2,
            lineStartPos.y,
            n,
            1
          );
          fatherNode.group.add(unfoldBtn.getBtn());
          n.btn = unfoldBtn;
        } else if (n.children.length > 0) {
          const foldBtn = this._getBtn(
            lineStartPos.x + space.x / 2,
            lineStartPos.y,
            n,
            0
          );
          fatherNode.group.add(foldBtn.getBtn());
          n.btn = foldBtn;
        }
      });
    };
    traverseNode(this.data);
    if (animation.switch) {
      this.data.group.animateTo(
        {
          scale: [1, 1]
        },
        animation.time,
        animation.easing
      );
    }
    this.rootGroup.add(this.data.group);
    this.zr.add(this.rootGroup);
  }
  // 渲染脑图
  render() {
    this._generateMap();
  }
  // 取消选中状态
  cancelSelected() {
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach((n) => {
        n.node.cancelNode();
      });
      this.selectedNodes = [];
    }
  }
  // 编辑名字
  editName() {
    if (this.readonly) {
      return;
    }
    if (this.selectedNodes.length === 0) {
      this.onError("请选择节点");
    } else if (this.selectedNodes.length === 1) {
      const data = this.selectedNodes[0];
      data.node.editName();
      this.isEditingText = true;
    } else {
      this.onError("只能选择一个节点");
    }
  }
  // 设置脑图缩放
  zoomMap(scale) {
    this.viewport.zoom(scale);
  }
  // 移除监听事件, 释放内存
  dispose() {
    this.data = [];
    this.zr && this.zr.clear();
    this.zr && this.zr.dispose();
    this.viewport && this.viewport.dispose();
    document.removeEventListener("keydown", this._onKeyDown);
  }
}
export {
  Mindmap as default
};
