import { GAME_TYPE } from "$lib/config/game";

export const defaultGame = {
	type: GAME_TYPE.Wheel,
	title: "Marbles Wheel of Death",
	duration: 10,
	items: [
		{
			name: "Quit Job",
			weight: 20,
			color: "#9d409d"
		},
		{
			name: "3 Games of Marbles",
			weight: 30,
			color: "#409340"
		},
		{
			name: "Forsen",
			weight: 35,
			color: "#d3a42e"
		},
		{
			name: "Quit Job",
			weight: 5,
			color: "#4f4006"
		},
		{
			name: "Quit Job",
			weight: 10,
			color: "#744a8c"
		},
		{
			name: "Maid outfit stream",
			weight: 50,
			color: "#505fc0"
		},
		{
			name: "Quit Job",
			weight: 15,
			color: "#b03737"
		},
		{
			name: "Buh only for 10 minutes",
			weight: 10,
			color: "#c44b85"
		},
	],
};