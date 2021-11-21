import nunjucks from "nunjucks";
import Config from "simcfg";
import Response from "../response/Response.js";
import BaseService from "./BaseService.js";

class RenderSevice extends BaseService {
	private _e: nunjucks.Environment;
	constructor(config: Config, path?: string) {
		super(config);
		if (!path) path = config.get("views", "src/views");
		const isDev = config.get("mode", "dev") === "dev";
		this._e = new nunjucks.Environment(new nunjucks.FileSystemLoader(path), {
			watch: isDev,
			noCache: isDev
		});
	}

	public render(file: string, params: NodeJS.Dict<any> = {}, charset: BufferEncoding = "utf-8") {
		const content = this._e.render(file, params);
		return new Response()
			.setContent(content)
			.setHeader("content-type", "text/html; charset=" + charset);
	}
}

declare module "./ListServices.js" {
	export default interface ListServices {
		RenderService: RenderSevice
	}
}

export default RenderSevice;
