import s, { ModelStatic, ModelCtor, ModelAttributes, InitOptions, Sequelize, BelongsToOptions, BelongsToManyOptions, HasOneOptions, HasManyOptions } from "sequelize";
import Logger from "../utils/Logger";
// const { Model } = s;
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
	}[];
	belongsToMany?: {
		target: ModelStatic<T>;
		options?: BelongsToManyOptions;
	}[];
	hasOne?: {
		target: ModelStatic<T>;
		options?: HasOneOptions;
	}[];
	hasMany?: {
		target: ModelStatic<T>;
		options?: HasManyOptions;
	}[];
}

abstract class Model<TModelAttributes extends {} = any, TCreationAttributes extends {} = TModelAttributes>
	extends s.Model<TModelAttributes, TCreationAttributes>
{
	private static _sequelize: Sequelize;
	private static _setupData: SetupData;
	private static models: Set<typeof Model> = new Set();

	public static init<MS extends ModelStatic<Model>, M extends InstanceType<MS>>(
		this: MS,
		attributes: ModelAttributes<M, M['_attributes']>, options?: Partial<InitOptions<M>>
	): MS;
	public static init<MS extends ModelStatic<Model>, M extends InstanceType<MS>>(
		attributes: ModelAttributes<M, M['_attributes']>, options: Partial<InitOptions<M>> = {}
	) {
		this._setupData = {
			//@ts-ignore
			init: { attributes, options },
			belongsTo: [],
			hasOne: [],
			hasMany: [],
			belongsToMany: []
		};

		if (this._sequelize)
			this._init()
		else
			Model.models.add(this);

		return this;
	}

	private static _init() {
		if (this._setupData.init) {
			//@ts-ignore
			s.Model.init.bind(this)(this._setupData.init.attributes, { ...this._setupData.init.options, sequelize: this._sequelize });
			//@ts-ignore
			this._setupData.init = null;
		}
	}

	public static belongsTo<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>,
		target: ModelStatic<T>, options?: BelongsToOptions
	): BelongsTo<M, T>;
	public static belongsTo<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options?: BelongsToOptions
	): BelongsTo<M, T> | void {
		//@ts-ignore
		this._setupData.belongsTo.push({ target, options });

		if (this._sequelize)
			return this._belongsTo()

		Model.models.add(this);
		return
	}
	private static _belongsTo() {
		let item;
		//@ts-ignore
		while (item = this._setupData.belongsTo.shift()) {
			//@ts-ignore
			s.Model.belongsTo.bind(this)(item.target, item.options);
		}
	}


	public static belongsToMany<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>, target: ModelStatic<T>, options: BelongsToManyOptions
	): BelongsToMany<M, T>;
	public static belongsToMany<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options: BelongsToManyOptions
	): BelongsToMany<M, T> | void {
		//@ts-ignore
		this._setupData.belongsToMany.push({ target, options });

		if (this._sequelize)
			return this._belongsToMany()

		Model.models.add(this);
		return
	}
	private static _belongsToMany() {
		let item;
		//@ts-ignore
		while (item = this._setupData.belongsToMany.shift()) {
			//@ts-ignore
			s.Model.belongsToMany.bind(this)(item.target, item.options);
		}
	}

	public static hasOne<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>, target: ModelStatic<T>, options?: HasOneOptions
	): HasOne<M, T>;
	public static hasOne<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options?: HasOneOptions
	): HasOne<M, T> | void {
		//@ts-ignore
		this._setupData.hasOne.push({ target, options });

		if (this._sequelize)
			return this._hasOne()

		Model.models.add(this);
		return
	}
	private static _hasOne() {
		let item;
		//@ts-ignore
		while (item = this._setupData.hasOne.shift()) {
			//@ts-ignore
			s.Model.hasOne.bind(this)(item.target, item.options);
		}
	}

	public static hasMany<M extends s.Model, T extends s.Model>(
		this: ModelStatic<M>, target: ModelStatic<T>, options?: HasManyOptions
	): HasMany<M, T>;
	public static hasMany<M extends s.Model, T extends s.Model>(
		target: ModelStatic<T>, options?: HasManyOptions
	): HasMany<M, T> | void {
		//@ts-ignore
		this._setupData.hasMany.push({ target, options });

		if (this._sequelize)
			return this._hasMany()

		Model.models.add(this);
		return
	}
	private static _hasMany() {
		let item;
		//@ts-ignore
		while (item = this._setupData.hasMany.shift()) {
			//@ts-ignore
			s.Model.hasMany.bind(this)(item.target, item.options);
		}
	}


	public static setup() {
		if (process.env.DATABASE_URL == undefined) {
			Logger.warn(`No configuration for database! Models not works!`);
			return;
		}

		this._sequelize = new s.Sequelize(process.env.DATABASE_URL, {
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
		});

		switch (process.env.DATABASE_MODE) {
			case 'alter':
			case 'force':
				if (process.env.MODE == "dev")
					this._sequelize.sync({ [process.env.DATABASE_MODE]: true });
				break;
			case "prod": break;
			default:
				Logger.warn(`Unknown mode "${process.env.DATABASE_MODE}" for sequelize`);
		}

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


interface StaticModel<T extends s.Model> extends ModelCtor<T> {
	new(): T;
}
export default Model;
export { StaticModel };
