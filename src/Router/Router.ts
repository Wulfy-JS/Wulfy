import "../utils/Map.ext"

import Logger from "../utils/Logger";
import Request from "../Request/Request";
import Route from "./Route";

import { ConstructorController } from "../Controller/Controller";
import { getRouteAttributesKey, ROOT_ATTRIBUTES } from "./Route.dec";

export default class Router {
	private routes: Map<string, Route> = new Map();

	public registerRoute(name: string, route: Route) {
		if (this.routes.has(name))
			throw new RangeError(`Route "${name}" alredy been register.`);

		this.routes.set(name, route);
	}

	public registerRoutesFromController(controller: ConstructorController) {
		const key = getRouteAttributesKey(controller);
		const RouteSettings = controller.prototype[key];
		if (!RouteSettings) return;

		const rootPath = RouteSettings[ROOT_ATTRIBUTES] || "";

		for (const key in RouteSettings) {
			if (key == ROOT_ATTRIBUTES) continue;
			const routeDesc = RouteSettings[key];
			try {
				const routeinfo = {
					method: routeDesc.method || "all",
					path: rootPath + (routeDesc.path || "")
				};
				this.registerRoute(
					routeDesc.name,
					new Route(routeinfo, controller, key)
				)
				Logger.debug(routeinfo, `Register route ${routeDesc.name}`);
			} catch (e) {
				Logger.error(e);
			}
		}
	}

	public getRoute(request: Request): Route | undefined {
		return this.routes.find((name, route) => route.check(request));
	}
}
