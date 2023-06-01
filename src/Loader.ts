import { glob } from "glob";

import loadModule from "./utils/loadModule";
import Config from "./Config";
import Modules from "./Modules";
interface ExportObjectInfo {
	export: string;
	path: string
}

// interface ModulesConfig {
// 	pathsSearch: string[];
// 	names: string[]
// };
// type Modules = ModulesConfig | string[]



abstract class Loader<C extends new (...args: any) => any, M> {
	protected constructor(
		protected readonly metaKey: string,
		protected readonly cfgPath: string,
		protected readonly cfgDefault: SingleOrArray<string> = [],
	) { }

	private async getFiles() {
		let paths = Config.get<SingleOrArray<string>>(this.cfgPath, this.cfgDefault);
		if (!Array.isArray(paths)) paths = [paths];

		paths = paths.concat(Modules.get(this.cfgPath)).map(e => {
			// paths = paths.map(e => {
			e = Config.prepareString(e);
			if (e.endsWith(".js")) return e;
			if (e.endsWith("**")) return e + "/*.js";
			if (e.endsWith("*")) return e + ".js";
			if (e.endsWith("/") || e.endsWith("\\")) return e + "**/*.js";
			return e + "/**/*.js";
		});
		console.log("getFiles", this.cfgPath + ":", paths)
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

			this.register(exportedObject, meta, { export: name, path });
		}
	}

	protected abstract register(clazz: C, meta: M, module: ExportObjectInfo): void;
}

export default Loader;
export { ExportObjectInfo }
