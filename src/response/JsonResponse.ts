import { ServerResponse } from "http";
import BaseResponse from "./BaseResponse.js";

class JsonResponse extends BaseResponse<any> {
	public getHeaders() {
		return Object.assign(super.getHeaders(), { "content-type": "application/json" });
	}

	protected __response(res: ServerResponse) {
		const content = this.getContent();
		if (content != null)
			res.write(JSON.stringify(content));
		res.end();
	}
}

export default JsonResponse;
