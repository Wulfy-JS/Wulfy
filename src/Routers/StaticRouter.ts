import { createReadStream, existsSync } from "fs";
import { resolve } from "path";
import { IncomingMessage, ServerResponse } from "http";

import mime from "mime";
import Config from "../Config";

type StaticRouterConfig = NodeJS.Dict<string[]>;
type StaticRouterList = Map<string, Set<string>>;

class StaticRouter {
	private routes: StaticRouterList = new Map();
	protected constructor() { }

	public configure(callback: () => void = () => { }) {
		this.routes.clear();
		const cfg = <StaticRouterConfig>Config.get("static", {})
		for (const url in cfg) {
			const rawPaths = cfg[url];
			if (!rawPaths) continue;
			const paths: Set<string> = new Set();
			for (const rawPath of rawPaths) {
				const path = Config.prepareString(rawPath);
				if (!existsSync(path)) continue;
				paths.add(path);
			}

			if (paths.size > 0)
				this.routes.set(url, paths);
		}
		callback();
	}

	public get(url_file: string) {
		for (const [url, paths] of this.routes.entries()) {
			if (!url_file.startsWith(url)) continue;
			url_file = url_file.slice(url.length)

			for (const [, path] of paths.entries()) {
				const path_file = resolve(path, url_file);
				if (!existsSync(path_file)) continue;

				return (req: IncomingMessage, res: ServerResponse) => {
					res.writeHead(200, { 'content-type': mime.getType(path_file) || "text/plain" });

					createReadStream(path_file).pipe(res);
				}
			}
		}

		return false;
	}

	private static _staticRouter = new StaticRouter();
	public static get StaticRouter() {
		return this._staticRouter;
	}
}


export default StaticRouter;
