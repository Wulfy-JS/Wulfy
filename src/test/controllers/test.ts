import { Route, Request, Controller, Logger } from "../..";

@Route("/")
class TestController extends Controller {
	@Route({ name: "index" })
	protected index(request: Request, params: NodeJS.Dict<string>) {
		return this.response("HELLO!");
	}

	@Route({ name: "asd", path: "asd/(\\d+)" })
	protected test(request: Request, params: any) {
		return this.json({ name: "test", params });
	}

	@Route({ name: "render", path: "render/:name(.*)" })
	protected _render(request: Request, params: any) {
		return this.render("index.njk", params);
	}
}

export default TestController;
