import FileResponse from "../Response/FileResponse";
import JsonResponse from "../Response/JsonResponse";
import RawResponse from "../Response/RawResponse";
import Response from "../Response/Response";
import Request from "../Request/Request";

import { Headers } from "../utils/Header";
import { ListServices } from "../Service/Service";

const symbol = Symbol.for("Wulfy.Controller");

export default abstract class Controller {
	constructor(protected readonly services: ListServices) { }


	protected response(content: string | Buffer, status: number = 200, headers: Headers = {}) {
		return new RawResponse()
			.setStatus(status)
			.setHeaders(headers)
			.setContent(content);
	}

	protected json(obj: any, status: number = 200, headers: Headers = {}) {
		return new JsonResponse()
			.setContent(obj)
			.setStatus(status)
			.setHeaders(headers);
	}

	protected file(path: string, status: number = 200, headers: Headers = {}) {
		return new FileResponse()
			.setStatus(status)
			.setHeaders(headers)
			.setFile(path);
	}

	protected async render(file: string, params?: NodeJS.Dict<any>, status?: number, headers?: Headers): Promise<Response>;
	protected async render(file: string, params: { charset: BufferEncoding, [key: string]: string }, status?: number, headers?: Headers): Promise<Response>;
	protected async render(file: string, params: NodeJS.Dict<any> = {}, status: number = 200, headers: Headers = {}) {
		const charset = params.charset || undefined;
		delete params.charset;

		return (await this.services.NunjucksService.render(file, params, charset))
			.setStatus(status)
			.setHeaders(headers);
	}

	private get [symbol]() {
		return symbol;
	};
	public static isController(obj: any): obj is Controller {
		return obj[symbol] == symbol;
	}
}

interface ConstructorController {
	new(services: ListServices): Controller;
}
interface ControllerHandler {
	(request: Request, params: NodeJS.Dict<string>): Response;
}
export { ConstructorController, ControllerHandler };
