export function shuffle<T>(array: T[]): Array<T> {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
		[array[i], array[j]] = [array[j], array[i]]; // Swap elements
	}
	return array;
}

export function pickRandom<T>(array: T[]): T | undefined {
	if (array.length === 0) return undefined; // Return default
	const randomIndex = Math.floor(Math.random() * array.length);
	return array[randomIndex]; // Return the random item
}
