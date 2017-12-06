import * as PIXI from "pixi.js"

function f(ex) {
	let prev = .5;
	return function() {
		return prev = ex * prev * (1 - prev);
	}
}

class Axis {
	constructor({min_divs, max_divs, f_min, f_max, vert, size}) {
		this.min_divs = min_divs;
		this.max_divs = max_divs;
		this.vert = vert;
		this.f_min = f_min;
		this.f_max = f_max;
		this.size = size;
		this.grf = new PIXI.Graphics();
		this.cnt = new PIXI.Container();
		if(vert) this.drawRect = (x, y, w, h) => this.grf.drawRect(y, x, h, w)
		else this.drawRect = (x, y, w, h) => this.grf.drawRect(x, y, w, h)
	}
	
	setPos(obj, x, y) {
		if(this.vert) { obj.y = x; obj.x = y; }
		else { obj.x = x; obj.y = y; }
	}
	
	redraw() {
		let grf = this.grf, f_max = this.f_max, f_min = this.f_min;
		let w = f_max - f_min;
		this.cnt.removeChildren();
		this.cnt.addChild(grf);
		grf.clear()
		grf.beginFill(0x202020, 1)
		let a = [Math.log10(5), Math.log10(2), 0]
		let gradexp = -Math.log10(w / 10);
		let ip = gradexp | 0, fp = gradexp % 1;
		let rgxp = ip + a.find((x) => x <= fp)
		let gradation = Math.pow(10, -rgxp);
		let first = Math.ceil(f_min / gradation) * gradation;
		let n = Math.floor(w / gradation);
		console.log(gradation, first, n);
		for(let i = 0, x = first; i < n; i++, x += gradation) {
			let dxp = (x - f_min) * this.size / w;
			this.drawRect(dxp, 0, 2, 10);
			let txt = new PIXI.Text(x.toFixed(Math.ceil(rgxp)));
			/*if(!this.vert) */txt.rotation = Math.PI / 8 - this.vert * Math.PI / 2;
			this.setPos(txt.position, dxp, 12);
			txt.anchor.y = 0.5
			//this.setPos(txt.anchor, 0, 0.5);
			this.cnt.addChild(txt);
		}
		this.drawRect(0, 0, this.size, 3);
		grf.endFill();
	}
}


class FunctionRenderer {
	constructor({r_dim, f_dim, fn=f, skip_iters = 100, iters = 300, darkness = 0xff}) {
		var rc = document.createElement('canvas');
		rc.width = r_dim.x;
		rc.height = r_dim.y;
		this.tex = PIXI.Texture.fromCanvas(rc);		
		this.rc = rc
		
		this.skip_iters = skip_iters
		this.iters = iters
		this.fn = f
		this.f_dim = f_dim
		this.darkness = darkness;
		
		this.ctx = this.rc.getContext('2d')
		
		this.redraw()
	}
	
	loc_to_fn(coord) {
		return new PIXI.Point(
			coord.x / this.rc.width * this.f_dim.width + this.f_dim.x,
			coord.y / this.rc.height * this.f_dim.height + this.f_dim.y,
		);
	}
	
	redraw() {
		const rect = this.f_dim
		this.ctx.clearRect(0, 0, this.rc.width, this.rc.height);
		var id = this.ctx.createImageData(this.rc.width, this.rc.height);
		const ww = this.rc.width, hh = this.rc.height;
		const dk = this.darkness;
		for(var i = rect.x; i <= rect.x+rect.width; i+=(rect.width/ww)) {
			const it = this.fn(i);
			const x = (i - rect.x) / rect.width;
			const xx = (x * ww) | 0;
			for(let j = 0; j < this.skip_iters; j++) it();
			for(let j = 0; j < this.iters; j++) {
				var v = it();
				const y = (v - rect.y) / rect.height;
				const yy = (y * hh) | 0;
				if (yy < 0 || yy > ww) continue;
				const ii = (yy*ww+xx)*4;
				id.data[ii+3] += dk;
			}
		}
		this.ctx.putImageData(id, 0, 0);
		this.tex.update();
	}
}
	
var app = new PIXI.Application(1920, 1080, {backgroundColor: 0xffffff});
document.body.appendChild(app.view);

