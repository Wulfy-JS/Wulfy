import SingleOrROArr from "../utils/SingleOrROArr";

type Header = number | SingleOrROArr<string>;
type HeaderDict = NodeJS.Dict<Header>;
type Content = string | Buffer;

class Response {
	protected status: number;
	protected headers: HeaderDict = {};
	protected content: Content;

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


	public setContent(content: Content) {
		this.content = content;
		return this;
	}
	public getContent() {
		return this.content;
	}
}

export default Response;
export { Content, Header, HeaderDict };
