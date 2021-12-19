import Core from "../index";
import { createServer, Server } from "http";
import Config from "simcfg";
import { RoutingConfigurator } from "../index";

declare module "http" {
	interface IncomingMessage {
		body: string;
	}
}

class HttpCore extends Core {
	private port: number;
	private server: Server;

	protected __init() {
		this.port = 8080;
		this.server = createServer();
		this.server.on("request", (req, res) => {
			req.body = "";
			req.on("data", c => req.body += c);
			req.on("end", () => {
				this.response(req, res);
			})
		})
	}

	protected async __launch() {
		this.server.listen(this.port || 80);
	}
	protected __shutdown() {
		this.server.close();
	}

	protected configure(config: Config): void {
	}
	protected configureRoutes(routes: RoutingConfigurator): void {
		routes.loadControllers("/dist/test/controllers")
		// throw new Error("Method not implemented.");
	}
}

export default HttpCore;
