import Controller, { ConstructorController } from "../Controller/Controller";
import Loader from "./Loader";

class ControllersLoader extends Loader<ConstructorController> {
	protected condition(obj: ConstructorController): boolean {
		return Controller.isController(obj.prototype);
	}
}


export default ControllersLoader;
