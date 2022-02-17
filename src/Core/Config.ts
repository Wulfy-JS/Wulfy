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

}

export default Config;
