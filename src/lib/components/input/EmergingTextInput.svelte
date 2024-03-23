<script>
	import focused from "$lib/action/focused";
	import { writable } from "svelte/store";

	export let value;
	export let bindTo;
	export let numerical = false;
	export let isFocused = false;
	/**
	 * @readonly
	 * @type {HTMLInputElement}
	 */
	export let element = null;

	const focusedStore = writable();

	const number = (n) => {
		const num = parseFloat(n);
		return isNaN(num) ? 0 : num;
	};
	const inputChanged = (e) => {
		const value = numerical ? number(e?.target?.value) : e?.target?.value;
		// Using this "bindTo" approach instead of normal svelte bind: will prevent the store from updating and
		// overriding the persisted wheel data
		bindTo.set(value);
	};
	const resetCaret = () => element?.setSelectionRange?.(0, 0);

	$: type = numerical ? "number" : "text";
	$: numerical && !$focusedStore && isNaN(value) && (value = 0);
	// I guess firefox doesn't do this on its own
	$: !numerical && $focusedStore === false && resetCaret();
	$: isFocused = $focusedStore;
</script>

<input
	{type}
	{value}
	class:numerical
	class="emerging-input {$$props.class}"
	spellcheck={$focusedStore}
	on:input={inputChanged}
	bind:this={element}
	use:focused={focusedStore}
/>

<style lang="scss">
	input, textarea {
		width: 90%;
		color: #fff;
		border: none;
		padding: 10px;
		display: block;
		appearance: textfield;
		background: none;
		border-radius: 8px;
		font-family: "Kanit";
		text-overflow: ellipsis;

		&.numerical {
			width: 2em;
			text-align: right;
		}

		&:focus {
			border: none;
			outline: none;
			background: #525050;
		}
	}
</style>