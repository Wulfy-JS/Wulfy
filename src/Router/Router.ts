import Route from "./Route";

export default class Router {
	private routes: Map<string, Route> = new Map();
	public registerRoute(name: string, route: Route) {
		if (this.routes.has(name))
			throw new RangeError(`Route "${name}" alredy been register.`);
	}

	public getRoute(): Route {
		//@ts-ignore
		return;
	}
}
