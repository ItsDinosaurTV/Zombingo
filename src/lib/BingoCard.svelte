<script lang="ts">
	import { onMount } from 'svelte';
	import BingoCardButton from './BingoCardButton.svelte';
	import labels from './cards/demo';
	import { launchConfetti } from './ConfettiLauncher.svelte';
	import { initPhysics, spawnTrophy, destroyTrophy } from './Trophies.svelte';

	const randomizedLabels = labels.slice(1).sort(() => Math.random() - 0.5); // random labels excluding the 1st element
	randomizedLabels.splice(12, 0, labels[0]); // add 1st element to middle

	const size = 5;
	const state = Array.from({ length: size }, (_, i) =>
		Array.from({ length: size }, (_, j) => ({
			label: randomizedLabels[i * size + j],
			selected: false,
			winning: false,
			winningDirections: []
		}))
	);

	let winningBingos = []; // This will keep track of currently valid lines
	let trophies = new Map(); // Stores trophies associated with each bingo line

	let objectElement;
	let svgLines = []; // Array to store line coordinates

	let viewportHeight = '100vh';

	// Function to update height based on the visible viewport
	function updateViewportHeight() {
		viewportHeight = `${window.visualViewport.height}px`;
	}

	onMount(() => {
		initPhysics(objectElement);

		// Initial setting of the height
		updateViewportHeight();

		// Update height on visual viewport changes
		window.visualViewport.addEventListener('resize', updateViewportHeight);

		return () => {
			window.visualViewport.removeEventListener('resize', updateViewportHeight);
		};
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

				cell.winningDirections.push(line.direction);
			}

			// Launch confetti for every newly valid line
			launchConfetti(['🎃', '☠️', '🍫', '🍬', '🍭']);

			const trophy = spawnTrophy(); // Store the trophy reference
			trophies.set(line.cells.map((cell) => cell.label).join(','), trophy); // Associate the trophy with the line

			// Add line to SVG
			addLine(line);
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

				cell.winningDirections = cell.winningDirections.filter(
					(direction) => direction !== line.direction
				);
			}

			// Destroy the associated trophy for invalid lines
			const lineKey = line.cells.map((cell) => cell.label).join(',');
			const trophy = trophies.get(lineKey);

			if (trophy) {
				destroyTrophy(trophy);
				trophies.delete(lineKey); // Remove the trophy reference from the map
			}

			// Remove line from SVG
			removeLine(line);
		}
	}

	// Function to calculate and add line positions to the svgLines array
	function addLine(line) {
		// Get the positions in the jagged array
		const positions = line.cells.map((cell) => {
			for (let i = 0; i < state.length; i++) {
				const rowIndex = state[i].findIndex((c) => c === cell);
				if (rowIndex !== -1) {
					return { row: i, col: rowIndex };
				}
			}
		});

		if (positions.length > 0) {
			const start = positions[0];
			const end = positions[positions.length - 1];

			const lineKey = line.cells.map((cell) => cell.label).join(',');

			// Calculate the percentage positions within the grid
			svgLines.push({
				key: lineKey,
				x1: (start.col + 0.5) * (100 / size),
				y1: (start.row + 0.5) * (100 / size),
				x2: (end.col + 0.5) * (100 / size),
				y2: (end.row + 0.5) * (100 / size)
			});

			// trigger redraw
			svgLines = svgLines;
		}
	}

	function removeLine(line) {
		const lineKey = line.cells.map((cell) => cell.label).join(',');
		svgLines = svgLines.filter((l) => l.key !== lineKey);
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

		// Return the winning lines
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

<!-- Use the dynamic height for main container -->
<div
	class="relative bg-gradient-to-t from-slate-950 to-neutral-950"
	style="height: {viewportHeight};"
>
	<div bind:this={objectElement} class="absolute z-30 h-full w-full"></div>

	<div class="flex h-full w-full flex-col items-center justify-center">
		<div class="mt-2 text-center font-zombie text-2xl text-orange-500">
			<span class="text-lime-500">ZOM</span>BINGO
		</div>

		<div class="flex flex-grow items-center justify-center p-2">
			<div class="grid h-full w-full grid-cols-5 gap-1">
				{#each Array(5) as _, i}
					{#each Array(5) as _, j}
						<BingoCardButton
							label={state[i][j].label}
							onclick={() => handleButtonClick(i, j)}
							selected={state[i][j].selected}
							winning={state[i][j].winning}
							winningDirections={state[i][j].winningDirections}
							center={i === 2 && j === 2}
						/>
					{/each}
				{/each}
			</div>

			<!-- SVG to draw lines -->
			<!--
			<svg class="pointer-events-none absolute inset-0 h-full w-full">
				{#each svgLines as { x1, y1, x2, y2 }}
					<line
						x1={x1 + '%'}
						y1={y1 + '%'}
						x2={x2 + '%'}
						y2={y2 + '%'}
						stroke="black"
						stroke-width="10"
					/>
				{/each}
			</svg>
			-->
		</div>
	</div>
</div>
