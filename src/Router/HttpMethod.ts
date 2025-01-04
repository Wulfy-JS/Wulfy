import { IncomingMessage, ServerResponse } from "http";

type HttpMethod = "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch";

interface Request extends IncomingMessage {
	url: string;
	method: HttpMethod;
}
interface Response extends ServerResponse<Request> { }

export type { HttpMethod, Request, Response };
