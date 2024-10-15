

<script lang="ts">
	import BingoCardButton from './BingoCardButton.svelte';
	import labels from './cards/demo';

	//const randomizedLabels = labels.toSorted(() => Math.random() - 0.5);
	const randomizedLabels = labels.sort(() => Math.random() - 0.5);

	const size = 5;
	const state = Array.from({ length: size }, (_, i) =>
		Array.from({ length: size }, (_, j) => ({
			label: randomizedLabels[i * size + j],
			selected: false,
			winning: false
		}))
	);
	//state[2][2].label = 'Free Space';

	function handleButtonClick(i: number, j: number) {
		state[i][j].selected = !state[i][j].selected;

		if (!state[i][j].selected)
			state[i][j].winning = false;

		const { bingo, winningLines } = checkBingo();

		for (const cell of state) {
			for (const element of cell) {
				element.winning = winningLines.some((line) => line.cells.includes(element));
			}
		}

		// Check for bingo
		if (bingo) {
			// Change background color to red
			//document.body.style.backgroundColor = 'red';
		} else {
			// Reset winning state if not bingo anymore (optional)
			state.forEach((row) => row.forEach((cell) => (cell.winning = false)));

			//document.body.style.backgroundColor = 'gray';
		}
	}

	function checkBingo() {
		let bingo = false;
		let winningLines = [];

		// Check rows, columns, and diagonals
		for (let i = 0; i < size; i++) {
			if (state[i].every((cell) => cell.selected)) {
				winningLines.push({ type: "row", direction: "horizontal", cells: state[i] });
				bingo = true;
			}
			if (state.every((row) => row[i].selected)) {
				winningLines.push({ type: "column", direction: "vertical", cells: state.map((row) => row[i]) });
				bingo = true;
			}
		}

		// Check diagonals
		if (state.every((row, i) => row[i].selected)) {
			winningLines.push({ type: "diagonal", direction: "top-left-to-bottom-right", cells: state.map((row, i) => row[i]) });
			bingo = true;
		}
		if (state.every((row, i) => row[size - 1 - i].selected)) {
			winningLines.push({ type: "diagonal", direction: "top-right-to-bottom-left", cells: state.map((row, i) => row[size - 1 - i]) });
			bingo = true;
		}

		return { bingo, winningLines };
	}
</script>

<div class="flex justify-center items-center h-screen w-screen">
	<div class="aspect-square grid grid-cols-5 gap-2 max-w-screen max-h-screen p-10">
	  {#each Array(5) as _, i}
		{#each Array(5) as _, j}
		  <BingoCardButton
			label={i === 2 && j === 2 ? "Free Space" : state[i][j].label}
			onclick={() => handleButtonClick(i, j)}
			selected={state[i][j].winning ? false : state[i][j].selected}
			winning={state[i][j].winning}
			font={i === 2 && j === 2 ? "Satan" : ''}
		  />
		{/each}
	  {/each}
	</div>
  </div>
  