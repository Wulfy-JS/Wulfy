import nunjucks from "nunjucks";
import Core from "../index.js";
import Response from "../response/Response.js";
import BaseService from "./BaseService.js";

class RenderSevice extends BaseService {
	private _e: nunjucks.Environment;
	constructor(core: Core, path?: string) {
		super(core);
		if (!path) path = core.projectFolder + "/" + core.config.get("views", "src/views");
		this._e = new nunjucks.Environment(new nunjucks.FileSystemLoader(path));
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
