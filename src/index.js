import * as PIXI from "pixi.js"

function f(ex) {
	let prev = .5;
	return function() {
		return prev = ex * prev * (1 - prev);
	}
}

class FunctionRenderer extends PIXI.Texture {
	constructor({r_dim, f_dim, fn=f, skip_iters = 100, iters = 300}) {
		var rc = document.createElement('canvas');
		rc.width = r_dim.x;
		rc.height = r_dim.y;
		super(PIXI.BaseTexture.fromCanvas(rc))
		
		this.rc = rc
		
		this.skip_iters = skip_iters
		this.iters = iters
		this.fn = f
		this.f_dim = f_dim
		
		this.ctx = this.rc.getContext('2d')
		
		this.redraw()
	}
	
	redraw() {
		const rect = this.f_dim
		this.ctx.clearRect(0, 0, this.rc.width, this.rc.height);
		var id = this.ctx.createImageData(this.rc.width, this.rc.height);
		const ww = this.rc.width, hh = this.rc.height;
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
				id.data[ii+3] = 0xff;
			}
		}
		this.ctx.putImageData(id, 0, 0);
		this.update();
	}
}
	
var app = new PIXI.Application(1920, 1080, {backgroundColor: 0xffffff});
document.body.appendChild(app.view);

var gtx = new FunctionRenderer({r_dim: new PIXI.Point(1920*2-200, 1080*2-200), f_dim: new PIXI.Rectangle(0, 0, 4, 1)});
var ww = gtx.rc.width, hh = gtx.rc.height;
var spr = new PIXI.Sprite(gtx);
spr.width = app.renderer.width - 100;
spr.height = app.renderer.height - 100;
spr.interactive = true;
console.log(spr.scale.y);
//spr.scale.y *= -1;
//spr.anchor.y = 1;
window.aaa = app;
app.stage.addChild(spr);
app.stage.interactive = true;

var initial_p = null;
var initial_pg = null;
var gfx = new PIXI.Graphics();
app.stage.addChild(gfx);
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
	var lc = ev.data.global;
	upd_rect(initial_pg, lc.x - initial_pg.x, lc.y - initial_pg.y);
})
app.stage.on('pointerup', (ev) => {
	if(initial_p == null) return;
	var gd = ev.data.getLocalPosition(spr)
	console.log(gd.x, gd.y);

	var x0 = Math.min(initial_p.x, gd.x) / ww;
	var x1 = Math.max(initial_p.x, gd.x) / ww;
	var y0 = Math.min(initial_p.y, gd.y) / hh;
	var y1 = Math.max(initial_p.y, gd.y) / hh;
	
	var w = new PIXI.Rectangle(x0 * gtx.f_dim.width + gtx.f_dim.x, y0 * gtx.f_dim.height + gtx.f_dim.y, (x1 - x0) * gtx.f_dim.width, (y1 - y0) * gtx.f_dim.height);
	
	console.log(w.width)
	if(x0 == x0+w/ww) {
		return false;
	}

	if(w.x + w.width / ww != w.x && w.height != 0) {
		gtx.f_dim = w;
		gtx.redraw();
	}
	initial_p = initial_pg = null;
	gfx.clear()
})
document.getElementById('reset').addEventListener('click', (ev) => {
	gtx.f_dim = new PIXI.Rectangle(0, 0, 4, 1);
	gtx.redraw();
})
document.getElementById('redraw').addEventListener('click', (ev) => {
	gtx.redraw();
})
document.getElementById('skip').addEventListener('blur', (ev) => {
	gtx.skip_iters = parseInt(ev.target.value);
})
document.getElementById('iters').addEventListener('blur', (ev) => {
	gtx.iters = parseInt(ev.target.value);
})