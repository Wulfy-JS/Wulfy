import { createReadStream, PathLike } from "fs";
import { ServerResponse } from "http";
import { Readable } from "stream";
import BaseResponse from "./BaseResponse.js";
import mime from "mime";

class FileResponse extends BaseResponse<Readable> {
	protected __response(res: ServerResponse) {
		const content = this.getContent();
		if (content) content.pipe(res);
		else res.end();;
	}

	public setFile(path: string, encoding?: BufferEncoding) {
		this.setHeader("content-type", mime.getType(path) + (encoding || ""));
		this.setContent(createReadStream(path, { encoding: encoding }));
		return this;
	}
}

export default FileResponse;
