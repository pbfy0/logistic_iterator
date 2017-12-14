/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _functions = __webpack_require__(1);

onmessage = function onmessage(e) {
  //console.log(e);
  var fn = e.data.canvas ? render_canvas : e.data.is_le ? render_le : render_be;
  postMessage({
    id: fn(e.data.fdim, e.data.rdim, _functions.functions[e.data.fn].fn, e.data.skip_iters, e.data.iters)
  });
  close();
};

function render_le(rect, rdim, fn, skip_iters, iters) {
  var ww = rdim.x,
      hh = rdim.y;
  var ab = new Uint32Array(ww * hh);
  ab.fill(0xff000000);

  for (var cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
    var it = fn(i);

    for (var j = 0; j < skip_iters; j++) {
      it();
    }

    for (var _j = 0; _j < iters; _j++) {
      var v = it();
      var y = (v - rect.y) / rect.height;
      if (y < 0 || y >= 1) continue;
      var yy = y * hh | 0;
      var ii = yy * ww + cc;
      ab[ii]++;
    }

    if ((cc & 127) == 127) {
      postMessage({
        progress: 128
      });
    }
  }

  postMessage({
    progress: (ww + 1 & 127) - 1
  });
  var id = new ImageData(new Uint8ClampedArray(ab.buffer), ww, hh);
  return id;
}

function render_be(rect, rdim, fn, skip_iters, iters) {
  var ww = rdim.x,
      hh = rdim.y;
  var ab = new Uint32Array(ww * hh);
  ab.fill(0xff);

  for (var cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
    var it = fn(i);

    for (var j = 0; j < skip_iters; j++) {
      it();
    }

    for (var _j2 = 0; _j2 < iters; _j2++) {
      var v = it();
      var y = (v - rect.y) / rect.height;
      if (y < 0 || y >= 1) continue;
      var yy = y * hh | 0;
      var ii = yy * ww + cc;
      ab[ii] += 0x100;
    }

    if ((cc & 127) == 127) {
      postMessage({
        progress: 128
      });
    }
  }

  postMessage({
    progress: (ww + 1 & 127) - 1
  });
  var id = new ImageData(new Uint8ClampedArray(ab.buffer), ww, hh);
  return id;
}

