import Controller from "../Controller.js";
import { Error, Route, Router } from "../Route.js";

@Router({
	name: "unregistered",
	path: "/unreg"
})
class UnregisteredController extends Controller {
	@Route({ path: "/" })
	public index() {
		this.text("Hello, Unregistered!");
	}

	@Error([300, { min: 400, max: 499 }, 500, { min: 503, max: 599 }])
	public error() {
		this.text("Unreg " + this.res.statusCode);
	}
}

export default UnregisteredController;
