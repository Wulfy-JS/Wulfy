import { resolve } from "path";
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
		if (deep == 0) return;


		const pathes = (await readdir(path)).map(file => path + "/" + file);
		for (const pathToController of pathes) {
			const file = await stat(pathToController);
			if (file.isDirectory()) {
				this.loadControllersFromDirectory(pathToController, deep - 1);
			} else if (file.isFile()) {
				await this.loadControllerFromFile(pathToController)
			}
		}
	}
	private controllers: NodeJS.Dict<BaseControllerConstructor> = {};
	private async loadControllerFromFile(path: string) {
		let controller: BaseControllerConstructor = (await import(path + "?" + Date.now())).default;
		if (!controller) return;
		this.registerRoutesFromController(controller);

		if (this.core.isDev) {
			this.controllers[resolve(path)] = controller;
		}
	}
	private unloadControllerFromFile(path: string) {
		let controller = this.controllers[path];
		if (!controller) return;
		this.unregisterRoutesFromController(controller);

		delete this.controllers[resolve(path)];
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
	private unregisterRoutesFromController(controller: BaseControllerConstructor) {
		const RouteSettings = controller.prototype[ROUTE_ATTRIBUTES];
		if (!RouteSettings) return;

		for (const key in RouteSettings) {
			if (key == ROOT_ATTRIBUTES) continue;
			const routeDesc = RouteSettings[key];

			this.routes.deleteByName(routeDesc.name);
		}
	}

	public loadControllers(paths: string | string[], deep: number = 4) {
		if (!Array.isArray(paths))
			paths = [paths];

		return Promise.all(paths.map(path => this.root + "/" + path).map(async path => {
			const file = await stat(path)
			if (file.isDirectory()) {
				await this.loadControllersFromDirectory(path, deep);
			} else if (file.isFile()) {
				await this.loadControllerFromFile(path);
			} else {
				console.warn(`Can't load path ${path}`);
				return;
			}

			if (this.core.isDev) {
				const chokidar = await import("chokidar");
				chokidar.watch(path, { ignoreInitial: true })
					.on("change", path => {
						this.unloadControllerFromFile(path);
						this.loadControllerFromFile(path);
					})
					.on('add', path => this.loadControllerFromFile(path))
					.on('unlink', path => this.unloadControllerFromFile(path));
			}
		}));
	}
}

export default RoutingConfigurator;
