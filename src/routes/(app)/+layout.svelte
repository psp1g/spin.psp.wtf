<script>
	import Modal from "$lib/components/modal/Modal.svelte";
</script>

<div id="spin-app">
	<div id="content">
		<slot />
	</div>
</div>

<Modal />

<style lang="scss">
	:global(body) {
		margin: 0;
		color: #c4c4c4;
		overflow: hidden;
		background: #1f1f1f;
		font-family: "Kanit";
	}

	#spin-app {
		gap: 20px;
		height: 100vh;
		display: flex;
		flex-direction: row;

		#content {
			max-height: 100vh;
			flex: 1 0 auto;
			background: var(--t-bgColor);
		}
	}
</style>