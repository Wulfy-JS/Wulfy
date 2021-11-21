
import { existsSync, statSync } from "fs";
import { IncomingMessage, ServerResponse } from "http";
import { normalize } from "path";
import Config from "simcfg";
import sequelize from "sequelize";
const { Sequelize } = sequelize;

import FileResponse from "../response/FileResponse.js";
import BaseResponse from "../response/BaseResponse.js";
import Response from "../response/Response.js";
import RouteMap from "../routing/RouteMap.js";
import RoutingConfigurator from "../routing/RoutingConfigurator.js";
import StaticRoute from "../routing/StaticRoute.js";
import BaseModel from "../model/BaseModel.js"
import ListServices from "../services/ListServices.js";
import RenderSevice from "../services/RenderService.js";
// import "../services/RenderService.js";
import final from "../utils/final.js";


interface DataBaseConfig {
	url: string;
	mode?: "force" | "alter" | "prod"
}
abstract class Core {
	public readonly projectFolder = process.cwd();
	protected readonly moduleFolder = normalize(import.meta.url.slice(8) + "/../../../");
	public readonly config = new Config();

	protected readonly routes = new RouteMap();
	protected staticRoute: StaticRoute = {
		path: "/",
		folder: "/public"
	};


	private _sequelize: sequelize.Sequelize;
	protected get sequelize() {
		return this._sequelize;
	}

	private serviceList: Partial<ListServices> = {}
	public get services(): ListServices {
		return <ListServices>Object.assign({}, this.serviceList);
	}
	protected localRenderService = new RenderSevice(this.config, this.moduleFolder + "/views/");

	private __inited = false;
	protected __init(): void { };

	private init() {
		if (this.__inited) return;

		//Config
		this.configure(this.config);

		//Services
		this.serviceList.RenderService = new RenderSevice(this.config);

		//Routes
		this.configureRoutes(new RoutingConfigurator(this.routes, this.staticRoute, this.projectFolder));

		//DataBase(Models)
		let databaseConfig = this.config.get<DataBaseConfig | string>("database");
		if (typeof databaseConfig == "string")
			databaseConfig = { url: databaseConfig };

		if (!databaseConfig.mode)
			databaseConfig.mode = "prod";

		this._sequelize = new Sequelize(databaseConfig.url);
		if (this.config.get("mode", "dev").toLowerCase() === "dev" &&
			databaseConfig.mode != "prod"
		) this._sequelize.sync({ [databaseConfig.mode]: true });
		BaseModel.setup(this._sequelize);


		//Core
		this.__init();
		this.__inited = true;
		return this;
	}

	protected __launch(): void { };
	protected __shutdown(): void { };

	@final
	public launch() {
		this.init();
		this.__launch();
	};
	@final
	public shutdown(): void {
		this.__shutdown()
	};

	protected abstract configure(config: Config): void;
	protected abstract configureRoutes(routes: RoutingConfigurator): void;

	private getStatic(path: string) {
		if (path.startsWith(this.staticRoute.path)) {
			const file = path.replace(this.staticRoute.path, "");
			const pathToFile = `${this.staticRoute.folder}/${file}`;

			if (existsSync(pathToFile) && statSync(pathToFile).isFile()) {
				return new FileResponse()
					.setStatus(200)
					.setFile(pathToFile);
			}
		}
		return false;
	}

	private async getResponse(req: IncomingMessage): Promise<BaseResponse> {
		const path = req.url.split("?")[0];

		if (["get", "head"].indexOf(req.method.toLowerCase()) != -1) {
			const staticResponse = this.getStatic(path);
			if (staticResponse)
				return staticResponse;
		}

		const value = this.routes.findRouteAndKeyByPath(path, req.method);
		if (!value) {
			return this.localRenderService
				.render("error.njk", { code: 404, message: "The file was not found :(" })
				.setStatus(404);
			// Response()
			// 	.setStatus(404)
			// 	.setContent(`Route "${req.method.toUpperCase()}: ${path}" not found.`);
		}
		const [route, key, matches] = value;
		const dictArgs: NodeJS.Dict<string> = {};
		const mLength = matches.length;
		const keys = key.keys;

		if (mLength > 1) {
			if (keys.length == 0) {
				for (let i = 1; i < mLength; i++) {
					dictArgs[i - 1] = matches[i];
				}
			} else {

				for (let i = 0, lK = keys.length; i < lK; i++) {
					const key = keys[i];
					dictArgs[key.name] = matches[i + 1];
				}
			}
		}

		try {
			let response = new route.controller(this.services)[route.handler](dictArgs, req);
			if (response instanceof Promise)
				response = await response;

			if (!(response instanceof BaseResponse)) {
				return this.localRenderService
					.render("error.njk", { code: 500, message: "Something happened and the app broke :(" })
					.setStatus(500);
				return new Response().setStatus(500).setContent(`Controller "${route.controller.name}.${route.handler}" return not Response.`);
			}
			return response;
		} catch (e) {
			return this.localRenderService
				.render("error.njk", { code: 500, message: "Something happened and the app broke :(" })
				.setStatus(500);
		}
	}

	protected async response(req: IncomingMessage, res: ServerResponse) {
		const response = await this.getResponse(req);
		response.response(res, this.config);
	}
}

export default Core;
