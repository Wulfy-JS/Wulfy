import { ConstructorController } from "../Controller/Controller";
import Request from "../Request/Request";
import Response from "../Response/Response";
import RouteInfo from "./RouteInfo";
import { match } from "path-to-regexp";


class Route {
	public constructor(
		private routeinfo: RouteInfo,
		private controller: ConstructorController,
		private handler: string
	) { }

	public check(request: RouteInfo): boolean {
		return this.getParams(request) !== false;
	}

	public getParams(request: RouteInfo) {
		if (this.routeinfo.method != "all" && this.routeinfo.method != request.method) return false;
		return match(this.routeinfo.path)(request.path) || false;
	}

	public getResponse(request: Request): Response {
		const params = this.getParams(request);
		if (params === false)
			throw new ReferenceError("The route does not match the request.");

		//@ts-ignore
		const response: Response = (new this.controller()[this.handler])(request, params);
		if (!Response.isResponse(response))
			throw new ReferenceError(`Handler ${this.controller.name}.${this.handler} return not Response`);
		return response;
	}
}

export default Route;
