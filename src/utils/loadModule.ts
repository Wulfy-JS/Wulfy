import { isAbsolute } from "path";

export default function loadModule(path: string) {
	if (process.platform == "win32" && isAbsolute(path)) {
		path = "file://" + path;
	}

	return import(path);
}
