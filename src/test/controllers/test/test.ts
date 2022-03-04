import Controller from "../../../Controller/Controller";
import Request from "../../../Request/Request";
import Route from "../../../Router/Decorator/Route";

class TestController extends Controller {
	protected index(request: Request, params: NodeJS.Dict<string>) {
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
