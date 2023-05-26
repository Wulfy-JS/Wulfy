import { Controller, ErrorRoute, HttpError } from "../../index";

class ErrorController extends Controller {
	@ErrorRoute({ min: 500, max: 599 })
	public error5xx(mathces: any[], error: HttpError) {
		this.res.statusCode = error.code;
		this.res.end(`${error.code} - Something broken. ${error.message}`);
	}

	@ErrorRoute(404)
	public error404(mathces: any[], error: HttpError) {
		this.res.statusCode = error.code;
		this.res.end("ITS MY ERROR 404 AHAHAHAHAH<br/>" + error.message);
	}
}

export default ErrorController;
