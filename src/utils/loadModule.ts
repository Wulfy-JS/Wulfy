import { isAbsolute, resolve } from "path";

export default function loadModule(path: string) {
	if (isAbsolute(path)) {
		path = "file://" + path;
	} else {
		path = "file://" + resolve(process.cwd(), path);
	}

	return import(path + "?t=" + Date.now());
}
