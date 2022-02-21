import EventEmitter from "events";
import glob from "fast-glob";
import { readFile } from "fs/promises";

import Logger from "../utils/Logger";
import normalize from "../utils/normalize";

import { SingleOrArr } from "../utils/SingleOrArr";

abstract class Loader<T> extends EventEmitter {
	constructor(protected root: string = process.cwd()) {
		super();
	};

	public setRoot(root: string) {
		this.root = root;
	}

	protected abstract condition(obj: T): boolean;
	protected abstract packageProperty(): string;

	public load(globs: SingleOrArr<string>, root: string = this.root) {
		if (!Array.isArray(globs)) globs = [globs];

		const paths = [];
		const modules = [];

		for (const path of globs) {
			if (/^[./\\]/.test(path))
				paths.push(path);
			else
				modules.push(path);
		}

		return Promise.all([
			this.loadFromFiles(paths, root),
			this.loadFromModules(modules)
		])
	}

	private async loadFromModules(modules: string[]) {
		return Promise.all(modules.map(async module => {
			if (!import.meta.resolve) return false;

			const path = await import.meta.resolve(module);
			const match = path.match(new RegExp("^(?:file:\/\/)?((?:.*)\\/" + module + "\\/)", "i"));
			if (!match) return false;
			const rootPath = match[1];

			const pakage = JSON.parse(await readFile(rootPath + "package.json", { encoding: "utf-8" }));;
			if (!pakage.wulfy) {
				Logger.warn(`Module ${module} not have configurate wulfy. Load from main.`)
				return this.loadModule(module);
			}

			const prop = this.packageProperty();
			const paths = pakage.wulfy[prop];
			if (!paths) {
				Logger.warn(`Module ${module} not have property ${prop}. Load from main.`);
				return this.loadModule(module);
			}

			return this.loadFromFiles(paths, rootPath);
		}));
	}

	private async loadFromFiles(globs: string[], root: string = this.root) {
		return Promise.all(
			(await glob(globs, { cwd: root }))
				.map(path => {
					path = normalize(root + path);
					if (!path.endsWith(".js")) return Logger.warn(`File ${path} is not JavaScript file.`);

					return this.loadModuleFromFile(path);
				})
		);
	}

	private async loadModuleFromFile(path: string): Promise<void> {
		const controller = (await <Promise<{ default: T }>>import("file://" + path)).default;

		if (!controller) {
			Logger.warn(`File ${path} does not export anything by default`);
			return;
		}


		if (Array.isArray(controller)) {
			controller.forEach((controller, index) => {
				if (!this.condition(controller)) {
					Logger.warn(`export default of the file ${path}[${index}] failed condition`);
					return;
				}

				this.emit("load", controller, path);
			})
		} else {
			if (!this.condition(controller)) {
				Logger.warn(`export default of the file ${path} failed condition`);
				return;
			}

			this.emit("load", controller, path);
		}
	}

	private async loadModule(module: string): Promise<void> {
		const controller = (await <Promise<{ default: SingleOrArr<T> }>>import(module)).default;

		if (!controller) {
			Logger.warn(`Module ${module} does not export anything by default`);
			return;
		}

		if (Array.isArray(controller)) {
			controller.forEach((controller, index) => {
				if (!this.condition(controller)) {
					Logger.warn(`export default of the module ${module}[${index}] failed condition`);
					return;
				}

				this.emit("load", controller, module);
			})
		} else {
			if (!this.condition(controller)) {
				Logger.warn(`export default of the module ${module} failed condition`);
				return;
			}

			this.emit("load", controller, module);
		}
	}
}

interface Loader<T> extends EventEmitter {
	emit(event: "load", obj: T, path: string): boolean;
	on(event: "load", callback: (obj: T, path: string) => void): this;
}

export default Loader;
