import { createReadStream, existsSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";

import mime from "mime";
import ServiceList from "./Services/ServiceList";
import Service from "./Services/Service";

type Header = number | string | string[];
type Headers = NodeJS.Dict<Header>;

abstract class Controller {

	constructor(
		protected readonly request: IncomingMessage,
		protected readonly response: ServerResponse,
		private readonly services: ServiceList
	) { }

	//Alias for this.request
	protected get req() { return this.request }
	//Alias for this.response
	protected get res() { return this.response }

	//Send string or Buffer
	protected text(data: string | Buffer, code: number = 200, headers: Headers = {}) {
		this.response.writeHead(code, headers);
		this.response.write(data);
		this.response.end();
	}

	//Send JSON
	protected json(data: any, code: number = 200, headers: Headers = {}) {
		this.response.writeHead(code, {
			...headers,
			"content-type": "application/json"
		});
		this.response.write(JSON.stringify(data));
		this.response.end();
	}

	protected file(path: string, code: number = 200, headers: Headers = {}) {
		if (!existsSync(path)) throw new ReferenceError("File noty Found");

		this.res.writeHead(code, {
			...headers,
			"content-type": mime.getType(path) || "text/plain"
		})
		createReadStream(path).pipe(this.res);
	}

	public getService(name: string): Service {
		return this.services.get(name);
	}
}

export default Controller;
