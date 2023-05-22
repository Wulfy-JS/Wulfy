import { resolve } from "path";

function getWulfyPath(...pathSegments: string[]) {
	return resolve(
		decodeURI(import.meta.url).slice(process.platform == "win32" ? 8 : 7),
		"../../../",
		...pathSegments
	)
}

export default getWulfyPath;
