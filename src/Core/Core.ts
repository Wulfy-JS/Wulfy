import Request from "../Request/Request";
import Response from "../Response/Response";
import RawResponse from "../Response/StringResponce";
import Route from "../Router/Route";
import Router from "../Router/Router";
import final from "../utils/final";
import Logger from "../utils/Logger";
import normalize from "../utils/normalize";
import glob from "fast-glob";
import { SingleOrArr } from "../utils/SingleOrArr";
import Controller, { ConstructorController } from "../Controller/Controller";
import { getRouteAttributesKey, ROOT_ATTRIBUTES } from "../Router/Route.dec";
import DotEnv from "../utils/DotEnv";

interface Config {
	/** 
	 * Root path
	 * @default process.cwd()
	 */
	root: string;

	/** 
	 * Root path
	 * @default process.cwd()
	 */
	controllers: SingleOrArr<string>;
}

export default abstract class Core {
	private static _root = normalize(process.cwd() + "/");
	public static get rootPath() {
		return this._root;
	}
	private static get wulfyPath() {
		return normalize(import.meta.url + "/../../../");
	};

	public constructor() {
		DotEnv.init();
		this.init();
	}

	private router: Router = new Router();

	protected getRoute(request: Request): Route | undefined {
		return this.router.getRoute(request);
	}

	protected getResponse(request: Request): Response {
		const route = this.getRoute(request);
		if (!route) {
			return new RawResponse().setStatus(404);
		}

		try {
			return route.getResponse(request);
		} catch (e) {
			Logger.error(e);
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
	 * Configure core
	 * @returns {Config}
	 */
	protected configure(): Partial<Config> {
		return Core.defaultConfig
	}
	private static defaultConfig: Config = {
		root: Core.rootPath,
		controllers: "./controllers/**/*.js"
	}

	/**
	 * Override to start the server
	 */
	protected __start(): void {
		Logger.info("Start core");
	}
	/**
	 * Start app. Override method __start to start the server
	 * @returns {Promise<this>}
	 */
	@final
	public async start(): Promise<this> {
		const cfg = {
			...Core.defaultConfig,
			...this.configure()
		};

		if (Core._root != cfg.root) {
			if (/^(?:(?:[a-z]|file):)?\//i.test(cfg.root))
				Core._root = normalize(cfg.root + "/");
			else
				Core._root = normalize(process.cwd() + "/" + cfg.root + "/");
		}

		await this.loadControllers(cfg.controllers);

		//load Controllers
		//load Services
		//then start
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
		//stop
		this.__stop();
		//unload Services
		//unload Controllers
		return this;
	};

	private async loadControllers(globControllers: SingleOrArr<string>): Promise<void> {
		await Promise.all(
			(await glob(globControllers, { cwd: Core.rootPath }))
				.map(path => normalize(Core.rootPath + path))
				.filter(path => {
					const isJS = path.endsWith(".js");
					if (!isJS)
						Logger.warn(`File ${path} is not JavaScript file.`);
					return isJS;
				})
				.map(path => this.loadController(path))
		);
	}

	private async loadController(pathController: string): Promise<void> {
		const controller = (await <Promise<{ default: ConstructorController }>>import("file://" + pathController)).default;
		if (!controller) {
			Logger.warn(`File ${pathController} does not export anything by default`);
			return;
		}

		if (!Controller.isController(controller.prototype)) {
			Logger.warn(`File ${pathController} export default not Controller`);
			return;
		}

		Logger.debug(`Load routes from controller ${controller.name} from file "${pathController}"`)
		this.registerRoutesFromController(controller);
	}

	private registerRoutesFromController(controller: ConstructorController): void {
		const key = getRouteAttributesKey(controller);
		const RouteSettings = controller.prototype[key];
		if (!RouteSettings) return;

		const rootPath = RouteSettings[ROOT_ATTRIBUTES] || "";

		for (const key in RouteSettings) {
			if (key == ROOT_ATTRIBUTES) continue;
			const routeDesc = RouteSettings[key];
			try {
				const routeinfo = {
					method: routeDesc.method || "all",
					path: rootPath + (routeDesc.path || "")
				};
				this.router.registerRoute(
					routeDesc.name,
					new Route(routeinfo, controller, key)
				)
				Logger.debug(routeinfo, `Register route ${routeDesc.name}`);
			} catch (e) {
				Logger.error(e);
			}
		}
	}
}
