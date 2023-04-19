import { ServerResponse } from "http";

declare module 'http' {
	interface ServerResponse {
		setHeaders(headers: OutgoingHttpHeaders): this;
	}

	interface IncomingMessage {
		secure?: boolean;
	}
}

ServerResponse.prototype.setHeaders = function (headers) {
	for (const headerKey in headers) {
		const headerValue = headers[headerKey];
		if (headerValue) this.setHeader(headerKey, headerValue);
	}
	return this;
}
