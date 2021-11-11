import { readFileSync } from "fs";

class Config {
	public constructor(file?: string) {
		if (file)
			this.readFromFile(file)
	}

	private cfg: NodeJS.Dict<any> = {};

	public readFromFile(file: string) {
		this.cfg = JSON.parse(readFileSync(file).toString())
	}

	public get<T>(key: string, defaultValue?: T): T {
		if (this.cfg[key] === undefined) {
			if (defaultValue !== undefined)
				return defaultValue;

			throw new RangeError(`Field "${key}" not found`);
		}

		return this.cfg[key];
	}

	public set<T>(key: string, value: T): this {
		this.cfg[key] = value;
		return this;
	}
}

export default Config;
