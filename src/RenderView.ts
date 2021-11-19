import nunjucks from "nunjucks";
import Response from "./response/Response.js";

class RenderView {
	public render(file: string, params: NodeJS.Dict<any> = {}, charset: BufferEncoding = "utf-8") {
		const content = nunjucks.render(file, params);
		return new Response()
			.setContent(content)
			.setHeader("content-type", "text/html; charset=" + charset);
	}
}

export default RenderView;
