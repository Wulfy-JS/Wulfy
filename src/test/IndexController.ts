import Controller from "../Controller.js";
import HttpError from "../HttpError.js";
import { Error, Route, Router } from "../Route.js";

@Router({
	path: "/",
	name: "index"
})
class IndexController extends Controller {
	@Route({ path: "/" }) // { method: 'get', name: 'index', path: "/" }
	public index() {
		this.text("Hello, World!");
	}

	@Route({
		path: /\/test\/(\d+)$/,
		match: (matches) => {
			console.log(matches);
			return {
				id: parseInt(matches[1])
			}
		},
		name: "test"
	}) // { method: 'get', name: 'get', path: "/" }
	public test({ id }: { id: number }) {
		this.text(`Hello, Test #${id}!`);
	}

	@Route({ path: "test" })
	public test2() {
		throw new HttpError(500, "Fuck");
	}

	@Error(404)
	public error404() {
		this.res.statusCode = 404;
		this.text("Ooops... 404 Not found");
	}

	@Error({ min: 400, max: 500 })
	public error() {
		this.text(`Error ${this.res.statusCode}`)
	}
}

export default IndexController;
