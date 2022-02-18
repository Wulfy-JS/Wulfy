import Core from "../Core/Core";
import Request from "../Request/Request";
import RouteMethods from "./RouteMethods"
import FileResponse from "../Response/FileResponse";
import normalize from "../utils/normalize";
import { existsSync as exists, statSync as stat } from "fs";

class StaticRouter {
	private routes: Map<string, string> = new Map();

	public register(url: string, path: string) {
		if (!url.startsWith("/")) url = "/" + url;

		if (this.routes.has(url))
			throw new RangeError(`Static Route for url "${url}" alredy been register.`);

		this.routes.set(url, path);
	}

	protected findRoutes(url: string): { url: string, path: string }[] | undefined {
		const routes: { url: string, path: string }[] = [];
		for (let key of this.routes.keys()) {
			if (!url.startsWith(key)) continue;
			const path = this.routes.get(key);
			if (!path) continue;
			routes.push({ url: key, path });
		}

		if (routes.length) return routes;

	}

	public getFileResponse(request: Request): FileResponse | undefined {
		const requestMethod = request.method.toUpperCase();
		if (requestMethod !== RouteMethods.GET && requestMethod !== RouteMethods.HEAD) return;

		let url = request.path;
		if (!url.startsWith("/")) url = "/" + url;

		const folders = this.findRoutes(url);
		if (!folders) return;
		for (const folder of folders) {
			const path = normalize(Core.rootPath + "/" + folder.path + "/" + url.replace(folder.url, ""));
			if (!exists(path) || !(stat(path).isFile())) continue;

			return new FileResponse()
				.setFile(path);
		}
	}
}

export default StaticRouter;
