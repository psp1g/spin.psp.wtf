<script>
	import Chart from "$lib/components/Chart.svelte";
	import { SPIN_STATE } from "$lib/config/states";
	import { currentGame, currentItems } from "$lib/stores/game";
	import {
		chartItemData,
		chartOptions,
		currentItemPoint,
		hasFrames,
		rotation,
		spinState,
		wheelChart,
	} from "$lib/stores/wheel";
	import { createEventDispatcher, onMount } from "svelte";

	let mounted = false;
	let isReady = false;

	let lastTime;

	const dispatch = createEventDispatcher();

	const { key, loading } = currentGame;

	onMount(() => (mounted = true));

	const ready = () => {
		isReady = true;
		dispatch('ready');
	};

	const update = () => {
		const { data, labels, colors } = $chartItemData;

		$wheelChart.data.labels = labels;
		$wheelChart.data.datasets[0].data = data;
		$wheelChart.data.datasets[0].backgroundColor = colors;

		const a = performance.now();
		$wheelChart.update();
		const b = performance.now();
		console.debug(b - a, "MS TO UPDATE WHEEL");
	};

	const frame = (now) => {
		if (!lastTime) lastTime = now;
		const delta = now - lastTime;
		spinState.frame($spinState, delta);
		if ($hasFrames) window.requestAnimationFrame(frame);
	};

	const options = chartOptions($chartItemData);

	$: $hasFrames && window.requestAnimationFrame(frame)
	$: mounted && $wheelChart && !isReady && ready();
	$: isReady && $currentItems && update();
</script>

<div class="wheel" style:--rotation={`${$rotation}deg`}>
	<div class="chart">
		<Chart
			{options}
			bind:chart={$wheelChart}
			on:click={() => spinState.set(SPIN_STATE.spinning)}
		/>
	</div>
	{$currentItemPoint?.name}
</div>

<style lang="scss">
	.wheel {
		height: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: space-evenly;

		.chart {
			width: 85%;
			max-height: 85vh;
			aspect-ratio: 1 / 1;

			display: flex;
			justify-content: center;

			:global(.chart) {
				position: relative;

				:global(canvas) {
					position: absolute;
					transform: rotate(var(--rotation));
				}

				&::after {
					content: "";
					top: 50%;
					width: 0;
					height: 0;
					right: -30px;
					position: absolute;
					transform: translateY(-50%);
					border-right: 50px solid #5a6667;
					border-top: 30px solid transparent;
					border-bottom: 30px solid transparent;
					filter: drop-shadow(0 0 1px #000) drop-shadow(0 0 1px #000) drop-shadow(0 0 0.7rem #000);
				}
			}
		}
	}
</style>