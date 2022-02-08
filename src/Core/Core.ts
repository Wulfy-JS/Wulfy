import Request from "../Request/Request";
import Response from "../Response/Response";
import RawResponse from "../Response/StringResponce";
import Route from "../Router/Route";
import Router from "../Router/Router";
import final from "../utils/final";
import Logger from "../utils/Logger";

export default abstract class Core {
	private router: Router = new Router();
	public constructor() {
		this.init();
	}

	protected getRoute(req: Request): Route {
		//@ts-ignore
		return;
	}

	protected getResponse(req: Request): Response {
		const request = this.getRoute(req);
		if (!request)
			return new RawResponse().setStatus(404);

		try {
			return request.getResponse(req);
		} catch (e) {
			return new RawResponse().setStatus(500);
		}
	}

	/**
	 * Initialization app. Override to init the server
	 */
	protected init(): void {
		Logger.info("Initialization core");
	}

	/**
	 * Override to start the server
	 */
	protected __start(): void {
		Logger.info("Start core");
	}
	/**
	 * Start app. Override method __start to start the server
	 * @returns {this}
	 */
	@final
	public start(): this {
		this.__start();
		return this;
	};

	/**
	 * Override to stop the server
	 */
	protected __stop(): void {
		Logger.info("Stop core");
	}
	/**
	 * Stop app. Override method __stop to stop the server
	 * @returns {this}
	 */
	@final
	public stop(): this {
		this.__stop();
		return this;
	};

}
