import dotenv from "dotenv";

namespace DotEnv {
	let __init: boolean = false;

	export function init() {
		if (__init) return;

		dotenv.config();
		__init = true;
	}
}

export default DotEnv;
