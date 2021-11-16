import sequelize, { ModelStatic, ModelAttributes, InitOptions, Sequelize } from "sequelize";
const Model = sequelize.Model;

abstract class BaseModel<TModelAttributes extends {} = any, TCreationAttributes extends {} = TModelAttributes>
	extends Model<TModelAttributes, TCreationAttributes>
{
	private static _sequelize: Sequelize;
	private static _attributes: ModelAttributes;
	private static _options: Partial<InitOptions>;
	private static models: (typeof BaseModel)[] = [];

	public static init<MS extends ModelStatic<BaseModel>, M extends InstanceType<MS>>(
		this: MS,
		attributes: ModelAttributes<M, M['_attributes']>, options?: Partial<InitOptions<M>>
	): MS;
	public static init<MS extends ModelStatic<BaseModel>, M extends InstanceType<MS>>(
		attributes: ModelAttributes<M, M['_attributes']>, options: Partial<InitOptions<M>> = {}
	) {
		this._attributes = attributes;
		this._options = options;

		if (this._sequelize)
			this.initModel()
		else
			BaseModel.models.push(this);

		return this;
	}
	private static initModel() {
		Model.init.bind(this)(this._attributes, this._options);
	}

	public static setup(sequelize: Sequelize) {
		this._sequelize = sequelize;
		this.models.forEach(e => e.initModel());
	}
}

export default BaseModel;
