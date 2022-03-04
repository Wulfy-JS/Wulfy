import Controller from "../../Controller/Controller";
import RawResponse from "../../Response/RawResponse";
import Route from "../../Router/Decorator/Route";

class TestController extends Controller {
	@Route({ name: "TT", path: "/tt" })
	public index(): RawResponse {
		return this.response("Test")
	}
}


export default TestController;
