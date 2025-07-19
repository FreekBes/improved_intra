const ImprovedStorage = {

	/**
	 * Get data from storage
	 * @param {string|string[]} keys The key or keys to retrieve
	 * @returns {Promise<Object>} The retrieved data in object format
	 * @example
	 * const { data } = await ImprovedStorage.get('key');
	 * const { value1, value2 } = await ImprovedStorage.get(['key1', 'key2']);
	 */
	get: async (keys) => {
		if (typeof keys == "string") {
			keys = [keys];
		}
		return new Promise((resolve) => {
			chrome.storage.local.get(keys, (result) => {
				resolve(result);
			});
		});
	},

	/**
	 * Set data in storage using a key-value pair
	 * @param {Object} data The data to set, as an object with key-value pairs
	 * @returns {Promise<void>}
	 * @example
	 * await ImprovedStorage.set({ key: 'value' });
	 */
	set: async (data) => {
		return new Promise((resolve) => {
			chrome.storage.local.set(data, () => {
				resolve();
			});
		});
	},

	remove: async (keys) => {
		if (typeof keys == "string") {
			keys = [keys];
		}
		return new Promise((resolve) => {
			chrome.storage.local.remove(keys, () => {
				resolve();
			});
		});
	},

	getBytesInUse: async (keys) => {
		if (typeof keys === "string") {
			keys = [keys];
		}
		return new Promise((resolve) => {
			chrome.storage.local.getBytesInUse(keys, (bytes) => {
				resolve(bytes);
			});
		});
	}
}
