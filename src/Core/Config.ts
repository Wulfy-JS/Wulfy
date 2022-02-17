import { SingleOrArr } from "../utils/SingleOrArr";

interface Config {
	/** 
	 * Root path
	 * @default process.cwd()
	 */
	root: string;

	/** 
	 * Paths to controllers
	 * @default ".\/controllers\/**\/*.js"
	*/
	controllers: SingleOrArr<string>;

	/**
	 * Paths to views
	 * @default "./views/"
	 */
	views: string;
}

export default Config;
