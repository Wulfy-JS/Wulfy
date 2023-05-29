import Service from "./Service";
import Loader from "../Loader";
import { MetaService } from "./RegisterService";

class ServiceList extends Loader<Constructor<typeof Service>, string>{
	private list: Map<string, Service> = new Map();
	protected readonly metaKey: string = MetaService;
	protected readonly cfgPath: string = "services";
	protected readonly cfgDefault: SingleOrArray<string> = [];

	protected register(clazz: Constructor<typeof Service>, meta: string, name: string, path: string): void {
		this.registerService(meta, new clazz());
	}

	public registerService(name: string, service: Service) {
		if (!service) throw new Error(`You don't resive Service`);
		const s = this.list.get(name);
		if (s) throw new Error(`Service "${name}" was been register`)
		this.list.set(name, service);
	}

	public get(name: string): Service {
		const s = this.list.get(name);
		if (s) return s;
		throw new Error(`Unknown service "${name}"`)
	}

	public emit(eventName: string | symbol, ...args: any[]): this {
		this.list.forEach(e => e.emit(eventName, ...args));
		return this;
	}
}

export default ServiceList;
