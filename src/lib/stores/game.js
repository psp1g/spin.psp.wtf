import { persisted } from "$lib/stores/persist.js";
import localforage from "localforage";
import { defaultGame } from "$lib/config/defaultItems";
import { debounce, shuffle } from "$lib/util";
import { cycleColors } from "$lib/util/color";
import { derived, writable } from "svelte/store";

const itemProps = [ 'name', 'color', 'weight' ];

const storage = localforage.createInstance({ name: "game" });

export const currentGame = {
	...persisted("game-", {
		hydrateNow: true,
		localForage: storage,
		defaultRandomKey: true,
		defaultValue: defaultGame,
		defaultToLastUsedKey: true,
		dontPersistKeys: [ "default" ],
	}),
	store(prop) {
		const gameThis = this;
		return {
			...derived([ gameThis ], ([ $game ]) => $game[prop]),
			set(value) {
				gameThis.update((game) => ({
					...game,
					[prop]: value,
				}));
			},
		};
	},
};

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

export const editorOpen = writable(false);