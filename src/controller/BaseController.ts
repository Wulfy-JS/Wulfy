import { IncomingMessage } from "http";
import { FileResponse } from "../index.js";
import RenderView from "../RenderView.js";
import BaseResponse, { HeaderDict } from "../response/BaseResponse.js";
import JsonResponse from "../response/JsonResponse.js";
import Response from "../response/Response.js";


interface BaseControllerConstructor {
	new(): BaseController;
}

abstract class BaseController {
	constructor() {
		this.__init();
	}
	protected __init() { };

	protected index(params: NodeJS.Dict<string>, request: IncomingMessage): BaseResponse {
		return this.response("Index controller not implements", 404);
	}

	protected response(content: string | Buffer, status: number = 200, headers: HeaderDict = {}) {
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

	protected file(path: string, status: number = 200, headers: HeaderDict = {}) {
		return new FileResponse()
			.setStatus(status)
			.setHeaders(headers)
			.setFile(path);
	}

	protected async render(file: string, params: NodeJS.Dict<any> = {}, status: number = 200, headers: HeaderDict = {}) {
		return (await new RenderView().render(file, params))
			.setStatus(status)
			.setHeaders(headers);
	}
}


export default BaseController;
export { BaseControllerConstructor };
