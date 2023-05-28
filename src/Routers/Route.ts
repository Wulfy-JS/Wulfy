import { resolve } from "path/posix";
import Controller from "../Controller";

type HttpMethod =
	// The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
	"GET" |

	// The HEAD method asks for a response identical to a GET request, but without the response body.
	"HEAD" |

	// The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
	"POST" |

	// The PUT method replaces all current representations of the target resource with the request payload.
	"PUT" |

	// The DELETE method deletes the specified resource.
	"DELETE" |

	// The CONNECT method establishes a tunnel to the server identified by the target resource.
	"CONNECT" |

	// The OPTIONS method describes the communication options for the target resource.
	"OPTIONS" |

	// The TRACE method performs a message loop-back test along the path to the target resource.
	"TRACE" |

	// The PATCH method applies partial modifications to a resource.
	"PATCH" |

	// Allowed all http-methods
	"ALL";

interface RouteInfo<M = never> {
	name: string;
	path: string;

	methods: HttpMethod[] | "ALL";

	meta?: M;
}

interface RootRouteInfo<M = never> extends RouteInfo<M> {
	routes: NodeJS.Dict<RouteInfo<M>>;
}

interface RouteDecorator {
	(target: typeof Controller | Controller, propertyKey?: string): void
}

interface RouteOptions<M = never> {
	path: string;
	name?: string;

	methods?: SingleOrArray<HttpMethod>;

	meta?: M;
}

interface PreparedRouteOptions<M = never> {
	path: string;
	name?: string;

	methods: HttpMethod[] | "ALL";

	meta?: M;
}


function prepareRouteOptions<M = never>(path_or_options: string | RouteOptions<M>, name?: string, methods?: SingleOrArray<HttpMethod>, meta?: M): PreparedRouteOptions<M> {
	if (typeof path_or_options === "string")
		return {
			name, path: path_or_options, methods: prepareMethods(methods), meta
		}

	return Object.assign(path_or_options, {
		methods: prepareMethods(path_or_options.methods)
	});


}



declare global {
	namespace Reflect {
		let Controller: string;
	}
}

Reflect.Controller = "@wulfy.controller";

function Route<M = never>(path: string, name: string, methods?: SingleOrArray<HttpMethod>, meta?: M): RouteDecorator;
function Route<M = never>(options: RouteOptions<M>): RouteDecorator;
function Route<M = never>(path_or_options: string | RouteOptions<M>, name: string = "", methods: SingleOrArray<HttpMethod> = "ALL", meta?: M): RouteDecorator {
	const options = prepareRouteOptions<M>(path_or_options, name, methods, meta);

	return (target: typeof Controller | Controller, propertyKey: string = "") => {
		const reftarget: typeof Controller = target instanceof Controller ? <typeof Controller>target.constructor : target;
		let meta = getRootRouteInfo<M>(reftarget);


		meta = target instanceof Controller ? RouteMethod<M>(meta, propertyKey, options) : RouteClass<M>(meta, options);

		Reflect.defineMetadata(Reflect.Controller, meta, reftarget);
	};
}

function prepareMethods(methods: SingleOrArray<HttpMethod> = "ALL"): HttpMethod[] | "ALL" {
	if (!Array.isArray(methods))
		return methods == "ALL" ? methods : [<HttpMethod>methods.toUpperCase()];
	else
		methods = methods.map(e => <HttpMethod>e.toUpperCase());

	if (methods.indexOf("ALL") != -1)
		return "ALL";

	return methods;
}

function getRootRouteInfo<M = never>(target: typeof Controller, metadata: string = Reflect.Controller): RootRouteInfo<M> {
	return Reflect.getMetadata(metadata, target) || {
		name: target.name,
		path: "/",
		methods: "ALL",
		routes: {}
	};
}


function RouteMethod<M = never>(meta: RootRouteInfo<M>, method: string, routeInfo: PreparedRouteOptions<M>) {
	meta.routes[method] = Object.assign({ name: method }, routeInfo);

	return meta;
}
function RouteClass<M = never>(meta: RootRouteInfo<M>, options: PreparedRouteOptions<M>) {
	const info: RootRouteInfo<M> = Object.assign(
		meta,
		options
	);

	for (const i in info.routes) {
		const route = info.routes[i];
		if (!route) continue;

		const path = route.path.startsWith("/") || route.path.startsWith("\\") ? '.' + route.path : route.path;
		route.path = resolve(info.path, path);

		if (info.methods == "ALL") continue;

		if (route.methods == "ALL") route.methods = info.methods.concat();
		else route.methods = route.methods.filter(method => info.methods.indexOf(method) != -1);

	}

	return info;
}

export default Route;
export {
	RouteInfo, HttpMethod, RootRouteInfo, RouteOptions, RouteDecorator,

	prepareRouteOptions,
	prepareMethods,
	getRootRouteInfo,
	RouteMethod,
	RouteClass
}
