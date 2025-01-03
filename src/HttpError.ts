import { getMessageByCode, HttpCode, isHttpCode } from "./HttpCodes.js";

class HttpError extends Error {
	public readonly error?: any;
	public readonly code: number;

	constructor(code: HttpCode, error?: any);
	constructor(code: number, message?: string, error?: any);
	constructor(
		code: number | HttpCode,
		message?: string | any,
		error?: any
	) {
		if (isHttpCode(code)) {
			error = message;
			message = code.message;
			code = code.code;
		}

		message = message || getMessageByCode(code);
		super(message);
		this.code = code;
		if (error instanceof Error)
			this.stack = error.stack
	}

	public static from(error: any, code: HttpCode): HttpError;
	public static from(error: any, code: number, message?: string): HttpError;
	public static from(error: any, code: number | HttpCode, message?: string): HttpError {
		if (error instanceof HttpError) return error;

		if (isHttpCode(code)) {
			message = code.message;
			code = code.code;
		}

		return new HttpError(code, message, error);
	}
}

export default HttpError;
