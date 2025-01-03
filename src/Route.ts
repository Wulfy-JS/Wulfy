import Controller from "./Controller.js";
import HttpError from "./HttpError.js";
import type { Range } from "./utils/Range.js";

type HttpMethod = "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch";
interface RouterInfo {
	name?: string;
	path: string;
}

interface BaseRouteInfo {
	name?: string;
	method?: HttpMethod;
	path: string;
}
type RouteParams = any;
interface RegExpRouteInfo<P extends RouteParams> {
	name?: string;
	method?: HttpMethod;
	path: RegExp;
	match: (matches: RegExpMatchArray) => P;
}
type RouteInfo<P extends RouteParams> = RegExpRouteInfo<P> | BaseRouteInfo;
type ControllerMethod<C extends Controller, P extends RouteParams> = keyof {
	[K in keyof C as C[K] extends (params: P) => void ? K : never]: any;
};


function Route<C extends Controller, P extends RouteParams>(info: RouteInfo<P>): (target: C, method: ControllerMethod<C, P>) => void {
	return (target: C, method: ControllerMethod<C, P>) => {
		if (!method) throw new ReferenceError("Not define method");
		defineRouteMetadata(target.constructor as typeof Controller, info, method as string);
	}
}

function Router(info: RouterInfo): (target: typeof Controller) => void {
	return (target) => {
		defineRouterMetadata(target, info);
	}
}


const METADATA_KEY = "@Router";
type RouteMetadata<P extends RouteParams> = RouteInfo<P> & {
	name: string;
	method: HttpMethod;
	handler: string
}
interface RouterMetadata<P extends RouteParams> {
	name: string;
	path: string;
	routes: (Required<RouteInfo<P>> & { handler: string })[];
	errors: { code: ErrorCode, handler: string }[]
}

function defineDefaultRouterMetadata(target: typeof Controller): RouterMetadata<any> {
	return {
		name: target.name,
		path: '/',
		routes: [],
		errors: []
	}
}

function defineRouteMetadata(target: typeof Controller, info: RouteInfo<any>, handler: string) {
	const meta: RouterMetadata<any> = Reflect.getMetadata(METADATA_KEY, target) || defineDefaultRouterMetadata(target);
	meta.routes.push({
		...info,
		name: info.name || handler,
		method: info.method || 'get',
		handler
	})
	Reflect.defineMetadata(METADATA_KEY, meta, target);
}

function defineRouterMetadata(target: typeof Controller, info: RouterInfo) {
	const meta: RouterMetadata<any> = Reflect.getMetadata(METADATA_KEY, target) || defineDefaultRouterMetadata(target);
	meta.name = info.name || target.name;
	meta.path = info.path;
	Reflect.defineMetadata(METADATA_KEY, meta, target);
}

function getRouterMetadata(target: typeof Controller) {
	const meta = <RouterMetadata<any> | undefined>Reflect.getMetadata(METADATA_KEY, target);
	if (!meta) throw new ReferenceError(`${target} is not controller`);
	return meta;
}

function isRegExpRouteInfo(route: RouteInfo<any>): route is RegExpRouteInfo<any> {
	return route.hasOwnProperty('match');
}


type ErrorCode = number | Range | (number | Range)[];
function Error<C extends Controller>(code: ErrorCode): (target: C, method: ControllerMethod<C, HttpError>) => void {
	return (target, method: ControllerMethod<C, HttpError>) => {
		defineErrorMetadata(target.constructor as typeof Controller, code, method as string);
	}
}

function defineErrorMetadata(target: typeof Controller, code: ErrorCode, handler: string) {
	const meta: RouterMetadata<any> = Reflect.getMetadata(METADATA_KEY, target) || defineDefaultRouterMetadata(target);
	meta.errors.push({ code, handler })
	Reflect.defineMetadata(METADATA_KEY, meta, target);
}

export {
	Route,
	RouteMetadata,
	Router,
	Error,
	getRouterMetadata,
	isRegExpRouteInfo
}
export type {
	HttpMethod,
	RouterInfo,
	RouteInfo,
	ControllerMethod
};
