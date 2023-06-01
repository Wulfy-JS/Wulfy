import { resolve } from "path";
import Config from "./Config";
import { existsSync, readFileSync } from "fs";


interface ModulesConfig {
	pathsSearch: string[];
	names: string[];
}

type RawModulesConfig = {
	pathsSearch: SingleOrArray<string>;
	names: SingleOrArray<string>;
} | SingleOrArray<string>;

interface RawWulfyConfig {
	controllers?: SingleOrArray<string>
	services?: SingleOrArray<string>
}
interface WulfyConfig {
	controllers: string[]
	services: string[]
}

// class Modules {
// 	private readConfig(): ModulesConfig {
// 		let cfg = Config.get<RawModulesConfig>("modules", []);
// 		if (typeof cfg === "string") cfg = [cfg];
// 		if (Array.isArray(cfg)) {
// 			cfg = {
// 				pathsSearch: [],
// 				names: cfg
// 			}
// 		};
// 		let { names, pathsSearch } = cfg;
// 		if (typeof names === "string") names = [names]
// 		if (typeof pathsSearch === "string") pathsSearch = [pathsSearch]

// 		pathsSearch.unshift('./node_modules/');

// 		return {
// 			pathsSearch,
// 			names
// 		};
// 	}

// 	private isWulfyConfig(cfg: any): cfg is RawWulfyConfig {
// 		return !!(cfg.controllers || cfg.services);
// 	}

// 	public readModules() {
// 		const cfg = this.readConfig();
// 		const cwd = process.cwd();
// 		return cfg.pathsSearch.reduce((r, pathSearch) => cfg.names.reduce((r, name) => {
// 			const rootPath = resolve(cwd, pathSearch, name);
// 			const wulfyConfigFile = resolve(rootPath, "wulfy.json");
// 			let wulfyConfig: any = {};

// 			if (existsSync(wulfyConfigFile)) {
// 				wulfyConfig = JSON.parse(readFileSync(wulfyConfigFile, { encoding: 'utf-8' }))
// 			} else {
// 				const npmConfigFile = resolve(rootPath, "package.json");
// 				if (!existsSync(npmConfigFile)) return r;
// 				const npmCfg = JSON.parse(readFileSync(npmConfigFile, { encoding: 'utf-8' }));
// 				if (!npmCfg.wulfy) return r;
// 				wulfyConfig = npmCfg.wulfy;
// 			}
// 			if (this.isWulfyConfig(wulfyConfig))
// 				r.push(wulfyConfig)

// 			return r;
// 		}, r), [] as RawWulfyConfig[]);
// 	}
// }

namespace Modules {
	function readConfig() {
		let cfg = Config.get<RawModulesConfig>("modules", []);
		if (typeof cfg === "string") cfg = [cfg];
		if (Array.isArray(cfg)) {
			cfg = {
				pathsSearch: [],
				names: cfg
			}
		};
		let { names, pathsSearch } = cfg;
		if (typeof names === "string") names = [names]
		if (typeof pathsSearch === "string") pathsSearch = [pathsSearch]

		pathsSearch.unshift('./node_modules/');

		return {
			pathsSearch,
			names
		};
	}

	function isWulfyConfig(cfg: any): cfg is RawWulfyConfig {
		return !!(cfg.controllers || cfg.services);
	}

	let _config: Nullable<ModulesConfig> = null;
	function readModulesInfo(): WulfyConfig {
		if (!_config) _config = readConfig();
		const { pathsSearch, names } = _config;
		const cwd = process.cwd();
		return pathsSearch.reduce((r, path) => names.reduce((r, name) => {
			const rootPath = resolve(cwd, path, name);
			const wulfyConfigFile = resolve(rootPath, "wulfy.json");
			let wulfyConfig: any = {};

			if (existsSync(wulfyConfigFile)) {
				wulfyConfig = JSON.parse(readFileSync(wulfyConfigFile, { encoding: 'utf-8' }))
			} else {
				const npmConfigFile = resolve(rootPath, "package.json");
				if (!existsSync(npmConfigFile)) return r;
				const npmCfg = JSON.parse(readFileSync(npmConfigFile, { encoding: 'utf-8' }));
				if (!npmCfg.wulfy) return r;
				wulfyConfig = npmCfg.wulfy;
			}
			if (isWulfyConfig(wulfyConfig)) {
				const { controllers, services } = wulfyConfig;

				if (controllers)
					Array.isArray(controllers)
						? r.controllers = r.controllers.concat(controllers.map(e => resolve(rootPath, e)))
						: r.controllers.push(resolve(rootPath, controllers));


				if (services)
					Array.isArray(services)
						? r.services = r.services.concat(services.map(e => resolve(rootPath, e)))
						: r.services.push(resolve(rootPath, services));

			}

			return r;
		}, r), {
			controllers: [],
			services: []
		} as WulfyConfig)
	}

	let ModulesConfig: Nullable<WulfyConfig> = null;
	function hasOwnProperty<T extends object>(t: T, p: string | number | symbol): p is keyof T {
		return t.hasOwnProperty(p);
	}
	export function get(key: string): string[] {
		if (!ModulesConfig) ModulesConfig = readModulesInfo();
		if (hasOwnProperty(ModulesConfig, key))
			return ModulesConfig[key];
		return [];
	}
}

export default Modules;
