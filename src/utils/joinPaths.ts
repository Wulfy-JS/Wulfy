import { resolve } from "path/posix"

function joinPaths(...paths: string[]): string;
function joinPaths(...paths: (string | RegExp)[]): RegExp;
function joinPaths(...paths: (string | RegExp)[]): RegExp | string {
	let joinedPath = "",
		isRegExp = false;
	for (const path of paths) {
		if (typeof path == "string") {
			joinedPath += "/" + path;
			continue;
		} else {
			isRegExp = true;
			let _path = path.source;
			if (_path.startsWith("^")) //have startline symbol
				_path = _path.slice(1);

			if (/(?<!\\)\$$/.test(_path)) //have endline symbol
				_path = _path.slice(0, -1);

			_path = _path.replace(/\\\//g, '/');

			joinedPath += "/" + _path;
		}
	}
	joinedPath = resolve(joinedPath);

	return isRegExp ? new RegExp("^" + joinedPath + "$") : joinedPath;
}

export default joinPaths;
