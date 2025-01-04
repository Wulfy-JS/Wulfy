import { Server } from "http";
import { Server as SecureServer } from "https";
import { Router } from "./Router/Router.js";
import { resolve } from "path/posix";
import StaticRouter from "./Router/StaticRouter.js";
import HttpError from "./HttpError.js";
import HttpCodes from "./HttpCodes.js";
import dotenv from 'dotenv';
import { getBoolean, getInteger, getString } from "./utils/getEnvValue.js";
import { DEFAULT_HOSTNAME, DEFAULT_HTTP_PORT, DEFAULT_HTTPS_PORT, DEFAULT_TIMEOUT } from "./consts.js";
import getSecureContext from "./utils/getSecureContext.js";
import { HttpMethod, Request, Response } from "./Router/HttpMethod.js";

class Wulfy {

	protected hostname: string = DEFAULT_HOSTNAME;
	protected http_port: number = DEFAULT_HTTP_PORT;
	protected https_port: number = DEFAULT_HTTPS_PORT;
	protected redirect_to_ssl: boolean = false;
	protected timeout: number = DEFAULT_TIMEOUT;

	protected getHttpLocation(path: string = '/'): string {
		let url = `http://${this.hostname}`;
		if (this.http_port !== DEFAULT_HTTP_PORT)
			url += `:${this.http_port}`;

		if (!path.startsWith('/')) path = '/' + path;
		return url + path;
	}
	protected getHttpsLocation(path: string = '/'): string {
		let url = `https://${this.hostname}`;
		if (this.https_port !== DEFAULT_HTTPS_PORT)
			url += `:${this.https_port}`;

		if (!path.startsWith('/')) path = '/' + path;
		return url + path;
	}

	private _server = new Server();
	private _secServer: SecureServer = new SecureServer();

	public readonly router = new Router('/');
	public readonly static = new StaticRouter();

	public constructor() {
		this.handleSIGINT = this.handleSIGINT.bind(this);
		this.handleRequest = this.handleRequest.bind(this);
		this.redirectToSSL = this.redirectToSSL.bind(this);
	}
	private async handleSIGINT() {
		await this.stop();
		process.exit(0);
	}

	private async handleError(req: Request, res: Response, error: any) {
		error = HttpError.from(error, HttpCodes.INTERNAL_SERVER_ERROR);

		res.statusCode = error.code;
		res.statusMessage = error.message;
		res.end();
	}

	private async handleRequest(req: Request, res: Response) {
		req.url = resolve(req.url || "/");
		req.method = req.method.toLowerCase() as HttpMethod;

		console.log("REQUEST:", req.method, req.url);

		try {
			const timeout = setTimeout(() => this.handleError(req, res, new HttpError(HttpCodes.REQUEST_TIMEOUT)), this.timeout);

			if (await this.static.request(req, res)) return;

			await this.router.request(req, res)

			clearTimeout(timeout);

		} catch (error: any) {
			await this.handleError(req, res, error);
		}
	}

	private async redirectToSSL(req: Request, res: Response) {
		const { code, message } = HttpCodes.FOUND;
		res.statusCode = code;
		res.statusMessage = message;
		res.setHeader('Location', this.getHttpsLocation(req.url));
		res.end();
	}

	protected __start(): void | Promise<void> { };

	public async start() {
		dotenv.config();

		const secure_context = getSecureContext();
		this.hostname = getString('HOSTNAME', DEFAULT_HOSTNAME);
		this.timeout = getInteger("TIMEOUT", DEFAULT_TIMEOUT);
		this.http_port = getInteger('HTTP_PORT', DEFAULT_HTTP_PORT);
		this.https_port = getInteger('HTTPS_PORT', DEFAULT_HTTPS_PORT);
		this.redirect_to_ssl = secure_context ? getBoolean("HTTP_TO_HTTPS", true) : false;

		this._server.on("request", this.redirect_to_ssl ? this.redirectToSSL : this.handleRequest);
		this._secServer.on("request", this.handleRequest);

		await this.__start();

		this._server.listen(this.http_port, this.hostname, () => {
			console.log(`HTTP-Server start in ${this.getHttpLocation()}`);
		});

		if (secure_context) {
			this._secServer.setSecureContext(secure_context)
			this._secServer.listen(this.https_port, this.hostname, () => {
				console.log(`HTTPS-Server start in ${this.getHttpsLocation()}`);
			})
		}
		process.on('SIGINT', this.handleSIGINT);
		return this;
	}

	protected __stop(): void | Promise<void> { };
	public async stop() {
		await this.__stop();

		process.off('SIGINT', this.handleSIGINT);
		this._server.off("request", this.redirect_to_ssl ? this.redirectToSSL : this.handleRequest);
		this._secServer.off("request", this.handleRequest);

		await new Promise<void>(r => this._server.close(() => {
			console.log("Server closed");
			r();
		}));
		return this;
	}

	private static _instance: Wulfy;

	public static getInstance<T extends Wulfy>(this: { new(): T } & typeof Wulfy): T {
		if (!this._instance)
			this._instance = new this();
		return <T>this._instance;
	}
}

export default Wulfy;
