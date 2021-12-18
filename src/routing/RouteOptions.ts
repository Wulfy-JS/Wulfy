import SingleOrArr from "../utils/SingleOrArr.js";
import RouteMethod from "./RouteMethod.js";

interface RouteOptions<T = RegExp> {
	name: string,
	path: T,
	method?: SingleOrArr<RouteMethod> | "all",
}



export default RouteOptions;
