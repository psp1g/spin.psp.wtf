<script>
	import click from "$lib/action/click";

	export let value;
	export let options;
	export let bindTo;

	const choose = (option) => {
		if (option === value) return;
		bindTo.set(option);
	};
</script>

<div class="options">
	{#each options as [ display, option ], i (option + i)}
		<div
			class="option"
			class:first={i === 0}
			class:last={i === (options.length - 1)}
			class:selected={option === value}
			use:click={choose.bind(null, option)}
		>
			{display}
		</div>
	{/each}
</div>

<style lang="scss">
	.options {
		display: flex;

		.option {
			padding: 12px;
			cursor: pointer;
			background: #5b5b5b;
			transition: background-color 200ms;

			&.first {
				border-top-left-radius: 6px;
				border-bottom-left-radius: 6px;
			}
			&.last {
				border-top-right-radius: 6px;
				border-bottom-right-radius: 6px;
			}
			&.selected {
				color: white;
				background: #4e6481;
			}
			&:hover:not(.selected) {
				color: white;
			}
		}
	}
</style>