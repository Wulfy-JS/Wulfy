import "reflect-metadata";

import Service from "./Service";
declare global {
	namespace Reflect {
		let Service: string;
	}
}

Reflect.Service = "@service";
function RegisterService(name: string) {
	return (target: typeof Service) => {
		Reflect.defineMetadata(Reflect.Service, name, target);
	}
}

export default RegisterService;
