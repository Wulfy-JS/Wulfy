import { createReadStream, PathLike } from "fs";
import { Readable } from "stream";
import Response from "./Response.js";

class FileResponse extends Response<Readable> {
	public setFile(path: PathLike) {
		this.setContent(createReadStream(path));
		return this;
	}
}

export default FileResponse;
