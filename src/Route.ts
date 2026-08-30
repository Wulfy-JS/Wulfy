import type Router from "./Router.js";
import type { WulfyHandle } from "./types.js";

class Route {
	constructor(
		public readonly router: Router,
		public readonly method: string,
		public readonly handle: WulfyHandle,
		public readonly params: string[] = []
	) { }

	public remove() {
		this.router.remove(this)
	}
}

export { Route }
