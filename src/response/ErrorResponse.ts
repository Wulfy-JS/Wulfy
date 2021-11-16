import { ServerResponse } from "http";
import { Config, RenderView } from "..";
import BaseResponse from "./BaseResponse.js";

class ErrorResponse extends BaseResponse<Error> {
	constructor() {
		super();
		this.setStatus(500);
	}

	protected __response(res: ServerResponse, config: Config) {
		if (config.get("mode", "dev") === "dev") {
			res.write(this.getContent().toString());
		} else {
			res.write(`Oops... Error ${this.getStatus()}`);
		}
		res.end();
	}
}

export default ErrorResponse;
