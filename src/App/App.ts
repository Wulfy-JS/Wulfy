abstract class App {
	constructor() {
		process.on("SIGINT", () => {
			this.stop(() => process.exit(0));
		});
	}
	public abstract start(callback?: () => void): void;
	public abstract stop(callback?: () => void): void;
}

export default App;
