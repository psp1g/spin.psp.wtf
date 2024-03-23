import { navigating } from '$app/stores';
import { tooltips } from "$lib/stores/tooltip";
import Tooltip from "$lib/components/Tooltip.svelte";

let i = 0;
const tooltip = (e, initEnabled = true) => {
	const getAttr = () => {
		const attr = e.getAttribute('title') || e.getAttribute('tip');
		e.removeAttribute('title');
		e.removeAttribute('tip');
		return attr;
	};

	let title = getAttr();
	let enabled = initEnabled;

	let component;

	const observer = new MutationObserver((mutations) =>
		mutations
			.filter((m) => m.type === 'attributes')
			.forEach(({ oldValue }) => {
				const newTitle = getAttr();
				if (!newTitle || newTitle === oldValue) return;
				title = newTitle;

				if (component) component.title = newTitle;
			})
	);

	observer.observe(e, { attributeFilter: [ 'tip', 'title' ] });

	const mouseOver = (event) => {
		if (component || !enabled || !title) return;
		component = new Tooltip({
			props: {
				title,
				i: ++i,
				x: event.pageX,
				y: event.pageY,
			},
			target: document.body,
		});
		tooltips.push(i);
		if (i >= Number.MAX_SAFE_INTEGER) i = 0;
	};

	const mouseMove = (event) => {
		if (!component) mouseOver(event);
		component?.$set({
			x: event.pageX,
			y: event.pageY,
		});
	};

	const mouseLeave = () => {
		if (!component) return;
		tooltips.pop(component.i);
		component.$destroy();
		component = undefined;
	};

	const u = navigating.subscribe((n) => {
		if (!n) return;
		mouseLeave();
	});

	e.addEventListener('mouseover', mouseOver);
	e.addEventListener('mousemove', mouseMove);
	e.addEventListener('mouseleave', mouseLeave);

	return {
		update: (newEnabled = true) => {
			enabled = newEnabled;
		},
		destroy: () => {
			e.removeEventListener('mouseover', mouseOver);
			e.removeEventListener('mousemove', mouseMove);
			e.removeEventListener('mouseleave', mouseLeave);
			mouseLeave();
			if (u) u();
		},
	};
};

export default tooltip;