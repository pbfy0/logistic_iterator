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
  postMessage({
    id: render(e.data.fdim, e.data.rdim, _functions.functions[e.data.fn].fn, e.data.skip_iters, e.data.iters, e.data.is_le)
  });
  close();
};

function render(rect, rdim, fn, skip_iters, iters, is_le) {
  //	console.log(rect, rdim, fn);
  var ww = rdim.x,
      hh = rdim.y;
  var ab = new Uint32Array(ww * hh);
  ab.fill(is_le ? 0xff000000 : 0xff); //console.log(ab.buffer);
  //console.log(rect);
  //for(let i = rect.x; i <= rect.x+rect.width; i+=(rect.width/ww)) {

  /*for(let i = 0; i < ww*hh; i ++) {
  	ab[i] = 0xff000000;
  }*/

  var o = is_le ? 1 : 0x100; //let offs = (Math.random() * 128) | 0;
  //let oo = 0;

  for (var cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
    //const i = rect.x + rect.width * v / ww;
    var it = fn(i); //const xx = (x * ww) | 0;

    for (var j = 0; j < skip_iters; j++) {
      it();
    }

    for (var _j = 0; _j < iters; _j++) {
      var v = it();
      var y = (v - rect.y) / rect.height;
      if (y < 0 || y >= 1) continue;
      var yy = y * hh | 0;
      var ii = yy * ww + cc;
      ab[ii] += o; //dk;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgY2FlMjBiNTUyZTg0NWU2MWIwMmQiLCJ3ZWJwYWNrOi8vLy4vc3JjL3JlbmRlcmVyLndvcmtlci5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZnVuY3Rpb25zLmpzIl0sIm5hbWVzIjpbIm9ubWVzc2FnZSIsImUiLCJwb3N0TWVzc2FnZSIsImlkIiwicmVuZGVyIiwiZGF0YSIsImZkaW0iLCJyZGltIiwiZm4iLCJza2lwX2l0ZXJzIiwiaXRlcnMiLCJpc19sZSIsImNsb3NlIiwicmVjdCIsInd3IiwieCIsImhoIiwieSIsImFiIiwiVWludDMyQXJyYXkiLCJmaWxsIiwibyIsImNjIiwiaSIsIndpZHRoIiwiaXQiLCJqIiwidiIsImhlaWdodCIsInl5IiwiaWkiLCJwcm9ncmVzcyIsIkltYWdlRGF0YSIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiYnVmZmVyIiwidyIsImgiLCJmdW5jdGlvbnMiLCJleCIsInByZXYiLCJib3VuZHMiLCJkZXNjIiwicDIiLCJNYXRoIiwiUEkiLCJzaW4iLCJjb3MiLCJleHAiLCJhYnMiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQzdEQTs7QUFDQUEsWUFBWSxtQkFBQ0MsQ0FBRCxFQUFPO0FBQ2xCO0FBQ0FDLGNBQVk7QUFBQ0Ms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QVlJLEtBQUtJLEdBQUwsQ0FBU1IsSUFBVCxDQUExQjtBQUNBLE9BRkQ7QUFHQSxLQU5hO0FBT2RDLFlBQVEsSUFBSTNCLElBQUosQ0FBUyxDQUFDLENBQVYsRUFBYSxDQUFiLEVBQWdCLEVBQWhCLEVBQW9CLENBQUMsRUFBckIsQ0FQTTtBQVFkNEIsVUFBTTtBQVJRLEdBOURFO0FBd0VqQixVQUFRO0FBQ1BqQyxRQUFJLFlBQVU4QixFQUFWLEVBQWM7QUFDakIsVUFBSUMsT0FBTyxHQUFYO0FBQ0EsYUFBTyxZQUFXO0FBQ2pCLGVBQU9BLE9BQU9ELE1BQU0sS0FBR0ssS0FBS0ssR0FBTCxDQUFTVCxPQUFLLEVBQWQsQ0FBVCxDQUFkLENBRGlCLENBQ3lCO0FBQzFDLE9BRkQ7QUFHQSxLQU5NO0FBT1BDLFlBQVEsSUFBSTNCLElBQUosQ0FBUyxDQUFULEVBQVksR0FBWixFQUFpQixDQUFqQixFQUFvQixDQUFDLElBQXJCLENBUEQ7QUFRUDRCLFVBQU0sb0JBUkMsQ0FRbUI7O0FBUm5CO0FBeEVTLENBQWxCIiwiZmlsZSI6ImNhZTIwYjU1MmU4NDVlNjFiMDJkLndvcmtlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGNhZTIwYjU1MmU4NDVlNjFiMDJkIiwiaW1wb3J0IHsgZnVuY3Rpb25zIH0gZnJvbSAnLi9mdW5jdGlvbnMuanMnO1xub25tZXNzYWdlID0gKGUpID0+IHtcblx0Ly9jb25zb2xlLmxvZyhlKTtcblx0cG9zdE1lc3NhZ2Uoe2lkOiByZW5kZXIoZS5kYXRhLmZkaW0sIGUuZGF0YS5yZGltLCBmdW5jdGlvbnNbZS5kYXRhLmZuXS5mbiwgZS5kYXRhLnNraXBfaXRlcnMsIGUuZGF0YS5pdGVycywgZS5kYXRhLmlzX2xlKX0pO1xuXHRjbG9zZSgpO1xufVxuZnVuY3Rpb24gcmVuZGVyKHJlY3QsIHJkaW0sIGZuLCBza2lwX2l0ZXJzLCBpdGVycywgaXNfbGUpIHtcbi8vXHRjb25zb2xlLmxvZyhyZWN0LCByZGltLCBmbik7XG5cdGNvbnN0IHd3ID0gcmRpbS54LCBoaCA9IHJkaW0ueTtcblx0Y29uc3QgYWIgPSBuZXcgVWludDMyQXJyYXkod3cgKiBoaCk7XG5cdGFiLmZpbGwoaXNfbGUgPyAweGZmMDAwMDAwIDogMHhmZik7XG5cdC8vY29uc29sZS5sb2coYWIuYnVmZmVyKTtcblx0Ly9jb25zb2xlLmxvZyhyZWN0KTtcblx0Ly9mb3IobGV0IGkgPSByZWN0Lng7IGkgPD0gcmVjdC54K3JlY3Qud2lkdGg7IGkrPShyZWN0LndpZHRoL3d3KSkge1xuXHQvKmZvcihsZXQgaSA9IDA7IGkgPCB3dypoaDsgaSArKykge1xuXHRcdGFiW2ldID0gMHhmZjAwMDAwMDtcblx0fSovXG5cdGNvbnN0IG8gPSBpc19sZSA/IDEgOiAweDEwMDtcblx0Ly9sZXQgb2ZmcyA9IChNYXRoLnJhbmRvbSgpICogMTI4KSB8IDA7XG5cdC8vbGV0IG9vID0gMDtcblx0Zm9yKGxldCBjYyA9IDAsIGkgPSByZWN0Lng7IGNjIDwgd3c7IGNjKyssIGkgKz0gcmVjdC53aWR0aCAvIHd3KSB7XG5cdFx0Ly9jb25zdCBpID0gcmVjdC54ICsgcmVjdC53aWR0aCAqIHYgLyB3dztcblx0XHRjb25zdCBpdCA9IGZuKGkpO1xuXHRcdC8vY29uc3QgeHggPSAoeCAqIHd3KSB8IDA7XG5cdFx0Zm9yKGxldCBqID0gMDsgaiA8IHNraXBfaXRlcnM7IGorKykgaXQoKTtcblx0XHRmb3IobGV0IGogPSAwOyBqIDwgaXRlcnM7IGorKykge1xuXHRcdFx0Y29uc3QgdiA9IGl0KCk7XG5cdFx0XHRjb25zdCB5ID0gKHYgLSByZWN0LnkpIC8gcmVjdC5oZWlnaHQ7XG5cdFx0XHRpZiAoeSA8IDAgfHwgeSA+PSAxKSBjb250aW51ZTtcblx0XHRcdGNvbnN0IHl5ID0gKHkgKiBoaCkgfCAwO1xuXHRcdFx0Y29uc3QgaWkgPSAoeXkqd3crY2MpO1xuXHRcdFx0YWJbaWldICs9IG87Ly9kaztcblx0XHR9XG5cdFx0aWYoKGNjICYgMTI3KSA9PSAxMjcpIHtcblx0XHRcdHBvc3RNZXNzYWdlKHtwcm9ncmVzczogMTI4fSlcblx0XHR9XG5cdH1cblx0cG9zdE1lc3NhZ2Uoe3Byb2dyZXNzOiAoKHd3ICsgMSkgJiAxMjcpIC0gMX0pO1xuXHRjb25zdCBpZCA9IG5ldyBJbWFnZURhdGEobmV3IFVpbnQ4Q2xhbXBlZEFycmF5KGFiLmJ1ZmZlciksIHd3LCBoaCk7XG5cdHJldHVybiBpZDtcbn1cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvcmVuZGVyZXIud29ya2VyLmpzIiwiY2xhc3MgcmVjdCB7XG5cdGNvbnN0cnVjdG9yKHgsIHksIHcsIGgpIHtcblx0XHR0aGlzLnggPSB4OyB0aGlzLnkgPSB5OyB0aGlzLndpZHRoID0gdzsgdGhpcy5oZWlnaHQgPSBoO1xuXHR9XG5cdGNsb25lKCkge1xuXHRcdHJldHVybiBuZXcgcmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXHR9XG59XG4vL2NvbnN0IG5ldyByZWN0ID0gKHgsIHksIHcsIGgpID0+ICh7eDogeCwgeTogeSwgd2lkdGg6IHcsIGhlaWdodDogaH0pXG5cbmNvbnN0IGZ1bmN0aW9ucyA9IHtcblx0J1F1YWRyYXRpYyc6IHtcblx0XHRmbjogZnVuY3Rpb24gKGV4KSB7XG5cdFx0XHRsZXQgcHJldiA9IDA7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBwcmV2ID0gcHJldiAqIHByZXYgKyBleDtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoLTIsIDIsIDIuMjUsIC00KSxcblx0XHRkZXNjOiBcInheMiArIENcIlxuXHR9LFxuXHQnTG9naXN0aWMnOiB7XG5cdFx0Zm46IGZ1bmN0aW9uIChleCkge1xuXHRcdFx0bGV0IHByZXYgPSAuNTtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqIHByZXYgKiAoMSAtIHByZXYpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym91bmRzOiBuZXcgcmVjdCgyLCAxLCAyLCAtMSksXG5cdFx0ZGVzYzogXCJDICogeCAqICgxLXgpXCJcblx0fSxcblx0J0N1YmljJzoge1xuXHRcdGZuOiBmdW5jdGlvbiAoZXgpIHtcblx0XHRcdGxldCBwcmV2ID0gMTtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqIHByZXYgKiAoMSAtIHByZXYqcHJldiAvIDMpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym91bmRzOiBuZXcgcmVjdCgtMywgMiwgNiwgLTQpLFxuXHRcdGRlc2M6IFwiQyAqIHggKiAoMSAtIHheMiAvMylcIlxuXHR9LFxuXHQnUXVhcnRpYyc6IHtcblx0XHRmbjogZnVuY3Rpb24gKGV4KSB7XG5cdFx0XHRsZXQgcHJldiA9IC0xO1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zdCBwMiA9IHByZXYgKiBwcmV2O1xuXHRcdFx0XHRyZXR1cm4gcHJldiA9IGV4ICogcDIgKiAoMiAtIHAyKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoLTIsIDEuNCwgNCwgLTIuOCksXG5cdFx0ZGVzYzogXCJDICogeF4yICogKDIgLSB4XjIpXCJcblx0fSxcblx0J1NpbmUnOiB7XG5cdFx0Zm46IGZ1bmN0aW9uIChleCkge1xuXHRcdFx0bGV0IHByZXYgPSBNYXRoLlBJIC8gMjtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqIE1hdGguc2luKHByZXYpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym91bmRzOiBuZXcgcmVjdCgtTWF0aC5QSSAqIDMsIE1hdGguUEkgKiAzLCBNYXRoLlBJICogNiwgLU1hdGguUEkgKiA2KSxcblx0XHRkZXNjOiBcIkMgKiBzaW4oeClcIlxuXHR9LFxuXHQnQ29zaW5lJzoge1xuXHRcdGZuOiBmdW5jdGlvbiAoZXgpIHtcblx0XHRcdGxldCBwcmV2ID0gMDtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqIE1hdGguY29zKHByZXYpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym91bmRzOiBuZXcgcmVjdCgtTWF0aC5QSSAqIDMsIE1hdGguUEkgKiAzLCBNYXRoLlBJICogNiwgLU1hdGguUEkgKiA2KSxcblx0XHRkZXNjOiBcIkMgKiBjb3MoeClcIlxuXHR9LFxuXHQnRXhwb25lbnRpYWwnOiB7XG5cdFx0Zm46IGZ1bmN0aW9uIChleCkge1xuXHRcdFx0bGV0IHByZXYgPSAtMTtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqIHByZXYgKiBNYXRoLmV4cChwcmV2KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJvdW5kczogbmV3IHJlY3QoLTUsIDUsIDM1LCAtMTUpLFxuXHRcdGRlc2M6IFwiQyAqIHggKiBlXnhcIlxuXHR9LFxuXHQnVGVudCc6IHtcblx0XHRmbjogZnVuY3Rpb24gKGV4KSB7XG5cdFx0XHRsZXQgcHJldiA9IDAuNTtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHByZXYgPSBleCAqICguNS1NYXRoLmFicyhwcmV2LS41KSk7Ly8ocHJldiA8PSAuNSA/IHByZXYgOiAxLXByZXYpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Ym91bmRzOiBuZXcgcmVjdCgwLCAxLjAsIDIsIC0xLjAxKSxcblx0XHRkZXNjOiBcIkMgKiAoLjUtYWJzKHgtLjUpKVwiLy9cIkMgKiAoeDwuNT94OjEteClcIlxuXHR9XG59O1xuXG5leHBvcnQgeyBmdW5jdGlvbnMgfTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvZnVuY3Rpb25zLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==