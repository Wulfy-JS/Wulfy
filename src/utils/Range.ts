type Range = { min: number, max: number };

function isRange(a: any): a is Range {
	return a.hasOwnProperty('min') && a.hasOwnProperty('max') && typeof a.min == "number" && typeof a.max == "number";
}

export type { Range };
export { isRange }
