import loadModule from "../utils/loadModule";
import { glob } from "glob";
import Service from "./Service";

class ServiceList {
	private list: Map<string, Service> = new Map();
	public async configure(paths: string[]) {
		this.list.clear();

		paths = paths.map(e => {
			if (e.endsWith(".js")) return e;
			if (e.endsWith("**")) return e + "/*.js";
			if (e.endsWith("*")) return e + ".js";
			if (e.endsWith("/") || e.endsWith("\\")) return e + "**/*.js";
			return e + "/**/*.js";

		})
		const files = await glob(paths, { windowsPathsNoEscape: true });
		await Promise.all(files.map(file => this.loadService(file)));
	}

	public async loadService(path: string) {
		const module = await loadModule(path);
		for (const name in module) {
			const service = module[name];
			if (typeof service !== "function") continue;
			const serviceName: Undefined<string> = Reflect.getMetadata(Reflect.Service, service);
			if (!serviceName) continue;
			this.registerService(serviceName, new service())
		}
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
