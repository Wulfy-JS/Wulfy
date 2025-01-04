import { Controller, HttpError, HttpCodes, Error, Route } from "../index.js";

@Route // path: '/'
class IndexController extends Controller {
	@Route // { method: 'get', path: "/" }
	public index() {
		this.text("Hello, World!");
	}

	@Route("/json")
	public test_json() {
		this.json({ id: 0, name: "World", age: 1e9 });
	}

	@Route("/redirect")
	public test_redirect() {
		this.redirect("https://google.com/", HttpCodes.FOUND);
	}

	@Route("/timeout")
	public test_timeout() {
		setTimeout(() => this.res.end("Hello, Timeout"), 2000);
	}

	@Route({
		path: /\/test\/(\d+)$/,
		match: (matches) => {
			return {
				id: parseInt(matches[1])
			}
		},
	})
	public async test_params({ id }: { id: number }) {
		this.text(`Hello, Test #${id}!`);
	}

	@Route("test")
	public test_error() {
		throw new HttpError(500);
	}

	@Error(404)
	public error404() {
		this.res.statusCode = 404;
		this.text("IndexController: 404 Not found");
	}

	@Error({ min: 400, max: 500 })
	public error(error: HttpError) {
		this.text(`IndexControllerError: ${error.code} - ${error.message}\n${error.stack}`)
	}
}


export default IndexController;
