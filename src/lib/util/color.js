export const colorTable = [
	"#9d409d",
	"#409340",
	"#d3a42e",
	"#4f4006",
	"#b03737",
	"#744a8c",
	"#505fc0",
];

let globalILast = 0;

export const cycleColors = (iLast) => {
	let i = (iLast || globalILast) + 1;
	if (!colorTable[i]) {
		if (!iLast) globalILast = 0;
		return { i: 0, color: colorTable[0] };
	}
	if (!iLast) globalILast = i;
	return { i, color: colorTable[i] };
};