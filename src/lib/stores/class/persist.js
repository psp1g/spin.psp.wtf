import localforage from "localforage";
import { writable } from "svelte/store";
import { randomStr, sleep } from "$lib/util/index.js";

/**
 * @template T
 * @typedef {Object} PersistedStoreOptions
 * @property {string} [defaultKey=""] - Default key.
 * @property {T} [defaultValue=null] - Default value.
 * @property {boolean} [autoPersist=true] - Automatically persist when store updates.
 * @property {boolean} [autoHydrate=true] - Automatically hydrate the store with persisted data on key change.
 * @property {boolean} [hydrateNow=true] - Hydrate on store creation with current key.
 * @property {string[]} [dontPersistKeys=[]] - List of keys not to persist.
 * @property {boolean} [defaultRandomKey=false] - If true, a random string will be generated instead of using `defaultKey`.
 * @property {boolean} [defaultToLastUsedKey=true] - Default to the last used key if available. Overrides `defaultKey` and `defaultRandomKey`
 * @property {LocalForage} [localForage] - Localforage instance to store keys in. Defaults to the global localforage instance.
 * @property {any} [newTemplate] - Template to use for a new item, or a function that returns a template. If not specified, `defaultValue` is used
 */

/**
 * @template T
 * @param {string} keyPrefix - A namespace for this key, string to prepend to all keys for this store
 * @param {PersistedStoreOptions<T>} options
 * @return {Writable<T>}
 */
