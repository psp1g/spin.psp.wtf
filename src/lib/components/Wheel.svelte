<script>
	import { sound, debounce } from "$lib/util/index.js";
	import { createEventDispatcher, onDestroy, onMount } from "svelte";
	import { SPIN_STATE } from "$lib/config/states";
	import { currentItems } from "$lib/stores/game";
	import {
		chartItemData,
		chartOptions,
		currentItemPoint,
		hasFrames,
		rotation,
		spinState,
		wheelStates,
		wheelChart,
	} from "$lib/stores/wheel";
	import Chart from "$lib/components/Chart.svelte";
	import clickMP3 from "$lib/sound/click.mp3";

	spinState.reset();

	let mounted = false;
	let isReady = false;

	let lastTime;

	const dispatch = createEventDispatcher();

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
		if (!mounted) return;
		window.requestAnimationFrame(frame);
		if (!$hasFrames) return;
		if (!lastTime) lastTime = now;
		const delta = now - lastTime;
		spinState.frame($spinState, delta);
	};

	onMount(() => {
		mounted = true;
		window.requestAnimationFrame(frame);
	});
	onDestroy(() => (mounted = false));

	const options = chartOptions($chartItemData);

	const tickSound = sound(clickMP3);
	const playSound = debounce(() => {
		const soundId = tickSound.play();
		tickSound.fade(1, 0.5, 25, soundId);
	}, 10, true);

	$: canUpdate = wheelStates[$spinState].canUpdateWheel ?? true;
	$: soundEnabled = wheelStates[$spinState].soundEnabled ?? false;
	$: currentItemPointI = $currentItemPoint?.i;
	$: mounted && $wheelChart && !isReady && ready();
	$: isReady && canUpdate && $currentItems && update();
	$: soundEnabled && currentItemPointI != null && playSound();
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