import Config from "../Core/Config";

class Service {
	constructor(protected readonly config: Config) { }
}

interface ListServices {
	[key: string]: Service
}

export default Service;
export { ListServices };
