
import { Readable } from "stream";
import { Request, Response } from "./Router/HttpMethod.js";
import { createReadStream, existsSync } from "fs";
import mime from 'mime';
import { extname } from "path";
import sendStream from "./utils/sendStream.js";
import { getMessageByCode, HttpCode } from "./HttpCodes.js";

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

	public redirect(location: string, code: HttpCode): void;
	public redirect(location: string, code: number, message: string): void;
	public redirect(location: string, code: HttpCode | number, message?: string): void {
		this.statusCode(code as number, message);
		this.res.setHeader('Location', location);
		this.res.end();
	}

	public statusCode(code: HttpCode): void;
	public statusCode(code: number, message?: string): void;
	public statusCode(code: HttpCode | number, message?: string): void {
		if (typeof code == "number") {
			message = message || getMessageByCode(code) || `Http Code ${code}`;
			this.res.statusCode = code;
			this.res.statusMessage = message;
		} else {
			this.res.statusCode = code.code;
			this.res.statusMessage = code.message;
		}
	}
}


export default Controller;
export { Controller };
