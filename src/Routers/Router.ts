import { IncomingMessage, ServerResponse } from "http";

import { glob } from "glob";
import { match } from "path-to-regexp";

import loadModule from "../utils/loadModule";
import { ControllerMeta, HttpMethod } from "./Route";
import Controller from "../Controller";
import ServiceList from "../Services/ServiceList";

interface RouterControllerMeta {
	meta: ControllerMeta;
	export: string;
	path: string;
}


class Router {
	//list[url_path] = controller_path;
	private list: Set<RouterControllerMeta> = new Set();

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

	public async loadController(path: string) {
		const module = await loadModule(path);
		for (const name in module) {
			const controller = module[name];
			if (typeof controller !== "function") continue;
			const controllerMeta: Undefined<ControllerMeta> = Reflect.getMetadata(Reflect.Controller, controller);
			if (!controllerMeta) continue;
			this.list.add({
				meta: controllerMeta,
				export: name,
				path
			});
		}
	}

	public async getRoute(path: string, method: HttpMethod) {
		for (const [, controllerMeta] of this.list.entries()) {
			if (controllerMeta.meta.methods != "ALL" && controllerMeta.meta.methods.indexOf(method) == -1)
				continue;
			if (!path.startsWith(controllerMeta.meta.path))
				continue;
			for (const i in controllerMeta.meta.routes) {
				const route = controllerMeta.meta.routes[i];
				if (!route) continue;
				if (route.methods != "ALL" && route.methods.indexOf(method) == -1)
					continue;
				const matches = match(route.path)(path);
				if (matches === false) continue;
				const module: NodeJS.Dict<Constructor<typeof Controller>> = await loadModule(controllerMeta.path);
				const controller = module[controllerMeta.export];
				if (!controller) continue;
				return async (req: IncomingMessage, res: ServerResponse, serviceList: ServiceList) => {
					const controllerInstance = new controller(req, res, serviceList);
					//@ts-ignore
					return await controllerInstance[i](matches)
				}
			}
		}
		return false;
	}
}

export default Router;
