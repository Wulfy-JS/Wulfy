import Request from "../Request/Request";
import FileResponse from "../Response/FileResponse";
import JsonResponse from "../Response/JsonResponse";
import Response from "../Response/Response";
import RawResponse from "../Response/StringResponce";
import { Headers } from "../utils/Header";
const symbol = Symbol.for("Wulfy.Controller");

export default abstract class Controller {
	constructor() {
		// loadServices()
	}


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

	private [symbol] = symbol;
	public static isController(obj: any): obj is Controller {
		return obj[symbol] == symbol;
	}
}

interface ConstructorController {
	new(): Controller;
}
interface ControllerHandler {
	(request: Request, params: NodeJS.Dict<string>): Response;
}
export { ConstructorController, ControllerHandler };
