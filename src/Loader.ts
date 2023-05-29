import { glob } from "glob";

import loadModule from "./utils/loadModule";

abstract class Loader<C extends new (...args: any) => any, M> {
	protected abstract readonly metaKey: string;
	protected constructor() { }

	public async load(paths: SingleOrArray<string>) {
		if (!Array.isArray(paths)) paths = [paths];

		paths = paths.map(e => {
			if (e.endsWith(".js")) return e;
			if (e.endsWith("**")) return e + "/*.js";
			if (e.endsWith("*")) return e + ".js";
			if (e.endsWith("/") || e.endsWith("\\")) return e + "**/*.js";
			return e + "/**/*.js";

		})
		const files = await glob(paths, { windowsPathsNoEscape: true });
		await Promise.all(files.map(file => this.loadModule(file)));
	}

	protected async loadModule(path: string) {
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
