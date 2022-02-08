import Request from "../Request/Request";
import FileResponse from "../Response/FileResponse";
import JsonResponse from "../Response/JsonResponse";
import Response from "../Response/Response";
import RawResponse from "../Response/StringResponce";
import { Headers } from "../utils/Header";

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
}

interface ConstructorController {
	new(): Controller;
}

export { ConstructorController };
