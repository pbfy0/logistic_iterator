import * as PIXI from "pixi.js"
import { functions } from './functions.js'
const default_fn = 'Logistic';
let cur_fn_name = default_fn;

function is_le() {
	const a = new Uint32Array(1);
	a[0] = 1;
	const b = new Uint8Array(a.buffer);
	return a[0] == 1;
}

const _le = is_le();

import rend_worker from './renderer.worker.js'
console.log(rend_worker);

const selector = document.getElementById('chooser');
for(let k in functions) {
	const e = document.createElement('option');
	const v = functions[k];
	e.value = k;
	e.textContent = k + ' (' + v.desc + ')'
	selector.appendChild(e);
}

selector.value = default_fn;

selector.addEventListener('change', (ev) => {
	select_fn(ev.target.value);
});


const log10abs = (x) => Math.log10(Math.abs(x));

const x0dom = document.getElementById('x0')
const y0dom = document.getElementById('y0')
const x1dom = document.getElementById('x1')
const y1dom = document.getElementById('y1')

//const default_dim = 
let default_dim;
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
		const gradexp = -log10abs(w / 10);
		const ip = Math.floor(gradexp), fp = gradexp - ip;
		const rgxp = ip + a.find((x) => x <= fp)
		const gradation = Math.pow(10, -rgxp) * (w < 0 ? -1 : 1);
		const first = Math.ceil(f_min / gradation) * gradation;
		const n = Math.floor((f_max - first) / gradation) + 1;//(w % gradation == 0);
		//console.log(f_min, f_max, gradation, first, n);
		const digits = Math.max(0, Math.ceil(rgxp));
		for(let i = 0, x = first; i < n; i++, x += gradation) {
			const dxp = (x - f_min) * this.size / w;
			//console.log(i, x, dxp, x, f_min, this.size, w);
			this.drawRect(dxp, 0, 2, 10);
			const txt = new PIXI.Text(x.toFixed(digits), {fontSize: 18});
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
	constructor({r_dim, f_dim, fn, skip_iters = 1000, iters = 3000, darkness = 32}) {
		const rc = document.createElement('canvas');
		rc.width = r_dim.x;
		rc.height = r_dim.y;
		this.r = PIXI.autoDetectRenderer({width: r_dim.x, height: r_dim.y, transparent: true});
		this.tex = PIXI.Texture.fromCanvas(rc);
		this.spr = new PIXI.Sprite(this.tex);
		this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
		//this.colorMatrix.enabled = true;
		//this.colorMatrix.negative();
		this.spr.filters = [this.colorMatrix];

		
		this.otex = PIXI.Texture.fromCanvas(this.r.view);
		//this.otex = null;
		this.ospr = new PIXI.Sprite(this.otex);
		this.rc = rc
		
		this.skip_iters = skip_iters
		this.iters = iters
		this.fn = fn
		this.f_dim = f_dim
		this._sd(darkness);
		
		this.ctx = this.rc.getContext('2d')
		
		//this.redraw()
	}
	
	_sd(d){ 
		this.colorMatrix.matrix = is_le ? 
		[0, 0, 0, 0, 0,
		 0, 0, 0, 0, 0,
		 0, 0, 0, 0, 0,	
		 d, d * 0x100, d * 0x10000, 0, 0] : 
		 [0, 0, 0, 0, 0,
		 0, 0, 0, 0, 0,
		 0, 0, 0, 0, 0,	
		 d * 0x10000, d * 0x100, d, 0, 0];
		/*this.colorMatrix._loadMatrix( 
		[d, 0, 0, 0, 0,
		 0, d, 0, 0, 0,
		 0, 0, d, 0, 0,
		 //0x1, 0x100, 0x10000, 0x1000000, 0], true);
		 0, 0, 0, d, 0], true);*/
		 //console.log(this.colorMatrix.matrix)
		
	}
	
	set_darkness(d){
		this._sd(d);
		this.r.render(this.spr);
		this.otex.update();
	}
	
	loc_to_fn(coord) {
		return new PIXI.Point(
			coord.x / this.rc.width * this.f_dim.width + this.f_dim.x,
			coord.y / this.rc.height * this.f_dim.height + this.f_dim.y,
		);
	}
	
	redraw(cb) {
		console.log('got redraw')
		const rect = this.f_dim
		this.ctx.clearRect(0, 0, this.rc.width, this.rc.height);
		const cc = navigator.hardwareConcurrency || 4;
		const ww = this.rc.width, hh = this.rc.height;
		const rfrac = (ww / cc) | 0;
		const frac = rect.width / cc;
		const rdim = new PIXI.Point(rfrac, hh);
		let parts_received = 0;
		for(let i = 0, fx = 0, rx = 0; i < cc; i++, fx += frac, rx += rfrac) {
			const rw = new rend_worker();
			rw.addEventListener('message', (ev) => {
				//console.log(ev.data.id);
				this.ctx.putImageData(ev.data.id, rx, 0);
				parts_received++;
				if(parts_received == cc) {
					this.tex.update();
					this.r.render(this.spr);
					this.otex.update();
					if(cb) cb();
				}
			});
			rw.postMessage({fdim: new PIXI.Rectangle(rect.x + fx, rect.y, frac, rect.height), rdim: rdim, fn: cur_fn_name, skip_iters: this.skip_iters, iters: this.iters, is_le: _le});
		}
	}
}
const cc = new PIXI.Point(document.documentElement.clientWidth * window.devicePixelRatio, document.documentElement.clientHeight * window.devicePixelRatio);
const app = new PIXI.Application(cc.x - 180, cc.y - 50, {backgroundColor: 0xffffff});
document.getElementById('cc').appendChild(app.view);
app.view.style.width = app.renderer.width / window.devicePixelRatio + "px"

