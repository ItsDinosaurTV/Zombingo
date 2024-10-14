<script lang="ts">
	import BingoCardButton from './BingoCardButton.svelte';
	import labels from './cards/demo';

	const randomizedLabels = labels.toSorted(() => Math.random() - 0.5);

	const size = 5;
	const state = Array.from({ length: size }, (_, i) =>
		Array.from({ length: size }, (_, j) => ({
			label: randomizedLabels[i * size + j],
			selected: false,
			winning: false
		}))
	);
	state[2][2].label = 'Free play';

	function handleButtonClick(i: number, j: number) {
		state[i][j].selected = !state[i][j].selected;

		// Check for bingo
		if (checkBingo()) {
			// Change background color to red
			document.body.style.backgroundColor = 'red';

			// Mark winning tiles white
			for (let i = 0; i < size; i++) {
				if (state[i].every((cell) => cell.selected)) {
					state[i].forEach((cell) => (cell.winning = true)); // Set all cells in winning row to winning
				}
				if (state.every((row) => row[i].selected)) {
					state.forEach((row) => (row[i].winning = true)); // Set all cells in winning column to winning
				}
			}

			// Check diagonals
			if (state.every((row, i) => row[i].selected)) {
				for (let i = 0; i < size; i++) {
					state[i][i].winning = true; // Set all cells in winning diagonal (top-left to bottom-right) to winning
				}
			}
			if (state.every((row, i) => row[size - 1 - i].selected)) {
				for (let i = 0; i < size; i++) {
					state[i][size - 1 - i].winning = true; // Set all cells in winning diagonal (top-right to bottom-left) to winning
				}
			}
		} else {
			// Reset winning state if not bingo anymore (optional)
			state.forEach((row) => row.forEach((cell) => (cell.winning = false)));

			document.body.style.backgroundColor = 'black';
		}
	}

	function checkBingo() {
		// Check rows, columns, and diagonals
		for (let i = 0; i < size; i++) {
			if (state[i].every((cell) => cell.selected)) return true; // Row bingo
			if (state.every((row) => row[i].selected)) return true; // Column bingo
		}

		// Check diagonals
		if (state.every((row, i) => row[i].selected)) return true; // Diagonal from top-left to bottom-right
		if (state.every((row, i) => row[size - 1 - i].selected)) return true; // Diagonal from top-right to bottom-left

		return false;
	}
</script>

<div class="grid h-screen grid-cols-5 content-around justify-items-center gap-2">
	{#each Array(5) as _, i}
		{#each Array(5) as _, j}
			<BingoCardButton
				label={state[i][j].label}
				onclick={() => handleButtonClick(i, j)}
				selected={state[i][j].selected}
				winning={state[i][j].winning}
			/>
		{/each}
	{/each}
</div>
