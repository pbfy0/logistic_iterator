import { functions } from './functions.js';
onmessage = (e) => {
	//console.log(e);
	const fn = e.data.canvas ? render_canvas : e.data.is_le ? render_le : render_be;
	postMessage({id: fn(e.data.fdim, e.data.rdim, functions[e.data.fn].fn, e.data.skip_iters, e.data.iters)});
	close();
}
function render_le(rect, rdim, fn, skip_iters, iters) {
	const ww = rdim.x, hh = rdim.y;
	const ab = new Uint32Array(ww * hh);
	ab.fill(0xff000000);
	for(let cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
		const it = fn(i);
		for(let j = 0; j < skip_iters; j++) it();
		for(let j = 0; j < iters; j++) {
			const v = it();
			const y = (v - rect.y) / rect.height;
			if (y < 0 || y >= 1) continue;
			const yy = (y * hh) | 0;
			const ii = (yy*ww+cc);
			ab[ii]++;
		}
		if((cc & 127) == 127) {
			postMessage({progress: 128})
		}
	}
	postMessage({progress: ((ww + 1) & 127) - 1});
	const id = new ImageData(new Uint8ClampedArray(ab.buffer), ww, hh);
	return id;
}

function render_be(rect, rdim, fn, skip_iters, iters) {
	const ww = rdim.x, hh = rdim.y;
	const ab = new Uint32Array(ww * hh);
	ab.fill(0xff);
	for(let cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
		const it = fn(i);
		for(let j = 0; j < skip_iters; j++) it();
		for(let j = 0; j < iters; j++) {
			const v = it();
			const y = (v - rect.y) / rect.height;
			if (y < 0 || y >= 1) continue;
			const yy = (y * hh) | 0;
			const ii = (yy*ww+cc);
			ab[ii] += 0x100;
		}
		if((cc & 127) == 127) {
			postMessage({progress: 128})
		}
	}
	postMessage({progress: ((ww + 1) & 127) - 1});
	const id = new ImageData(new Uint8ClampedArray(ab.buffer), ww, hh);
	return id;
}


function render_canvas(rect, rdim, fn, skip_iters, iters) {
	const ww = rdim.x, hh = rdim.y;
	const id = new ImageData(ww, hh);
	const ab = id.data;
	for(let cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
		const it = fn(i);
		for(let j = 0; j < skip_iters; j++) it();
		for(let j = 0; j < iters; j++) {
			const v = it();
			const y = (v - rect.y) / rect.height;
			if (y < 0 || y >= 1) continue;
			const yy = (y * hh) | 0;
			const ii = (yy*ww+cc);
			ab[ii*4+3]++;//= darkness;
		}
		if((cc & 127) == 127) {
			postMessage({progress: 128})
		}
	}
	postMessage({progress: ((ww + 1) & 127) - 1});
	return id;
}