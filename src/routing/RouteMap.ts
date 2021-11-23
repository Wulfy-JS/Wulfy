import PTR from "path-to-regexp";
import RouteHandler from "./RouteHandler.js";
import RouteOptions from "./RouteOptions.js";
const { pathToRegexp } = PTR;

interface RouteKey extends RouteOptions<RegExp> {
	keys: PTR.Key[]
}

class RouteMap extends Map<RouteKey, RouteHandler> {
	private static algoFindByPath(path: string, method: string, putMatches: (matches: RegExpExecArray) => void = () => null) {
		return (key: RouteOptions) => {
			const matches = key.path.exec(path);
			if (!matches) return false;
			putMatches(matches);

			let i = -1;
			if (Array.isArray(key.method))
				i = key.method.findIndex(e => e == method);
			else
				i = [method, "all"].indexOf(key.method);

			return i !== -1;
		}
	}
	private static algoFindByName(name: string) {
		return (key: RouteOptions) => key.name == name
	}

	public set(key: RouteOptions<string | RegExp>, value: RouteHandler): this {
		if (this.findRouteByName(key.name))
			throw new RangeError(`Route "${key.name}" was alredy register`);

		const keys = [];
		super.set({
			...key,
			path: key.path instanceof RegExp ? key.path : pathToRegexp(key.path, keys),
			keys
		}, value);
		return this;
	}



	public findKey(callback: (key: RouteOptions) => boolean): RouteKey | false {
		for (const key of this.keys())
			if (callback(key))
				return key;

		return false;
	}

	public findKeyByName(name: string) {
		return this.findKey(RouteMap.algoFindByName(name));
	}

	public findKeyByPath(path: string, method: string): [RouteKey, RegExpExecArray] | false {
		method = method.toLowerCase();
		let matches: RegExpExecArray;

		const result = this.findKey(RouteMap.algoFindByPath(path, method, m => matches = m));

		if (!result)
			return false;

		return [result, matches];
	}

	public findRoute(callback: (key: RouteKey) => boolean): RouteHandler | false {
		const key = this.findKey(callback);
		if (!key)
			return false;

		return this.get(key);
	}

	public findRouteByName(name: string) {
		return this.findRoute(RouteMap.algoFindByName(name));
	}

	public findRouteByPath(path: string, method: string): [RouteHandler, RegExpExecArray] | false {
		method = method.toLowerCase();

		let matches: RegExpExecArray;
		const result = this.findKey(RouteMap.algoFindByPath(path, method, m => matches = m));

		if (!result)
			return false;

		return [this.get(result), matches];
	}

	public findRouteAndKey(callback: (key: RouteOptions) => boolean): [RouteHandler, RouteKey] | false {
		const key = this.findKey(callback);
		if (!key) return false;

		return [this.get(key), key];
	}

	public findRouteAndKeyByName(name: string) {
		return this.findRouteAndKey(RouteMap.algoFindByName(name));
	}

	public findRouteAndKeyByPath(path: string, method: string): [RouteHandler, RouteKey, RegExpExecArray] | false {
		method = method.toLowerCase();

		let matches: RegExpExecArray;
		const result = this.findRouteAndKey(RouteMap.algoFindByPath(path, method, m => matches = m));

		if (!result)
			return false;
		return [...result, matches];
	}
}

export default RouteMap;
