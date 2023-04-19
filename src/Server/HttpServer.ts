import { Server, ServerOptions } from "http";

import getNetworkAddress from "../utils/getNetworkAddress";
import getServerAddress from "../utils/getServerAddress";

class HttpServer extends Server {
	constructor(options: ServerOptions = {}) {
		super(options);
		this.on('listening', () => {
			const serverAddress = getServerAddress(this.address(), 80);
			if (!serverAddress) return;
			console.log(`HTTP-Server launch in port ${serverAddress.port}`);
			console.log(`- http://${serverAddress.address}:${serverAddress.port}`);
			const address = getNetworkAddress();
			if (!address) return;
			console.log(`- http://${address}:${serverAddress.port}`);
		})
	}
}

export default HttpServer;
