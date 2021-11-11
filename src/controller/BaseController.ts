import JsonResponse from "../response/JsonResponse.js";
import Response, { Content, HeaderDict } from "../response/Response.js";

interface BaseControllerConstructor {
	new(): BaseController;
}

abstract class BaseController {
	constructor() {
		this.__init();
	}
	protected __init() { };

	protected index(): Response {
		return this.response("Index controller not implements", 404);
	}

	protected response(content: Content, status: number = 200, headers: HeaderDict = {}) {
		return new Response()
			.setStatus(status)
			.setHeaders(headers)
			.setContent(content);
	}

	protected json(obj: any, status: number = 200, headers: HeaderDict = {}) {
		return new JsonResponse()
			.setContent(obj)
			.setStatus(status)
			.setHeaders(headers);
	}
}


export default BaseController;
export { BaseControllerConstructor };
