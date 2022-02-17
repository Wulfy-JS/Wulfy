import { createServer, Server } from "http";
import { Readable } from "stream";
import Core from "../Core/Core";
import Request from "../Request/Request";
import Logger from "../utils/Logger";
import { networkInterfaces } from "os";

declare module "http" {
	interface IncomingMessage {
		body: string;
	}
}

class HttpCore extends Core {
	private port?: number;
	private server?: Server;

	protected init() {
		this.port = 8080;
		this.server = createServer();
		this.server.on("request", (req, res) => {
			req.body = "";
			req.on("data", c => req.body += c);
			req.on("end", async () => {
				const request: Request = {
					headers: req.headers,
					method: req.method || "get",
					path: req.url || "/",
					body: req.body || ""
				};

				const response = await this.getResponse(request);

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
				Logger.info(`${request.method} ${request.path} HTTP/${req.httpVersion} ${res.statusCode} ${req.headers['user-agent'] || "-"}`);
			})
		})
	}

	protected __start() {
		if (!this.server) return;
		const port = this.port || 80
		this.server.listen(port, () => {
			Logger.info(`Server launch in port ${port}`);
			const ip = getNetworkAddress();
			Logger.info(`Local - http://localhost:${port}`);
			if (ip !== false)
				Logger.info(`Local - http://${ip}:${port}`);
		});
	}
	protected __stop() {
		if (!this.server) return;

		this.server.close(e => {
			e ? Logger.error(e) : Logger.info(`Server stoped`);
		});
	}

	protected configure() {
		return {
			root: "./dist/test"
		}
	}
}

const getNetworkAddress = () => {
	const interfaces = networkInterfaces();
	if (interfaces === undefined) return false;

	for (const name of Object.keys(interfaces)) {
		const _interface = interfaces[name];
		if (_interface == undefined) continue;
		for (const _adress of _interface) {
			const { address, family, internal } = _adress;
			if (family === 'IPv4' && !internal) {
				return address;
			}
		}
	}
	return false;
};

export default HttpCore;
