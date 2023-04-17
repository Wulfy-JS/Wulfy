import Controller from "../../Controller";
import Route from "../../Route";

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
	@Route({ name: "index", path: '/asd', methods: 'ALL' })
	public index() {
		this.response.write("Hello, Test!" + (this.request.secure ? " You sequre!" : ""));
		this.response.end();
	}

	@Route({ name: "test", path: '/asdaaas', methods: ['GET', 'PATCH'] })
	public test() {
		this.response.write("Hello, Test!" + (this.request.secure ? " You sequre!" : ""));
		this.response.end();
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
