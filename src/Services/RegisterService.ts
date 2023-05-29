import "reflect-metadata";

import Service from "./Service";

const MetaService = "@wulfy.service";
function RegisterService(name: string) {
	return (target: typeof Service) => {
		Reflect.defineMetadata(MetaService, name, target);
	}
}

export default RegisterService;
export { MetaService }; 
