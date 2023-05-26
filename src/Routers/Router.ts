import { IncomingMessage, ServerResponse } from "http";

import { glob } from "glob";
import { match } from "path-to-regexp";

import loadModule from "../utils/loadModule";
import { HttpMethod } from "./Route";
import Controller from "../Controller";
import ServiceList from "../Services/ServiceList";


interface RouteInfo<M = never> {
	name: string;
	path: string;
	methods: HttpMethod[] | "ALL";

	meta: M;
}

interface RootRoute<M = never> extends RouteInfo<M> {
	routes: NodeJS.Dict<RouteInfo<M>>;
}
interface ControllerMeta {
	export: string;
	path: string
}
interface RootRouteInfo<M = never> extends RootRoute<M> {
	routes: NodeJS.Dict<RouteInfo<M>>;

	module: ControllerMeta;
}

class Router<M = never, G = M> {
	private list: Set<RootRouteInfo<M>> = new Set();
	protected readonly keyMeta: string = Reflect.Controller;

	public async configure(paths: string[]) {
		this.list.clear();

		paths = paths.map(e => {
			if (e.endsWith(".js")) return e;
			if (e.endsWith("**")) return e + "/*.js";
			if (e.endsWith("*")) return e + ".js";
			if (e.endsWith("/") || e.endsWith("\\")) return e + "**/*.js";
			return e + "/**/*.js";

		})
		const files = await glob(paths, { windowsPathsNoEscape: true });
		await Promise.all(files.map(file => this.loadController(file)));


	}

	private async loadController(path: string) {
		const module = await loadModule(path);
		for (const exportName in module) {
			const controller = module[exportName];
			if (typeof controller !== "function") continue;
			const controllerMeta: Undefined<RootRoute<M>> = Reflect.getMetadata(this.keyMeta, controller);
			if (!controllerMeta) continue;
			this.list.add(Object.assign(
				{},
				controllerMeta,
				{
					module: {
						export: exportName,
						path: path
					}
				}
			));
		}
	}

	protected checkRoute(info: RouteInfo<M>, req: IncomingMessage, meta?: G): boolean {
		return true;
	}

	public async get(req: IncomingMessage, meta?: G) {
		const url = new URL(req.url || "/", `http${req.secure ? 's' : ''}://${req.headers.host || "localhost"}`);
		const method = <HttpMethod>(req.method || 'get').toUpperCase();
		const path = url.pathname;

		for (const [, RootRouteInfo] of this.list.entries()) {
			if (RootRouteInfo.methods != "ALL" && RootRouteInfo.methods.indexOf(method) == -1)
				continue;
			if (!path.startsWith(RootRouteInfo.path))
				continue;

			if (!this.checkRoute(RootRouteInfo, req, meta)) continue;

			for (const i in RootRouteInfo.routes) {
				const route = RootRouteInfo.routes[i];
				if (!route) continue;
				if (route.methods != "ALL" && route.methods.indexOf(method) == -1) continue;

				const matches = match(route.path)(path);
				if (matches === false) continue;

				if (!this.checkRoute(route, req, meta)) continue;

				const module: NodeJS.Dict<Constructor<typeof Controller>> = await loadModule(RootRouteInfo.module.path);
				const controller = module[RootRouteInfo.module.export];

				if (!controller) continue;
				return async (res: ServerResponse, serviceList: ServiceList) => {
					const controllerInstance = new controller(req, res, serviceList);
					//@ts-ignore
					return await controllerInstance[i](matches, meta);
				}
			}
		}
		return false;
	}
}


export default Router;
