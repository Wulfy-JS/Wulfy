import Controller from "../../Controller/Controller";
import RawResponse from "../../Response/StringResponce";
import Route from "../../Router/Route.dec";

class TestController extends Controller {
	@Route({ name: "TT", path: "/tt" })
	public index(): RawResponse {
		return this.response("Test")
	}
}


export default TestController;
