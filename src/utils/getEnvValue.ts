const booleanTrue = ['true', 't', 'yes', 'y', '1'];
const booleanFalse = ['false', 'f', 'no', 'n', '0'];

function getBoolean(key: string): boolean | undefined;
function getBoolean(key: string, defValue: boolean): boolean;
function getBoolean(key: string, defValue?: boolean): boolean | undefined {
	let value = process.env[key];
	if (!value) return defValue;
	value = value.toLowerCase();

	if (booleanTrue.indexOf(value) != -1) return true;
	if (booleanFalse.indexOf(value) != -1) return false;
	return defValue;
}

function getInteger(key: string): number | undefined;
function getInteger(key: string, defValue: number): number;
function getInteger(key: string, defValue?: number): number | undefined {
	let value = process.env[key];
	if (!value) return defValue;
	if (!/\d+/.test(value)) return defValue;
	return parseInt(value);
}

function getString(key: string): string | undefined;
function getString(key: string, defValue: string): string;
function getString(key: string, defValue?: string): string | undefined {
	let value = process.env[key];
	if (!value) return defValue;
	return value;
}

export {
	getBoolean,
	getInteger,
	getString
}
