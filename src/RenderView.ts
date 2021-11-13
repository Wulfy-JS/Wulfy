import ejs from "ejs";
import Response from "./response/Response.js";
const { renderFile } = ejs;

class RenderView {
	public async render(file: string, params: NodeJS.Dict<any> = {}) {
		const content = await renderFile("./src/views/" + file, params);
		return new Response()
			.setContent(content);
	}
}

export default RenderView;
