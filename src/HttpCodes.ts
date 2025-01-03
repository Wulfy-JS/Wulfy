type InfoHttpCodes = "CONTINUE"
	| "SWITCHING_PROTOCOLS"
	| "PROCESSING"
	| "EARLY_HINTS";
type SuccessHttpCodes = "OK"
	| "CREATED"
	| "ACCEPTED"
	| "NON_AUTHORITATIVE_INFORMATION"
	| "NO_CONTENT"
	| "RESET_CONTENT"
	| "PARTIAL_CONTENT"
	| "MULTI_STATUS"
	| "ALREADY_REPORTED"
	| "IM_USED";
type RedirectHttpCodes = "MULTIPLE_CHOICES"
	| "MOVED_PERMANENTLY"
	| "FOUND"
	| "SEE_OTHER"
	| "NOT_MODIFIED"
	| "USE_PROXY"
	| "TEMPORARY_REDIRECT"
	| "PERMANENT_REDIRECT";
type ClientErrorHttpCodes = "BAD_REQUEST"
	| "UNAUTHORIZED"
	| "PAYMENT_REQUIRED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "METHOD_NOT_ALLOWED"
	| "NOT_ACCEPTABLE"
	| "PROXY_AUTHENTICATION_REQUIRED"
	| "REQUEST_TIMEOUT"
	| "CONFLICT"
	| "GONE"
	| "LENGTH_REQUIRED"
	| "PRECONDITION_FAILED"
	| "CONTENT_TOO_LARGE"
	| "URI_TOO_LONG"
	| "UNSUPPORTED_MEDIA_TYPE"
	| "RANGE_NOT_SATISFIABLE"
	| "EXPECTATION_FAILED"
	| "TEAPOT"
	| "MISDIRECTED_REQUEST"
	| "UNPROCESSABLE_CONTENT"
	| "LOCKED"
	| "FAILED_DEPENDENCY"
	| "TOO_EARLY"
	| "UPGRADE_REQUIRED"
	| "PRECONDITION_REQUIRED"
	| "TOO_MANY_REQUESTS"
	| "REQUEST_HEADER_FIELDS_TOO_LARGE"
	| "UNAVAILABLE_FOR_LEGAL_REASONS";
type ServerErrorHttpCodes = "INTERNAL_SERVER_ERROR"
	| "NOT_IMPLEMENTED"
	| "BAD_GATEWAY"
	| "SERVICE_UNAVAILABLE"
	| "GATEWAY_TIMEOUT"
	| "HTTP_VERSION_NOT_SUPPORTED"
	| "VARIANT_ALSO_NEGOTIATES"
	| "INSUFFICIENT_STORAGE"
	| "LOOP_DETECTED"
	| "NOT_EXTENDED"
	| "NETWORK_AUTHENTICATION_REQUIRED";

type HttpCodesKeys = InfoHttpCodes
	| SuccessHttpCodes
	| RedirectHttpCodes
	| ClientErrorHttpCodes
	| ServerErrorHttpCodes;

