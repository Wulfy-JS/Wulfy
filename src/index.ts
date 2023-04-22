import Core from "./Core";

export { default as Core } from "./Core"
export { default as Controller } from "./Controller";
export { default as Route } from "./Routers/Route";
export { default as HttpError } from "./HttpError";
export { default as ErrorRoute } from "./Routers/ErrorRoute";
export { default as Service } from "./Services/Service";
export { default as RegisterService } from "./Services/RegisterService";


export default function run() {
	Core.getInstance().start();
}