const frw = (app.renderer.width - 80), frh = (app.renderer.height - 80);
//console.log(cc, app.renderer.width, app.renderer.height);
const frend = new FunctionRenderer({r_dim: new PIXI.Point(frw * 2, frh * 2)});

const h_axis = new Axis({vert: false, size: frw});
h_axis.cnt.position.y = frh;
app.stage.addChild(h_axis.cnt);
h_axis.redraw();
const v_axis = new Axis({vert: true, size: frh});
v_axis.cnt.position.x = frw;
app.stage.addChild(v_axis.cnt);
v_axis.redraw();

//window.v_a = v_axis; window.h_a = h_axis;

function select_fn(name) {
	const o = functions[name];
	//console.log(o);
	cur_fn_name = name;
	frend.fn = o.fn;
	default_dim = o.bounds;
	set_wind(default_dim);
}
//window.sf = select_fn;
//frend.f_dim = default_dim.clone();
//frend.fn = f;
//window.f = frend;
//const gtx = frend.otex;
const ww = frend.rc.width, hh = frend.rc.height;
const spr = frend.ospr;//new PIXI.Sprite(gtx);
// window.ss = spr;
const ltx = new PIXI.Text('Loading...');
ltx.position.x = 10;
ltx.position.y = 50;
//ltx.visible = false;
app.stage.addChild(ltx);

select_fn(default_fn);

spr.width = frw
spr.height = frh
spr.interactive = true;
app.stage.addChild(spr);
app.stage.interactive = true;

const tx = new PIXI.Text(null, {fontSize: 20});
tx.position.x = 10;
tx.position.y = 10;
app.stage.addChild(tx);

let initial_p = null;
let initial_pg = null;
let final_p = null;
const gfx = new PIXI.Graphics();
app.stage.addChild(gfx);

