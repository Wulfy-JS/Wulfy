import { readFileSync } from "fs";
import { isAbsolute, resolve } from "path";

import DotEnv from "./utils/DotEnv";

type RawControllerConfig = Undefined<SingleOrArray<string>>;
type ControllerConfig = string[];
type RawStaticConfig = Undefined<NodeJS.Dict<SingleOrArray<string>>>;
type StaticConfig = NodeJS.Dict<string[]>;

interface RawConfig {
	controllers: RawControllerConfig;
	static: RawStaticConfig;
	error: RawControllerConfig;
}

interface Config {
	controllers: ControllerConfig;
	static: StaticConfig;
	error: ControllerConfig;
}

function prepareControllerConfig(config: RawControllerConfig, def?: string): ControllerConfig {
	if (!config) config = def ? [def] : [];
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
	const rawConfig: RawConfig = JSON.parse(readFileSync(file, { encoding: 'utf-8' }));
	const config: Config = {
		controllers: prepareControllerConfig(rawConfig.controllers, "./controllers/**/*.js"),
		static: prepareStaticConfig(rawConfig.static),
		error: prepareControllerConfig(rawConfig.error)
	};
	return config;
}

export default readConfig;
