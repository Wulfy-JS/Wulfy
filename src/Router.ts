import { glob } from "glob";
import { resolve } from "path";
import { match } from "path-to-regexp";
import { ControllerSettings, HttpMethod, RouteSettings } from "./Route";

class Router {
	//list[url_path] = controller_path;
	private list: Map<ControllerSettings, string> = new Map();

	public async configure(path: string) {
		const files = await glob(resolve(path, "**/*.js"));
		files.forEach(file => this.loadController(file))
		console.log(files);
	}

	public async loadController(path: string) {
		const module = await import(path);
		for (const name in module) {
			const controller = module[name];
			if (typeof controller !== "function") continue;
			const controllerMeta: Undefined<ControllerSettings> = Reflect.getMetadata(Reflect.Controller, controller);
			if (!controllerMeta) continue;
			this.list.set(controllerMeta, path);
		}
	}

	public async getRoute(path: string, method: HttpMethod) {
		console.log({ path, method })
		for (const [controller, controllerPath] of this.list.entries()) {
			if (controller.methods != "ALL" && controller.methods.indexOf(method) == -1)
				continue;
			if (!path.startsWith(controller.path))
				continue;
			console.log("Controller:", controller)
			for (const i in controller.routes) {
				const route = controller.routes[i];
				if (!route) continue;
				if (route.methods != "ALL" && route.methods.indexOf(method) == -1)
					continue;
				console.log("Route:", route);

				const matches = match(route.path)(path);
				if (matches === false) continue;
				// return await import(path)
			}
		}
	}
}

export default Router;
