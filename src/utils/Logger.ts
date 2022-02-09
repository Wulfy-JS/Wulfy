import pino from "pino";
import DotEnv from "./DotEnv";

const Logger = (() => {
	DotEnv.init();
	return pino({
		level: process.env.MODE == "dev" ? "debug" : "info"
	});
})()

export default Logger;
