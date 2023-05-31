import { readFileSync } from "fs";
import { resolve } from "path";
import Cache from "./Cache";
import getAppDataPath from "./utils/getAppDataPath";

namespace Config {
	let rawConfig: object; read();

	function read() {
		const configFile = process.env.CONFIG || "config.json";
		rawConfig = JSON.parse(readFileSync(configFile, { encoding: 'utf-8' }));
	}
	interface Replacer {
		(variable: string, offset: number, source: string): string
	}

	const MapVariables: [
		string | ((variable: string, offset: number, source: string) => boolean),
		string | ((variable: string, offset: number, source: string) => string | false)
	][] = [
			// Env
			[variable => variable.startsWith("env."), (variable) => process.env[variable.slice(4)] ?? false],
			// Cache
			['cache', resolve(process.cwd(), Cache.folder)],
			// AppData
			['appdata', getAppDataPath()],
		];

	function defaultReplace(variable: string, offset: number, source: string, replacer: Replacer): string {
		for (const i in MapVariables) {
			const [condition, replace] = MapVariables[i];
			if (typeof condition === "string" && variable.toLowerCase() !== condition.toLowerCase()) continue;
			if (typeof condition === "function" && !condition(variable, offset, source)) continue;

			if (typeof replace === "string") return replace;
			const res = replace(variable, offset, source);
			if (res !== false) return res;
		}
		return replacer(variable, offset, source);
	}

	export function prepareString(source: string, replacer: Replacer = (e) => e): string {
		return source.replace(/\$([^$]+?)\$/g, (...args) => {
			args.shift();
			const variable: string = args.shift();
			const source: string = args.pop();
			const offset: number = args.pop();

			return defaultReplace(variable, offset, source, replacer);
		});
	}

	export function get<T>(path: string): T | undefined;
	export function get<T>(path: string, defValue: T): T;
	export function get<T>(path: string, defValue?: T): T | undefined {
		let object: any = rawConfig;
		do {
			const objetcKeys = Object.keys(object);
			const _key =
				objetcKeys.find((e) => path === e) ||
				objetcKeys.find((e) => path.startsWith(e + "."));

			if (!_key) return defValue;

			if (!object.hasOwnProperty(_key)) return defValue;

			object = object[_key];
			if (!object) return defValue;

			path = path.slice(_key.length + 1);
			if (path === "")
				return typeof object === "object"
					&& typeof defValue === "object"
					&& !Array.isArray(object)
					&& !Array.isArray(defValue) ? Object.assign({}, defValue, object) : object;
		} while (path !== "");
		return defValue;
	}

}

export default Config;
