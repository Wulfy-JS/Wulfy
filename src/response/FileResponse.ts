import { createReadStream } from "fs";
import { ServerResponse } from "http";
import { Readable } from "stream";
import BaseResponse from "./BaseResponse.js";
import mime from "mime";

class FileResponse extends BaseResponse<Readable> {
	private _mime: string = "text/plain";
	private _encoding: BufferEncoding = null;

	protected __response(res: ServerResponse) {
		const content = this.getContent();
		let type = `${this._mime}`;
		if (this._encoding)
			type += `; charset=${this._encoding}`;
		res.setHeader("content-type", type)
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

	public setFile(path: string, encoding: BufferEncoding = null) {
		return this.setMime(mime.getType(path))
			.setEncoding(encoding)
			.setContent(createReadStream(path, { encoding }));
	}
}

export default FileResponse;
