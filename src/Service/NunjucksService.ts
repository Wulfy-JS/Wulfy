import nunjucks from "nunjucks";
import Core from "../Core/Core";
import RawResponse from "../Response/RawResponse";
import normalize from "../utils/normalize";
import Service from "./Service";

class NunjucksService extends Service {
	private _e: nunjucks.Environment;

	constructor() {
		super();

		const path = normalize(Core.rootPath + (process.env.VIEWS || "/src/views"));
		const isDev = process.env.MODE == "dev";

		this._e = new nunjucks.Environment(new nunjucks.FileSystemLoader(path, {
			watch: isDev,
			noCache: isDev
		}));

		for (const key in NunjucksService.globals)
			this._e.addGlobal(key, NunjucksService.globals[key]);

		this._e.addGlobal("dev", isDev);
	}

	private static globals: NodeJS.Dict<any> = {};
	public static addGlobal(key: string, value: any): typeof NunjucksService {
		this.globals[key] = value;
		return this;
	}
	public addGlobal(key: string, value: any): this {
		this._e.addGlobal(key, value);
		return this;
	}

	public render(file: string, params: NodeJS.Dict<any> = {}, charset: BufferEncoding = "utf-8") {
		const content = this._e.render(file, params);
		return new RawResponse()
			.setContent(content)
			.setHeader("content-type", "text/html; charset=" + charset);
	}
}

declare module "../Service/Service" {
	export interface ListServices {
		NunjucksService: NunjucksService
	}
}

export default NunjucksService;
