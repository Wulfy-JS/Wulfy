import { BaseController, Route } from "../..";

class TestController extends BaseController {
	@Route({ name: "TT", path: "/tt" })
	index() {
		return this.response("Test")
	}
}


export default TestController;
