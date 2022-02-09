import Controller from "../../Controller/Controller";
import Request from "../../Request/Request";
import Route from "../../Router/Route.dec";

@Route("/")
class TestController extends Controller {
	@Route({ name: "index" })
	protected index(request: Request, params: NodeJS.Dict<string>) {
		return this.response("HELLO!");
	}

	@Route({ name: "asd", path: "/asd/(\\d+)" })
	protected test(params: any) {
		return this.json({ name: "test", params });
	}
}

export default TestController;
