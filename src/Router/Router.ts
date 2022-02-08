import Request from "../Request/Request";
import Route from "./Route";
import "../utils/Map.ext"

export default class Router {
	private routes: Map<string, Route> = new Map();

	public registerRoute(name: string, route: Route) {
		if (this.routes.has(name))
			throw new RangeError(`Route "${name}" alredy been register.`);
	}

	public getRoute(request: Request): Route | undefined {
		return this.routes.find((name, route) => {
			return route.check(request);
		});
	}
}
