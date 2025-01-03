import Wulfy from "../index.js";
import IndexController from "./IndexController.js";
import UnregisteredController from "./UnreigsteredController.js";

class App extends Wulfy {
	protected __start(): void | Promise<void> {
		this.router.register(
			IndexController,
			UnregisteredController,
		);

		this.static.register('/', 'static')
		// this.router.unregister(UnregisteredController);
	}
	protected __stop(): void | Promise<void> {
		this.router.unregister(
			IndexController,
			UnregisteredController,
		);

		this.static.unregister('/')
	}
}

export default App; 
