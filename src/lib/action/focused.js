/**
 * @function
 * @name FocusedCallback
 * @param {boolean} isFocused
 */

/**
 * @param {Element} e
 * @param {Writable<boolean>|FocusedCallback} handler
 * @returns {Object}
 */
const focused = (e, handler) => {
	if (!handler) return;

	const focusChange = (focused) => {
		if (!handler) return;

		if (typeof handler === 'function')
			handler(focused);
		else handler.set?.(focused);
	};

	const focused = focusChange.bind(null, true);
	const unfocused = focusChange.bind(null, false);

	e.addEventListener('focus', focused);
	e.addEventListener('blur', unfocused);

	return {
		destroy: () => {
			e.removeEventListener('focus', focused);
			e.removeEventListener('blur', unfocused);
		},
	};
};

export default focused;