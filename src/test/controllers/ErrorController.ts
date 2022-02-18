import { Controller, Request, Route } from "../..";

@Route("/error")
class ErrorController extends Controller {
	@Route({ name: "error" })
	private index() {
		throw new Error("Test error page");
	}

	@Route({ name: "error_not_response", path: "/r" })
	private error_not_response() {
		return "not_response";
	}
}

export default ErrorController;
