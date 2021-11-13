import { ServerResponse } from "http";
import SingleOrArr from "../utils/SingleOrROArr";

type Header = number | SingleOrArr<string>;
type HeaderDict = NodeJS.Dict<Header>;

abstract class BaseResponse<T = any> {
	private status: number = 200;
	private headers: HeaderDict = {};
	private content: T | null = null;

	public setHeader(key: string, value: Header) {
		this.headers[key] = value;
		return this;
	}
	public setHeaders(headers: Readonly<HeaderDict>) {
		for (const key in headers)
			this.setHeader(key, headers[key]);

		return this;
	}

	public getHeaders(): Readonly<HeaderDict> {
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


	protected __setHeaders(res: ServerResponse) {
		res.statusCode = this.getStatus();
		const headers = this.getHeaders();
		for (const key in headers) {
			const value = headers[key];
			res.setHeader(key, value);
		}
	}
	protected abstract __response(res: ServerResponse);
	public response(res: ServerResponse) {
		this.__setHeaders(res);
		this.__response(res);
	}

}

export default BaseResponse;
export { Header, HeaderDict };
