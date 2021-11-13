
import { existsSync, statSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { FileResponse } from "./index.js";
import BaseResponse from "./response/BaseResponse.js";
import Response from "./response/Response.js";
import RouteMap from "./routing/RouteMap.js";
import RoutingConfigurator from "./routing/RoutingConfigurator.js";
import StaticRoute from "./routing/StaticRoute.js";

abstract class Core {
	protected readonly projectFolder = process.cwd();
	protected readonly routes = new RouteMap();
	protected staticRoute: StaticRoute = {
		path: "/",
		folder: "/public"
	};
	// protected readonly config = new Config();

	private __inited = false;
	protected __init(): void { };

	private init() {
		if (this.__inited) return;

		this.configureRoutes(new RoutingConfigurator(this.routes, this.staticRoute, this.projectFolder));

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

	protected abstract configureRoutes(routes: RoutingConfigurator): void;

	private getStatic(path: string) {
		if (path.startsWith(this.staticRoute.path)) {
			const file = path.replace(this.staticRoute.path, "");
			const pathToFile = `${this.projectFolder}/${this.staticRoute.folder}/${file}`;

			if (existsSync(pathToFile) && statSync(pathToFile).isFile()) {
				return new FileResponse()
					.setStatus(200)
					.setFile(pathToFile);
			}
		}
		return false;
	}

	private async getResponse(req: IncomingMessage): Promise<BaseResponse> {
		const path = req.url.split("?")[0];

		if (["get", "head"].indexOf(req.method.toLowerCase()) != -1) {
			const staticResponse = this.getStatic(path);
			if (staticResponse)
				return staticResponse;
		}

		const value = this.routes.findRouteAndKeyByPath(path, req.method);
		if (!value) {
			return new Response()
				.setStatus(404)
				.setContent(`Route "${req.method.toUpperCase()}: ${path}" not found.`);
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

		let response = new route.controller()[route.handler](dictArgs, req);
		if (response instanceof Promise)
			response = await response;

		if (!(response instanceof BaseResponse)) {
			return new Response()
				.setStatus(500)
				.setContent(`Controller "${route.controller.name}.${route.handler}" return not Response.`);
		}

		return response;
	}

	protected async response(req: IncomingMessage, res: ServerResponse) {
		const response = await this.getResponse(req);
		response.response(res);
	}
}

export default Core;
