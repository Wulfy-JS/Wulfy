import { IncomingMessage, Server, ServerResponse } from "http";
import { Router } from "./Router.js";
import { HttpMethod } from "./Route.js";
import { resolve } from "path/posix";
import StaticRouter from "./StaticRouter.js";
import HttpError from "./HttpError.js";
// import { Server as SecureServer } from "https";

interface Request extends IncomingMessage {
	url: string;
	method: HttpMethod;
}
interface Response extends ServerResponse<Request> { }

class Wulfy {

	private _server = new Server();
	// private _secServer: SecureServer = new SecureServer();

	public readonly router = new Router();
	public readonly static = new StaticRouter();

	protected constructor() {
		this.handleSIGINT = this.handleSIGINT.bind(this);
	}
	private async handleSIGINT() {
		await this.stop();
		console.log('Do something useful here.');
		process.exit(0);
	}

	public async start() {
		await this.init();
		this._server.listen(80, "localhost");
		process.on('SIGINT', this.handleSIGINT);
		return this;
	}

	public async stop() {
		process.off('SIGINT', this.handleSIGINT);
		await new Promise<void>(r => this._server.close(() => {
			console.log("Server closed");
			r();
		}));
		return this;
	}

	// Override
	protected __init(): void | Promise<void> { }

	private _inited: boolean = false;
	public get inited() {
		return this._inited;
	}
	protected async init() {
		if (this.inited) return;

		await this.__init();

		this._server.on("request", async (req: Request, res: Response) => {
			req.url = resolve(req.url || "/");
			req.method = req.method.toLowerCase() as HttpMethod;

			console.log("REQUEST:", req.method, req.url)
			try {
				if (await this.router.request(req, res)) return;

				if (await this.static.request(req, res)) return;

				await this.router.error(req, res, new HttpError(404, "Not Found"));
			} catch (error: any) {
				try {
					if (!(error instanceof HttpError))
						error = new HttpError(500, "Internal Server Error");

					await this.router.error(req, res, error);
				} catch (e) {
					res.statusCode = 500;
					res.statusMessage = "Internal Server Error";
					res.end();
				}
			}
		});

		this._inited = true;
		return this;
	}

	private static _instance: Wulfy;

	public static getInstance() {
		if (!this._instance)
			this._instance = new this();
		return this._instance;
	}
}

export default Wulfy;

export type { Request, Response };
