import { AddressInfo } from "net";

function getServerAddress(address: AddressInfo | string | null, defaultPort: number): Nullable<AddressInfo> {
	if (address === null) return null

	if (typeof address === "string") {
		address = {
			family: "IPv4",
			address: address,
			port: defaultPort
		}
	}

	if (
		(address.family.toLowerCase() === "ipv6" && address.address === "::") ||
		(address.family.toLowerCase() === "ipv4" && address.address === "127.0.0.1")
	) address.address = "localhost"

	return address;
}

export default getServerAddress;
