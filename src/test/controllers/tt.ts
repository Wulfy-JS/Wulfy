import Controller from "../../Controller/Controller";

class TestController extends Controller {
	// @Route({ name: "TT", path: "/tt" })
	index() {
		return this.response("Test")
	}
}


export default TestController;
