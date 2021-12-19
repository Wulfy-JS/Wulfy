import { readdir, stat } from "fs/promises";
import { BaseControllerConstructor } from "../controller/BaseController.js";
import Core from "../index.js";
import { ROOT_ATTRIBUTES, ROUTE_ATTRIBUTES } from "./Route.js";
import RouteHandler from "./RouteHandler.js";
import RouteMap from "./RouteMap.js";
import RouteOptions from "./RouteOptions.js";
import StaticRoute from "./StaticRoute.js";

export type Route = RouteOptions<string | RegExp> & RouteHandler;

class RoutingConfigurator {
	constructor(
		private readonly core: Core,
		private readonly routes: RouteMap,
		private readonly staticRoute: StaticRoute,
		private readonly root: string = "/") {
	}

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

	private async loadControllersFromDirectory(path: string, deep: number = 4) {
		let arr: BaseControllerConstructor[] = [];
		if (deep == 0) return arr;


		const pathes = (await readdir(path)).map(file => path + "/" + file);
		for (const pathToontroller of pathes) {
			const file = await stat(pathToontroller);
			if (file.isDirectory()) {
				arr = arr.concat(await this.loadControllersFromDirectory(path, deep - 1));
			} else if (file.isFile()) {
				arr.push(await this.loadControllerFromFile(pathToontroller));
			}
		}
		return arr;
	}

	private async loadControllerFromFile(path: string): Promise<BaseControllerConstructor> {
		return (await import("file://" + path)).default;
	}

	private registerRoutesFromController(controller: BaseControllerConstructor) {
		const RouteSettings = controller.prototype[ROUTE_ATTRIBUTES];
		if (!RouteSettings) return;

		const rootPath = RouteSettings[ROOT_ATTRIBUTES] || "";

		for (const key in RouteSettings) {
			if (key == ROOT_ATTRIBUTES) continue;
			const routeDesc = RouteSettings[key];

			this.routes.set({
				path: (routeDesc.path instanceof RegExp) ? routeDesc.path : rootPath + (routeDesc.path || ""),
				name: routeDesc.name,
				method: routeDesc.method || "all"
			}, {
				controller: controller,
				handler: key
			});
		}
	}

	public loadControllers(paths: string | string[], deep: number = 4) {
		if (!Array.isArray(paths))
			paths = [paths];

		return Promise.all(paths.map(path => this.root + "/" + path).map(async path => {
			const file = await stat(path)
			if (file.isDirectory()) {
				const controllers = await this.loadControllersFromDirectory(path, deep);
				for (const controller of controllers)
					this.registerRoutesFromController(controller)
			} else if (file.isFile()) {
				const controller = await this.loadControllerFromFile(path);
				this.registerRoutesFromController(controller)
			} else {
				console.warn(`Can't load path ${path}`);
			}
		}));
	}
}

export default RoutingConfigurator;
