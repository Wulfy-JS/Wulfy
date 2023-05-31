import os from "os";
import cluster from "cluster";

import App from "./App";
import Config from "../Config";
import ServerApp from "./ServerApp";
import ClusterApp from "./ClusterApp";

function CPUS(): number {
	let cpus = Config.get("server.cpus", 0);
	const maxCPUS = os.cpus().length;
	if (cpus < 0) {
		cpus = 1;
		console.warn(`server.cpus can't be < 0. Set ${cpus}`);
	}

	if (cpus == 0)
		cpus = maxCPUS;

	if (cpus > maxCPUS) {
		cpus = maxCPUS;
		console.warn(`server.cpus can't be > ${maxCPUS} in this machine. Set ${cpus}`);
	}

	return cpus;
}

function getServerApp(): App {
	if (cluster.isPrimary) {
		const cpus = CPUS();
		return cpus === 1 ? new ServerApp() : new ClusterApp(cpus);
	} else if (cluster.isWorker) {
		return new ServerApp();
	}
	throw new ReferenceError();
}


export default getServerApp;
