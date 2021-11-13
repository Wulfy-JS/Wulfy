// import { readFileSync } from "fs";
// import { join } from "path";

import RouteHandler from "./RouteHandler.js";
import RouteMap from "./RouteMap.js";
import RouteOptions from "./RouteOptions.js";
import StaticRoute from "./StaticRoute.js";

type Route = RouteOptions<string | RegExp> & RouteHandler;

class RoutingConfigurator {
	constructor(routes: RouteMap, staticRoute: StaticRoute, root: string = "/") {
		this.root = root;
		this.routes = routes;
		this.staticRoute = staticRoute;
	}

	private readonly root: string;
	private readonly routes: RouteMap;
	private readonly staticRoute: StaticRoute;

	// public import(file: string) {
	// 	const raw = readFileSync(join(this.root, file));
	// 	const routes = <NodeJS.Dict<{
	// 		path: string,
	// 		method?: string,
	// 		controller: string
	// 	}>>JSON.parse(raw.toString());

	// 	for (const name in routes) {
	// 		const route = routes[name];
	// 		const controller = route.controller;
	// 		delete route.controller;
	// 		const options = {
	// 			method: "get",
	// 			...route,
	// 			name
	// 		};
	// 		options.method = options.method.toLowerCase();
	// 		this.routes.set(options, controller);
	// 	}
	// }

	public setRoute(route: Route) {
		this.routes.set({
			name: route.name,
			path: route.path,
			method: route.method || "get"
		}, {
			controller: route.controller,
			handler: route.handler || "index"
		});
	}

	public setStatic(path: string, folder: string) {
		this.staticRoute.path = path;
		this.staticRoute.folder = folder;
	}
}

export default RoutingConfigurator;
