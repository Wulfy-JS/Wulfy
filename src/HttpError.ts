class HttpError extends Error {
	constructor(message: string, public readonly code: number = 500) {
		super(message);
	}
}

export default HttpError;
