import ptr from "path-to-regexp";

import Response from "../Response/Response";
import Request from "../Request/Request";
import RouteInfo from "./RouteInfo";
import { ConstructorController, ControllerHandler } from "../Controller/Controller";
import { ListServices } from "../Service/Service";


class Route {
	public constructor(
		private routeinfo: RouteInfo,
		private controller: ConstructorController,
		private handler: string
	) { }

	public check(request: Request): boolean {
		return this.getParams(request) !== false;
	}

	public getParams(request: Request) {
		const routeMethods = Array.isArray(this.routeinfo.method) ? this.routeinfo.method.map(e => e.toLowerCase()) : this.routeinfo.method.toLowerCase();
		const requestMethod = request.method.toLowerCase();

		if (Array.isArray(routeMethods) && routeMethods.indexOf(requestMethod) == -1)
			return false;
		else if (routeMethods != "all" && routeMethods != requestMethod)
			return false;


		const _match = ptr.match<NodeJS.Dict<string>>(this.routeinfo.path)(request.path);
		if (!_match) return false;

		return _match.params || false;
	}

	public async getResponse(services: ListServices, request: Request): Promise<Response> {
		const params = this.getParams(request);
		if (params === false)
			throw new ReferenceError("The route does not match the request.");

		const controller = new this.controller(services);
		//@ts-ignore
		const handler: ControllerHandler = controller[this.handler];

		let response: Promise<Response> | Response = handler.apply(controller, [request, params]);
		if (response instanceof Promise)
			response = await response;

		if (!Response.isResponse(response))
			throw new ReferenceError(`Handler ${this.controller.name}.${this.handler} return not Response`);

		return response;
	}
}

export default Route;
