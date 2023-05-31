import getServerApp from "./App/getServerApp";

export { default as Server } from "./Server/Server"
export { default as Controller } from "./Controller";
export { default as Route } from "./Routers/Route";
export { default as HttpError } from "./HttpError";
export { default as ErrorRoute } from "./Routers/ErrorRoute";
export { default as Service } from "./Services/Service";
export { default as RegisterService } from "./Services/RegisterService";
export { default as getServerApp } from "./App/getServerApp"


export default function run() {
	// if CLI
	//     run CLI
	// Else
	//    run app
	getServerApp().start();
}
