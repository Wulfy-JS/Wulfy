import { resolve } from "path";
import { Core } from "../index";

(async () => {
	const app = new Core();
	await app.configure(resolve(process.cwd(), 'dist/test'));
	app.start();
})()
