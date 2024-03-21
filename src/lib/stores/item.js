import { writable } from "svelte/store";

export const createItemStores = ({ name, color, weight = 1 } = {}) => ({
	name: writable(name),
	color: writable(color),
	weight: writable(weight),
});

export const createGameStores = ({ title, items } = {}) => ({
	title: writable(title),
	items,
});