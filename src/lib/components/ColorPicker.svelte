<script>
	import ColorPicker from "svelte-awesome-color-picker";

	export let value;
	export let bindTo;

	let isOpen = false;

	const onInput = (e) => {
		// We only want to trigger the bindTo store when the user has inputted something
		// In other cases, if the store was set somewhere else then `value` should update for us
		if (!isOpen) return;
		bindTo.set(e.detail.hex);
	};
</script>

<div class="p-wrapper">
	<ColorPicker
		label=""
		on:input={onInput}
		bind:hex={value}
		bind:isOpen={isOpen}
	/>
</div>

<style lang="scss">
	.p-wrapper {
		--cp-bg-color: #333;
		--cp-border-color: transparent;
		--cp-input-color: #555;
		--cp-button-hover-color: #777;
		--input-size: 18px;

		flex-shrink: 0;

		:global(.color-picker) {
			position: relative;
			display: inline-block;
			height: 100%;
			width: var(--input-size);

			:global(label) {
				top: 0;
				left: 0;
				margin: 0;
				position: absolute;
				display: inline-block;
				width: var(--input-size);
				height: 100%;

				:global(.container) {
					height: 100%;

					:global(.color) {
						box-sizing: border-box;
						border: 1px solid #000;
						border-radius: 6px !important;
						height: 100%;
					}
				}
			}
		}
	}
</style>