import EventEmitter from "events";
import glob from "fast-glob";

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

	public async load(globs: SingleOrArr<string>) {
		await Promise.all(
			(await glob(globs, { cwd: this.root }))
				.map(path => {
					path = normalize(this.root + path);
					if (!path.endsWith(".js")) return Logger.warn(`File ${path} is not JavaScript file.`);

					return this.loadModule(path);
				})
		);
	}

	private async loadModule(path: string): Promise<void> {
		const controller = (await <Promise<{ default: T }>>import("file://" + path)).default;

		if (!controller) {
			Logger.warn(`File ${path} does not export anything by default`);
			return;
		}

		if (!this.condition(controller)) {
			Logger.warn(`export default of the file ${path} failed condition`);
			return;
		}

		this.emit("load", controller, path);
	}
}

interface Loader<T> extends EventEmitter {
	emit(event: "load", obj: T, path: string): boolean;
	on(event: "load", callback: (obj: T, path: string) => void): this;
}

export default Loader;
