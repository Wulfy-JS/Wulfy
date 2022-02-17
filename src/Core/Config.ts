import { SingleOrArr } from "../utils/SingleOrArr";

interface Config {
	/** 
	 * Root path
	 * @default process.cwd()
	 */
	root: string;

	/** 
	 * Glob paths to controllers
	 * @default ".\/controllers\/**\/*.js"
	*/
	controllers: SingleOrArr<string>;

	/** 
	 * Glob paths to services
	 * @default ".\/services\/**\/*.js"
	*/
	services: SingleOrArr<string>;

	/**
	 * Paths to views
	 * @default "./views/"
	 */
	views: string;
}

export default Config;
