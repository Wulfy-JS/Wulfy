import Controller from "../Controller";
import {
	RouteDecorator, RouteOptions,
	prepareRouteOptions,
	getRootRouteInfo,
	RouteMethod,
	RouteClass
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


function prepareErrorRouteOptions(code_or_options: SingleOrArray<ErrorCode> | ErrorOptions, name?: string, path?: string, methods?: SingleOrArray<HttpMethod>) {
	const opts = isErrorCode(code_or_options) ? prepareRouteOptions(path || "/", name, methods, code_or_options) : prepareRouteOptions(code_or_options)
	if (!opts.meta) throw new ReferenceError("ErrorCode not defined");

	return {
		name: opts.name,
		path: opts.path,
		methods: opts.methods,
		meta: Array.isArray(opts.meta) ? opts.meta : [opts.meta]
	};
}

type PreparedErrorCode = ErrorCode[] | -1;

function ErrorRoute(code: SingleOrArray<ErrorCode>, name?: string, path?: string, methods?: SingleOrArray<HttpMethod>): RouteDecorator;
function ErrorRoute(options: RouteOptions<ErrorCode[]>): RouteDecorator;
function ErrorRoute(code_or_options: SingleOrArray<ErrorCode> | ErrorOptions, name?: string, path?: string, methods?: SingleOrArray<HttpMethod>): RouteDecorator {
	return (target: typeof Controller | Controller, propertyKey: string = "") => {

		const options = prepareErrorRouteOptions(code_or_options, name, path || target instanceof Controller ? "(.*)" : "", methods);

		const reftarget: typeof Controller = target instanceof Controller ? <typeof Controller>target.constructor : target;
		let meta = getRootRouteInfo<PreparedErrorCode>(reftarget, MetaError);
		meta.meta = meta.meta || -1;


		meta = target instanceof Controller ? RouteMethod<PreparedErrorCode>(meta, propertyKey, options) : RouteClass<PreparedErrorCode>(meta, options);

		Reflect.defineMetadata(MetaError, meta, reftarget);
	};
}

export default ErrorRoute;
export { ErrorCode, PreparedErrorCode, MetaError };
