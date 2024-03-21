import BezierEasing from 'bezier-easing';
import ChartDataLabels from "chartjs-plugin-datalabels";
import { tweened } from "svelte/motion";
import { derived, get, writable } from "svelte/store";
import { MODAL } from "$lib/config/modal";
import { SPIN_STATE } from "$lib/config/states";
import { durationMs, currentItems, totalWeight } from "$lib/stores/game";
import { currentModal } from "$lib/stores/modal";
import { state } from "$lib/stores/class/state";
import { lerp, sleep, weightedRandom } from "$lib/util";
import { mapItems } from "$lib/util/items";

const easeInBack = (x) => 1.6875 * x * x * x - 0.675 * x * x;
const easingOut = BezierEasing(.22, .83, 0, 1);

const splitEasing = (t) => {
	const split = 0.1;
	// pull wheel back a bit
	if (t < split) return easeInBack(t * 4);
	// spin
	return easingOut(
		(t - split) / (1 - split)
		// dumb hack to help smooth out things
		+ 0.00017
	);
};

const easing = splitEasing;

const radians = (deg) => deg * (Math.PI / 180);

export const rotation = {
	...tweened(0,
		{
			duration: 0,
			easing,
		}),
	inc(amt) {
		this.update((state) => state + amt);
	},
	incLerp(amt, amp) {
		this.update((state) => lerp(state, state + amt, amp));
	},
};

/**
 * Normalized number in degrees at the point of the flapper/arrow/ticker
 * @type {Readable<number>}
 */
export const flapperRotation = derived([ rotation ], ([ $rotation ]) => {
	let rotNormal = 360 - ($rotation % 360) + 90;
	if (rotNormal > 360) rotNormal -= 360;
	return rotNormal;
});

/**
 * Winning item index
 * @type {Writable<int>}
 */
export const winner = writable();

/**
 * @type {Writable<import('chart.js').Chart>}
 */
export const wheelChart = writable();

export const winningItem = derived([ winner, currentItems ], ([ $winner, $items ]) => $items[$winner]);

export const chartItemData = derived([ currentItems ], ([ $items ]) => $items ? mapItems($items) : {});

export const dataTransformed = derived([ chartItemData ], ([ $itemData ]) => {
	const { data, labels } = $itemData;

	const sum = data.reduce((acc, weight) => acc + weight, 0);

	let lastMaxDeg = 0;

	return data.map((weight, i) => {
		const name = labels[i];
		const pct = weight / sum;

		const deg = pct * 360;
		const wheelMinDeg = lastMaxDeg;
		const wheelMaxDeg = lastMaxDeg + deg;

		lastMaxDeg = wheelMaxDeg;

		return {
			pct,
			deg,
			name,
			weight,
			wheelMinDeg,
			wheelMaxDeg,
		};
	});
});

export const currentItemPoint =
	derived([ flapperRotation, dataTransformed ], ([ $rotation, $data ]) =>
		$data.find(({ wheelMaxDeg }) => $rotation < wheelMaxDeg)
	);

/**
 * @type {Object<SPIN_STATE, any>}
 */
export const wheel_states = {
	[SPIN_STATE.waiting]: {
		toWhitelist: [ SPIN_STATE.spinning ],
		frame() {
			rotation.incLerp(10, 0.02);
		},
	},
	[SPIN_STATE.spinning]: {
		fromWhitelist: [ SPIN_STATE.waiting, SPIN_STATE.won ],
		toWhitelist: [ SPIN_STATE.won ],
		async to(store) {
			const itemData = get(chartItemData);
			const { data } = itemData;

			// Figure out what the winner will be based on their weights
			const iWinner = weightedRandom(data);
			winner.set(iWinner);

			const dur = get(durationMs);

			// instantly set to a normalized angle of the current rotation
			let setPromise = rotation.set(get(rotation) % 360);

			const tData = get(dataTransformed);
			const { deg, wheelMinDeg } = tData[iWinner];

			// Based on the duration setting, add several extra spins
			const durationMultiplier = Math.max(15, Math.ceil(dur / 1000));
			const spinExaggeration = 360 * durationMultiplier;

			// Translate degree from top going right to degrees + 90 spinning left
			const targetDeg = spinExaggeration + 90 - (wheelMinDeg + (Math.random() * deg));

			// Wait for animations to finish
			await setPromise;
			await rotation.set(targetDeg, { duration: dur, easing });
			await sleep(400);

			store.set(SPIN_STATE.won);
		},
	},
	[SPIN_STATE.won]: {
		fromWhitelist: [ SPIN_STATE.spinning ],
		to() {
			currentModal.set(MODAL.Win);
			// cool effects XDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD
		},
	},
};

