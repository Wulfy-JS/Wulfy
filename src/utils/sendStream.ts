import { Readable } from "stream";
import { Response } from "../Router/HttpMethod.js";

function sendStream(stream: Readable, res: Response) {
	stream.pipe(res);
	return new Promise<void>((r, c) => {
		stream.on('error', err => c(err))
		stream.on('close', () => r())
	})
}

export default sendStream;
