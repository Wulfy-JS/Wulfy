import { BaseControllerConstructor } from "../controller/BaseController.js";

interface RouteHandler {
	controller: BaseControllerConstructor;
	handler?: string
}

export default RouteHandler;
