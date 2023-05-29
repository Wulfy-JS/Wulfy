import { glob } from "glob";

import loadModule from "./utils/loadModule";
import Config from "./Config";

abstract class Loader<C extends new (...args: any) => any, M> {
	protected abstract readonly metaKey: string;
	protected abstract readonly cfgPath: string;
	protected readonly cfgDefault: SingleOrArray<string> = [];
	protected constructor() { }

	private async getFiles() {
		let paths = Config.get<SingleOrArray<string>>(this.cfgPath, this.cfgDefault);

		if (!Array.isArray(paths)) paths = [paths];

		paths = paths.map(e => {
			if (e.endsWith(".js")) return e;
			if (e.endsWith("**")) return e + "/*.js";
			if (e.endsWith("*")) return e + ".js";
			if (e.endsWith("/") || e.endsWith("\\")) return e + "**/*.js";
			return e + "/**/*.js";
		});
		return await glob(paths, { windowsPathsNoEscape: true });
	}

	public async configure(callback: () => void = () => { }) {
		await this.load(await this.getFiles());
		callback();
	}

	private async load(files: string[]) {
		await Promise.all(files.map(file => this.loadModule(file)));
	}
	private async loadModule(path: string) {
		const module = await loadModule(path);

		for (const name in module) {
			const exportedObject = module[name];
			if (typeof exportedObject !== "function") continue;

			const meta: Undefined<M> = Reflect.getMetadata(this.metaKey, exportedObject);
			if (!meta) continue;

			this.register(exportedObject, meta, name, path);
		}
	}

	protected abstract register(clazz: C, meta: M, name: string, path: string): void;

	private static instance: Loader<any, any>;
	public static getInstance<C extends new (...args: any) => any, M, L extends Loader<C, M>>(): L {
		//@ts-ignore
		if (!this.instance || !(this.instance instanceof this)) this.instance = new this();
		//@ts-ignore
		return this.instance;
	}
}

export default Loader;
