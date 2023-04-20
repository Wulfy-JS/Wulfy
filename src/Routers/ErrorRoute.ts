import Controller from "../Controller";

interface RangeCode {
	min: number;
	max: number;
}
type ErrorCode = number | RangeCode;

declare global {
	namespace Reflect {
		let Error: string;
	}
}

interface ErrorHandlesList {
	[method: string]: ErrorCode[]
}

Reflect.Error = "@error";
function ErrorRoute(code: SingleOrArray<ErrorCode>) {

	return (target: Controller, method: string) => {
		const meta: ErrorHandlesList = Reflect.getMetadata(Reflect.Error, target.constructor) || {};
		if (!Array.isArray(code)) code = [code];
		meta[method] = code;
		Reflect.defineMetadata(Reflect.Error, meta, target.constructor);
	}
}


export default ErrorRoute;
export { ErrorHandlesList };
