type Nullable<T> = T | null;
type SingleOrArray<T> = T | T[];
type Undefined<T> = T | undefined;
type Constructor<T> = T extends abstract new (...args: infer ARGS) => infer R ? new (...args: ARGS) => R : never;