export const spinState = state(SPIN_STATE.waiting, wheel_states);
export const hasFrames = spinState.hasFramesStore();

let sumWeight = 0;
let wheelItems;

totalWeight.subscribe((weight) => (sumWeight = weight));
chartItemData.subscribe((items) => (wheelItems = items));

/**
 * Provides font settings to the chart
 * This primarily handles scaling fonts to fit within their slice of the wheel
 */
const labelFont = (ctx) => {
	if (ctx?.dataIndex == null || !wheelItems) return { size: 0 };

	const { labels, data } = wheelItems;

	const name = labels[ctx.dataIndex];
	const weight = data[ctx.dataIndex];

	const fontBasis = 24;
	ctx.chart.ctx.font = `${fontBasis}px "Kanit"`;

	const { width: basisWidth } = ctx.chart.ctx.measureText(name);

	const deg = (weight / sumWeight) * 360;
	const isocAngle = Math.sin(radians(90 - deg / 2));

	const radius = ctx.chart.width / 2 - 40;
	let maxFontSize = radius;

	// Max font size based on the angle of the slice
	if (deg < 180) {
		const halfRadius = radius / 2;
		const height = halfRadius * isocAngle;
		// using isosceles base px length as the max font size (center of the slice)
		maxFontSize = 2 * Math.sqrt(halfRadius * halfRadius - height * height);
	}

	// Scaling font size based on the width of the text and the wheel's radius
	const fOverflowScale = basisWidth > 0 ? radius / basisWidth : 1;
	const roSize = Math.min(maxFontSize, Math.round(fontBasis * fOverflowScale));

	ctx.chart.ctx.font = `${roSize}px "Kanit"`;
	const { width: scaledTextWidth } = ctx.chart.ctx.measureText(name);

	let aoSize = roSize;

	// Scale font further depending on font size + angle
	// This is for wider text inside slices with smaller angles
	// Without this the text overflows near the center of the wheel
	if (deg < 180) {
		// How many pixels in the slice from the center until the current text size height can fit in the angle
		let fitEdge = null;
		// How many pixels in the slice from the center until 10px tall text can fit
		let minEdge = null;

		for (let px = 5; px < radius; px += 5) {
			// isosceles base px length
			const h = px * isocAngle;
			const max = 2 * Math.sqrt(px * px - h * h);

			if (max >= 10 && !minEdge) minEdge = px;

			if (roSize < max) {
				fitEdge = px;
				break;
			}
		}

		// If 10px can't even fit, don't bother showing it
		if (minEdge === null) return { size: 0 };

		// Scale again based on the radius - closest fit depth
		const fAngleOverflowScale = fitEdge && Math.min(1, (radius - fitEdge) / scaledTextWidth);
		aoSize = Math.round(roSize * fAngleOverflowScale);
	}

	return {
		lineHeight: 0,
		family: "Kanit",
		size: Math.min(roSize, aoSize),
	};
};

const labelRotation = (ctx) => {
	let mine;
	let atMine = 0;
	let sum = 0;

	const { data } = ctx.chart.data.datasets[0];

	for (const i in data) {
		const weight = data[i];

		// coercion is intended
		if (i == ctx.dataIndex) {
			mine = weight;
			atMine = sum;
		}

		sum += weight;
	}

	// Rotate the label based on the slice's angle offset and size
	const mineNormal = (mine / sum * 360);
	const atMineNormal = (atMine / sum * 360);

	return atMineNormal + mineNormal / 2 - 90 +
		ctx.chart.options.rotation;
};

const baseChartOptions = {
	type: 'pie',
	plugins: [ ChartDataLabels ],
	options: {
		responsive: true,
		animation: { duration: 0 },
		borderWidth: 1,
		borderColor: "#000",
		plugins: {
			tooltip: false,
			legend: { display: false },
			datalabels: {
				// labels don't always align perfectly vertically depending on the font.
				// the font should be "fixed" using: https://transfonter.org/
				// make sure that "Fix vertical metrics" is checked
				color: "#fff",
				formatter: (_, ctx) => ctx.chart.data.labels[ctx.dataIndex],
				font: labelFont,
				rotation: labelRotation,
				anchor: "center",
				align: "center",
				padding: 0,
			},
		},
	},
};

export const chartOptions = ({ labels, data, colors }) => ({
	...baseChartOptions,
	data: {
		labels,
		datasets: [
			{
				data,
				backgroundColor: colors,
			},
		],
	},
});
