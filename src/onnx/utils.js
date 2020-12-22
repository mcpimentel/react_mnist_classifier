//import ndarray from "ndarray";
//import ops from "ndarray-ops";
import { Tensor } from "onnxjs";

export async function warmupModel(model, size) {
	// OK. we generate a random input and call Session.run() as a warmup query
	const warmupTensor = new Tensor(new Float32Array(size*size*4), "float32", [size, size, 4]);
	try {
		await model.run([warmupTensor]);
	} catch (e) {
		console.error(e);
	}
}

export function getTensorFromCanvasContext(ctx) {
	const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	const { data } = imageData;
    // const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
    const dataTensor = new Tensor(new Float32Array(data), "float32");
    return dataTensor;
}
