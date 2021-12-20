import { IncomingMessage } from "http";
import { BaseController, Route } from "../../..";

class TestController extends BaseController {
	protected index(params: NodeJS.Dict<string>, request: IncomingMessage) {
		return this.response("HELLO 2!");
	}
}

Route({
	name: "test",
	path: "/test",
	controller: TestController,
	handler: "index"
})

export default TestController;
