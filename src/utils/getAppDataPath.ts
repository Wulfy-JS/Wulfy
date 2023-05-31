import { resolve } from "path";
import { readFileSync, existsSync, mkdirSync } from "fs";

function getAppDataPath(): string {
	const home_path = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
	const { name, organisation } = JSON.parse(readFileSync("./package.json", { encoding: "utf-8" }));


	const app_data_path = resolve(home_path, organisation ?? "", name ?? "wulfy");
	if (!existsSync(app_data_path))
		mkdirSync(app_data_path, { recursive: true })

	return app_data_path;
}

export default getAppDataPath;
