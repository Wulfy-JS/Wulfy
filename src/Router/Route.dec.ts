import Controller, { ConstructorController } from "../Controller/Controller";
import RouteInfo from "./RouteInfo";

interface RouteOptions extends Partial<RouteInfo> {
	name: string,
}
function isRouteOptions(options: any): options is RouteOptions {
	return !!options.name;
}

interface RouteConfigurate extends Partial<RouteInfo> {
	name: string;
	controller: ConstructorController;
	handler: string;
}
function isRouteConfigurate(options: any): options is RouteConfigurate {
	return options.name && options.controller;
}

interface RouteCalssDecorator { (constructor: ConstructorController): void }
interface RouteMethodDecorator { (target: Controller, propertyKey: string, descriptor: PropertyDescriptor): void }

const ROUTE_ATTRIBUTES = "Route";
function getRouteAttributesKey(constructor: Function) {
	return `@${ROUTE_ATTRIBUTES}.${constructor.name}`;
}
const ROOT_ATTRIBUTES = "@Root";

/**
 * Class decorator for Controllers
 * @param {string} rootPath root path for Controller
 */
function Route(rootPath: string): RouteCalssDecorator;
/**
 * Method decorator for Controllers
 * @param {RouteOptions} rootPath Options route handlers
 */
function Route(route: RouteOptions): RouteMethodDecorator;
/**
 * Alias for JavaScript
 * @param {RouteConfigurate} route 
 */
function Route(route: RouteConfigurate): void;
function Route(path_route: string | RouteOptions | RouteConfigurate): RouteCalssDecorator | RouteMethodDecorator | void {
	if (typeof path_route == "string") //If is string => Class decorator
		return function (constructor: ConstructorController) {
			const target = constructor.prototype;
			const key = getRouteAttributesKey(constructor);
			if (!target[key]) target[key] = {};

			target[key][ROOT_ATTRIBUTES] = path_route;
		};

	if (isRouteOptions(path_route)) { // If is RouteOptoions => Method decorator

		if (isRouteConfigurate(path_route)) { // If is RouteConfigurate => JS Alias
			const target = path_route.controller.prototype;
			const key = getRouteAttributesKey(path_route.controller);
			if (!target[key]) target[key] = {};
			target[key][path_route.handler] = {
				name: path_route.name,
				path: path_route.path,
				method: path_route.method
			};
			return;
		}

		return function (target: Controller, propertyKey: string, descriptor: PropertyDescriptor) {
			const key = getRouteAttributesKey(target.constructor);
			//@ts-ignore
			if (!target[key]) target[key] = {};
			//@ts-ignore
			target[key][propertyKey] = path_route;
		};
	}



	throw new ReferenceError("Unknown type routeDescription");
}

export default Route;
export { getRouteAttributesKey };
