import { IncomingMessage, ServerResponse } from "http";

import { match } from "path-to-regexp";

import loadModule from "../utils/loadModule";
import { HttpMethod, MetaController, RootRouteInfo, RouteInfo, prepareRouteInfo } from "./Route";
import Controller from "../Controller";
import ServiceList from "../Services/ServiceList";
import Loader, { Module } from "../Loader";
import { URL } from "url";
import { parse } from "path";
import Cache from "../Cache";


interface ControllerInfo<M = never> extends RootRouteInfo<M> {
	module: Module;
}

class Router<M = never, G = M> extends Loader<Constructor<typeof Controller>, RootRouteInfo<M>> {
	private list: Set<ControllerInfo<M>> = new Set();
	protected readonly metaKey: string = MetaController;
	protected readonly cfgPath: string = "controllers";
	protected readonly cfgDefault: SingleOrArray<string> = ["./controllers/**/*.js"];

	protected readonly cachePath: string = ".controllers";
	protected registerFromCache(raw: Buffer): boolean {
		try {
			const data: ControllerInfo<M>[] = JSON.parse(raw.toString());
			if (!Array.isArray(data)) return false;

			const reduced = data.reduce<ControllerInfo<M>[]>((r, e) => {
				if (
					!e.path
					|| !e.module
					|| !e.module.path
				) return r;

				const module = {
					export: e.module.export ?? "default",
					path: e.module.path
				};

				const route = prepareRouteInfo(
					e.path,
					e.name ?? module.export === "default" ? parse(e.module.path).name : module.export,
					e.methods ?? "ALL",
					e.meta
				)
				const routes: NodeJS.Dict<RouteInfo<M>> = {};
				for (const name in e.routes) {
					const route = e.routes[name];
					if (!route || !route.name) continue;

					routes[name] = prepareRouteInfo(
						route.path,
						route.name ?? name,
						route.methods ?? "ALL",
						route.meta
					)
				}
				if (Object.keys(routes).length == 0) return r;
				r.push({
					...route,
					module,
					routes
				});
				return r;
			}, [])

			if (reduced.length == 0) return false;
			this.list = new Set(reduced);

			return true;
		} catch (e) {
			return false;
		}
	}
	protected generateCache(): string | Buffer {
		return JSON.stringify(this.list ? Array.from(this.list) : []);
	}

	public async configure(callback: () => void = () => { }) {
		if (
			!await Cache.exists(this.cachePath)
			|| !this.registerFromCache(await Cache.read(this.cachePath))
		) {
			this.list.clear();
			await super.configure(callback);
			await Cache.write(this.cachePath, this.generateCache())
		}
	}

	protected register(clazz: Constructor<typeof Controller>, meta: RootRouteInfo<M>, module: Module): void {
		this.list.add(Object.assign(
			{},
			meta,
			{ module }
		));
	}

	protected checkRoute(info: RouteInfo<M>, req: IncomingMessage, meta?: G): boolean {
		return true;
	}

	public async get(req: IncomingMessage, meta?: G) {
		const url = new URL(req.url || "/", `http${req.secure ? 's' : ''}://${req.headers.host || "localhost"}`);
		const method = <HttpMethod>(req.method || 'get').toUpperCase();
		const path = url.pathname;
		if (this.list === null) return false;

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
