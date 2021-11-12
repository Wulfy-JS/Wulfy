
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
		const value = this.routes.findRouteAndKeyByPath(path, req.method);
		if (!value) {
			return new Response()
				.setStatus(404)
				.setContent(`Route "${path}" not found.`);
		}
		const [route, key, matches] = value;
		const dictArgs: NodeJS.Dict<string> = {};
		const mLength = matches.length;
		const keys = key.keys;

		if (mLength > 1) {
			if (keys.length == 0) {
				for (let i = 1; i < mLength; i++) {
					dictArgs[i - 1] = matches[i];
				}
			} else {

				for (let i = 0, lK = keys.length; i < lK; i++) {
					const key = keys[i];
					dictArgs[key.name] = matches[i + 1];
				}
			}
		}

		const response = new route.controller()[route.handler](dictArgs, req);

		if (!(response instanceof Response)) {
			return new Response()
				.setStatus(500)
				.setContent(`Controller "${route.controller.name}.${route.handler}" return not Response.`);
		}

		return response;
	}
}

export default Core;
