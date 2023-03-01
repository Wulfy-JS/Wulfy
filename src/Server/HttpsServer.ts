import { Server, ServerOptions } from "https";
import getNetworkAddress from "../utils/getNetworkAddress";
import getServerAddress from "../utils/getServerAddress";

class HttpsServer extends Server {
	constructor(options: ServerOptions = {}) {
		super(options);
		this.on('listening', () => {
			const serverAddress = getServerAddress(this.address(), 443);
			if (!serverAddress) return;
			console.log(`HTTPS-Server launch in port ${serverAddress.port}`);
			console.log(`- https://${serverAddress.address}:${serverAddress.port}`);
			const address = getNetworkAddress();
			if (!address) return;
			console.log(`- https://${address}:${serverAddress.port}`);
		})
	}
}

export default HttpsServer;
