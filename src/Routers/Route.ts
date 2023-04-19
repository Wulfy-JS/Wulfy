import { resolve } from "path/posix";

import "reflect-metadata";

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


// type HttpMethod = "get";

interface RouteOptions {
	path: string,
	name: string,

	/**
	 * @default HttpMethod.ALL
	 */
	methods?: SingleOrArray<HttpMethod>
}
interface RouteMeta {
	path: string,
	name: string,
	methods: HttpMethod[] | "ALL"
};

interface ControllerMeta extends RouteMeta {
	routes: NodeJS.Dict<RouteMeta>
};

function prepareMethods(methods: SingleOrArray<HttpMethod>): HttpMethod[] | "ALL" {
	if (!Array.isArray(methods)) {
		if (methods == "ALL")
			return methods;
		else
			methods = [methods];
	}

	if (methods.indexOf("ALL") != -1)
		return "ALL";

	return methods;
}
// function Route(path: string, name: string, methods?: SingleOrArray<HttpMethod>);
// function Route(options: RouteOptions);
function Route(path_or_options: string | RouteOptions, name: string = "", methods: SingleOrArray<HttpMethod> = "ALL") {
	methods = prepareMethods((typeof path_or_options !== "string" && path_or_options.methods) || methods);
	name = (typeof path_or_options !== "string" && path_or_options.name) || name;
	const path = typeof path_or_options === "string" ? path_or_options : path_or_options.path;

	const options: RouteMeta = {
		methods,
		name,
		path
	};

	return (target: typeof Controller | Controller, propertyKey: string = "") => {
		if (target instanceof Controller) {
			RouteMethod(target, propertyKey, options)
		} else {
			RouteClass(target, options);
		}
	};
}

const _router = "@router";
declare global {
	namespace Reflect {
		let Controller: string;
	}
}

Reflect.Controller = "@controller";

function RouteMethod(target: Controller, method: string, options: RouteMeta) {
	const meta = Reflect.getMetadata(_router, target.constructor) || {};
	meta[method] = options;
	Reflect.defineMetadata(_router, meta, target.constructor);
}
function RouteClass(target: typeof Controller, options: RouteMeta) {
	const meta: NodeJS.Dict<RouteMeta> = Reflect.getMetadata(_router, target);
	const t: ControllerMeta = {
		...options,
		routes: {}
	};

	for (const i in meta) {
		const route = meta[i];
		if (!route) continue;

		const path = route.path.startsWith("/") || route.path.startsWith("\\") ? '.' + route.path : route.path;
		route.path = resolve(t.path, path);

		if (options.methods !== "ALL") {
			if (route.methods == "ALL") {
				route.methods = options.methods;
			} else {
				route.methods = route.methods.filter(method => options.methods.indexOf(method) != -1)
			}
		}
		t.routes[i] = route;
	}

	Reflect.defineMetadata(Reflect.Controller, t, target);
}

export default Route;
export { HttpMethod, ControllerMeta, RouteMeta };
