import wheelSVG from "$lib/images/icon/wheel.svg";

/**
 * @readonly
 * @enum {string}
 */
export const GAME_TYPE = {
	// Case: 'case',
	Wheel: 'wheel',
};

export const GameTypeIcon = {
	// [GAME_TYPE.Case]: caseSVG,
	[GAME_TYPE.Wheel]: wheelSVG,
};