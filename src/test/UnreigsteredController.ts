import { Controller, Error, Route, Router } from "../index.js";
import App from "./App.js";

@Router({
	name: "unregistered",
	path: "/unreg"
})
class UnregisteredController extends Controller {
	@Route({ path: "/" })
	public index() {
		this.text("Hello, Unregistered!");
	}

	@Route({ path: '/disable' })
	public test_runtime_disable() {
		App.getInstance().router.unregister(UnregisteredController);
		this.text("Try reload page");
	}

	@Error([300, { min: 400, max: 499 }, 500, { min: 503, max: 599 }])
	public error() {
		this.text("Unreg " + this.res.statusCode);
	}
}

export default UnregisteredController;