function render_canvas(rect, rdim, fn, skip_iters, iters) {
  var ww = rdim.x,
      hh = rdim.y;
  var id = new ImageData(ww, hh);
  var ab = id.data;

  for (var cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
    var it = fn(i);

    for (var j = 0; j < skip_iters; j++) {
      it();
    }

    for (var _j3 = 0; _j3 < iters; _j3++) {
      var v = it();
      var y = (v - rect.y) / rect.height;
      if (y < 0 || y >= 1) continue;
      var yy = y * hh | 0;
      var ii = yy * ww + cc;
      ab[ii * 4 + 3]++; //= darkness;
    }

    if ((cc & 127) == 127) {
      postMessage({
        progress: 128
      });
    }
  }

  postMessage({
    progress: (ww + 1 & 127) - 1
  });
  return id;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.functions = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var rect =
/*#__PURE__*/
function () {
  function rect(x, y, w, h) {
    _classCallCheck(this, rect);

    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  _createClass(rect, [{
    key: "clone",
    value: function clone() {
      return new rect(this.x, this.y, this.width, this.height);
    }
  }]);

  return rect;
}(); //const new rect = (x, y, w, h) => ({x: x, y: y, width: w, height: h})


var functions = {
  'Quadratic': {
    fn: function fn(ex) {
      var prev = 0;
      return function () {
        return prev = prev * prev + ex;
      };
    },
    bounds: new rect(-2, 2, 2.25, -4),
    desc: "x^2 + C"
  },
  'Logistic': {
    fn: function fn(ex) {
      var prev = .5;
      return function () {
        return prev = ex * prev * (1 - prev);
      };
    },
    bounds: new rect(2, 1, 2, -1),
    desc: "C * x * (1-x)"
  },
  'Cubic': {
    fn: function fn(ex) {
      var prev = 1;
      return function () {
        return prev = ex * prev * (1 - prev * prev / 3);
      };
    },
    bounds: new rect(-3, 2, 6, -4),
    desc: "C * x * (1 - x^2 /3)"
  },
  'Quartic': {
    fn: function fn(ex) {
      var prev = -1;
      return function () {
        var p2 = prev * prev;
        return prev = ex * p2 * (2 - p2);
      };
    },
    bounds: new rect(-2, 1.4, 4, -2.8),
    desc: "C * x^2 * (2 - x^2)"
  },
  'Sine': {
    fn: function fn(ex) {
      var prev = Math.PI / 2;
      return function () {
        return prev = ex * Math.sin(prev);
      };
    },
    bounds: new rect(-Math.PI * 3, Math.PI * 3, Math.PI * 6, -Math.PI * 6),
    desc: "C * sin(x)"
  },
  'Cosine': {
    fn: function fn(ex) {
      var prev = 0;
      return function () {
        return prev = ex * Math.cos(prev);
      };
    },
    bounds: new rect(-Math.PI * 3, Math.PI * 3, Math.PI * 6, -Math.PI * 6),
    desc: "C * cos(x)"
  },
  'Exponential': {
    fn: function fn(ex) {
      var prev = -1;
      return function () {
        return prev = ex * prev * Math.exp(prev);
      };
    },
    bounds: new rect(-5, 5, 35, -15),
    desc: "C * x * e^x"
  },
  'Tent': {
    fn: function fn(ex) {
      var prev = 0.5;
      return function () {
        return prev = ex * (.5 - Math.abs(prev - .5)); //(prev <= .5 ? prev : 1-prev);
      };
    },
    bounds: new rect(0, 1.0, 2, -1.01),
    desc: "C * (.5-abs(x-.5))" //"C * (x<.5?x:1-x)"

  }
};
exports.functions = functions;

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDZjYWJhN2Y3Mzc0NzcwY2EwODkiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlcmVyLndvcmtlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZnVuY3Rpb25zLmpzIl0sIm5hbWVzIjpbIm9ubWVzc2FnZSIsImUiLCJmbiIsImRhdGEiLCJjYW52YXMiLCJyZW5kZXJfY2FudmFzIiwiaXNfbGUiLCJyZW5kZXJfbGUiLCJyZW5kZXJfYmUiLCJwb3N0TWVzc2FnZSIsImlkIiwiZmRpbSIsInJkaW0iLCJza2lwX2l0ZXJzIiwiaXRlcnMiLCJjbG9zZSIsInJlY3QiLCJ3dyIsIngiLCJoaCIsInkiLCJhYiIsIlVpbnQzMkFycmF5IiwiZmlsbCIsImNjIiwiaSIsIndpZHRoIiwiaXQiLCJqIiwidiIsImhlaWdodCIsInl5IiwiaWkiLCJwcm9ncmVzcyIsIkltYWdlRGF0YSIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiYnVmZmVyIiwidyIsImgiLCJmdW5jdGlvbnMiLCJleCIsInByZXYiLCJib3VuZHMiLCJkZXNjIiwicDIiLCJNYXRoIiwiUEkiLCJzaW4iLCJjb3MiLCJleHAiLCJhYnMiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEQTs7QUFDQUEsWUFBWSxtQkFB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SCxVQUFNO0FBUkcsR0FwRE87QUE4RGpCLGlCQUFlO0FBQ2R6QyxRQUFJLFlBQVVzQyxFQUFWLEVBQWM7QUFDakIsVUFBSUMsT0FBTyxDQUFDLENBQVo7QUFDQSxhQUFPLFlBQVc7QUFDakIsZUFBT0EsT0FBT0QsS0FBS0MsSUFBTCxHQUFZSSxLQUFLSSxHQUFMLENBQVNSLElBQVQsQ0FBMUI7QUFDQSxPQUZEO0FBR0EsS0FOYTtBQU9kQyxZQUFRLElBQUkxQixJQUFKLENBQVMsQ0FBQyxDQUFWLEVBQWEsQ0FBYixFQUFnQixFQUFoQixFQUFvQixDQUFDLEVBQXJCLENBUE07QUFRZDJCLFVBQU07QUFSUSxHQTlERTtBQXdFakIsVUFBUTtBQUNQekMsUUFBSSxZQUFVc0MsRUFBVixFQUFjO0FBQ2pCLFVBQUlDLE9BQU8sR0FBWDtBQUNBLGFBQU8sWUFBVztBQUNqQixlQUFPQSxPQUFPRCxNQUFNLEtBQUdLLEtBQUtLLEdBQUwsQ0FBU1QsT0FBSyxFQUFkLENBQVQsQ0FBZCxDQURpQixDQUN5QjtBQUMxQyxPQUZEO0FBR0EsS0FOTTtBQU9QQyxZQUFRLElBQUkxQixJQUFKLENBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsQ0FBakIsRUFBb0IsQ0FBQyxJQUFyQixDQVBEO0FBUVAyQixVQUFNLG9CQVJDLENBUW1COztBQVJuQjtBQXhFUyxDQUFsQiIsImZpbGUiOiJkNmNhYmE3ZjczNzQ3NzBjYTA4OS53b3JrZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBkNmNhYmE3ZjczNzQ3NzBjYTA4OSIsImltcG9ydCB7IGZ1bmN0aW9ucyB9IGZyb20gJy4vZnVuY3Rpb25zLmpzJztcbm9ubWVzc2FnZSA9IChlKSA9PiB7XG5cdC8vY29uc29sZS5sb2coZSk7XG5cdGNvbnN0IGZuID0gZS5kYXRhLmNhbnZhcyA/IHJlbmRlcl9jYW52YXMgOiBlLmRhdGEuaXNfbGUgPyByZW5kZXJfbGUgOiByZW5kZXJfYmU7XG5cdHBvc3RNZXNzYWdlKHtpZDogZm4oZS5kYXRhLmZkaW0sIGUuZGF0YS5yZGltLCBmdW5jdGlvbnNbZS5kYXRhLmZuXS5mbiwgZS5kYXRhLnNraXBfaXRlcnMsIGUuZGF0YS5pdGVycyl9KTtcblx0Y2xvc2UoKTtcbn1cbmZ1bmN0aW9uIHJlbmRlcl9sZShyZWN0LCByZGltLCBmbiwgc2tpcF9pdGVycywgaXRlcnMpIHtcblx0Y29uc3Qgd3cgPSByZGltLngsIGhoID0gcmRpbS55O1xuXHRjb25zdCBhYiA9IG5ldyBVaW50MzJBcnJheSh3dyAqIGhoKTtcblx0YWIuZmlsbCgweGZmMDAwMDAwKTtcblx0Zm9yKGxldCBjYyA9IDAsIGkgPSByZWN0Lng7IGNjIDwgd3c7IGNjKyssIGkgKz0gcmVjdC53aWR0aCAvIHd3KSB7XG5cdFx0Y29uc3QgaXQgPSBmbihpKTtcblx0XHRmb3IobGV0IGogPSAwOyBqIDwgc2tpcF9pdGVyczsgaisrKSBpdCgpO1xuXHRcdGZvcihsZXQgaiA9IDA7IGogPCBpdGVyczsgaisrKSB7XG5cdFx0XHRjb25zdCB2ID0gaXQoKTtcblx0XHRcdGNvbnN0IHkgPSAodiAtIHJlY3QueSkgLyByZWN0LmhlaWdodDtcblx0XHRcdGlmICh5IDwgMCB8fCB5ID49IDEpIGNvbnRpbnVlO1xuXHRcdFx0Y29uc3QgeXkgPSAoeSAqIGhoKSB8IDA7XG5cdFx0XHRjb25zdCBpaSA9ICh5eSp3dytjYyk7XG5cdFx0XHRhYltpaV0rKztcblx0XHR9XG5cdFx0aWYoKGNjICYgMTI3KSA9PSAxMjcpIHtcblx0XHRcdHBvc3RNZXNzYWdlKHtwcm9ncmVzczogMTI4fSlcblx0XHR9XG5cdH1cblx0cG9zdE1lc3NhZ2Uoe3Byb2dyZXNzOiAoKHd3ICsgMSkgJiAxMjcpIC0gMX0pO1xuXHRjb25zdCBpZCA9IG5ldyBJbWFnZURhdGEobmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGFiLmJ1ZmZlciksIHd3LCBoaCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyX2JlKHJlY3QsIHJkaW0sIGZuLCBza2lwX2l0ZXJzLCBpdGVycykge1xuXHRjb25zdCB3dyA9IHJkaW0ueCwgaGggPSByZGltLnk7XG5cdGNvbnN0IGFiID0gbmV3IFVpbnQzMkFycmF5KHd3ICogaGgpO1xuXHRhYi5maWxsKDB4ZmYpO1xuXHRmb3IobGV0IGNjID0gMCwgaSA9IHJlY3QueDsgY2MgPCB3dzsgY2MrKywgaSArPSByZWN0LndpZHRoIC8gd3cpIHtcblx0XHRjb25zdCBpdCA9IGZuKGkpO1xuXHRcdGZvcihsZXQgaiA9IDA7IGogPCBza2lwX2l0ZXJzOyBqKyspIGl0KCk7XG5cdFx0Zm9yKGxldCBqID0gMDsgaiA8IGl0ZXJzOyBqKyspIHtcblx0XHRcdGNvbnN0IHYgPSBpdCgpO1xuXHRcdFx0Y29uc3QgeSA9ICh2IC0gcmVjdC55KSAvIHJlY3QuaGVpZ2h0O1xuXHRcdFx0aWYgKHkgPCAwIHx8IHkgPj0gMSkgY29udGludWU7XG5cdFx0XHRjb25zdCB5eSA9ICh5ICogaGgpIHwgMDtcblx0XHRcdGNvbnN0IGlpID0gKHl5Knd3K2NjKTtcblx0XHRcdGFiW2lpXSArPSAweDEwMDtcblx0XHR9XG5cdFx0aWYoKGNjICYgMTI3KSA9PSAxMjcpIHtcblx0XHRcdHBvc3RNZXNzYWdlKHtwcm9ncmVzczogMTI4fSlcblx0XHR9XG5cdH1cblx0cG9zdE1lc3NhZ2Uoe3Byb2dyZXNzOiAoKHd3ICsgMSkgJiAxMjcpIC0gMX0pO1xuXHRjb25zdCBpZCA9IG5ldyBJbWFnZURhdGEobmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGFiLmJ1ZmZlciksIHd3LCBoaCk7XG5cdHJldHVybiBpZDtcbn1cblxuXG5mdW5jdGlvbiByZW5kZXJfY2FudmFzKHJlY3QsIHJkaW0sIGZuLCBza2lwX2l0ZXJzLCBpdGVycykge1xuXHRjb25zdCB3dyA9IHJkaW0ueCwgaGggPSByZGltLnk7XG5cdGNvbnN0IGlkID0gbmV3IEltYWdlRGF0YSh3dywgaGgpO1xuXHRjb25zdCBhYiA9IGlkLmRhdGE7XG5cdGZvcihsZXQgY2MgPSAwLCBpID0gcmVjdC54OyBjYyA8IHd3OyBjYysrLCBpICs9IHJlY3Qud2lkdGggLyB3dykge1xuXHRcdGNvbnN0IGl0ID0gZm4oaSk7XG5cdFx0Zm9yKGxldCBqID0gMDsgaiA8IHNraXBfaXRlcnM7IGorKykgaXQoKTtcblx0XHRmb3IobGV0IGogPSAwOyBqIDwgaXRlcnM7IGorKykge1xuXHRcdFx0Y29uc3QgdiA9IGl0KCk7XG5cdFx0XHRjb25zdCB5ID0gKHYgLSByZWN0LnkpIC8gcmVjdC5oZWlnaHQ7XG5cdFx0XHRpZiAoeSA8IDAgfHwgeSA+PSAxKSBjb250aW51ZTtcblx0XHRcdGNvbnN0IHl5ID0gKHkgKiBoaCkgfCAwO1xuXHRcdFx0Y29uc3QgaWkgPSAoeXkqd3crY2MpO1xuXHRcdFx0YWJbaWkqNCszXSsrOy8vPSBkYXJrbmVzcztcblx0XHR9XG5cdFx0aWYoKGNjICYgMTI3KSA9PSAxMjcpIHtcblx0XHRcdHBvc3RNZXNzYWdlKHtwcm9ncmVzczogMTI4fSlcblx0XHR9XG5cdH1cblx0cG9zdE1lc3NhZ2Uoe3Byb2dyZXNzOiAoKHd3ICsgMSkgJiAxMjcpIC0gMX0pO1xuXHRyZXR1cm4gaWQ7XG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3JlbmRlcmVyLndvcmtlci5qcyIsImNsYXNzIHJlY3Qge1xuXHRjb25zdHJ1Y3Rvcih4LCB5LCB3LCBoKSB7XG5cdFx0dGhpcy54ID0geDsgdGhpcy55ID0geTsgdGhpcy53aWR0aCA9IHc7IHRoaXMuaGVpZ2h0ID0gaDtcblx0fVxuXHRjbG9uZSgpIHtcblx0XHRyZXR1cm4gbmV3IHJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblx0fVxufVxuLy9jb25zdCBuZXcgcmVjdCA9ICh4LCB5LCB3LCBoKSA9PiAoe3g6IHgsIHk6IHksIHdpZHRoOiB3LCBoZWlnaHQ6IGh9KVxuXG5jb25zdCBmdW5jdGlvbnMgPSB7XG5cdCdRdWFkcmF0aWMnOiB7XG5cdFx0Zm46IGZ1bmN0aW9uIChleCkge1xuXHRcdFx0bGV0IHByZXYgPSAwO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gcHJldiA9IHByZXYgKiBwcmV2ICsgZXg7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib3VuZHM6IG5ldyByZWN0KC0yLCAyLCAyLjI1LCAtNCksXG5cdFx0ZGVzYzogXCJ4XjIgKyBDXCJcblx0fSxcblx0J0xvZ2lzdGljJzoge1xuXHRcdGZuOiBmdW5jdGlvbiAoZXgpIHtcblx0XHRcdGxldCBwcmV2ID0gLjU7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gZXggKiBwcmV2ICogKDEgLSBwcmV2KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoMiwgMSwgMiwgLTEpLFxuXHRcdGRlc2M6IFwiQyAqIHggKiAoMS14KVwiXG5cdH0sXG5cdCdDdWJpYyc6IHtcblx0XHRmbjogZnVuY3Rpb24gKGV4KSB7XG5cdFx0XHRsZXQgcHJldiA9IDE7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gZXggKiBwcmV2ICogKDEgLSBwcmV2KnByZXYgLyAzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoLTMsIDIsIDYsIC00KSxcblx0XHRkZXNjOiBcIkMgKiB4ICogKDEgLSB4XjIgLzMpXCJcblx0fSxcblx0J1F1YXJ0aWMnOiB7XG5cdFx0Zm46IGZ1bmN0aW9uIChleCkge1xuXHRcdFx0bGV0IHByZXYgPSAtMTtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29uc3QgcDIgPSBwcmV2ICogcHJldjtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqIHAyICogKDIgLSBwMik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib3VuZHM6IG5ldyByZWN0KC0yLCAxLjQsIDQsIC0yLjgpLFxuXHRcdGRlc2M6IFwiQyAqIHheMiAqICgyIC0geF4yKVwiXG5cdH0sXG5cdCdTaW5lJzoge1xuXHRcdGZuOiBmdW5jdGlvbiAoZXgpIHtcblx0XHRcdGxldCBwcmV2ID0gTWF0aC5QSSAvIDI7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gZXggKiBNYXRoLnNpbihwcmV2KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoLU1hdGguUEkgKiAzLCBNYXRoLlBJICogMywgTWF0aC5QSSAqIDYsIC1NYXRoLlBJICogNiksXG5cdFx0ZGVzYzogXCJDICogc2luKHgpXCJcblx0fSxcblx0J0Nvc2luZSc6IHtcblx0XHRmbjogZnVuY3Rpb24gKGV4KSB7XG5cdFx0XHRsZXQgcHJldiA9IDA7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gZXggKiBNYXRoLmNvcyhwcmV2KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoLU1hdGguUEkgKiAzLCBNYXRoLlBJICogMywgTWF0aC5QSSAqIDYsIC1NYXRoLlBJICogNiksXG5cdFx0ZGVzYzogXCJDICogY29zKHgpXCJcblx0fSxcblx0J0V4cG9uZW50aWFsJzoge1xuXHRcdGZuOiBmdW5jdGlvbiAoZXgpIHtcblx0XHRcdGxldCBwcmV2ID0gLTE7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gZXggKiBwcmV2ICogTWF0aC5leHAocHJldik7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRib3VuZHM6IG5ldyByZWN0KC01LCA1LCAzNSwgLTE1KSxcblx0XHRkZXNjOiBcIkMgKiB4ICogZV54XCJcblx0fSxcblx0J1RlbnQnOiB7XG5cdFx0Zm46IGZ1bmN0aW9uIChleCkge1xuXHRcdFx0bGV0IHByZXYgPSAwLjU7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gZXggKiAoLjUtTWF0aC5hYnMocHJldi0uNSkpOy8vKHByZXYgPD0gLjUgPyBwcmV2IDogMS1wcmV2KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoMCwgMS4wLCAyLCAtMS4wMSksXG5cdFx0ZGVzYzogXCJDICogKC41LWFicyh4LS41KSlcIi8vXCJDICogKHg8LjU/eDoxLXgpXCJcblx0fVxufTtcblxuZXhwb3J0IHsgZnVuY3Rpb25zIH07XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2Z1bmN0aW9ucy5qcyJdLCJzb3VyY2VSb290IjoiIn0=