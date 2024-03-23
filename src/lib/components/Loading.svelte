<script>
	import spinnuWebp from "$lib/images/spinnu.webp";

	export let loading;
</script>

<div class="loading" class:show={$loading}>
	<div class="img-wrapper">
		<img src={spinnuWebp} alt="loading" />
	</div>
</div>

{#if !$loading}
	<slot />
{/if}

<style lang="scss">
	.loading {
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		opacity: 0;
		pointer-events: none;
		position: absolute;

		&.show {
			opacity: 1;
		}

		.img-wrapper {
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>