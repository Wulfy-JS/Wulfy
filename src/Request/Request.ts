import RouteInfo from "../Router/RouteInfo";
import { Headers } from "../utils/Header";

export default interface Request extends RouteInfo {
	headers: Headers;
	body: Buffer | string;
}
