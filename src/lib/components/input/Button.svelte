<script>
	import click from "$lib/action/click";
	import tooltip from "$lib/action/tooltip";
	import { url } from "$lib/util";

	export let mask;
	export let tip;
	export let onClick = () => { };
</script>

<button
	{tip}
	class="{$$props.class}"
	class:mask={!!mask}
	use:click={onClick}
	use:tooltip
	style:--mask={url(mask)}
>
	<slot />
</button>

<style lang="scss">
	button {
		color: #fff;
		font-weight: 600;
		border: none;
		border-radius: 6px;
		background: var(--bg-color);
		padding: 8px;
		height: var(--height, var(--size, 40px));
		position: relative;

		&.mask {
			width: var(--width, var(--size, 40px));

			&::after {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: #cecccc;
				mask: var(--mask) center/contain no-repeat;
				mask-size: 65%;
				mask-origin: content-box;
			}
		}

		&:hover {
			cursor: pointer;
			background: var(--bg-focus);
		}
	}
</style>