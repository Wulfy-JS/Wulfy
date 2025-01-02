import { createReadStream, existsSync, readdirSync, statSync } from "fs";
import { Request, Response } from "./Wulfy.js";
import { extname, resolve } from "path";
import { resolve as posix_resolve } from "path/posix";
import mime from 'mime';
import sendStream from "./utils/sendStream.js";
interface StaticOptions {
	dynamic?: boolean
	ignored?: string[]
}

interface StaticRouteOptions extends Required<StaticOptions> {
	dir: string;
}

function INIT_STATICROUTEOPTIONS(dir: string): StaticRouteOptions {
	return {
		dir,
		dynamic: false,
		ignored: []
	}
}
class StaticRouter {
	private routes: Map<string, StaticRouteOptions> = new Map();
	private static: Map<string, string> = new Map();
	private dynamic: Map<string, StaticRouteOptions> = new Map();

	public register(url: string, dir: string, options: StaticOptions = {}) {
		dir = resolve(process.cwd(), dir);
		const { dynamic, ignored } = Object.assign(INIT_STATICROUTEOPTIONS(dir), options);

		if (!existsSync(dir))
			throw new ReferenceError(`${dir} not exists`);

		if (!statSync(dir).isDirectory()) {
			console.log("Register static:", url, dir);
			this.static.set(url, dir);
			if (dynamic)
				console.warn(`"${dir}" is not directory. Option "dynamic" ignored.`);

			this.routes.set(url, { dir, dynamic: false, ignored });
			return this;
		}

		if (dynamic) {
			console.log("Register dynamic static:", url, dir);
			this.dynamic.set(url, { dir, dynamic, ignored });
			this.routes.set(url, { dir, dynamic, ignored });
			return this;
		}

		const files = readdirSync(dir, { recursive: true, encoding: 'utf-8' });
		for (let file of files) {
			file = file.replace(/\\/g, '/');
			const path = resolve(dir, file);
			if (statSync(path).isDirectory())
				continue;

			const _url = posix_resolve(url, file);
			if (ignored.findIndex(ignore => file.startsWith(ignore)) == -1) {
				console.log("Register static:", _url, path);
				this.static.set(_url, path);
			}
		}
		this.routes.set(url, { dir, dynamic, ignored });

		return this;
	}

	public unregister(url: string) {
		const route = this.routes.get(url);
		if (!route) return this;

		const { dir, dynamic } = route;

		if (dynamic) {
			this.dynamic.delete(url);
			console.log("Unregister dynamic static:", url);
		} else {
			const files = readdirSync(dir, { recursive: true, encoding: 'utf-8' });
			for (let file of files) {
				file = file.replace(/\\/g, '/');
				const path = resolve(dir, file);
				if (statSync(path).isDirectory())
					continue;

				const _url = posix_resolve(url, file);
				console.log("Unregister static:", _url);
				this.static.delete(_url);
			}
		}

		return this;
	}

	public async request(req: Request, res: Response): Promise<boolean> {
		const file = this.static.get(req.url);
		if (file) {
			if (!existsSync(file)) return Promise.resolve(false);

			res.setHeader('content-type', mime.getType(extname(file)) || 'text/plain');
			const stream = createReadStream(file);
			await sendStream(stream, res);
			return true;
		}

		for (const url of this.dynamic.keys()) {
			if (!req.url.startsWith(url)) continue;

			const route = this.dynamic.get(url) as StaticRouteOptions;
			const file = resolve(route.dir, "./" + req.url.slice(url.length));
			console.log("Test dynamic static file:", file,)
			if (route.ignored.findIndex(e => file.startsWith(resolve(route.dir, e))) != -1)
				return Promise.resolve(false);
			if (!existsSync(file)) return Promise.resolve(false);

			if (statSync(file).isDirectory()) return Promise.resolve(false);

			res.setHeader('content-type', mime.getType(extname(file)) || 'text/plain');
			const _res = createReadStream(file).pipe(res);
			return new Promise((r) => _res.on('close', () => r(true)))
		}

		return Promise.resolve(false);
	}
}

export default StaticRouter;
