<script lang="ts">
	import { onMount } from 'svelte';
	import BingoCardButton from './BingoCardButton.svelte';
	import labels from './cards/demo';
	import { launchConfetti } from './ConfettiLauncher.svelte';
	import { initPhysics, spawnTrophy } from './Rigidbody.svelte'; // Adjust the path as necessary

	//const randomizedLabels = labels.toSorted(() => Math.random() - 0.5);
	const randomizedLabels = labels.slice(1).sort(() => Math.random() - 0.5); // random labels excluding the 1st element
	randomizedLabels.splice(12, 0, labels[0]); // add 1st element to middle

	const size = 5;
	const state = Array.from({ length: size }, (_, i) =>
		Array.from({ length: size }, (_, j) => ({
			label: randomizedLabels[i * size + j],
			selected: false,
			winning: false
		}))
	);

	let winningBingos = []; // This will keep track of currently valid lines

	let objectElement;

	onMount(() => {
		initPhysics(objectElement);

		/*
		window.addEventListener('keydown', (event) => {
			if (event.code === 'KeyT') {
				spawnTrophy();
			}
		});
		*/
	});

	function handleButtonClick(i: number, j: number) {
		// Toggle the selected state of the clicked cell
		state[i][j].selected = !state[i][j].selected;

		// Get the current winning lines
		const activeBingos = checkBingo();

		// Determine new lines to add and remove
		const toAdd = [];
		const toRemove = [];

		const activeLinesSet = new Set(activeBingos.map((line) => JSON.stringify(line.cells)));
		const winningLinesSet = new Set(winningBingos.map((line) => JSON.stringify(line.cells)));

		// Identify lines to add and remove
		for (const line of activeBingos) {
			if (!winningLinesSet.has(JSON.stringify(line.cells))) {
				toAdd.push(line); // Line is new, to add it
			}
		}

		for (const line of winningBingos) {
			if (!activeLinesSet.has(JSON.stringify(line.cells))) {
				toRemove.push(line); // Line is old, to remove it
			}
		}

		// Update current valid lines
		winningBingos = activeBingos;

		// Handle newly valid lines
		for (const line of toAdd) {
			for (const cell of line.cells) {
				cell.winning = true; // Mark winning for valid cells
			}
			// Launch confetti for every newly valid line
			launchConfetti(['🎃', '☠️', '🍫', '🍬', '🍭']);
			spawnTrophy();
		}

		// Handle invalid lines: only remove winning status if they were previously valid
		const winningCells = new Set();
		for (const line of activeBingos) {
			for (const cell of line.cells) {
				winningCells.add(cell); // Add each cell in the current winning lines
			}
		}

		for (const line of toRemove) {
			for (const cell of line.cells) {
				if (!winningCells.has(cell)) {
					cell.winning = false; // Remove winning status for invalid cells
				}
			}
		}
	}

	// Function to check for valid bingo lines
	function checkBingo() {
		let winningLines = [];

		// Check rows and columns
		for (let i = 0; i < size; i++) {
			if (state[i].every((cell) => cell.selected)) {
				winningLines.push({ type: 'row', direction: 'horizontal', cells: state[i] });
			}
			if (state.every((row) => row[i].selected)) {
				winningLines.push({
					type: 'column',
					direction: 'vertical',
					cells: state.map((row) => row[i])
				});
			}
		}

		// Check diagonals
		if (state.every((row, i) => row[i].selected)) {
			winningLines.push({
				type: 'diagonal',
				direction: 'top-left-to-bottom-right',
				cells: state.map((row, i) => row[i])
			});
		}

		if (state.every((row, i) => row[size - 1 - i].selected)) {
			winningLines.push({
				type: 'diagonal',
				direction: 'top-right-to-bottom-left',
				cells: state.map((row, i) => row[size - 1 - i])
			});
		}

		// Return the winning lines
		return winningLines;
	}
</script>

<div class="relative">
	<div bind:this={objectElement} class="absolute z-10 h-full w-full"></div>

	<div class="flex h-screen w-screen flex-col items-center justify-center">
		<div class="mt-2 text-center font-zombie text-2xl text-orange-500">
			<span class="text-lime-500">ZOM</span>BINGO
		</div>

		<div class="flex w-full flex-grow items-center justify-center p-2">
			<div class="grid h-full w-full grid-cols-5 gap-1">
				{#each Array(5) as _, i}
					{#each Array(5) as _, j}
						<BingoCardButton
							label={state[i][j].label}
							onclick={() => handleButtonClick(i, j)}
							selected={state[i][j].selected}
							winning={state[i][j].winning}
							font={i === 2 && j === 2
								? 'font-zombie uppercase text-orange-500'
								: 'font-vhs text-slate-200'}
						/>
					{/each}
				{/each}
			</div>
		</div>
	</div>
</div>
