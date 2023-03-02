import { existsSync, readFileSync } from "fs";
import HttpServer from "./Server/HttpServer";
import HttpsServer from "./Server/HttpsServer";
import DotEnv from './utils/DotEnv';
import { URL } from "url";
import { IncomingMessage, ServerResponse } from "http";
import { TLSSocket } from "tls";
import "reflect-metadata";

declare module 'http' {
	interface IncomingMessage {
		secure?: boolean;
	}
}

const MIN_PORT = 0,
	MAX_PORT = 65535,
	DEFAULT_HTTP_PORT = 80,
	DEFAULT_HTTPS_PORT = 443;

class Core {
	private httpServer: Nullable<HttpServer> = null;
	private httpsServer: Nullable<HttpsServer> = null;

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

	private onRequest(req: IncomingMessage, res: ServerResponse) {
		/**
		 * HTTPS server gives TLS Socket
		 */
		req.secure = req.socket instanceof TLSSocket ? req.socket.encrypted : false;

		res.write("Hello, World!" + (req.secure ? " You sequred!" : ""));
		res.end();
	}

	private redirect(req: IncomingMessage, res: ServerResponse) {
		const url = new URL(req.url || "", `https://${req.headers.host || 'localhost'}`);

		res.statusCode = 303;
		res.setHeader("Location", url.href);

		res.end();
	}

	public start() {
		if (this.httpServer !== null || this.httpsServer !== null) return;
		DotEnv.config();

		this.httpServer = new HttpServer();

		const key = this.getPrivateKey();
		const cert = this.getCertificate();
		const canRun = key != null && cert != null;

		if (canRun) {
			this.httpsServer = new HttpsServer({ key: key, cert: cert })
			this.httpsServer.on('request', this.onRequest);
			this.httpsServer.listen(this.getPort("HTTPS_PORT", DEFAULT_HTTPS_PORT));
		}

		const redirect = canRun && DotEnv.getBoolean("TLS_REDIRECT", false);
		this.httpServer.on('request', redirect ? this.redirect : this.onRequest);

		this.httpServer.listen(this.getPort("HTTP_PORT", DEFAULT_HTTP_PORT));
		return this;
	}

	public stop() {
		this.httpServer?.close();
		this.httpsServer?.close();

		this.httpServer = null;
		this.httpsServer = null;
		return this;
	}

	public restart() {
		return this.stop().start();
	}
}

export default Core;
