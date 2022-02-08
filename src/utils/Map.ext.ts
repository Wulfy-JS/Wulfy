interface Map<K, V> {
	find(callback: (key: K, value: V, map: Map<K, V>) => boolean): V | undefined;
}

Map.prototype.find = function <K, V>(callback: (key: K, value: V, map: Map<K, V>) => boolean): V | undefined {
	for (const key of this.keys()) {
		const value = this.get(key);
		if (callback(key, value, this))
			return value;
	}
	return;
}
