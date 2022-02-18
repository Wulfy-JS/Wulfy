import Loader from "./Loader";
import Service, { ConstructorService } from "../Service/Service";

class ServicesLoader extends Loader<ConstructorService> {
	protected condition(obj: ConstructorService): boolean {
		return Service.isService(obj.prototype);
	}
}


export default ServicesLoader;
