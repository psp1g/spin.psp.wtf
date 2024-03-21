<script>
	import Chart from "chart.js/auto";
	import { createEventDispatcher, onMount } from "svelte";

	/**
	 * @type {import('chart.js').ChartConfiguration<keyof import('chart.js').ChartTypeRegistry, (number | [number, number] | import('chart.js').Point | import('chart.js').BubbleDataPoint | null)[], unknown> | import('chart.js').ChartConfigurationCustomTypesPerDataset<any>}
	 */
	export let options;
	/**
	 * @type {import('chart.js').Chart}
	 * @readonly
	 */
	export let chart;

	let chartCtx;
	let mounted = false;

	const dispatch = createEventDispatcher();

	onMount(() => (mounted = true));

	const updateChart = () => {
		if (chart) {
			chart.destroy();
			chart = undefined;
		}

		chart = new Chart(chartCtx, options);
	};

	const click = (e) => {
		if (!chart) return;

		const points = chart.getElementsAtEventForMode(e, "nearest", { intersect: true }, true);
		if (points[0]) dispatch("click", { points });
	};

	$: chartValid = chartCtx && mounted;
	$: chartValid && options && updateChart();
</script>

<div class="chart">
	<canvas bind:this={chartCtx} on:click={click}></canvas>
</div>

<style lang="scss">
	.chart {
		height: 100%;
		position: relative;
		aspect-ratio: 1 / 1;
	}
</style>