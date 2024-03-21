<script>
	import { fade } from "svelte/transition";
	import click from "$lib/action/click";
	import { currentModal, modalData } from "$lib/stores/modal";

	const close = () => currentModal.set(undefined);
	const escape = (e) => e.code === 'Escape' && close();
</script>

<svelte:window on:keydown|nonpassive={escape} />

{#if $currentModal}
	<div class="modal-bg" use:click={close} transition:fade={{ duration: 100 }}>
		<svelte:component this={$modalData.component} data={$modalData.data} />
	</div>
{/if}

<style lang="scss">
	.modal-bg {
		position: fixed;
		z-index: 2000;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(1px);
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}
</style>