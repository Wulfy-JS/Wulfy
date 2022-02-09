import Request from "../Request/Request";
import Response from "../Response/Response";
import RawResponse from "../Response/StringResponce";
import Route from "../Router/Route";
import Router from "../Router/Router";
import final from "../utils/final";
import Logger from "../utils/Logger";
import dotenv from "dotenv";
import { SingleOrArr } from "../utils/SingleOrArr";
import normalize from "../utils/normalize";

export default abstract class Core {
	public static rootPath = normalize(process.cwd() + "/");
	private static modulePath = normalize(import.meta.url + "/../../../");

	public constructor() {
		this.init();
		this.configure();
		dotenv.config();
	}

	private router: Router = new Router();

	protected getRoute(request: Request): Route | undefined {
		return this.router.getRoute(request);
	}

	protected getResponse(request: Request): Response {
		const route = this.getRoute(request);
		if (!route)
			return new RawResponse().setStatus(404);

		try {
			return route.getResponse(request);
		} catch (e) {
			return new RawResponse().setStatus(500);
		}
	}

	/**
	 * Load controller from path or module
	 * @param {string|string[]} path 
	 */
	protected loadControllers(path: SingleOrArr<string>) {
		console.log(Core.rootPath, Core.modulePath);
	}

	/**
	 * Initialization app. Override to init the server
	 */
	protected init(): void {
		Logger.info("Initialization core");
	}

	/**
	 * Configure core 
	 */
	protected configure(): void {
		this.loadControllers("")
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
