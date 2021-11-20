import { BaseController } from "..";
import BaseService from "./BaseService";

interface ListServices {
	[key: string]: BaseService
}

export default ListServices;
