<svelte:options accessors />

<script>
	import { shouldHideTooltip, tooltips } from "$lib/stores/tooltip";

	export let title = '';
	export let x = 0;
	export let y = 0;
	export let i;

	const padding = 40;
	const POINTER_OFFSET = 15;

	let offsetWidth = 0, offsetHeight = 0;
	let windowWidth = 0, windowHeight = 0;

	const getStyle = (x, y) => {
		let posX = -500, posY = -500;

		if (offsetWidth) {
			posX = x + POINTER_OFFSET;
			posY = y + POINTER_OFFSET;

			if (x + offsetWidth + padding > windowWidth)
				posX = x - offsetWidth;
			if (y + offsetHeight + padding > windowHeight)
				posY = y - offsetHeight;
		}

		return `top:${posY}px;left:${posX}px;`;
	};

	$: hide = shouldHideTooltip(i, $tooltips);
	$: style = getStyle(x, y, windowWidth, windowHeight);
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div {style} class:hide bind:offsetWidth bind:offsetHeight>
	{@html title}
</div>

<style lang="scss">
	div {
		position: absolute;
		z-index: 999;
		padding: 8px;
		border-radius: 4px;
		max-width: 20em;
		background: #555555;
		box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.85);

		&.hide {
			opacity: 0;
		}
	}
</style>