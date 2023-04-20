import HttpError from "../HttpError";
import { IncomingMessage, ServerResponse } from "http";
import { ErrorHandlesList } from "./ErrorRoute";
import { glob } from "glob";
import loadModule from "../utils/loadModule";

interface RouterErrorHandlesList {
	meta: ErrorHandlesList;
	export: string;
	path: string;
}


class ErrorRouter {
	private list: Set<RouterErrorHandlesList> = new Set();

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
		for (const [, controller] of this.list.entries()) {
			for (const i in controller.meta) {
				const route = controller.meta[i];
				if (!route) continue;

				const valid = route.findIndex(value => {
					if (typeof value == "number")
						return code == value;

					return value.min <= code && code <= value.max;
				}) !== -1;

				if (!valid) continue;

				const module = await loadModule(controller.path);
				return async (req: IncomingMessage, res: ServerResponse, error: HttpError) => {
					return await (new module[controller.export](req, res))[i](error);
				}
			}
		}
		return this.defaultRoute;
	}

	private defaultRoute(req: IncomingMessage, res: ServerResponse, error: HttpError) {
		res.statusCode = error.code;
		res.write(error.message || "Internal Server Error");
		res.end()
	}
}

export default ErrorRouter;
