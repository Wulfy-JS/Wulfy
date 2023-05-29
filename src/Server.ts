import { ServerResponse } from "http";
import Config from "./Config";
import ErrorRouter from "./Routers/ErrorRouter";
import Router from "./Routers/Router";
import StaticRouter from "./Routers/StaticRouter";
import HttpServer from "./Server/HttpServer";
import HttpsServer from "./Server/HttpsServer";
import ServiceList from "./Services/ServiceList";
import { IncomingMessage } from "http";
import { existsSync, readFileSync } from "fs";
import { TLSSocket } from "tls";
import HttpError from "./HttpError";

interface BaseServerConfig {
	http_port: number;
	https_port?: number;
}
interface TLSServerConfig extends BaseServerConfig {
	https_port: number;
	tls_redirect: boolean;
	private_key: string;
	certificate: string;
}
type ServerConfig = BaseServerConfig | TLSServerConfig;

function isTLSServerConfig(cfg: any): cfg is TLSServerConfig {
	return !!cfg.private_key && !!cfg.certificate && !!cfg.https_port
}

class Server {
	private httpServer: Nullable<HttpServer> = null;
	private httpsServer: Nullable<HttpsServer> = null;
	private cfg: Nullable<ServerConfig> = null;

	protected readonly router: Router = Router.getInstance();
	protected readonly staticRouter: StaticRouter = new StaticRouter();
	protected readonly errorRouter: ErrorRouter = ErrorRouter.getInstance();
	protected readonly serviceList: ServiceList = ServiceList.getInstance();

	protected constructor() {
		this.onRequest = this.onRequest.bind(this);
		this.onRedirect = this.onRedirect.bind(this);
	}

	private async onRequest(req: IncomingMessage, res: ServerResponse) {
		req.secure = req.socket instanceof TLSSocket ? req.socket.encrypted : false;
		console.log(this.router, this.errorRouter)
		const controller = await this.router.get(req);
		if (controller !== false) {
			try {
				await controller(res, this.serviceList);
			} catch (e) {
				this.onError(req, res, e);
			}
			return;
		}

		const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
		const method = (req.method || 'get').toUpperCase();
		if (method == "GET" || method == "HEAD") {
			const file = this.staticRouter.get(url.pathname);
			if (file) return file(req, res);
		}

		//Error 404
		await this.onError(req, res, new HttpError("Not Found", 404));
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
		const errorHandler = await this.errorRouter.get(req, error);
		try {
			errorHandler(res, this.serviceList);
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
	private onRedirect(req: IncomingMessage, res: ServerResponse) {
		const url = new URL(req.url || "", `https://${req.headers.host || 'localhost'}`);

		res.statusCode = 303;
		res.setHeader("Location", url.href);

		res.end();
	}

	protected async configure(callback: () => void = () => { }) {
		this.cfg = Config.get<ServerConfig>("server", {
			http_port: 80,
			https_port: 443,
			tls_redirect: true
		});
		this.httpServer = new HttpServer();

		if (isTLSServerConfig(this.cfg)) {
			this.httpsServer = new HttpsServer({
				key: readFileSync(this.cfg.private_key).toString(),
				cert: readFileSync(this.cfg.certificate).toString()
			});
			this.httpsServer.on('request', this.onRequest);
			this.httpServer.on('request', this.cfg.tls_redirect ? this.onRedirect : this.onRequest)
		} else {
			this.httpServer.on('request', this.onRequest)
		}

		Promise.all([
			new Promise<void>(r => this.router.configure(r)),
			new Promise<void>(r => this.errorRouter.configure(r)),
			new Promise<void>(r => this.serviceList.configure(r)),
		]).then(callback)
		// this.staticRouter.load(cfg.static);

		// this.serviceList.registerService("nunjucks", new NunjucksService());



		return this;
	}

	public start(callback: () => void = () => { }) {
		if (this.httpServer?.listening || this.httpsServer?.listening) return this;
		if (this.cfg === null)
			this.configure();

		Promise.all([
			new Promise<void>(r => this.httpServer ? this.httpServer.listen(this.cfg?.http_port, r) : r()),
			new Promise<void>(r => this.httpsServer ? this.httpsServer.listen(this.cfg?.https_port, r) : r())
		]).then(callback);

		return this;
	}
	public stop(callback: () => void = () => { }) {
		Promise.all([
			new Promise<void>((r) => this.httpServer ? this.httpServer.close(() => { this.httpServer = null; r() }) : r()),
			new Promise<void>((r) => this.httpsServer ? this.httpsServer.close(() => { this.httpsServer = null; r() }) : r())
		]).then(callback)

		return this;
	}
	public restart(callback: () => void = () => { }) {
		this.stop(() => this.start(callback));
		return this;
	}

	private static _instance: Server = new Server();
	public static get Instance(): Server {
		return this._instance;
	}
}

export default Server;
