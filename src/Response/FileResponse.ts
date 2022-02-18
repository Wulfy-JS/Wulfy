import mime from "mime";
import { createReadStream } from "fs";
import { Readable } from "stream";

import Response from "./Response";
import { Headers } from "../utils/Header";

export default class FileResponse extends Response<Readable> {
	private _mime: string = "text/plain";
	private _encoding: BufferEncoding = "utf-8";

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

	public getHeaders(): Readonly<Headers> {
		let type = `${this._mime}`;
		if (this._encoding) type += `; charset=${this._encoding}`;
		return Object.assign(super.getHeaders(), { "content-type": type });
	}

	public setFile(path: string, encoding: BufferEncoding = "utf-8") {
		return this.setMime(mime.getType(path) || "text/plain")
			.setEncoding(encoding)
			.setContent(createReadStream(path, { encoding }));
	}
}
