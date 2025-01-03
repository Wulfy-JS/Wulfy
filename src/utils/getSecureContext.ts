import { SecureContextOptions } from "tls";
import { getString } from "./getEnvValue.js";
import { resolve } from "path";
import { existsSync, readFileSync, statSync } from "fs";

function readFromEnvOrFile(envKey: "HTTPS_KEY" | "HTTPS_CERT") {
	const key = getString(envKey);
	if (key) return key;

	const key_file = getString(envKey + "_FILE");
	if (!key_file) return false;

	const key_path = resolve(process.cwd(), key_file);
	if (!existsSync(key_path) || !statSync(key_path).isFile()) return false;

	return readFileSync(key_path);
}

function getSecureContext(): SecureContextOptions | false {
	let key = readFromEnvOrFile("HTTPS_KEY");
	if (!key) return false;
	let cert = readFromEnvOrFile("HTTPS_CERT");
	if (!cert) return false;


	return { key, cert }
}

export default getSecureContext;
