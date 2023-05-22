import HttpError from "../HttpError";
import { IncomingMessage, ServerResponse } from "http";
import { ErrorHandlesList } from "./ErrorRoute";
import { glob } from "glob";
import loadModule from "../utils/loadModule";
import Controller from "../Controller";
import ServiceList from "../Services/ServiceList";
import nunjucks from "nunjucks";
import { readFileSync } from "fs";
import getWulfyPath from "../utils/getWulfyPath";

interface RouterErrorHandlesList {
	meta: ErrorHandlesList;
	export: string;
	path: string;
}



class ErrorRouter {
	private list: Set<RouterErrorHandlesList> = new Set();
	private template = nunjucks.compile(readFileSync(getWulfyPath("views/error.njk"), { encoding: "utf-8" }));

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
			const controllerMeta: Undefined<ErrorHandlesList> = Reflect.getMetadata(Reflect.Error, controller);
			if (!controllerMeta) continue;
			this.list.add({
				meta: controllerMeta,
				export: name,
				path
			});
		}
	}

	public async get(code: number) {
		for (const [, controllerMeta] of this.list.entries()) {
			for (const i in controllerMeta.meta) {
				const route = controllerMeta.meta[i];
				if (!route) continue;

				const valid = route.findIndex(value => {
					if (typeof value == "number")
						return code == value;

					return value.min <= code && code <= value.max;
				}) !== -1;

				if (!valid) continue;

				// const module = await loadModule(controller.path);
				const module: NodeJS.Dict<Constructor<typeof Controller>> = await loadModule(controllerMeta.path);
				const controller = module[controllerMeta.export];
				if (!controller) continue;
				return async (req: IncomingMessage, res: ServerResponse, serviceList: ServiceList, error: HttpError) => {
					const controllerInstance = new controller(req, res, serviceList);
					//@ts-ignore
					return await controllerInstance[i](error);
				}
			}
		}
		return this.defaultRoute.bind(this);
	}

	private defaultRoute(req: IncomingMessage, res: ServerResponse, serviceList: ServiceList, error: HttpError) {
		res.statusCode = error.code;
		res.write(this.template.render({
			code: error.code,
			error: error,
			message: error.message,
			stack: error.stack
		}));
		res.end()
	}
}

export default ErrorRouter;
