import { Controller, HttpError, Route } from "../../index";

@Route("/", "index")
class IndexController extends Controller {
	@Route({ name: "index", path: '' })
	public index() {
		this.response.write("Hello, World!" + (this.request.secure ? " You sequre!" : ""));
		this.response.end();
	}
}




@Route("/test", "test", 'GET')
class TestController extends Controller {
	@Route({ name: "index", path: '', methods: 'ALL' })
	public index() {
		const nunj = this.getService("nunjucks");
		const service = this.getService("test");
		console.log(service.getValue());
		this.res.end(nunj.render("error.njk", { error: { code: service.getValue() } }));
	}

	@Route({ name: "test_asd", path: '/asd', methods: ['GET', 'PATCH'] })
	public test() {
		this.text("Hello, Test 2!");
	}

	@Route({ name: "error", path: '/error', methods: ['GET'] })
	public error() {
		throw new HttpError("Oops...");
	}
}
class TestClass {
	constructor() {
		console.log("Im test class")
	}
}

const PI = 3.14;

export default IndexController;
export { TestController, TestClass, PI };
