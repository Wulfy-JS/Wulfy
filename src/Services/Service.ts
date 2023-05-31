import EventEmitter from "events";
import { ServerResponse } from "http";
import { IncomingMessage } from "http";
import HttpError from "../HttpError";

interface Service extends EventEmitter {
	on(eventName: "request", listener: (req: IncomingMessage, res: ServerResponse) => void): this;
	on(eventName: "error", listener: (req: IncomingMessage, res: ServerResponse, error: HttpError) => void): this;
	on(eventName: "loaded", listener: () => void): this;
	on(eventName: "start", listener: () => void): this;
	on(eventName: "stop", listener: () => void): this;
}
abstract class Service extends EventEmitter { }

export default Service;
