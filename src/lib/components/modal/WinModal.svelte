<script>
	import { winningItem } from "$lib/stores/wheel";

	export let data;
</script>

<div class="win" style:--item-color={$winningItem?.color}>
	<div class="header">Winner!!</div>
	<div class="winner">{$winningItem.name}</div>
</div>

<style lang="scss">
	.win {
		width: 75%;
		height: 30%;
		border-radius: 16px;
		background-color: #1e1e1e;

		div {
			padding: 20px;
			font-weight: 700;
		}

		.header {
			font-size: 18px;
			background: var(--item-color);
			border-top-left-radius: 16px;
			border-top-right-radius: 16px;
		}

		.winner {
			font-size: 28px;
		}
	}
</style>