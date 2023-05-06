import { resolve } from "path";
import Service from "./Service";
import RegisterService from "./RegisterService";
import nunjucks from "nunjucks";

declare module "../index" {
	interface Controller {
		getService(name: "nunjucks"): NunjucksService;
	}
}

@RegisterService("nunjucks")
class NunjucksService extends Service {
	private _e: nunjucks.Environment;
	constructor() {
		super();
		this._e = new nunjucks.Environment(new nunjucks.FileSystemLoader(process.env.VIEW || resolve(process.cwd(), "views")));
	}

	public render(file: string, params: NodeJS.Dict<any> = {}, charset: BufferEncoding = "utf-8") {
		return this._e.render(file, params);
	}
}

export default NunjucksService;
