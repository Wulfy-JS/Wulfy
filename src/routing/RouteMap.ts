import RouteHandler from "./RouteHandler.js";
import RouteOptions from "./RouteOptions.js";


class RouteMap extends Map<RouteOptions, RouteHandler> {
	public set(key: RouteOptions, value: RouteHandler): this {
		if (this.findRouteByName(key.name))
			throw new RangeError(`Route "${key.name}" was alredy register`);

		super.set(key, value);

		return this;
	}

	public findRouteByName(name: string) {
		return this.find(e => e.name == name);
	}

	public findRoute(path: string, method: string) {
		method = method.toLowerCase();

		return this.find(e => {
			if (e.path !== path) return;
			let i = -1;
			if (Array.isArray(e.method))
				i = e.method.findIndex(e => e == "all" || e == method);
			else
				i = [e.method, "all"].indexOf(e.method);

			return i !== -1;
		});
	}

	public findKey(callback: (key: RouteOptions) => boolean): RouteOptions | false {
		for (const key of this.keys())
			if (callback(key))
				return key;

		return false;
	}

	public find(callback: (key: RouteOptions) => boolean): RouteHandler | false {
		const key = this.findKey(callback);
		if (!key)
			return false;

		return this.get(key);
	}
}

export default RouteMap;
