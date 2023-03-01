import dotenv from 'dotenv';

namespace DotEnv {
	export function config() {
		dotenv.config();
	}

	export function getInt(ENV_KEY: string): Nullable<number>;
	export function getInt(ENV_KEY: string, defaultValue: number): number;
	export function getInt(ENV_KEY: string, defaultValue: Nullable<number> = null): Nullable<number> {
		const raw = process.env[ENV_KEY];
		if (raw === undefined) return defaultValue;
		const number = parseInt(raw);

		if (isNaN(number)) throw new ReferenceError(`${ENV_KEY} was been Integer.`);
		return number;
	}

	export function getFloat(ENV_KEY: string): Nullable<number>;
	export function getFloat(ENV_KEY: string, defaultValue: number): number;
	export function getFloat(ENV_KEY: string, defaultValue: Nullable<number> = null): Nullable<number> {
		const raw = process.env[ENV_KEY];
		if (raw === undefined) return defaultValue;
		const number = parseFloat(raw);

		if (isNaN(number)) throw new ReferenceError(`${ENV_KEY} was been Integer.`);
		return number;
	}

	export function getString(ENV_KEY: string): Nullable<string>;
	export function getString(ENV_KEY: string, defaultValue: string): string;
	export function getString(ENV_KEY: string, defaultValue: Nullable<string> = null): Nullable<string> {
		const value = process.env[ENV_KEY];
		if (value === undefined) return defaultValue;
		return value;
	}



	export function getBoolean(ENV_KEY: string): Nullable<boolean>;
	export function getBoolean(ENV_KEY: string, defaultValue: boolean): boolean;
	export function getBoolean(ENV_KEY: string, defaultValue: Nullable<boolean> = null): Nullable<boolean> {
		let value = process.env[ENV_KEY];
		if (value === undefined) return defaultValue;
		value = value.toLowerCase();
		const i = [
			'false', 'true',
			'f', 't',
			'0', '1'
		].indexOf(value) % 2;

		if (i == -1) throw new ReferenceError(`${ENV_KEY} was been Boolean`);

		return i === 1;
	}
}

export default DotEnv;
