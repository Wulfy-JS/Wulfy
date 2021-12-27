import { normalize as nz } from "path";


export default function normilize(path: string) {
	if (path.startsWith("file:/"))
		path = path.slice(process.platform == "win32" ? 8 : 7);

	return nz(path)
}
