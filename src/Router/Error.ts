import Controller from "../Controller.js";
import HttpError from "../HttpError.js";
import type { Range } from "../utils/Range.js";
import { ControllerHandlers } from "./Route.js";

type ErrorCode = number | Range | (number | Range)[];

type ControllerErrorHandlers<C extends Controller> = ControllerHandlers<C, HttpError> | ControllerHandlers<C, unknown>;

const METADATA_KEY = "@Errors";
function Error<C extends Controller>(code: ErrorCode): (target: C, method: ControllerErrorHandlers<C>) => void {
	return (target, method) => {
		const controller = target.constructor as typeof Controller;
		defineErrorMetadata(controller, method as string, code);
	}
}

type MetadataErrors = [number | Range, string][];

function defineErrorMetadata(target: typeof Controller, handler: string, code: ErrorCode) {
	const meta = getMetadataError(target) || [];

	if (Array.isArray(code)) {
		for (const c of code)
			meta.push([c, handler])
	} else {
		meta.push([code, handler])
	}

	Reflect.defineMetadata(METADATA_KEY, meta, target);
}

function getMetadataError(target: typeof Controller) {
	return <MetadataErrors | undefined>Reflect.getMetadata(METADATA_KEY, target)
}

export default Error;
export { Error, getMetadataError };
