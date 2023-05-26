import nunjucks from "nunjucks";
import { IncomingMessage, ServerResponse } from "node:http";
import { RouteInfo } from "./Route";
import Router from "./Router";
import HttpError from "../HttpError";
import ServiceList from "../Services/ServiceList";
import { readFileSync } from "node:fs";
import getWulfyPath from "../utils/getWulfyPath";
import { ErrorCode } from "./ErrorRoute";

class ErrorRouter extends Router<ErrorCode[], HttpError> {
	private template = nunjucks.compile(readFileSync(getWulfyPath("views/error.njk"), { encoding: "utf-8" }));
	protected readonly keyMeta: string = Reflect.Error;

	protected checkRoute(info: RouteInfo<ErrorCode[]>, req: IncomingMessage, meta?: HttpError): boolean {
		if (!info.meta || !meta) return false;
		const code = meta.code;

		const valid = info.meta.findIndex(value => {
			if (typeof value == "number")
				return code == value;

			return value.min <= code && code <= value.max;
		}) !== -1;

		return valid;
	}

	public async get(req: IncomingMessage, meta: HttpError): Promise<(res: ServerResponse, serviceList: ServiceList) => any> {
		const route = await super.get(req, meta);

		if (route !== false) return route;

		return (res: ServerResponse, serviceList: ServiceList) => {
			this.defaultRoute(req, res, serviceList, meta)
		}
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
export { ErrorCode }
