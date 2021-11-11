class ExtMap<K, V> extends Map<K, V> {
	findKey(callback: (key: K) => boolean) {
		for (const key of this.keys())
			if (callback(key))
				return key;

		return false;
	}
}

export default ExtMap;
