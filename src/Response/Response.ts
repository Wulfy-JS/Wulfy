import Header, { Headers } from "../utils/Header";
const symbol = Symbol.for("Wulfy.Response");

export default abstract class Response<T = any> {
	private status: number = 200;
	private headers: Headers = {};
	private content: T | null = null;

	public setHeader(key: string, value: Header) {
		this.headers[key] = value;
		return this;
	}
	public setHeaders(headers: Readonly<Headers>) {
		for (const header in headers) {
			const value = headers[header];
			if (value !== undefined)
				this.setHeader(header, value);
		}

		return this;
	}

	public getHeaders(): Readonly<Headers> {
		return Object.assign({}, this.headers);
	}


	public setStatus(status: number): this {
		this.status = status;
		return this;
	}
	public getStatus(): number {
		return this.status;
	}


	public setContent(content: T | null) {
		this.content = content;
		return this;
	}
	public getContent(): T | null {
		return this.content;
	}

	private [symbol] = symbol;
	public static isResponse(obj: any): obj is Response {
		return obj[symbol] == symbol;
	}
}
