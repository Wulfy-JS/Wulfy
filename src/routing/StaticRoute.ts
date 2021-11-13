import { PathLike } from "fs";

interface StaticRoute {
	path: string,
	folder: PathLike
}

export default StaticRoute;
