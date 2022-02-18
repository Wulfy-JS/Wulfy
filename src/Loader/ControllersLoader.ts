import Controller from "../Controller/Controller";
import Loader from "./Loader";

import { ConstructorController } from "../Controller/Controller";

class ControllersLoader extends Loader<ConstructorController> {
	protected condition(obj: ConstructorController): boolean {
		return Controller.isController(obj.prototype);
	}
}


export default ControllersLoader;
