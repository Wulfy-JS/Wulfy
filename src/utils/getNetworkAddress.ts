import { networkInterfaces } from "os";

function getNetworkAddress(): Nullable<string> {
	const interfaces = networkInterfaces();
	if (interfaces === undefined) return null;

	for (const name of Object.keys(interfaces)) {
		const _interface = interfaces[name];
		if (_interface == undefined) continue;
		for (const _adress of _interface) {
			const { address, family, internal } = _adress;
			if (family === 'IPv4' && !internal) {
				return address;
			}
		}
	}
	return null;
}


export default getNetworkAddress;
