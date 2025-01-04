import { Controller, Error, Route } from "../index.js";
import App from "./App.js";

@Route("/unreg")
class UnregisteredController extends Controller {
	@Route
	public index() {
		this.text("Hello, Unregistered!");
	}

	@Route('/disable')
	public test_runtime_disable() {
		App.getInstance().subRouter.unregister(UnregisteredController);
		this.text("Try reload page");
	}

	@Error([300, { min: 400, max: 499 }, 500, { min: 503, max: 599 }])
	public error() {
		this.text("Unreg " + this.res.statusCode);
	}
}

export default UnregisteredController;
