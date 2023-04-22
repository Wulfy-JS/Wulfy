import { existsSync, readFileSync } from "fs";
import { URL } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { TLSSocket } from "tls";

import "reflect-metadata";

import HttpServer from "./Server/HttpServer";
import HttpsServer from "./Server/HttpsServer";
import DotEnv from './utils/DotEnv';
import Router from "./Routers/Router";
import readConfig from "./Config";
import StaticRouter from "./Routers/StaticRouter";
import { HttpMethod } from "./Routers/Route";
import "./utils/HttpExtend";
import HttpError from "./HttpError";
import ErrorRouter from "./Routers/ErrorRouter";
import ServiceList from "./Services/ServiceList";

const MIN_PORT = 0,
	MAX_PORT = 65535,
	DEFAULT_HTTP_PORT = 80,
	DEFAULT_HTTPS_PORT = 443;

class Core {
	private httpServer: Nullable<HttpServer> = null;
	private httpsServer: Nullable<HttpsServer> = null;
	private configured: boolean = false;

	protected readonly router: Router = new Router();
	protected readonly staticRouter: StaticRouter = new StaticRouter();
	protected readonly errorRouter: ErrorRouter = new ErrorRouter();
	protected readonly serviceList: ServiceList = new ServiceList();
	private constructor() {
		process.on("SIGINT", () => {
			this.stop();
		});
	}

	private getPort(ENV_KEY: string, defaultValue: number) {
		const port = DotEnv.getInt(ENV_KEY, defaultValue);
		if (port < MIN_PORT) throw new ReferenceError(`${ENV_KEY} was been >= ${MIN_PORT}`);
		if (port > MAX_PORT) throw new ReferenceError(`${ENV_KEY} was been <= ${MAX_PORT}`);
		return port;
	}

	private getPrivateKey(): Nullable<string> {
		// Check key in env
		const key = DotEnv.getString("PRIVATE_KEY");
		if (key !== null) return key;
		// Check path to key-file in env
		const key_file = DotEnv.getString("PRIVATE_KEY_FILE");
		if (key_file === null) return null;
		// Check exists key-file
		if (!existsSync(key_file)) return null;

		return readFileSync(key_file).toString();
	}

	private getCertificate(): Nullable<string> {
		// Check key in env
		const key = DotEnv.getString("CERTIFICATE");
		if (key !== null) return key;
		// Check path to key-file in env
		const key_file = DotEnv.getString("CERTIFICATE_FILE");
		if (key_file === null) return null;
		// Check exists key-file
		if (!existsSync(key_file)) return null;

		return readFileSync(key_file).toString();
	}

	private async onError(req: IncomingMessage, res: ServerResponse, error: any) {
		if (!(error instanceof HttpError)) {
			if (error instanceof Error)
				error = new HttpError(error.message);
			else if (typeof error != "object")
				error = new HttpError(error.toString(), 500);
			else
				error = new HttpError(JSON.stringify(error), 500);
		}
		const errorHandler = await this.errorRouter.get(error.code);
		try {
			errorHandler(req, res, this.serviceList, error);
		} catch (e: any) {
			res.writeHead(500);
			res.end("500 Internal Server Error <br/>" +
				(e instanceof Error
					? (e.message + "<br/>" + e.stack)
					: (typeof e == "object"
						? JSON.stringify(e)
						: e.toString()
					)
				)
			);
		}
	}

	private async onRequest(req: IncomingMessage, res: ServerResponse) {
		/**
		 * HTTPS server gives TLS Socket
		 */
		req.secure = req.socket instanceof TLSSocket ? req.socket.encrypted : false;
		const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
		const method = (req.method || 'get').toUpperCase();

		const controller = await this.router.getRoute(url.pathname, <HttpMethod>method.toUpperCase());
		if (controller !== false) {
			try {
				await controller(req, res, this.serviceList);
			} catch (e) {
				this.onError(req, res, e);
			}
			return;
		}

		if (method == "GET" || method == "HEAD") {
			const file = this.staticRouter.getRoute(url.pathname);
			if (file) return file(req, res);
		}

		//Error 404
		await this.onError(req, res, new HttpError("Not Found", 404));
	}

	private redirect(req: IncomingMessage, res: ServerResponse) {
		const url = new URL(req.url || "", `https://${req.headers.host || 'localhost'}`);

		res.statusCode = 303;
		res.setHeader("Location", url.href);

		res.end();
	}

	public async configure() {
		this.configured = true;

		const cfg = readConfig();

		await this.router.configure(cfg.controllers);
		await this.errorRouter.configure(cfg.error);
		await this.serviceList.configure(cfg.services);
		this.staticRouter.configure(cfg.static);

		return this;
	}

	public async start() {
		if (this.httpServer !== null || this.httpsServer !== null) return;
		DotEnv.config();

		if (!this.configured)
			await this.configure();

		this.httpServer = new HttpServer();

		const key = this.getPrivateKey();
		const cert = this.getCertificate();
		const canRun = key != null && cert != null;

		if (canRun) {
			this.httpsServer = new HttpsServer({ key: key, cert: cert })
			this.httpsServer.on('request', (req, res) => this.onRequest(req, res));
			this.httpsServer.listen(this.getPort("HTTPS_PORT", DEFAULT_HTTPS_PORT));
		}

		const redirect = canRun && DotEnv.getBoolean("TLS_REDIRECT", false);
		this.httpServer.on('request', (req, res) => {
			redirect ? this.redirect(req, res) : this.onRequest(req, res)
		});

		this.httpServer.listen(this.getPort("HTTP_PORT", DEFAULT_HTTP_PORT));
		return this;
	}

	public async stop() {
		await Promise.all(
			[
				new Promise<void>(r => this.httpServer === null ? r() : this.httpServer.close(() => r())),
				new Promise<void>(r => this.httpsServer === null ? r() : this.httpsServer.close(() => r())),
			]
		)

		this.httpServer = null;
		this.httpsServer = null;
		return this;
	}

	public async restart() {
		await this.stop();
		return await this.start();
	}

	private static instance: Nullable<Core> = null;
	public static getInstance(): Core {
		if (this.instance === null)
			this.instance = new Core();
		return this.instance;
	}

}

export default Core;
