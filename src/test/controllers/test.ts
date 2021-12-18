import { IncomingMessage } from "http";
import { BaseController, Route } from "../..";

@Route("/")
class TestController extends BaseController {
	@Route({ name: "index" })
	protected index(params: NodeJS.Dict<string>, request: IncomingMessage) {
		return this.response("HELLO!");
	}
}

export default TestController;
