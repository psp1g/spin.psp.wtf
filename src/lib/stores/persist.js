import localforage from "localforage";
import { writable } from "svelte/store";
import { randomStr } from "$lib/util";

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

				lastKey = key;
				keyStore.set(key);

				localForage.setItem(lastUsedKeyKey, key);

				if (forceHydrate ?? autoHydrate)
					return persist.hydrate();
			},
		},
		loading: writable(defaultToLastUsedKey),
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


			this.loading.set(true);

			const json = await localForage.getItem(lastKey);
			const value = json != null ? JSON.parse(json) : json;
			await this.set(value, false);

			this.loading.set(false);

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
		 * @param {string} key
		 * @param {any} value
		 * @return {Promise<void>}
		 */
		async new(key, value) {
			if (typeof key !== "string") throw "`Key` isn't a string or defined!";
			if (value === undefined) {
				// in this case `key` is the value
				value = key;

				const randomKey = await this.randomKey();
				// Will resolve instantly
				await this.key.set(randomKey, false);
			} else await this.key.set(key, false);

			return this.set(value);
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
		}
	};

	if (defaultToLastUsedKey) {
		persist.loading.set(true);

		localForage.getItem(lastUsedKeyKey)
			.then(async (key) => {
				if (key == null) return localForage.setItem(lastUsedKeyKey, lastKey);

				const exists = await persist.exists(key);
				if (!exists) return;

				return persist.key.set(key, hydrateNow || autoHydrate)
			})
			.then(() => persist.loading.set(false));
	} else if (hydrateNow && !dontPersistKeys.includes(lastKey))
		persist.hydrate();

	return persist;
};