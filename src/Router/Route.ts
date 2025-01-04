
import { Controller } from "../Controller.js";
import { HttpMethod } from "./HttpMethod.js";


type RouteParams = {
	path: string;
	method: HttpMethod
};

type DynamicRouteParams<P> = {
	path: RegExp;
	match: (matches: RegExpMatchArray) => P;
	method?: HttpMethod;
}

type ControllerHandlers<C extends Controller, P> = keyof {
	[K in Exclude<keyof C, keyof Controller> as C[K] extends (params: infer I) => any ? I extends P ? P extends I ? K : never : never : never]: true;
};


function Route(target: typeof Controller | Controller, method?: string): void;
function Route(path?: string): (target: typeof Controller | Controller, method?: string) => void;
function Route(params: RouteParams): (target: Controller, method: string) => void;
function Route<C extends Controller, P>(path: DynamicRouteParams<P>): (target: C, method: ControllerHandlers<C, P>) => void;
function Route(target?: string | RouteParams | DynamicRouteParams<any> | typeof Controller | Controller, method?: string): void | ((target: typeof Controller) => void) | ((target: Controller, method: string) => void) {
	if (target instanceof Controller) {
		if (typeof method !== "string")
			throw new ReferenceError();
		return Route('/')(target, method);
	}
	if (typeof target == "function") {
		return Route('/')(target);
	}

	const params = target || '/';

	return (target: typeof Controller | Controller, method?: string) => {
		if (target instanceof Controller) {
			if (typeof method !== "string")
				throw new ReferenceError();


			defineRouteMetadata(target.constructor as typeof Controller, method, params);
		} else {
			if (typeof params !== 'string')
				throw new ReferenceError();

			defineMetaController(target, params);
		}
	}

}

type MetadataRoute = { handler: string } & (RouteParams | Required<DynamicRouteParams<any>>);

const METADATA_KEY = "@New.Router";
interface MetadataController {
	path: string;
	routes: MetadataRoute[]
}
const INIT_CONTROLLER = (target: typeof Controller) => (getMetadataController(target) || { path: '/', routes: [] });

function getMetadataController(target: typeof Controller) {
	return <MetadataController | undefined>Reflect.getMetadata(METADATA_KEY, target)
}
function isDynamicRouteParams(route: MetadataRoute): route is ({ handler: string } & Required<DynamicRouteParams<any>>) {
	return route.path instanceof RegExp;
}
function defineMetaController(target: typeof Controller, path: string) {
	const meta = INIT_CONTROLLER(target);
	if (!path.startsWith('/')) path = '/' + path;
	meta.path = path;
	Reflect.defineMetadata(METADATA_KEY, meta, target);
}

function generateMetadateRoute(handler: string, params: string | RouteParams | DynamicRouteParams<any>): MetadataRoute {
	if (typeof params == "string")
		params = { path: params, method: 'get' };

	if (typeof params.path == "string") {
		if (!params.path.startsWith('/'))
			params.path = '/' + params.path
	} else {
		let regex = params.path.source.replace(/\\\//g, "/");
		if (regex.startsWith('^')) regex = regex.slice(1);
		if (regex.startsWith('/')) regex = regex.slice(1);
		if (regex.endsWith('$')) regex = regex.slice(0, -1);
		params.path = new RegExp('^/' + regex + "$");
	}

	return Object.assign({ handler, method: 'get' }, params)
}

function defineRouteMetadata(target: typeof Controller, handler: string, params: string | RouteParams | DynamicRouteParams<any>) {
	const meta = INIT_CONTROLLER(target);

	meta.routes.push(generateMetadateRoute(handler, params));

	Reflect.defineMetadata(METADATA_KEY, meta, target);
}

export default Route;
export { Route, getMetadataController, isDynamicRouteParams }
export type { ControllerHandlers };
