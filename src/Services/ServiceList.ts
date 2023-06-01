import Service from "./Service";
import Loader, { ExportObjectInfo } from "../Loader";
import { MetaService } from "./RegisterService";
import Server from "../Server/Server";

class ServiceList extends Loader<Constructor<typeof Service>, string>{
	private list: Map<string, Service> = new Map();

	protected register(clazz: Constructor<typeof Service>, meta: string, module: ExportObjectInfo): void {
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

	protected static _serviceList = new ServiceList(MetaService, "services", ['./controllers/**/*.js']);
	public static get ServiceList() {
		return this._serviceList;
	}

}

export default ServiceList;
