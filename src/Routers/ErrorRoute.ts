import Controller from "../Controller";
import {
	RouteDecorator, RouteOptions,
	getRootRouteInfo,
	RouteMethod,
	RouteClass,
	prepareRouteInfo
} from "./Route";
import { HttpMethod } from "./Route";

interface RangeCode {
	min: number;
	max: number;
}
type ErrorCode = number | RangeCode;



const MetaError = "@wulfy.error";

interface ErrorOptions extends RouteOptions<SingleOrArray<ErrorCode>> { }

function isErrorCode(obj: any): obj is SingleOrArray<ErrorCode> {
	if (typeof obj === "number") return true;

	if (typeof obj === "object") {
		if (Array.isArray(obj)) return true;
		if (obj.hasOwnProperty("min") && obj.hasOwnProperty("max")) return true;
	}

	return false;
}

function prepareErrorCode(error: SingleOrArray<ErrorCode>): PreparedErrorCode {
	if (Array.isArray(error)) {
		if (error.indexOf(-1) != -1)
			return -1;
		return error
	} else {
		if (error == -1) return -1;
		return [error];
	}
}

type PreparedErrorCode = ErrorCode[] | -1;

function ErrorRoute(code?: SingleOrArray<ErrorCode>, name?: string, path?: string, methods?: SingleOrArray<HttpMethod>): RouteDecorator;
function ErrorRoute(options: RouteOptions<ErrorCode[]>): RouteDecorator;
function ErrorRoute(code_or_options: SingleOrArray<ErrorCode> | ErrorOptions = -1, name: string = "", path: string = "/(.*)", methods: SingleOrArray<HttpMethod> = "ALL"): RouteDecorator {
	return (target: typeof Controller | Controller, propertyKey?: string) => {
		target = target instanceof Controller ? <typeof Controller>target.constructor : target;
		let metaTarget = getRootRouteInfo<PreparedErrorCode>(target, MetaError, -1);


		const options = isErrorCode(code_or_options)
			? prepareRouteInfo<PreparedErrorCode>(path, name, methods, prepareErrorCode(code_or_options))
			: prepareRouteInfo<PreparedErrorCode>(
				code_or_options.path ?? "/(.*)",
				code_or_options.name ?? (propertyKey ?? target.name),
				code_or_options.methods ?? "ALL",
				prepareErrorCode(code_or_options.meta ?? -1)
			);

		metaTarget = propertyKey ? RouteMethod<PreparedErrorCode>(metaTarget, propertyKey, options) : RouteClass<PreparedErrorCode>(metaTarget, options);

		Reflect.defineMetadata(MetaError, metaTarget, target);
	};
}

export default ErrorRoute;
export { ErrorCode, PreparedErrorCode, MetaError };
