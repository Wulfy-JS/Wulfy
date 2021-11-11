import SingleOrArr from "../utils/SingleOrArr.js";
import RouteMethod from "./RouteMethod.js";

interface RouteOptions {
	name: string,
	path: string,
	method?: SingleOrArr<RouteMethod>
}

export default RouteOptions;
