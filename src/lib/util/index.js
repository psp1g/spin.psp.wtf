import { Howl } from "howler/src/howler.core";

export const sleep = async (ms) =>
	new Promise((res) => setTimeout(() => res(), ms));

export const isFnc = (fnc) => fnc && typeof fnc === "function";
export const optCall = (fnc, ...args) => isFnc(fnc) ? fnc(...args) : undefined;

export const weightedRandom = (weights, generatedNumber = Math.random()) => {
	const availableWeights = weights
		.map((weight, i) => ({ weight, i }));

	if (!availableWeights.length) return -1;
	if (availableWeights.length === 1) return availableWeights[0].i;

	const cWeights = availableWeights
		.sort(({ weight: a }, { weight: b }) => a - b)
		.reduce((acc, obj, i) => {
			acc[i] = {
				...obj,
				weight: obj.weight + (i ? acc[i - 1].weight : 0),
			};
			return acc;
		}, []);

	const sum = cWeights[cWeights.length - 1].weight;
	const adjusted = generatedNumber * sum;

	const result = cWeights.find(({ weight }) => weight > adjusted);

	return result?.i ?? -1;
};

export const lerp = (from, to, speed) => from + speed * (to - from);

export const url = (u) => `url(${u})`;

export const shuffle = (arr) => {
	if (!arr?.length) return arr;

	const copy = [ ...arr ];
	const result = [];

	while (copy.length > 0) {
		const randomIndex = Math.floor(Math.random() * copy.length)
		result.push(copy[randomIndex]);
		copy.splice(randomIndex, 1);
	}

	return result;
};

export const debounce = (fn, wait, callFirst) => {
	let timeout = null;
	let debouncedFn = null;

	const clear = function () {
		if (!timeout) return;

		clearTimeout(timeout);

		debouncedFn = null;
		timeout = null;
	};

	const flush = function () {
		const call = debouncedFn;
		clear();
		call?.();
	};

	const debounceWrapper = function () {
		if (!wait) return fn.apply(this, arguments);

		const context = this;
		const callNow = callFirst && !timeout;

		clear();

		debouncedFn = () => fn.apply(context, arguments);

		timeout = setTimeout(function () {
			timeout = null;

			if (callNow) return;

			const call = debouncedFn;
			debouncedFn = null;

			return call?.();
		}, wait);

		if (callNow) debouncedFn();
	};

	debounceWrapper.cancel = clear;
	debounceWrapper.flush = flush;

	return debounceWrapper;
};

/**
 * Returns a random string
 * @param {number} length - Length of the random string, must be divisible by 2
 * @return {string}
 */
export const randomStr = (length = 6) =>
	Array.from(
		window.crypto.getRandomValues(
			new Uint8Array(Math.floor(length / 2))
		)
	)
		.map((dec) => dec.toString(16).padStart(2, "0"))
		.join("");

export const truncDecimals = (val, decimals = 2) => {
	const modifier = Math.pow(10, decimals);
	const rounded = Math.round(val * modifier);
	return rounded / modifier;
};

export const download = (file) => {
	const url = URL.createObjectURL(file);
	const linkElement = document.createElement("a");

	linkElement.href = url;
	linkElement.download = file.name;

	linkElement.style.opacity = "0";
	linkElement.style.position = "absolute";

	linkElement.click();

	URL.revokeObjectURL(url);
	linkElement.remove();
};

export const upload = (multipleAllowed = false) =>
	new Promise((res, rej) => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = multipleAllowed;

		input.style.opacity = "0";
		input.style.position = "absolute";

		input.onchange = async (e) => {
			const promises = Array.from(e.target.files)
				.map((file) =>
					new Promise((res, rej) => {
						const reader = new FileReader();
						reader.onloadend = (re) => res(re.target.result);
						reader.onerror = (e) => rej(e);
						reader.readAsText(file, "UTF-8");
					})
				);

			const allFileContent = await Promise.all(promises);
			res(multipleAllowed ? allFileContent : allFileContent[0]);

			input.remove();
		};
		input.addEventListener("cancel", () => {
			res([]);
			input.remove();
		});
		input.onerror = (e) => {
			rej(e);
			input.remove();
		};

		input.click();
	});

export const sound = (src, options = { }) =>
	new Howl({
		src,
		loop: false,
		volume: 1,
		...options,
	});

