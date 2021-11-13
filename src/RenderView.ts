import nunjucks from "nunjucks";
import Response from "./response/Response.js";
nunjucks.configure("./src/views");

class RenderView {
	public render(file: string, params: NodeJS.Dict<any> = {}) {
		const content = nunjucks.render(file, params);
		return new Response()
			.setContent(content);
	}
}

export default RenderView;
