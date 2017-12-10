class rect {
	constructor(x, y, w, h) {
		this.x = x; this.y = y; this.width = w; this.height = h;
	}
	clone() {
		return new rect(this.x, this.y, this.width, this.height);
	}
}
//const new rect = (x, y, w, h) => ({x: x, y: y, width: w, height: h})

const functions = {
	'Quadratic': {
		fn: function (ex) {
			let prev = 0;
			return function() {
				return prev = prev * prev + ex;
			}
		},
		bounds: new rect(-2, 2, 2.25, -4),
		desc: "x^2 + C"
	},
	'Logistic': {
		fn: function (ex) {
			let prev = .5;
			return function() {
				return prev = ex * prev * (1 - prev);
			}
		},
		bounds: new rect(2, 1, 2, -1),
		desc: "C * x * (1-x)"
	},
	'Cubic': {
		fn: function (ex) {
			let prev = 1;
			return function() {
				return prev = ex * prev * (1 - prev*prev / 3);
			}
		},
		bounds: new rect(-3, 2, 6, -4),
		desc: "C * x * (1 - x^2 /3)"
	},
	'Quartic': {
		fn: function (ex) {
			let prev = -1;
			return function() {
				const p2 = prev * prev;
				return prev = ex * p2 * (2 - p2);
			}
		},
		bounds: new rect(-2, 1.4, 4, -2.8),
		desc: "C * x^2 * (2 - x^2)"
	},
	'Sine': {
		fn: function (ex) {
			let prev = Math.PI / 2;
			return function() {
				return prev = ex * Math.sin(prev);
			}
		},
		bounds: new rect(-Math.PI * 3, Math.PI * 3, Math.PI * 6, -Math.PI * 6),
		desc: "C * sin(x)"
	},
	'Cosine': {
		fn: function (ex) {
			let prev = 0;
			return function() {
				return prev = ex * Math.cos(prev);
			}
		},
		bounds: new rect(-Math.PI * 3, Math.PI * 3, Math.PI * 6, -Math.PI * 6),
		desc: "C * cos(x)"
	},
	'Exponential': {
		fn: function (ex) {
			let prev = -1;
			return function() {
				return prev = ex * prev * Math.exp(prev);
			}
		},
		bounds: new rect(-5, 5, 35, -15),
		desc: "C * x * e^x"
	},
	'Tent': {
		fn: function (ex) {
			let prev = 0.5;
			return function() {
				return prev = ex * (.5-Math.abs(prev-.5));//(prev <= .5 ? prev : 1-prev);
			}
		},
		bounds: new rect(0, 1.0, 2, -1.01),
		desc: "C * (.5-abs(x-.5))"//"C * (x<.5?x:1-x)"
	}
};

export { functions };