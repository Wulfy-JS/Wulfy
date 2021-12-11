import s, { ModelStatic, ModelCtor, ModelAttributes, InitOptions, Sequelize, BelongsToOptions, BelongsToManyOptions, HasOneOptions, HasManyOptions } from "sequelize";
const { Model } = s;
// type Model<A extends {} = any, B extends {} = A> = sequelize.Model<A, B>;
type BelongsTo<S extends s.Model = s.Model, T extends s.Model = s.Model> = s.BelongsTo<S, T>;
type BelongsToMany<S extends s.Model = s.Model, T extends s.Model = s.Model> = s.BelongsToMany<S, T>;
type HasOne<S extends s.Model = s.Model, T extends s.Model = s.Model> = s.HasOne<S, T>;
type HasMany<S extends s.Model = s.Model, T extends s.Model = s.Model> = s.HasMany<S, T>;


interface SetupData<T extends s.Model<any, any> = any> {
	init?: {
		attributes: ModelAttributes;
		options: Partial<InitOptions>;
	};
	belongsTo?: {
		target: ModelStatic<T>;
		options?: BelongsToOptions;
	};
	belongsToMany?: {
		target: ModelStatic<T>;
		options?: BelongsToManyOptions;
	};
	hasOne?: {
		target: ModelStatic<T>;
		options?: HasOneOptions;
	};
	hasMany?: {
		target: ModelStatic<T>;
		options?: HasManyOptions;
	};
}

abstract class BaseModel<TModelAttributes extends {} = any, TCreationAttributes extends {} = TModelAttributes>
	extends s.Model<TModelAttributes, TCreationAttributes>
{
	private static _sequelize: Sequelize;
	private static _setupData: SetupData;
	private static models: Set<typeof BaseModel> = new Set();

	public static init<MS extends ModelStatic<BaseModel>, M extends InstanceType<MS>>(
		this: MS,
		attributes: ModelAttributes<M, M['_attributes']>, options?: Partial<InitOptions<M>>
	): MS;
	public static init<MS extends ModelStatic<BaseModel>, M extends InstanceType<MS>>(
		attributes: ModelAttributes<M, M['_attributes']>, options: Partial<InitOptions<M>> = {}
	) {
		this._setupData = {};
		this._setupData.init = { attributes, options };

		if (this._sequelize)
			this._init()
		else
			BaseModel.models.add(this);

		return this;
	}

	private static _init() {
		if (this._setupData.init) {
			Model.init.bind(this)(this._setupData.init.attributes, { ...this._setupData.init.options, sequelize: this._sequelize });
			this._setupData.init = null;
		}
	}

	public static belongsTo<M extends s.Model, T extends s.Model>(
		// this: ModelStatic<M>, 
		target: ModelStatic<T>, options?: BelongsToOptions
	): BelongsTo<M, T>;
	public static belongsTo<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options?: BelongsToOptions
	): BelongsTo<M, T> {
		this._setupData.belongsTo = { target, options };

		if (this._sequelize)
			return this._belongsTo()

		BaseModel.models.add(this);
		return
	}
	private static _belongsTo() {
		if (this._setupData.belongsTo) {
			const r = Model.belongsTo.bind(this)(this._setupData.belongsTo.target, this._setupData.belongsTo.options);
			this._setupData.belongsTo = null;
			return r;
		}
	}


	public static belongsToMany<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>, target: ModelStatic<T>, options: BelongsToManyOptions
	): BelongsToMany<M, T>;
	public static belongsToMany<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options: BelongsToManyOptions
	): BelongsToMany<M, T> {
		this._setupData.belongsToMany = { target, options };

		if (this._sequelize)
			return this._belongsToMany()

		BaseModel.models.add(this);
		return
	}
	private static _belongsToMany() {
		if (this._setupData.belongsToMany) {
			const r = Model.belongsToMany.bind(this)(this._setupData.belongsToMany.target, this._setupData.belongsToMany.options);
			this._setupData.belongsToMany = null;
			return r;
		}
	}

	public static hasOne<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>, target: ModelStatic<T>, options?: HasOneOptions
	): HasOne<M, T>;
	public static hasOne<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options?: HasOneOptions
	): HasOne<M, T> {
		this._setupData.hasOne = { target, options };

		if (this._sequelize)
			return this._hasOne()

		BaseModel.models.add(this);
		return
	}
	private static _hasOne() {
		if (this._setupData.hasOne) {
			const r = Model.hasOne.bind(this)(this._setupData.hasOne.target, this._setupData.hasOne.options);
			this._setupData.hasOne = null;
			return r;
		}
	}

	public static hasMany<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>, target: ModelStatic<T>, options?: HasManyOptions
	): HasMany<M, T>;
	public static hasMany<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options?: HasManyOptions
	): HasMany<M, T> {
		this._setupData.hasMany = { target, options };

		if (this._sequelize)
			return this._hasMany()

		BaseModel.models.add(this);
		return
	}
	private static _hasMany() {
		if (this._setupData.hasMany) {
			const r = Model.hasMany.bind(this)(this._setupData.hasMany.target, this._setupData.hasMany.options);
			this._setupData.hasMany = null;
			return r;
		}
	}



	public static setup(sequelize: Sequelize) {
		this._sequelize = sequelize;
		this.models.forEach(e => e._init());
		this.models.forEach(e => e._setup());
	}

	private static _setup() {
		this._hasOne();
		this._hasMany();
		this._belongsTo();
		this._belongsToMany();
	}
}


interface StaticBaseModel<T extends s.Model> extends ModelCtor<T> {
	new(): T;
}
export default BaseModel;
export { StaticBaseModel };
