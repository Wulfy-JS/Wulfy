import { copyFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, rmSync, statSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { Stream } from "stream";

namespace Cache {
	export const folder = ".cache";

	function checkCahceFolder(): void {
		if (!existsSync(folder)) mkdirSync(folder);
		const stats = statSync(folder);

		if (!stats.isDirectory()) {
			copyFileSync(folder, folder + ".backup");
			rmSync(folder);
			mkdirSync(folder)
		}
	}

	function resolveCahcePath(file: string) {
		return resolve("./", folder, file)
	}

	export async function read(file: string) {
		checkCahceFolder();

		return readFile(resolveCahcePath(file));
	}

	export async function readStream(file: string) {
		checkCahceFolder();

		return createReadStream(resolveCahcePath(file));
	}

	export async function writeStream(file: string) {
		checkCahceFolder();

		return createWriteStream(resolveCahcePath(file))
	}

	export async function write(file: string, data: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream): Promise<void> {
		checkCahceFolder();

		writeFile(resolveCahcePath(file), data)
	}

	export async function exists(file: string): Promise<boolean> {
		checkCahceFolder();

		return existsSync(resolveCahcePath(file))
	}
}
export default Cache;
