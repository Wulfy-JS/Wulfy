import Request from "../Request/Request";
import Route from "./Route";
import "../utils/Map.ext"
import Logger from "../utils/Logger";

export default class Router {
	private routes: Map<string, Route> = new Map();

	public registerRoute(name: string, route: Route) {
		if (this.routes.has(name))
			throw new RangeError(`Route "${name}" alredy been register.`);

		this.routes.set(name, route);
	}

	public getRoute(request: Request): Route | undefined {
		return this.routes.find((name, route) => route.check(request));
	}
}
