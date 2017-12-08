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
		const grf = this.grf, f_max = this.f_max, f_min = this.f_min;
		const w = f_max - f_min;
		this.cnt.removeChildren();
		this.cnt.addChild(grf);
		grf.clear()
		grf.beginFill(0x202020, 1)
		const a = [Math.log10(5), Math.log10(2), 0]
		const gradexp = -Math.log10(w / 10);
		const ip = gradexp | 0, fp = gradexp % 1;
		const rgxp = ip + a.find((x) => x <= fp)
		const gradation = Math.pow(10, -rgxp);
		const first = Math.ceil(f_min / gradation) * gradation;
		const n = Math.floor(w / gradation);
		console.log(gradation, first, n);
		for(let i = 0, x = first; i < n; i++, x += gradation) {
			const dxp = (x - f_min) * this.size / w;
			this.drawRect(dxp, 0, 2, 10);
			const txt = new PIXI.Text(x.toFixed(Math.ceil(rgxp)));
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
	constructor({r_dim, f_dim, fn=f, skip_iters = 1000, iters = 3000, darkness = 32}) {
		let rc = document.createElement('canvas');
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
		let id = this.ctx.createImageData(this.rc.width, this.rc.height);
		const ww = this.rc.width, hh = this.rc.height;
		const dk = this.darkness;
		for(let i = rect.x; i <= rect.x+rect.width; i+=(rect.width/ww)) {
			const it = this.fn(i);
			const x = (i - rect.x) / rect.width;
			const xx = (x * ww) | 0;
			for(let j = 0; j < this.skip_iters; j++) it();
			for(let j = 0; j < this.iters; j++) {
				let v = it();
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
const cc = new PIXI.Point(document.documentElement.clientWidth * window.devicePixelRatio, document.documentElement.clientHeight * window.devicePixelRatio);
const app = new PIXI.Application(cc.x - 180, cc.y - 50, {backgroundColor: 0xffffff});
document.getElementById('cc').appendChild(app.view);
app.view.style.width = app.renderer.width / window.devicePixelRatio + "px"

const frw = (app.renderer.width - 100), frh = (app.renderer.height - 100);
console.log(cc, app.renderer.width, app.renderer.height);
const frend = new FunctionRenderer({r_dim: new PIXI.Point(frw * 2, frh * 2), f_dim: new PIXI.Rectangle(0, 0, 4, 1)});
const gtx = frend.tex;
const ww = frend.rc.width, hh = frend.rc.height;
let container = new PIXI.Container();
const spr = new PIXI.Sprite(gtx);
let colorMatrix = new PIXI.filters.ColorMatrixFilter();
colorMatrix.enabled = true;
colorMatrix.negative();
spr.filters = [colorMatrix];
 window.qqq =colorMatrix;
 window.ss = spr;

//spr.width = frw
//spr.height = frh
spr.interactive = true;
console.log(spr.scale.y);

container.addChild(spr);
container.scale.x = container.scale.y = 0.5;
app.stage.addChild(container);
app.stage.interactive = true;

const h_axis = new Axis({f_min: 0, f_max: 4, vert: false, size: frw});
h_axis.cnt.position.y = frh;
app.stage.addChild(h_axis.cnt);
h_axis.redraw();
const v_axis = new Axis({f_min: 0, f_max: 1, vert: true, size: frh});
v_axis.cnt.position.x = frw;
app.stage.addChild(v_axis.cnt);
v_axis.redraw();

window.v_a = v_axis; window.h_a = h_axis;

const tx = new PIXI.Text();
tx.position.x = 10;
tx.position.y = 10;
app.stage.addChild(tx);

let initial_p = null;
let initial_pg = null;
let final_p = null;
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

const x0dom = document.getElementById('x0')
const y0dom = document.getElementById('y0')
const wdom = document.getElementById('w')
const hdom = document.getElementById('h')
function set_domwind() {
	x0dom.value = frend.f_dim.x
	y0dom.value = frend.f_dim.y
	wdom.value = frend.f_dim.width
	hdom.value = frend.f_dim.height
}
set_domwind();

function set_wind(w) {
	frend.f_dim = w;
	set_domwind();
	h_axis.f_min = w.x;
	h_axis.f_max = w.x + w.width;
	h_axis.redraw();
	v_axis.f_min = w.y;
	v_axis.f_max = w.y + w.height;
	v_axis.redraw();
	frend.redraw();
}
function upd_rect(pt, w, h) {
	//let g = new PIXI.Graphics();
	gfx.clear()
	gfx.lineStyle(1, 0xff0000);
	gfx.drawRect(pt.x, pt.y, w, h);
}
spr.on('pointerdown', (ev) => {
	if(!ev.data.originalEvent.isPrimary) return;
	if(initial_p != null) return;
	initial_p = ev.data.getLocalPosition(spr);
	initial_pg = ev.data.global.clone();
	final_p = initial_p;
	upd_rect(initial_pg, 0, 0);
})
spr.on('pointermove', (ev) => {
	if(initial_p == null) return;
	final_p = ev.data.getLocalPosition(spr);
	let lc = ev.data.global;
	upd_rect(initial_pg, lc.x - initial_pg.x, lc.y - initial_pg.y);
})
spr.on('pointermove', (ev) => {
	let pos = frend.loc_to_fn(ev.data.getLocalPosition(spr))
	let x_exp = -Math.log10(frend.f_dim.width) + 3;
	let y_exp = -Math.log10(frend.f_dim.height) + 3;
	tx.text = '(' + pos.x.toFixed(x_exp) + ', ' + pos.y.toFixed(y_exp) + ')';
})
const label = document.getElementById('label')
spr.on('rightclick', (ev) => { 
	console.log(ev.data.originalEvent);
	//ev.data.originalEvent.preventDefault();
	const pos = frend.loc_to_fn(ev.data.getLocalPosition(spr))
	const dd = document.getElementById('cis')
	const x_exp = -Math.log10(frend.f_dim.width) + 5;
	const y_exp = -Math.log10(frend.f_dim.height) + 5;
	let ch;
	while(ch = dd.lastChild) dd.removeChild(ch);
	/*for(let i of dd.children) {
		dd.removeChild(i);
	}*/
	const iter = frend.fn(pos.x);
	label.textContent = 'Iteration at ' + pos.x.toFixed(x_exp);
	for(let i = 0; i < frend.skip_iters; i++) iter();
	for(let i = 0; i < frend.iters; i++) {
		const c = document.createElement('li');
		c.textContent = iter().toFixed(y_exp);
		dd.appendChild(c);
	}
})
app.view.addEventListener('contextmenu', (ev) => { ev.preventDefault(); return false; });
let wind_queue = [];
document.body.addEventListener('pointerup', (ev) => {
	if(!ev.isPrimary) return;
	if(initial_p == null) return;
	let gd = final_p;
	console.log(gd.x, gd.y);

	const x0 = Math.min(initial_p.x, gd.x) / ww;
	const x1 = Math.max(initial_p.x, gd.x) / ww;
	const y0 = Math.min(initial_p.y, gd.y) / hh;
	const y1 = Math.max(initial_p.y, gd.y) / hh;
	
	let w = new PIXI.Rectangle(x0 * frend.f_dim.width + frend.f_dim.x, y0 * frend.f_dim.height + frend.f_dim.y, (x1 - x0) * frend.f_dim.width, (y1 - y0) * frend.f_dim.height);
	
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

const aaa = {'x0': 'x', 'y0': 'y', 'w': 'width', 'h': 'height'}
for(let k in aaa) {
	const v = aaa		[k];
	document.getElementById(k).addEventListener('blur', (ev) => {
		console.log(v, ev.target.value);
		frend.f_dim[v] = parseFloat(ev.target.value);
		set_wind(frend.f_dim)
	});
}