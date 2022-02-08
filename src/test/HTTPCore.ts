import { createServer, Server } from "http";
import { Readable } from "stream";
import Core from "../Core/Core";
import Logger from "../utils/Logger";

declare module "http" {
	interface IncomingMessage {
		body: string;
	}
}

class HttpCore extends Core {
	private port: number;
	private server: Server;

	constructor() {
		super();

		this.port = 8080;
		this.server = createServer();
	}

	protected init() {
		this.server.on("request", (req, res) => {
			req.body = "";
			req.on("data", c => req.body += c);
			req.on("end", () => {
				const request = {
					headers: req.headers,
					method: req.method || "get",
					path: req.url || "/",
					body: req.body || ""
				};

				const response = this.getResponse(request);

				const headers = response.getHeaders();
				for (const header in headers) {
					const value = headers[header];
					if (value)
						res.setHeader(header, value);
				}

				res.statusCode = response.getStatus();
				const content = response.getContent();
				if (content) {
					if (content instanceof Readable) {
						content.pipe(res);
					} else {
						res.write(content);
					}
				}
				res.end();
			})
		})
	}

	protected __start() {
		const port = this.port || 80
		this.server.listen(port, () => {
			Logger.info(`Server launch in port ${port}`);
		});
	}
	protected __stop() {
		this.server.close(e => {
			e ? Logger.error(e) : Logger.info(`Server stoped`);
		});
	}

	// protected configure(config: Config): void {
	// }
	// protected configureRoutes(routes: RoutingConfigurator): void {
	// 	routes.loadControllers("/dist/test/controllers")
	// 	// throw new Error("Method not implemented.");
	// }
}

export default HttpCore;
