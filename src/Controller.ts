import { IncomingMessage, ServerResponse } from "http";

abstract class Controller {
	constructor(
		protected readonly request: IncomingMessage,
		protected readonly response: ServerResponse
	) { }
}

export default Controller;