var frend = new FunctionRenderer({r_dim: new PIXI.Point(1920*2-200, 1080*2-200), f_dim: new PIXI.Rectangle(0, 0, 4, 1)});
var gtx = frend.tex;
var ww = frend.rc.width, hh = frend.rc.height;
var spr = new PIXI.Sprite(gtx);
spr.width = app.renderer.width - 100;
spr.height = app.renderer.height - 100;
spr.interactive = true;
console.log(spr.scale.y);

app.stage.addChild(spr);
app.stage.interactive = true;

let h_axis = new Axis({f_min: 0, f_max: 4, vert: false, size: 1820});
h_axis.cnt.position.y = 980;
app.stage.addChild(h_axis.cnt);
h_axis.redraw();
let v_axis = new Axis({f_min: 0, f_max: 1, vert: true, size: 980});
v_axis.cnt.position.x = 1820;
app.stage.addChild(v_axis.cnt);
v_axis.redraw();

window.v_a = v_axis; window.h_a = h_axis;

var tx = new PIXI.Text();
tx.position.x = 10;
tx.position.y = 10;
app.stage.addChild(tx);

var initial_p = null;
var initial_pg = null;
var final_p = null;
var gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

function set_wind(w) {
	frend.f_dim = w;
	h_axis.f_min = w.x;
	h_axis.f_max = w.x + w.width;
	h_axis.redraw();
	v_axis.f_min = w.y;
	v_axis.f_max = w.y + w.height;
	v_axis.redraw();
	frend.redraw();
}
function upd_rect(pt, w, h) {
	//var g = new PIXI.Graphics();
	gfx.clear()
	gfx.lineStyle(1, 0xff0000);
	gfx.drawRect(pt.x, pt.y, w, h);
}
spr.on('pointerdown', (ev) => {
	if(initial_p != null) return;
	initial_p = ev.data.getLocalPosition(spr);
	initial_pg = ev.data.global.clone();
	upd_rect(initial_pg, 0, 0);
})
spr.on('pointermove', (ev) => {
	if(initial_p == null) return;
	final_p = ev.data.getLocalPosition(spr);
	var lc = ev.data.global;
	upd_rect(initial_pg, lc.x - initial_pg.x, lc.y - initial_pg.y);
})
spr.on('pointermove', (ev) => {
	let pos = frend.loc_to_fn(ev.data.getLocalPosition(spr))
	let x_exp = -Math.log10(frend.f_dim.width) + 3;
	let y_exp = -Math.log10(frend.f_dim.height) + 3;
	tx.text = '(' + pos.x.toFixed(x_exp) + ', ' + pos.y.toFixed(y_exp) + ')';
})
let wind_queue = [];
document.body.addEventListener('pointerup', (ev) => {
	if(initial_p == null) return;
	var gd = final_p;
	console.log(gd.x, gd.y);

	var x0 = Math.min(initial_p.x, gd.x) / ww;
	var x1 = Math.max(initial_p.x, gd.x) / ww;
	var y0 = Math.min(initial_p.y, gd.y) / hh;
	var y1 = Math.max(initial_p.y, gd.y) / hh;
	
	var w = new PIXI.Rectangle(x0 * frend.f_dim.width + frend.f_dim.x, y0 * frend.f_dim.height + frend.f_dim.y, (x1 - x0) * frend.f_dim.width, (y1 - y0) * frend.f_dim.height);
	
	if(w.x + w.width / ww != w.x && w.height != 0) {
		wind_queue.push(frend.f_dim);
		set_wind(w);
	}
	initial_p = initial_pg = final_p = null;
	gfx.clear()
})
document.getElementById('reset').addEventListener('click', (ev) => {
	wind_queue = [];
	set_wind(new PIXI.Rectangle(0, 0, 4, 1));
})
document.getElementById('redraw').addEventListener('click', (ev) => {
	frend.redraw();
})
document.getElementById('revert').addEventListener('click', (ev) => {
	const v = wind_queue.pop();
	console.log(v);
	if(v !== undefined) set_wind(v);
})
document.getElementById('skip').addEventListener('blur', (ev) => {
	frend.skip_iters = parseInt(ev.target.value);
})
document.getElementById('darkness').addEventListener('blur', (ev) => {
	frend.darkness = parseInt(ev.target.value);
})
document.getElementById('iters').addEventListener('blur', (ev) => {
	frend.iters = parseInt(ev.target.value);
})