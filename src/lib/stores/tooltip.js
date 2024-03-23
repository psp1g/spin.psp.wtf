import { writable } from "svelte/store";

export const tooltips = {
	...writable([]),
	push(i) {
		this.update((tips) => [i].concat(tips));
	},
	pop(i) {
		this.update((tips) => tips.filter((t) => t !== i));
	},
};

export const shouldHideTooltip = (i, $tooltips) =>
	$tooltips.findIndex((t) => t === i) !== 0;