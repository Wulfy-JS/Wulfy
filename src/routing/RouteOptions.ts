import SingleOrArr from "../utils/SingleOrArr.js";
import RouteMethod from "./RouteMethod.js";
import PTR from "path-to-regexp";

interface RouteOptions<T = RegExp> {
	name: string,
	path: T,
	method?: SingleOrArr<RouteMethod>,
}



export default RouteOptions;
