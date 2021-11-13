import { ServerResponse } from "http";
import BaseResponse from "./BaseResponse.js";

class Response extends BaseResponse<string | Buffer> {
	protected __response(res: ServerResponse) {
		const content = this.getContent();
		if (content != null) res.write(content);
		res.end();
	}
}

export default Response;
