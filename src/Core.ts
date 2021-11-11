
import { IncomingMessage, ServerResponse } from "http";
import { BaseControllerConstructor } from "./controller/BaseController.js";
import Response from "./response/Response.js";
import RouteMap from "./routing/RouteMap.js";
import RoutingConfigurator from "./routing/RoutingConfigurator.js";
import Config from "./utils/Config.js";

abstract class Core {
	protected readonly projectFolder = process.cwd();
	protected readonly routes = new RouteMap();
	// protected readonly config = new Config();

	private __inited = false;
	protected __init(): void { };

	private init() {
		if (this.__inited) return;

		this.configureRoutes(new RoutingConfigurator(this.routes, this.projectFolder));

		this.__init();
		this.__inited = true;
		return this;
	}

	protected __launch(): void { };

	public launch() {
		this.init();
		this.__launch();
	};
	public abstract shutdown(): void;

	protected configureRoutes(routes: RoutingConfigurator): void { }

	protected getResponse(req: IncomingMessage): Response {
		const path = req.url.split("?")[0];
		const route = this.routes.findRoute(path, req.method);
		if (!route) {
			return new Response()
				.setStatus(404)
				.setContent(`Route "${path}" not found.`);
		}
		const response = new route.controller()[route.handler]();

		if (!(response instanceof Response)) {
			return new Response()
				.setStatus(500)
				.setContent(`Controller "${route.controller.name}.${route.handler}" return not Response.`);
		}

		return response;
	}
}


export default Core;
