<script>
	import { optCall } from "$lib/util/index";

	/**
	 * @type {Function|string}
	 */
	export let action;
	export let link = false;

	const click = () => {
		if (link) window.href = action;
		else optCall(action);
	};
</script>

<button on:click={click}>
	<slot />
</button>

<style lang="scss">
	button {
		padding: 10px 6px;
		border-radius: 10px;
		background: #178c96;
		color: #fff;
		cursor: pointer;
	}
</style>