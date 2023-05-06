import { Service, RegisterService } from "../../index"

declare module "../../index" {
	interface Controller {
		getService(name: "test"): TestService;
	}
}

@RegisterService("test")
class TestService extends Service {
	constructor() {
		super();
	}

	public getValue() {
		return 5;
	}
}

export default TestService;
