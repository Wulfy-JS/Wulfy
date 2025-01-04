import { Controller, HttpError, HttpCodes } from "../index.js";
import { getMetadataController, isDynamicRouteParams } from "./Route.js";
import { getMetadataError } from "./Error.js";
import { HttpMethod, Request, Response } from "./HttpMethod.js";

type RouterHandler = (req: Request, res: Response) => Promise<void>;

class Router {
	protected readonly path: string;

	protected routes: Set<Router | typeof Controller> = new Set();

	constructor(path: string) {
		if (!path.startsWith('/'))
			path = '/' + path;

		this.path = path;
	}


	public register(...routers: (Router | typeof Controller)[]) {
		for (const router of routers)
			this.routes.add(router);

		return this;
	}

	public unregister(...routers: (Router | typeof Controller)[]) {
		for (const router of routers)
			this.routes.delete(router);

		return this;
	}

	public getRequestHandler(path: string, method: HttpMethod): RouterHandler | undefined {
		if (!path.startsWith(this.path)) return;

		let url = path.slice(this.path.length);
		if (!url.startsWith('/')) url = '/' + url;

		for (const router of this.routes) {
			if (router instanceof Router) {
				const handler = router.getRequestHandler(url, method);
				if (!handler) continue;
				return handler;
			}
			const meta = getMetadataController(router) as Exclude<ReturnType<typeof getMetadataController>, undefined>;
			if (!url.startsWith(meta.path)) continue;

			url = url.slice(meta.path.length);
			if (!url.startsWith('/')) url = '/' + url;

			for (const route of meta.routes) {
				if (isDynamicRouteParams(route)) {
					const match = url.match(route.path);
					if (!match) continue;
					const param = route.match(match);
					return (req: Request, res: Response) => (<(param: any) => Promise<void>>(new router(req, res)[route.handler as keyof Controller]))(param)
				} else {
					if (route.path == url) {
						return (req: Request, res: Response) => (<() => Promise<void>>(new router(req, res)[route.handler as keyof Controller]))();
					}
				}
			}
		}
	}

	public getErrorHandler(path: string, error: HttpError): RouterHandler | undefined {
		if (!path.startsWith(this.path)) return;

		let url = path.slice(this.path.length);
		if (!url.startsWith('/')) url = '/' + url;

		for (const router of this.routes) {
			if (router instanceof Router) {
				const handler = router.getErrorHandler(url, error);
				if (!handler) continue;
				return handler;
			}

			const meta = getMetadataController(router) as Exclude<ReturnType<typeof getMetadataController>, undefined>;
			if (!url.startsWith(meta.path)) continue;
			const errors = getMetadataError(router);
			if (!errors) continue;

			for (const [available_code, handler] of errors) {
				if (typeof available_code == 'number') {
					if (available_code != error.code)
						continue;
				} else {
					if (available_code.min > error.code || available_code.max < error.code)
						continue;
				}

				return async (req, res) => {
					res.statusCode = error.code;
					res.statusMessage = error.message;
					await (<(error: HttpError) => Promise<void>>(new router(req, res)[handler as keyof Controller]))(error)
				};
			}
		}
	}

	public async request(req: Request, res: Response) {
		const handler = this.getRequestHandler(req.url, req.method) || this.getErrorHandler(req.url, new HttpError(HttpCodes.NOT_FOUND));
		if (!handler) throw new HttpError(HttpCodes.NOT_FOUND);

		try {
			await handler(req, res)
		} catch (err) {
			err = HttpError.from(err, HttpCodes.INTERNAL_SERVER_ERROR)
			const handler = this.getErrorHandler(req.url, err as HttpError);
			if (!handler) throw err;
			await handler(req, res);
		}
	}

}

export default Router;
export { Router };
