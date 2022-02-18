import nunjucks from "nunjucks";
import { readFileSync as readFile } from "fs";

import Config from "./Config";
import ControllersLoader from "../Loader/ControllersLoader";
import DotEnv from "../utils/DotEnv";
import final from "../utils/final";
import Logger from "../utils/Logger";
import Model from "../Model/Model";
import normalize from "../utils/normalize";
import NunjucksService from "../Service/NunjucksService";
import RawResponse from "../Response/RawResponse";
import Request from "../Request/Request";
import Response from "../Response/Response";
import Route from "../Router/Route";
import Router from "../Router/Router";
import ServicesLoader from "../Loader/ServicesLoader";

import { ConstructorController } from "../Controller/Controller";
import { ConstructorService, ListServices } from "../Service/Service";
import { FileResponse } from "..";
import StaticRouter from "../Router/StaticRouter";


abstract class Core {
	private static _root = normalize(process.cwd() + "/");
	public static get rootPath() {
		return this._root;
	}
	private static get wulfyPath() {
		return normalize(import.meta.url + "/../../../");
	};

	private static errorTemplate = nunjucks.compile(readFile(Core.wulfyPath + "/views/error.njk", { encoding: "utf-8" }));

	public constructor() {
		DotEnv.init();
		this.init();
	}

	private router: Router = new Router();
	private staticRouter: StaticRouter = new StaticRouter();
	private controllersLoader = new ControllersLoader();
	private servicesLoader = new ServicesLoader();

	private services?: ListServices;

	protected getRoute(request: Request): Route | undefined {
		return this.router.getRoute(request);
	}

	protected async getResponse(request: Request): Promise<Response> {
		if (!this.services) {
			return new RawResponse().setStatus(500);
		}

		const _static = this.getStatic(request);
		if (_static)
			return _static;


		const route = this.getRoute(request);
		if (!route) {
			return this.getErrorResponse({
				error: new ReferenceError(`Route "${request.method.toUpperCase()}: ${request.path}" not found.`),
				message: "The file was not found :("
			}, 404);
		}

		try {
			return await route.getResponse(this.services, request);
		} catch (error) {
			if (!(error instanceof Error))
				error = new Error((<any>error).toString());

			Logger.error(error);
			return this.getErrorResponse({
				error: <Error>error,
				message: "Something happened and the app broke :("
			});
		}
	}


	protected async getErrorResponse(context: { error: Error, message?: string, code?: number }, status: number = 500) {
		return new RawResponse()
			.setStatus(status)
			.setContent(await Core.errorTemplate.render({
				dev: process.env.MODE == "dev",
				error: context.error,
				message: context.message || context.error.message,
				code: context.code || status,
			}));
	}

	public getStatic(request: Request): FileResponse | undefined {
		return this.staticRouter.getFileResponse(request);
	}

	public setStatic(url: string, path: string): this {
		this.staticRouter.register(url, path);
		return this;
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
		controllers: "./controllers/**/*.js",
		services: "./services/**/*.js",
		views: "./views/"
	}

	protected getConfig(): Config {
		return {
			...Core.defaultConfig,
			...this.configure()
		}
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
		const cfg = this.getConfig();

		if (Core._root != cfg.root) {
			if (/^(?:(?:[a-z]|file):)?\//i.test(cfg.root))
				Core._root = normalize(cfg.root + "/");
			else
				Core._root = normalize(process.cwd() + "/" + cfg.root + "/");
		}

		Model.setup();

		this.controllersLoader.setRoot(Core.rootPath);
		this.controllersLoader.on("load", (controller: ConstructorController, path: string) => {
			Logger.debug(`Load routes from controller ${controller.name} from file "${path}"`)
			this.router.registerRoutesFromController(controller);
		})

		this.servicesLoader.setRoot(Core.rootPath);
		this.servicesLoader.on("load", (service: ConstructorService, path: string) => {
			Logger.debug(`Load service ${service.name} from file "${path}"`);
			if (!this.services) throw new ReferenceError();
			this.services[service.name] = new service(cfg);
		});

		await this.controllersLoader.load(cfg.controllers)

		this.services = {
			NunjucksService: new NunjucksService(cfg)
		};
		await this.servicesLoader.load(cfg.services);

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
		//unload Services
		//unload Controllers
		return this;
	};
}

export default Core;
