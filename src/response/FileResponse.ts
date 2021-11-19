import { createReadStream } from "fs";
import { ServerResponse } from "http";
import { Readable } from "stream";
import BaseResponse from "./BaseResponse.js";
import mime from "mime";

class FileResponse extends BaseResponse<Readable> {
	private _mime: string = "text/plain";
	private _encoding: BufferEncoding = "utf-8";

	protected __response(res: ServerResponse) {
		const content = this.getContent();
		res.setHeader("content-type", `${this._mime}; charset=${this._encoding}`)
		if (content) content.pipe(res);
		else res.end();
	}

	public setMime(mime: string) {
		this._mime = mime;
		return this;
	}
	public getMime() {
		return this._mime;
	}
	public setEncoding(encoding: BufferEncoding) {
		this._encoding = encoding;
		return this;
	}
	public getEncoding() {
		return this._encoding;
	}

	public setFile(path: string, encoding: BufferEncoding = "utf-8") {
		return this.setMime(mime.getType(path))
			.setEncoding(encoding)
			.setContent(createReadStream(path, { encoding }));
	}
}

export default FileResponse;
