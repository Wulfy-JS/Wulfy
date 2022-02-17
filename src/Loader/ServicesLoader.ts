import Service, { ConstructorService } from "../Service/Service";
import Loader from "./Loader";

class ServicesLoader extends Loader<ConstructorService> {
	protected condition(obj: ConstructorService): boolean {
		return Service.isService(obj.prototype);
	}
}


export default ServicesLoader;