export const persisted = (keyPrefix, {
	defaultKey = "",
	defaultValue = null,
	autoPersist = true,
	autoHydrate = true,
	hydrateNow = true,
	defaultRandomKey = false,
	defaultToLastUsedKey = true,
	dontPersistKeys = [],
	localForage = localforage,
	newTemplate = { },
} = {}) => {
	const prefixRgx = new RegExp(`^${keyPrefix}`);

	// Ensures that our prefix is on the key
	const cleanKeyInput = (key) => `${keyPrefix}${key.replace(prefixRgx, '')}`;
	const randomKey = () => randomStr(8);
	const randomCleanKey = () => cleanKeyInput(randomKey());

	const cleanDefaultKey = defaultRandomKey ? randomCleanKey() : cleanKeyInput(defaultKey);

	const lastUsedKeyKey = `meta_${keyPrefix}_lastUsedKey`; // xd

	let last = defaultValue;
	let lastKey = cleanDefaultKey;

	const store = writable(defaultValue);
	const keyStore = writable(cleanDefaultKey);
	const loadingStore = writable(false);

	const persist = {
		...store,
		key: {
			...keyStore,
			/**
			 * @param val
			 * @param {boolean|null} [forceHydrate=null] - Force whether to hydrate or not.
			 */
			async set(val, forceHydrate = null) {
				const key = cleanKeyInput(val);
				if (lastKey === key) return;

				lastKey = key;
				keyStore.set(key);

				localForage.setItem(lastUsedKeyKey, key);

				if (forceHydrate ?? autoHydrate)
					return persist.hydrate();
			},
		},
		/**
		 * @type {Readable<boolean>}
		 */
		loading: {
			subscribe: loadingStore.subscribe,
		},
		/**
		 * @param {any} val
		 * @param {boolean|null} [forcePersist=null] - Force whether to persist or not.
		 * @return {Promise<void>} - Will resolve instantly if not persisting
		 */
		async set(val, forcePersist = null) {
			last = val;
			store.set(val);

			if (forcePersist ?? autoPersist)
				return this.persist();
		},
		/**
		 * @param {(any) => Promise<any>} callback
		 * @param {boolean|null} [forcePersist=null] - Force whether to persist or not.
		 * @return {Promise<void>}
		 */
		async update(callback, forcePersist = null) {
			const val = await callback(last);
			return this.set(val, forcePersist);
		},
		/**
		 * Write the value of the store with the value to the current key.
		 * @return {Promise<string>} - Value in JSON
		 */
		async persist() {
			if (dontPersistKeys.includes(lastKey)) return;
			return localForage.setItem(lastKey, JSON.stringify(last))
		},
		/**
		 * Hydrate the store with the value associated with the current key.
		 * @return {Promise<any>} - The hydrated (stored) value
		 */
		async hydrate() {
			// If this key isn't persisted, we know we cant hydrate
			if (dontPersistKeys.includes(lastKey)) return;

			loadingStore.set(true);

			await sleep(200);

			const json = await localForage.getItem(lastKey);
			const value = json != null ? JSON.parse(json) : json;
			await this.set(value, false);

			loadingStore.set(false);

			return value;
		},
		/**
		 * @typedef {Object} PersistedStoreDeleteOptions
		 * @property {string?} [replaceKey=null] - If deleting the currently used key, set the current key to replaceKey if it exists.
		 * @property {boolean} [replaceIfCurrent=true] - If deleting the currently used key, should we replace the stores with a new value?
		 */
		/**
		 * @param {string} [tKey=null] - Key to delete, leave null to delete the currently used key.
		 * @param {PersistedStoreOptions} [options={}]
		 * @return {Promise<void>}
		 */
		async delete(tKey, {
			replaceIfCurrent = true,
			replaceKey = null,
		}) {
			const delKey = cleanKeyInput(tKey ?? lastKey);

			// Handle replacing the current value with another key if applicable
			if (delKey === lastKey) {
				if (replaceIfCurrent) {
					const rKey = cleanKeyInput(replaceKey);
					const replacementJSON = await localForage.getItem(rKey);
					const replacement = replacementJSON != null ? JSON.parse(replacementJSON) : defaultValue;
					const replacementKey = replacementJSON != null ? rKey : cleanDefaultKey;

					this.key.set(replacementKey, false);

					// These set calls will resolve instantly
					await this.set(replacement, false);
				} else await this.set(null, false);
			}

			return localForage.removeItem(delKey);
		},
		/**
		 * Creates a new entry to the persisted storage with the key and value provided.
		 * @param {string} [key] - The new stored object's key (if omitted, uses a random key)
		 * @param {any} [value] - Value of the stored object. (if undefined, uses the new item template/default value)
		 * @return {Promise<void>}
		 */
		async new({ key, value } = {}) {
			if (value === undefined) {
				// Use the template if available
				value = defaultValue;
				if (newTemplate !== undefined)
					typeof newTemplate === "function" ?
						value = newTemplate() :
						value = newTemplate;
			}

			if (value === undefined) return;

			await this.key.set(key ?? await this.randomKey(), false);
			return this.set(value);
		},
		/**
		 * @param {string[]} keys
		 * @param {any[]} values
		 * @return {Promise<void>}
		 */
		async import({ keys = [], values }) {
			if (!values) return Promise.reject("No value(s) provided");
			await Promise.all(
				values.map((value, i) => {
					const keyPromise = !!(keys?.[i]) ? Promise.resolve(keys[i]) : this.randomKey();
					return keyPromise.then((key) => localForage.setItem(key, JSON.stringify(value)));
				})
			);
		},
		/**
		 * Check if there is anything stored with this key
		 * @param {string} key
		 * @return {Promise<boolean>}
		 */
		async exists(key) {
			const cleanKey = cleanKeyInput(key);
			const value = await localForage.getItem(cleanKey);
			return value !== null;
		},
		/**
		 * Returns a random key that isn't already in use
		 * @return {Promise<string>}
		 */
		async randomKey() {
			let key = randomKey();
			// Loop until we get a key that doesn't already exist
			while ((await this.exists(key))) key = randomKey();
			return cleanKeyInput(key);
		},
	};

	if (defaultToLastUsedKey) {
		loadingStore.set(true);

		localForage.getItem(lastUsedKeyKey)
			.then(async (key) => {
				if (key == null) return localForage.setItem(lastUsedKeyKey, lastKey);

				const exists = await persist.exists(key);
				if (!exists) return;

				return persist.key.set(key, hydrateNow || autoHydrate)
			})
			.then(() => loadingStore.set(false));
	} else if (hydrateNow && !dontPersistKeys.includes(lastKey))
		persist.hydrate();

	return persist;
};

export const persistedList = (keyPrefix, {
	localForage = localforage,
	refreshNow = true,
	modifier = (v) => v,
} = {}) => {
	const store = writable([]);
	const keysStore = writable([]);
	const loadingStore = writable(false);

	const list = {
		subscribe: store.subscribe,
		keys: {
			subscribe: keysStore.subscribe,
		},
		loading: {
			subscribe: loadingStore.subscribe,
		},
		async refresh() {
			loadingStore.set(true);

			await sleep(200);

			const allKeys = await localForage.keys();
			const nsKeys = !keyPrefix ? allKeys : allKeys.filter((key) => key.startsWith(keyPrefix));

			const promises = nsKeys.map(
				(key) =>
					localForage.getItem(key)
						.then((json) => JSON.parse(json))
			);
			const values = await (
				Promise.all(promises)
					.then((values) => modifier(values))
			);

			store.set(values);
			keysStore.set(nsKeys);

			loadingStore.set(false);
		},
	};

	if (refreshNow) list.refresh();

	return list;
};