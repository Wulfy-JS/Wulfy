import Wulfy, { Router } from "../index.js";
import IndexController from "./IndexController.js";
import UnregisteredController from "./UnreigsteredController.js";

class App extends Wulfy {
	public readonly subRouter = new Router('/test');

	protected __start(): void | Promise<void> {
		this.subRouter.register(UnregisteredController);
		this.router.register(
			this.subRouter,
			IndexController
		);

		this.static.register('/', 'static')
	}
	protected __stop(): void | Promise<void> {
		this.router.unregister(
			IndexController,
			this.subRouter,
		);

		this.static.unregister('/')
	}
}

export default App; 
