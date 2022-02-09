import Controller from "../../Controller/Controller";
import Route from "../../Router/Route.dec";

class TestController extends Controller {
	@Route({ name: "TT", path: "/tt" })
	index() {
		return this.response("Test")
	}
}


export default TestController;
