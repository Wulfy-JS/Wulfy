import { createReadStream, PathLike } from "fs";
import { ServerResponse } from "http";
import { Readable } from "stream";
import BaseResponse from "./BaseResponse.js";

class FileResponse extends BaseResponse<Readable> {
	protected __response(res: ServerResponse) {
		const content = this.getContent();
		if (content) content.pipe(res);
		else res.end();;
	}

	public setFile(path: PathLike) {
		this.setContent(createReadStream(path));
		return this;
	}
}

export default FileResponse;
