import Wulfy from "../index.js";
import IndexController from "./IndexController.js";
import UnregisteredController from "./UnreigsteredController.js";

class App extends Wulfy {
	protected __init(): void {
		this.router.register(
			IndexController,
			UnregisteredController,
		);

		this.static.register('/', 'static')

		this.router.unregister(UnregisteredController);

	}
}

export default App; 
