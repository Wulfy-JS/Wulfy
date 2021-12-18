import { IncomingMessage } from "http";
import { BaseController, Route } from "../..";

@Route("/")
class TestController extends BaseController {
	@Route({ name: "index" })
	protected index(params: NodeJS.Dict<string>, request: IncomingMessage) {
		return this.response("HELLO!");
	}

	@Route({ name: "asd", path: /\/asd\/(\d+)/ })
	protected test(params) {
		return this.json({ name: "test", params });
	}
}

export default TestController;