const HttpCodes = {
	// 1XX
	CONTINUE: { code: 100, message: "Continue" },
	SWITCHING_PROTOCOLS: { code: 101, message: "Switching Protocols" },
	PROCESSING: { code: 102, message: "Processing" },
	EARLY_HINTS: { code: 103, message: "Early Hints" },
	// 2XX
	OK: { code: 200, message: "OK" },
	CREATED: { code: 201, message: "Created" },
	ACCEPTED: { code: 202, message: "Accepted" },
	NON_AUTHORITATIVE_INFORMATION: { code: 203, message: "Non-Authoritative Information" },
	NO_CONTENT: { code: 204, message: "No Content" },
	RESET_CONTENT: { code: 205, message: "Reset Content" },
	PARTIAL_CONTENT: { code: 206, message: "Partial Content" },
	MULTI_STATUS: { code: 207, message: "Multi-Status" },
	ALREADY_REPORTED: { code: 208, message: "Already Reported" },
	IM_USED: { code: 226, message: "IM Used" },
	// 3XX
	MULTIPLE_CHOICES: { code: 300, message: "Multiple Choices" },
	MOVED_PERMANENTLY: { code: 301, message: "Moved Permanently" },
	FOUND: { code: 302, message: "Found" },
	SEE_OTHER: { code: 303, message: "See Other" },
	NOT_MODIFIED: { code: 304, message: "Not Modified" },
	USE_PROXY: { code: 305, message: "Use Proxy" },
	TEMPORARY_REDIRECT: { code: 307, message: "Temporary Redirect" },
	PERMANENT_REDIRECT: { code: 308, message: "Permanent Redirect" },
	// 4XX
	BAD_REQUEST: { code: 400, message: "Bad Request" },
	UNAUTHORIZED: { code: 401, message: "Unauthorized" },
	PAYMENT_REQUIRED: { code: 402, message: "Payment Required" },
	FORBIDDEN: { code: 403, message: "Forbidden" },
	NOT_FOUND: { code: 404, message: "Not Found" },
	METHOD_NOT_ALLOWED: { code: 405, message: "Method Not Allowed" },
	NOT_ACCEPTABLE: { code: 406, message: "Not Acceptable" },
	PROXY_AUTHENTICATION_REQUIRED: { code: 407, message: "Proxy Authentication Required" },
	REQUEST_TIMEOUT: { code: 408, message: "Request Timeout" },
	CONFLICT: { code: 409, message: "Conflict" },
	GONE: { code: 410, message: "Gone" },
	LENGTH_REQUIRED: { code: 411, message: "Length Required" },
	PRECONDITION_FAILED: { code: 412, message: "Precondition Failed" },
	CONTENT_TOO_LARGE: { code: 413, message: "Content Too Large" },
	URI_TOO_LONG: { code: 414, message: "URI Too Long" },
	UNSUPPORTED_MEDIA_TYPE: { code: 415, message: "Unsupported Media Type" },
	RANGE_NOT_SATISFIABLE: { code: 416, message: "Range Not Satisfiable" },
	EXPECTATION_FAILED: { code: 417, message: "Expectation Failed" },
	TEAPOT: { code: 418, message: " I’m a teapot" },
	MISDIRECTED_REQUEST: { code: 421, message: "Misdirected Request" },
	UNPROCESSABLE_CONTENT: { code: 422, message: "Unprocessable Content" },
	LOCKED: { code: 423, message: "Locked" },
	FAILED_DEPENDENCY: { code: 424, message: "Failed Dependency" },
	TOO_EARLY: { code: 425, message: "Too Early" },
	UPGRADE_REQUIRED: { code: 426, message: "Upgrade Required" },
	PRECONDITION_REQUIRED: { code: 428, message: "Precondition Required" },
	TOO_MANY_REQUESTS: { code: 429, message: "Too Many Requests" },
	REQUEST_HEADER_FIELDS_TOO_LARGE: { code: 431, message: "Request Header Fields Too Large" },
	UNAVAILABLE_FOR_LEGAL_REASONS: { code: 451, message: "Unavailable For Legal Reasons" },
	// 5XX
	INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
	NOT_IMPLEMENTED: { code: 501, message: "Not Implemented" },
	BAD_GATEWAY: { code: 502, message: "Bad Gateway" },
	SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
	GATEWAY_TIMEOUT: { code: 504, message: "Gateway Timeout" },
	HTTP_VERSION_NOT_SUPPORTED: { code: 505, message: "HTTP Version Not Supported" },
	VARIANT_ALSO_NEGOTIATES: { code: 506, message: "Variant Also Negotiates" },
	INSUFFICIENT_STORAGE: { code: 507, message: "Insufficient Storage" },
	LOOP_DETECTED: { code: 508, message: "Loop Detected" },
	NOT_EXTENDED: { code: 510, message: "Not Extended" },
	NETWORK_AUTHENTICATION_REQUIRED: { code: 511, message: "Network Authentication Required" }
} as {
		[key in HttpCodesKeys]: HttpCode
	};

const HttpCodeByCode = (<HttpCodesKeys[]>Object.keys(HttpCodes)).reduce((r, key) => {
	const HttpCode = HttpCodes[key];
	r[HttpCode.code] = HttpCode;
	return r;
}, {} as {
	[key: number]: HttpCode
	| undefined
})

function getMessageByCode(code: number) {
	return HttpCodeByCode[code]?.message
}

interface HttpCode {
	code: number;
	message: string;
}

function isHttpCode(a: any): a is HttpCode {
	return typeof a == "object"
		&& a.hasOwnProperty('code')
		&& typeof a.code == "number"
		&& a.hasOwnProperty('message')
		&& typeof a.message == "string";
}

export default HttpCodes;
export {
	HttpCodes,
	getMessageByCode,
	isHttpCode
}
export type {
	HttpCode,
	InfoHttpCodes,
	SuccessHttpCodes,
	RedirectHttpCodes,
	ClientErrorHttpCodes,
	ServerErrorHttpCodes,
}
