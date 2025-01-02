import { Request, Response } from "./Wulfy.js";
import Controller from "./Controller.js";
import { getRouterMetadata, HttpMethod, isRegExpRouteInfo, type RouteMetadata } from "./Route.js";
import joinPaths from "./utils/joinPaths.js";
import HttpError from "./HttpError.js";
import { isRange, Range } from "./utils/Range.js";

type Route<T> = RouteMetadata<T> & { controller: typeof Controller };
type RouterHandlers<T> = {
	[method in HttpMethod]?: Route<T>;
}

type ErrorRoute = {
	code: Range | number | (Range | number)[];
	controller: typeof Controller;
	handler: string;
}



class Router {
	constructor() { }

	private static: Map<string, RouterHandlers<unknown>> = new Map();
	private dynamicRoutes: RegExp[] = [];
	private dynamic: Map<RegExp, RouterHandlers<any>> = new Map();
	private errorsRoutes: string[] = [];
	private errors: Map<string, ErrorRoute[]> = new Map();

	private registerController(controller: typeof Controller) {
		const meta = getRouterMetadata(controller);

		for (const route of meta.routes) {
			const name = `${meta.name}/${route.name}/${route.method}`;
			const path = joinPaths(meta.path, route.path) as RegExp & string;
			const storage = typeof path == "string" ? this.static : this.dynamic;

			const router = storage.get(path) || {};

			if (router[route.method])
				throw new ReferenceError(`Route ${route.method.toUpperCase()} ${path} was benn register`)

			router[route.method] = Object.assign({ controller }, route, { name, path });

			console.log(`Register route "${name}":`, router[route.method]);
			storage.set(path, router);
		}

		for (const error of meta.errors) {
			const errorRoute = this.errors.get(meta.path) || [];
			const i = errorRoute.push(Object.assign({ controller }, error));
			console.log(`Register error route "${JSON.stringify(error.code)}" for path ${meta.path}:`, errorRoute[i - 1]);
			this.errors.set(meta.path, errorRoute);
		}
	}

	private unregisterController(controller: typeof Controller) {
		const meta = getRouterMetadata(controller);

		for (const route of meta.routes) {
			const name = `${meta.name}/${route.name}/${route.method}`;
			const path = joinPaths(meta.path, route.path) as RegExp & string;
			const storage = typeof path == "string" ? this.static : this.dynamic;

			const router = storage.get(path);
			if (!router) continue;

			delete router[route.method];

			console.log(`Unregister route "${name}"`);
			if (Object.keys(router).length == 0)
				storage.delete(path);
			else
				storage.set(path, router);
		}

		for (const error of meta.errors) {
			let errorRouter = this.errors.get(meta.path);
			if (!errorRouter) continue;

			errorRouter = errorRouter.filter(({ code }) => {
				if (typeof error.code == "number") {
					return !(typeof code == "number" && code == error.code);
				} else if (Array.isArray(error.code)) {
					if (!Array.isArray(code)) return true;

					for (const i in error.code) {
						const error_code = error.code[i];
						const router_code = code[i];
						if (typeof error_code == "number") {
							if (typeof router_code !== "number") return true;
							if (router_code !== error_code) return true;
						} else {
							if (typeof router_code == "number") return true;
							if (router_code.min != error_code.min || router_code.max != error_code.max)
								return true;
						}
					}
					return false;
				} else {
					return !(typeof code == "object"
						&& !Array.isArray(code)
						&& code.min == error.code.min
						&& code.max == error.code.max);
				}
			})

			console.log(`Unregister error route "${JSON.stringify(error.code)}" for path ${meta.path}`);
			if (errorRouter.length == 0)
				this.errors.delete(meta.path);
			else
				this.errors.set(meta.path, errorRouter);
		}
	}

	private sortRoutes() {
		this.dynamicRoutes = Array.from(this.dynamic.keys()).sort((a, b) => {
			if (a.source.length > b.source.length) return -1;
			if (a.source.length < b.source.length) return 1;
			return 0;
		})
		this.errorsRoutes = Array.from(this.errors.keys()).sort((a, b) => {
			if (a.length > b.length) return -1;
			if (a.length < b.length) return 1;
			return 0;
		})
	}

	public register(...controllers: typeof Controller[]): this {
		for (const controller of controllers)
			this.registerController(controller);

		this.sortRoutes()

		return this;
	}
	public unregister(...controllers: typeof Controller[]): this {
		for (const controller of controllers)
			this.unregisterController(controller);

		this.sortRoutes()

		return this;
	}

	private getHandler(url: string, method: HttpMethod): Route<any> | null {
		const router = this.static.get(url);
		if (router) {
			const handler = router[method];
			if (handler)
				return handler;
		}

		for (const path of this.dynamicRoutes) {
			if (!path.test(url))
				continue;

			const router = this.dynamic.get(path) as RouterHandlers<any>;
			return router[method] || null;
		}

		return null;
	}

	public async request(req: Request, res: Response): Promise<boolean> {
		const handlerObject = this.getHandler(req.url, req.method);
		if (!handlerObject) return false;
		const controller = new handlerObject.controller(req, res);
		const handler = (<(params?: any) => Promise<void>>controller[handlerObject.handler as keyof Controller]);
		if (!handler) return false;

		await handler.call(
			controller,
			isRegExpRouteInfo(handlerObject)
				? handlerObject.match(req.url.match(handlerObject.path) as RegExpMatchArray)
				: undefined
		);

		return true;
	}


	private getErrorHandler(url: string, err: HttpError): ErrorRoute | null {
		for (const path of this.errorsRoutes) {
			if (!url.startsWith(path)) continue;

			const router = this.errors.get(path) as ErrorRoute[];
			for (const route of router) {
				if (typeof route.code == "number") {
					if (err.code == route.code)
						return route;
				} else if (isRange(route.code)) {
					if (route.code.min <= err.code && route.code.max >= err.code)
						return route;
				} else {
					const index = route.code.findIndex((code) => {
						if (typeof code == "number") {
							if (err.code == code)
								return true;
						} else {
							if (code.min <= err.code && code.max >= err.code)
								return true;
						}

						return false;
					})
					if (index != -1)
						return route;
				}
			}
		}
		return null;
	}

	public async error(req: Request, res: Response, err: HttpError): Promise<void> {
		res.statusCode = err.code;
		res.statusMessage = err.message;

		const handlerObject = this.getErrorHandler(req.url, err);
		if (!handlerObject) return;

		const controller = new handlerObject.controller(req, res);
		const handler = (<(params?: any) => Promise<void>>controller[handlerObject.handler as keyof Controller]);
		if (!handler) return;

		await handler.call(controller);
	}
}

export default Router;
export { Router };
