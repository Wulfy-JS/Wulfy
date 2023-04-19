import { existsSync, readFileSync } from "fs";
import DotEnv from "./utils/DotEnv";
import path, { isAbsolute, resolve } from "path";

type RawControllerConfig = Undefined<SingleOrArray<string>>;
type ControllerConfig = string[];
type RawStaticConfig = Undefined<NodeJS.Dict<SingleOrArray<string>>>;
type StaticConfig = NodeJS.Dict<string[]>;

interface RawConfig {
	controllers: RawControllerConfig;
	static: RawStaticConfig;
}

interface Config {
	controllers: ControllerConfig;
	static: StaticConfig;
}

function prepareControllerConfig(config: RawControllerConfig): ControllerConfig {
	if (!config) config = ["./controllers/**/*.js"];
	if (!Array.isArray(config)) config = [config];

	config = config.map(path => isAbsolute(path) ? path : resolve(process.cwd(), path));
	return config;
}

function prepareStaticConfig(config: RawStaticConfig): StaticConfig {
	if (!config) return {};

	const preparedConfig: StaticConfig = {};
	for (const url in config) {
		let paths = config[url];
		if (!paths) continue;
		if (!Array.isArray(paths)) paths = [paths];

		paths = paths.map(path => isAbsolute(path) ? path : resolve(process.cwd(), path));
		if (paths.length > 0) preparedConfig[url] = paths;
	}

	return preparedConfig;
}


const defaultConfigFile = "config.json";
function readConfig(): Config {
	const file = DotEnv.getString("CONFIG_FILE", defaultConfigFile);
	const cfg: RawConfig = JSON.parse(readFileSync(file, { encoding: 'utf-8' }));


	return {
		controllers: prepareControllerConfig(cfg.controllers),
		static: prepareStaticConfig(cfg.static)
	};
}

export default readConfig;
