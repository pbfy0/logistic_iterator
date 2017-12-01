import * as PIXI from "pixi.js"

function f(ex) {
	var prev = .5;
	return function() {
		return prev = ex * prev * (1 - prev);
	}
}


//document.addEventListener('DOMContentLoaded', (ev) => {
	var cc = document.createElement('canvas');
	cc.width = 3640;
	cc.height = 1960;
	
	var ctx = cc.getContext('2d');
	//var dp = [];
	var ww = cc.width;
	var hh = cc.height;
	
	var app = new PIXI.Application(1920, 1080, {backgroundColor: 0xffffff});//, {backgroundColor : 0x1099bb});
	document.body.appendChild(app.view);
	
	var cnt = new PIXI.Container();
	app.stage.addChild(cnt);
	var gtx = PIXI.Texture.fromCanvas(cc);
	var spr = new PIXI.Sprite(gtx);
	spr.width = app.renderer.width - 100;
	spr.height = app.renderer.height - 100;
	spr.interactive = true;
	window.aaa = app;
	app.stage.addChild(spr);
	var skip_iters = 100;
	var iters = 300;
	
	var initial_p = null;
	var initial_pg = null;
	var cur_wnd = new PIXI.Rectangle(0, 0, 4, 1);
	function upd_rect(pt, w, h) {
		cnt.removeChildren();
		var g = new PIXI.Graphics();
		g.lineStyle(1, 0xff0000);
		g.drawRect(pt.x, pt.y, w, h);
		cnt.addChild(g);
	}
	spr.on('pointerdown', (ev) => {
		if(initial_p != null) return;
		initial_p = ev.data.getLocalPosition(spr);
		initial_pg = ev.data.global.clone();
		upd_rect(initial_pg, 0, 0);
	})
	spr.on('pointermove', (ev) => {
		if(initial_p == null) return;
		//console.log(initial_p)
		var lc = ev.data.global;
		upd_rect(initial_pg, lc.x - initial_pg.x, lc.y - initial_pg.y);
	})
	spr.on('pointerup', (ev) => {
		if(initial_p == null) return;
		var gd = ev.data.getLocalPosition(spr)
		//console.log(initial_p, gd);
		var x0 = Math.min(initial_p.x, gd.x) / ww;
		var x1 = Math.max(initial_p.x, gd.x) / ww;
		var y0 = Math.min(initial_p.y, gd.y) / hh;
		var y1 = Math.max(initial_p.y, gd.y) / hh;
		
		//console.log(x0, y0, x1, y1);
		//console.log(cur_wnd)
		if(x0 != x1 && y0 != y1) {
			cur_wnd = new PIXI.Rectangle(x0 * cur_wnd.width + cur_wnd.x, y0 * cur_wnd.height + cur_wnd.y, (x1 - x0) * cur_wnd.width, (y1 - y0) * cur_wnd.height);
			rr(cur_wnd);
		}
		initial_p = initial_pg = null;
		cnt.removeChildren();
	})
	document.getElementById('reset').addEventListener('click', (ev) => {
		rr(cur_wnd = new PIXI.Rectangle(0, 0, 4, 1));
	})
	document.getElementById('redraw').addEventListener('click', (ev) => {
		rr(cur_wnd);
	})
	document.getElementById('skip').addEventListener('blur', (ev) => {
		skip_iters = parseInt(ev.target.value);
	})
	document.getElementById('iters').addEventListener('blur', (ev) => {
		iters = parseInt(ev.target.value);
	})
	
	function rr(rect) {
		return render(rect.x, rect.y, rect.width, rect.height);
	}
	
	function render(x0, y0, w, h) {
		ctx.clearRect(0, 0, ww, hh);
		var id = ctx.createImageData(ww, hh);
		for(var i = x0; i <= x0+w; i+=(w/ww)) {
			//console.log(i);
			var it = f(i);
			for(var j = 0; j < skip_iters; j++) it();
			for(var j = 0; j < iters; j++) {
				var v = it();
				var x = (i - x0) / w;
				var y = (v - y0) / h;
				var xx = (x * ww) | 0;
				var yy = (y * hh) | 0;
				if (yy < 0 || yy > ww) continue;
				var ii = yy*ww*4+xx*4;
				/*id.data[ii] = 0;
				id.data[ii+1] = 0;
				id.data[ii+2] = 0;*/
				id.data[ii+3] = 0xff;
				//ctx.fillRect((x * 800) | 0, (y * 600) | 0, 1, 1);
				//dp.push({x: i, y: v});
			}
		}
		ctx.putImageData(id, 0, 0);
		gtx.update();
		//app.render();
	}
	window.r = render;
	rr(cur_wnd);
//})