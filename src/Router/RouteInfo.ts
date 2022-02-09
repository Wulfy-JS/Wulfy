import { SingleOrArr } from "../utils/SingleOrArr";
import RouteMethods from "./RouteMethods";

export default interface RouteInfo {
	path: string;
	method: SingleOrArr<string>;
}
