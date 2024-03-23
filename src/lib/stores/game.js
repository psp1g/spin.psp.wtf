import localforage from "localforage";
import { derived, writable } from "svelte/store";
import { persisted, persistedList } from "$lib/stores/class/persist";
import { defaultGame, newGameTemplate } from "$lib/config/default";
import { debounce, shuffle } from "$lib/util";
import { cycleColors } from "$lib/util/color";

const itemProps = [ "name", "color", "weight" ];

const storage = localforage.createInstance({ name: "game" });

const persistedPrefix = "game-";

export const gameList = persistedList(persistedPrefix, {
	refreshNow: false,
	localForage: storage,
	// modifier: (games) => games.sort(),
});

export const currentGame = {
	...persisted(persistedPrefix, {
		hydrateNow: true,
		localForage: storage,
		defaultRandomKey: true,
		defaultValue: defaultGame,
		defaultToLastUsedKey: true,
		newTemplate: newGameTemplate,
		dontPersistKeys: [ "default" ],
	}),
	store(prop, debounceTime) {
		const gameThis = this;
		const updateParent = (value) =>
			gameThis.update((game) => ({
				...game,
				[prop]: value,
			}));

		const set = debounceTime ? debounce(updateParent, debounceTime) : updateParent;

		return {
			...derived([ gameThis ], ([ $game ]) => $game[prop]),
			set,
		};
	},
};

const debounceTime = 200;

/**
 * @type {Writable<string>}
 */
export const title = currentGame.store("title", debounceTime);

/**
 * @type {Writable<GAME_TYPE>}
 */
export const gameType = currentGame.store("type", debounceTime);

/**
 * @type {Writable<number>}
 */
export const duration = currentGame.store("duration", debounceTime);

/**
 * @type {Readable<number>}
 */
export const durationMs = derived([ duration ], ([ $duration ]) => $duration * 1000);

export const currentItems = {
	...derived([ currentGame ], ([ $game ]) => $game?.items),
	new() {
		currentGame.update((game) => ({
			...game,
			items:
				game?.items?.concat([ {
					name: "New Item",
					weight: 10,
					color: cycleColors().color,
				} ])
		}));
	},
	delete(i) {
		currentGame.update((game) => ({
			...game,
			items: game?.items?.toSpliced(i, 1)
		}))
	},
	shuffle() {
		currentGame.update((game) => ({
			...game,
			items: shuffle(game?.items),
		}));
	},
	item(i, debounceTime) {
		const setParent = (prop, value) =>
			currentGame.update((game) => {
				if (!game.items) return game;

				const newItems = [ ...game.items ];
				newItems[i] = {
					...newItems[i],
					[prop]: value,
				};

				return {
					...game,
					items: newItems,
				};
			});

		return itemProps.reduce((acc, prop) => {
			const setParentProp = setParent.bind(null, prop);
			const set = debounceTime ? debounce(setParentProp, debounceTime) : setParentProp;
			return {
				...acc,
				[prop]: {
					...derived([ currentGame ], ([ { items } ]) => items[i]?.[prop]),
					set,
				},
			};
		}, {})
	},
};

export const totalWeight = derived([ currentItems ], ([ $items ]) =>
	$items.reduce((acc, { weight }) => acc + weight, 0)
);

export const gameListOpen = writable(false);

const editorOpenStore = writable(false);
export const editorOpen = {
	...editorOpenStore,
	set(val) {
		editorOpenStore.set(val);
		if (!val) gameListOpen.set(false);
	},
};