function set_domwind() {
	x0dom.value = frend.f_dim.x
	y0dom.value = frend.f_dim.y
	x1dom.value = frend.f_dim.width + frend.f_dim.x
	y1dom.value = frend.f_dim.height + frend.f_dim.y
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
	spr.visible = false;
	ltx.visible = true;
	frend.redraw(() => {
		spr.visible = true;
		ltx.visible = false;
	});
}
//window.sw = set_wind
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
	const lc = ev.data.global;
	upd_rect(initial_pg, lc.x - initial_pg.x, lc.y - initial_pg.y);
})
spr.on('pointermove', (ev) => {
	const pos = frend.loc_to_fn(ev.data.getLocalPosition(spr))
	const x_exp = Math.max(-log10abs(frend.f_dim.width) + 3, 0);
	const y_exp = Math.max(-log10abs(frend.f_dim.height) + 3, 0);
	tx.text = '(' + pos.x.toFixed(x_exp) + ', ' + pos.y.toFixed(y_exp) + ')';
})
const hhe = document.getElementById('hh')
const dd = document.getElementById('cis')
function clear_iters() {
	let ch;
	while(ch = dd.lastChild) dd.removeChild(ch);
	while(ch = hhe.lastChild) hhe.removeChild(ch);
}
spr.on('rightclick', (ev) => { 
	//ev.data.originalEvent.preventDefault();
	const pos = frend.loc_to_fn(ev.data.getLocalPosition(spr))
	const x_exp = Math.max(-log10abs(frend.f_dim.width) + 5, 0);
	const y_exp = Math.max(-log10abs(frend.f_dim.height) + 5, 0);
	clear_iters();
	/*for(let i of dd.children) {
		dd.removeChild(i);
	}*/
	const iter = frend.fn(pos.x);
	const aa = document.createElement('div');
	aa.textContent = 'Iteration at ' + pos.x.toFixed(x_exp);
	hhe.appendChild(aa);
	const clb = document.createElement('button');
	clb.textContent = "Clear"
	clb.addEventListener('click', (ev) => { clear_iters(); });
	hhe.appendChild(clb);
	for(let i = 0; i < frend.skip_iters; i++) iter();
	const first = iter();
	let ai = (i) => {
		const c = document.createElement('li');
		c.textContent = iter().toFixed(y_exp);
		dd.appendChild(c);
	}
	ai(first);
	let cl = -1;
	for(let i = 0; i < frend.iters-1; i++) {
		const a = iter();
		if(cl == -1 && a === first) {
			cl = i + 1;
		}
		ai(a);
	}
	const cle = document.createElement('div')
	cle.textContent = cl == -1 ? 'No cycle found' : 'Cycle length: ' + cl
	hhe.appendChild(cle);
})
app.view.addEventListener('contextmenu', (ev) => { ev.preventDefault(); return false; });
let wind_queue = [];
document.body.addEventListener('pointerup', (ev) => {
	if(!ev.isPrimary) return;
	if(initial_p == null) return;
	const gd = final_p;
	//console.log(gd.x, gd.y);

	const x0 = Math.min(initial_p.x, gd.x) / ww;
	const x1 = Math.max(initial_p.x, gd.x) / ww;
	const y0 = Math.min(initial_p.y, gd.y) / hh;
	const y1 = Math.max(initial_p.y, gd.y) / hh;
	
	const w = new PIXI.Rectangle(x0 * frend.f_dim.width + frend.f_dim.x, y0 * frend.f_dim.height + frend.f_dim.y, (x1 - x0) * frend.f_dim.width, (y1 - y0) * frend.f_dim.height);
	
	if(w.x + w.width / ww != w.x && w.height != 0) {
		wind_queue.push(frend.f_dim);
		set_wind(w);
	}
	initial_p = initial_pg = final_p = null;
	gfx.clear()
})
document.getElementById('reset').addEventListener('click', (ev) => {
	wind_queue = [];
	set_wind(default_dim.clone());
})
document.getElementById('redraw').addEventListener('click', (ev) => {
	//console.log(frend.f_dim);
	set_wind(frend.f_dim);
})
document.getElementById('revert').addEventListener('click', (ev) => {
	const v = wind_queue.pop();
	//console.log(v);
	if(v !== undefined) set_wind(v);
})
document.getElementById('skip').addEventListener('blur', (ev) => {
	frend.skip_iters = parseInt(ev.target.value);
})
document.getElementById('darkness').addEventListener('input', (ev) => {
	frend.set_darkness(Math.pow(2, parseFloat(ev.target.value)));
})
document.getElementById('iters').addEventListener('blur', (ev) => {
	frend.iters = parseInt(ev.target.value);
})

//const aaa = {'x0': 'x', 'y0': 'y', 'w': 'width', 'h': 'height'}
function add_listener(elem, setter) {
	let orig_v = null;
	elem.addEventListener('focus', (ev) => {
		orig_v = ev.target.value;
	});
	elem.addEventListener('blur', (ev) => {
		if(orig_v == ev.target.value) return;
		orig_v = null;
		setter(parseFloat(ev.target.value));
		//set_wind(frend.f_dim)
	});

}

add_listener(x0dom, (v) => { frend.f_dim.width -= v - frend.f_dim.x; frend.f_dim.x = v; });
add_listener(x1dom, (v) => { frend.f_dim.width = v - frend.f_dim.x; });
add_listener(y0dom, (v) => { frend.f_dim.height -= v - frend.f_dim.y; frend.f_dim.y = v; });
add_listener(y1dom, (v) => { frend.f_dim.height = v - frend.f_dim.y; });
