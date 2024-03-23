import { derived, writable } from "svelte/store";
import { isFnc, optCall } from "$lib/util/index.js";

export const isListed = (cState, states, isWhitelist = false) =>
	states.includes(cState) ? isWhitelist : !isWhitelist;
export const isWhitelisted = (cState, states) => isListed(cState, states, true);
export const notBlacklisted = (cState, states) => isListed(cState, states, false);

export const state = (defaultState, states) => {
	let lastState;

	const store = writable();
	const stateStore = {
		...store,
		set(newState) {
			if (lastState === newState) return;

			if (lastState && states[lastState]) {
				const { from, toWhitelist } = states[lastState];

				if (toWhitelist && !isWhitelisted(newState, toWhitelist)) return;
				if (isFnc(from) && from(this, newState) === false) return;
			}

			if (states[newState]) {
				const { to, fromWhitelist } = states[newState];

				if (lastState !== undefined && fromWhitelist && !isWhitelisted(lastState, fromWhitelist)) return;
				if (isFnc(to) && to(this, lastState) === false) return;
			} else return;

			lastState = newState;
			store.set(newState);
		},
		reset(triggerFunctions = false) {
			if (triggerFunctions) this.set(defaultState);
			else {
				lastState = defaultState;
				store.set(defaultState);
			}
		},
		hasFramesStore() {
			return derived([ this ], ([ $state ]) => !!states?.[$state]?.frame);
		},
		frame(state, delta) {
			if (!states?.[state]?.frame) return;

			const { frame } = states[state];
			optCall(frame, delta);
		},
	};

	stateStore.set(defaultState);

	return stateStore;
};