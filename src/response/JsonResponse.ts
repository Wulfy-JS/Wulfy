import Response from "./Response.js";

class JsonResponse extends Response<string> {
	public getHeaders() {
		return Object.assign(super.getHeaders(), { "content-type": "application/json" });
	}
	public setContent(content: any) {
		super.setContent(JSON.stringify(content));
		return this;
	}
}

export default JsonResponse;
