import { normalize as nz } from "path";


export default function normalize(path: string) {
	if (path.startsWith("file://"))
		path = path.slice(7);

	return nz(path)
}
