
import { Readable } from "stream";
import { Request, Response } from "./Wulfy.js";
import { createReadStream, existsSync } from "fs";
import mime from 'mime';
import { extname } from "path";
import sendStream from "./utils/sendStream.js";

class Controller {
	constructor(protected req: Request, protected res: Response) { }

	public json(object: any) {
		this.res.setHeader('content-type', "application/json; charset=utf-8");
		this.res.end(JSON.stringify(object));
	}

	public text(text: string) {
		this.res.setHeader('content-type', "text/plain; charset=utf-8");
		this.res.end(text);
	}

	public file(path: string) {
		if (!existsSync(path))
			throw new ReferenceError(`File ${path} is not exists.`);

		this.res.setHeader('content-type', mime.getType(extname(path)) || 'text/plain');
		return this.stream(createReadStream(path))
	}

	public stream(stream: Readable) {
		return sendStream(stream, this.res);
	}
}


export default Controller;
export { Controller };
