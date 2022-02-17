import { SingleOrArr } from "../utils/SingleOrArr";

export default interface RouteInfo {
	path: string;
	method: SingleOrArr<string>;
}
