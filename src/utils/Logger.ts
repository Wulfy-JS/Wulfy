import pino from "pino";
import DotEnv from "./DotEnv";

const Logger = (() => {
	DotEnv.init();
	const logger = pino({
		level: process.env.MODE == "dev" ? "debug" : "info",
		...(process.env.PINO_TRANSPORT ? { transport: { target: process.env.PINO_TRANSPORT } } : {}),
	});
	process.on('uncaughtException', pino.final(logger, (err, finalLogger) => {
		finalLogger.error(err, 'uncaughtException')
		process.exit(1)
	}))

	process.on('unhandledRejection', pino.final(logger, (err, finalLogger) => {
		finalLogger.error(err, 'unhandledRejection')
		process.exit(1)
	}))
	return logger;
})()

export default Logger;
