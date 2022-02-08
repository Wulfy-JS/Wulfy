
import RawResponse from "./StringResponce.js";

class JsonResponse extends RawResponse {
	public getHeaders() {
		return Object.assign(super.getHeaders(), { "content-type": "application/json" });
	}

	public setContent(content: any): this {
		return super.setContent(JSON.stringify(content));
	}
}

export default JsonResponse;
