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

export default IndexController;
