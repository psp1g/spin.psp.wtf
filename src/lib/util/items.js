export const mapItems = (items) => {
	const data = [];
	const labels = [];
	const colors = [];

	for (const { name, weight, color } of items) {
		let nameTrunc = name.substring(0, 46);
		if (nameTrunc.length !== name.length)
			nameTrunc += "..."

		data.push(weight);
		labels.push(nameTrunc);
		colors.push(color);
	}

	return { data, labels, colors };
};