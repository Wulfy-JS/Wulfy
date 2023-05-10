import { readFileSync } from "fs";
import { isAbsolute, resolve } from "path";

type RawControllerConfig = Undefined<SingleOrArray<string>>;
type ControllerConfig = string[];
type RawStaticConfig = Undefined<NodeJS.Dict<SingleOrArray<string>>>;
type StaticConfig = NodeJS.Dict<string[]>;
interface RawServerConfig {
	http_port?: number;
	https_port?: number;
	tls_redirect?: boolean;
	private_key?: string;
	certificate?: string;
}
interface BaseServerConfig {
	http_port: number;
}
interface TLSServerConfig extends BaseServerConfig {
	https_port: number;
	tls_redirect: boolean;
	private_key: string;
	certificate: string;
}
type ServerConfig = BaseServerConfig | TLSServerConfig;

interface RawConfig {
	server?: RawServerConfig;
	controllers?: RawControllerConfig;
	static?: RawStaticConfig;
	error?: RawControllerConfig;
	services?: RawControllerConfig;
}

interface Config {
	server: ServerConfig;
	controllers: ControllerConfig;
	static: StaticConfig;
	error: ControllerConfig;
	services: ControllerConfig;
}

function prepareControllerConfig(config: RawControllerConfig, def: ControllerConfig = []): ControllerConfig {
	if (!config) config = def;
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

function prepareServerConfig(config: RawServerConfig = {}): ServerConfig {
	if (config.certificate && config.private_key)
		return {
			http_port: config.http_port || 80,
			https_port: config.https_port || 443,
			certificate: config.certificate,
			tls_redirect: config.tls_redirect || true,
			private_key: config.private_key

		}
	return {
		http_port: config.http_port || 80
	};
}


const defaultConfigFile = "config.json";
function readConfig(): Config {
	const rawConfig: RawConfig = JSON.parse(readFileSync(defaultConfigFile, { encoding: 'utf-8' }));
	const config: Config = {
		controllers: prepareControllerConfig(rawConfig.controllers, ["./controllers/**/*.js"]),
		static: prepareStaticConfig(rawConfig.static),
		error: prepareControllerConfig(rawConfig.error),
		services: prepareControllerConfig(rawConfig.services),
		server: prepareServerConfig(rawConfig.server)
	};
	return config;
}

function isTLSServerConfig(cfg: ServerConfig): cfg is TLSServerConfig {
	return !!((<TLSServerConfig>cfg).private_key && (<TLSServerConfig>cfg).certificate);
}

export default readConfig;
export { Config, isTLSServerConfig, TLSServerConfig };
