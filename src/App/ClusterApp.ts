import App from "./App";
import cluster, { Worker } from "cluster";


class ClusterApp extends App {
	private readonly forks: Set<Worker> = new Set();
	private stoping: boolean = false;
	constructor(private readonly cpus: number) {
		super();
	}

	start(callback: () => void = () => { }): void {
		console.log("Start PID:", process.pid)
		for (let i = 1; i < this.cpus; i++)
			this.fork();

		callback();
	}
	stop(callback: () => void = () => { }): void {
		this.stoping = true;
		this.forks.forEach(worker => worker.kill("SIGINT"));
		callback();
	}

	private fork() {
		const worker = cluster.fork();
		worker.on("exit", () => {
			this.forks.delete(worker);
			if (this.stoping) return;
			this.fork();
		})
		this.forks.add(worker);
	}

}

export default ClusterApp;
