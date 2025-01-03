import { Controller, HttpError, HttpCodes, Error, Route, Router } from "../index.js";

@Router({
	path: "/",
	name: "index"
})
class IndexController extends Controller {
	@Route({ path: "/" }) // { method: 'get', name: 'index', path: "/" }
	public index() {
		this.text("Hello, World!");
	}

	@Route({ path: "/json" })
	public test_json() {
		this.json({ id: 0, name: "World", age: 1e9 });
	}

	@Route({ path: "/redirect" })
	public test_redirect() {
		this.redirect("https://google.com/", HttpCodes.FOUND);
	}

	@Route({ path: "/timeout" })
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
		name: "test"
	}) // { method: 'get', name: 'get', path: "/" }
	public test_params({ id }: { id: number }) {
		this.text(`Hello, Test #${id}!`);
	}

	@Route({ path: "test" })
	public test_error() {
		throw new HttpError(500);
	}

	@Error(404)
	public error404() {
		this.res.statusCode = 404;
		this.text("Ooops... 404 Not found");
	}

	@Error({ min: 400, max: 500 })
	public error(error: HttpError) {
		this.text(`IndexControllerError: ${error.code} - ${error.message}\n${error.stack}`)
	}
}

export default IndexController;
