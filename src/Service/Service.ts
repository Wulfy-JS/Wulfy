import Config from "../Core/Config";
const symbol = Symbol.for("Wulfy.Service");

class Service {
	constructor(protected readonly config: Config) { }

	private get [symbol]() {
		return symbol;
	};
	public static isService(obj: any): obj is Service {
		return obj[symbol] == symbol;
	}
}
interface ConstructorService {
	new(config: Config): Service;
}
interface ListServices {
	[key: string]: Service
}

export default Service;
export { ConstructorService, ListServices };
