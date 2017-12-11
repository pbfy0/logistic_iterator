import { functions } from './functions.js';
onmessage = (e) => {
	//console.log(e);
	postMessage({id: render(e.data.fdim, e.data.rdim, functions[e.data.fn].fn, e.data.skip_iters, e.data.iters, e.data.is_le)});
	close();
}
function render(rect, rdim, fn, skip_iters, iters, is_le) {
//	console.log(rect, rdim, fn);
	const ww = rdim.x, hh = rdim.y;
	const ab = new Uint32Array(ww * hh);
	ab.fill(is_le ? 0xff000000 : 0xff);
	//console.log(ab.buffer);
	//console.log(rect);
	//for(let i = rect.x; i <= rect.x+rect.width; i+=(rect.width/ww)) {
	/*for(let i = 0; i < ww*hh; i ++) {
		ab[i] = 0xff000000;
	}*/
	const o = is_le ? 1 : 0x100;
	for(let cc = 0, i = rect.x; cc < ww; cc++, i += rect.width / ww) {
		//const i = rect.x + rect.width * v / ww;
		const it = fn(i);
		const x = (i - rect.x) / rect.width;
		//const xx = (x * ww) | 0;
		for(let j = 0; j < skip_iters; j++) it();
		for(let j = 0; j < iters; j++) {
			const v = it();
			const y = (v - rect.y) / rect.height;
			if (y < 0 || y >= 1) continue;
			const yy = (y * hh) | 0;
			const ii = (yy*ww+cc);
			ab[ii] += o;//dk;
		}
		if((cc & 127) == 127) {
			postMessage({progress: 128})
		}
	}
	postMessage({progress: ((ww + 1) & 127) - 1});
	const id = new ImageData(new Uint8ClampedArray(ab.buffer), ww, hh);
	return id;
}