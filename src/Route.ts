import Controller from "./Controller";

type HttpMethod =
	// The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
	"GET" | "get" |

	// The HEAD method asks for a response identical to a GET request, but without the response body.
	"HEAD" | "head" |

	// The POST method submits an entity to the specified resource, often causing a change in state or side effects on the server.
	"POST" | "post" |

	// The PUT method replaces all current representations of the target resource with the request payload.
	"PUT" | "put" |

	// The DELETE method deletes the specified resource.
	"DELETE" | "delete" |

	// The CONNECT method establishes a tunnel to the server identified by the target resource.
	"CONNECT" | "connect" |

	// The OPTIONS method describes the communication options for the target resource.
	"OPTIONS" | "options" |

	// The TRACE method performs a message loop-back test along the path to the target resource.
	"TRACE" | "trace" |

	// The PATCH method applies partial modifications to a resource.
	"PATCH" | "patch" |

	// Allowed all http-methods
	"ALL" | "all";


// type HttpMethod = "get" | "post";

interface RouteOptions {
	path: string,
	name: string,

	/**
	 * @default HttpMethod.ALL
	 */
	methods?: SingleOrArray<HttpMethod>
}
type RouteSettings = Required<RouteOptions>;
// function Route(path: string, name: string, methods?: SingleOrArray<HttpMethod>);
// function Route(options: RouteOptions);
function Route(path_or_options: string | RouteOptions, name: string = "", methods: SingleOrArray<HttpMethod> = "ALL") {
	const options: RouteSettings = Object.assign({ methods: "ALL" }, typeof path_or_options == "string" ? { path: path_or_options, name, methods } : path_or_options);
	options.methods = (typeof options.methods == "string" ? [options.methods] : options.methods).map(e => <HttpMethod>e.toLowerCase());

	return (target: typeof Controller | Controller, propertyKey: string = "") => {
		if (target instanceof Controller) {
			RouteMethod(target, propertyKey, options)
		} else {
			RouteClass(target, options);
		}
	};
}

function RouteMethod(target: Controller, method: string, options: RouteSettings) {
	console.log(`Route method "${method}" in "${target.constructor.name}"`, options)
	const meta = Reflect.getMetadata("router", target.constructor) || {};
	meta[method] = options;
	Reflect.defineMetadata("router", meta, target.constructor);
}
function RouteClass(target: typeof Controller, options: RouteSettings) {
	console.log(`Route class "${target.name}"`, options);
	Reflect.defineMetadata("controller", options, target);
}

export default Route;
export { HttpMethod };
