import BaseController, { BaseControllerConstructor } from "../controller/BaseController";
import SingleOrArr from "../utils/SingleOrArr";
import RouteMethod from "./RouteMethod";
import { Route as RouteConfigurate } from "./RoutingConfigurator.js";

const ROUTE_ATTRIBUTES = "@Route";
const ROOT_ATTRIBUTES = "@Root";

interface RouteOptions {
	name: string,
	path?: string | RegExp,
	method?: SingleOrArr<RouteMethod> | "all",
}

function isRouteOptions(options: any): options is RouteOptions {
	return options.name && !options.controller;
}
function isRouteConfigurate(options: any): options is RouteConfigurate {
	return options.name && options.controller;
}

/**
 * Class decorator for Controllers
 * @param {string} rootPath root path for Controller
 */
function Route(rootPath: string): (constructor: BaseControllerConstructor) => void;
/**
 * Method decorator for Controllers
 * @param {RouteOptions} rootPath Options route handlers
 */
function Route(route: RouteOptions): (target: BaseController, propertyKey: string, descriptor: PropertyDescriptor) => void;

/**
 * Alias for JavaScript
 * @param {RouteConfigurate} route 
 */
function Route(route: RouteConfigurate): void;

function Route(routeDescription: unknown) {
	if (typeof routeDescription == "string")
		return function (constructor: BaseControllerConstructor) {
			const target = constructor.prototype;
			if (!target[ROUTE_ATTRIBUTES]) target[ROUTE_ATTRIBUTES] = {};
			else target[ROUTE_ATTRIBUTES] = Object.assign({}, target[ROUTE_ATTRIBUTES]);

			target[ROUTE_ATTRIBUTES][ROOT_ATTRIBUTES] = routeDescription;
		};

	if (isRouteOptions(routeDescription))
		return function (target: BaseController, propertyKey: string, descriptor: PropertyDescriptor) {
			if (!target[ROUTE_ATTRIBUTES]) target[ROUTE_ATTRIBUTES] = {};
			else target[ROUTE_ATTRIBUTES] = Object.assign({}, target[ROUTE_ATTRIBUTES]);

			target[ROUTE_ATTRIBUTES][propertyKey] = routeDescription;
		};

	if (isRouteConfigurate(routeDescription)) {
		const target = routeDescription.controller.prototype;
		if (!target[ROUTE_ATTRIBUTES]) target[ROUTE_ATTRIBUTES] = {};
		target[ROUTE_ATTRIBUTES][routeDescription.handler] = {
			name: routeDescription.name,
			path: routeDescription.path,
			method: routeDescription.method
		};
		return;
	}

	throw new Error(`Unknown type routeDescription`);
}

export default Route;
export { ROOT_ATTRIBUTES, ROUTE_ATTRIBUTES };
