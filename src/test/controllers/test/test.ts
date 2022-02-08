import { IncomingMessage } from "http";
import Controller from "../../../Controller/Controller";
import Request from "../../../Request/Request";

class TestController extends Controller {
	protected index(request: Request, params: NodeJS.Dict<string>) {
		return this.response("HELLO 2!");
	}
}

// Route({
// 	name: "test",
// 	path: "/test",
// 	controller: TestController,
// 	handler: "index"
// })

export default TestController;
