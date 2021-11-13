import { Readable } from "stream";
import SingleOrROArr from "../utils/SingleOrROArr";

type Header = number | SingleOrROArr<string>;
type HeaderDict = NodeJS.Dict<Header>;
type Content = string | Buffer | Readable;

class Response<C extends Content = Content> {
	protected status: number = 200;
	protected headers: HeaderDict = {};
	protected content: C | null = null;

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


	public setContent(content: C | null) {
		this.content = content;
		return this;
	}
	public getContent(): C | null {
		return this.content;
	}
}

export default Response;
export { Content, Header, HeaderDict };
