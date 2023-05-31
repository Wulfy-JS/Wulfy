import Server from "../Server/Server";
import App from "./App";

class ServerApp extends App {
	protected server: Nullable<Server> = null;

	public start(callback: () => void = () => { }) {
		console.log("Start PID:", process.pid);
		this.server = Server.Instance;
		this.server.start(callback);
	}

	public stop(callback: () => void = () => { }) {
		console.log("Stop PID:", process.pid);
		if (this.server)
			this.server.stop(callback);
		else
			callback();
	}
}

export default ServerApp;
