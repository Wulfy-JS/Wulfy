import RouteMethods from "../Router/RouteMethods";
import { Headers } from "../utils/Header";

export default interface Request {
	headers: Headers;
	body: Buffer | string;
	method: string;
	path: string;
}
