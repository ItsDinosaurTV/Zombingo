<script lang="ts">
	import { onMount } from 'svelte';
	import BingoCardButton from './BingoCardButton.svelte';
	import labels from './cards/demo';
	import { launchConfetti } from './ConfettiLauncher.svelte';
	import { initPhysics, spawnTrophy, destroyTrophy } from './Trophies.svelte';
	import { clearSession, getStateFromSession, saveStateToSession } from './utils/sessionStorage';
	import type { GameState } from './types/gameState';

	const size = 5;
	let gameState = $state<GameState>([]);

	$effect(() => {
		isMounted && saveStateToSession(gameState);
	});

	function initializeState() {
		// Shuffle the labels (excluding the center label)
		const shuffledLabels = labels.slice(1).sort(() => Math.random() - 0.5);
		shuffledLabels.splice(12, 0, labels[0]); // Add the center label back to the middle

		return Array.from({ length: size }, (_, i) =>
			Array.from({ length: size }, (_, j) => ({
				label: shuffledLabels[i * size + j],
				selected: false,
				winning: false,
				winningDirections: []
			}))
		);
	}

	let winningBingos = []; // This will keep track of currently valid lines
	let trophies = new Map(); // Stores trophies associated with each bingo line

	let objectElement;

	let viewportHeight = '100vh';

	// Function to update height based on the visible viewport
	function updateViewportHeight() {
		viewportHeight = `${window.visualViewport.height}px`;
	}

	let isMounted = $state(false);

	onMount(() => {
		gameState = getStateFromSession() ?? initializeState();

		initPhysics(objectElement);

		setWinningStates();

		// Initial setting of the height
		updateViewportHeight();

		// Update height on visual viewport changes
		window.visualViewport.addEventListener('resize', updateViewportHeight);

		isMounted = true;

		return () => {
			window.visualViewport.removeEventListener('resize', updateViewportHeight);
		};
	});

	function resetCard() {
		clearSession();

		gameState = initializeState();

		// Clear any active trophies and winning lines
		for (const trophy of trophies.values()) {
			destroyTrophy(trophy);
		}
		trophies.clear();

		winningBingos = [];
	}

	function handleButtonClick(i: number, j: number) {
		// Toggle the selected state of the clicked cell
		gameState[i][j].selected = !gameState[i][j].selected;

		setWinningStates();
	}

	function setWinningStates() {
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
		}
	}

	// Function to check for valid bingo lines
	function checkBingo() {
		let winningLines = [];

		// Check rows and columns
		for (let i = 0; i < size; i++) {
			if (gameState[i].every((cell) => cell.selected)) {
				winningLines.push({ type: 'row', direction: 'horizontal', cells: gameState[i] });
			}
			if (gameState.every((row) => row[i].selected)) {
				winningLines.push({
					type: 'column',
					direction: 'vertical',
					cells: gameState.map((row) => row[i])
				});
			}
		}

		// Check diagonals
		if (gameState.every((row, i) => row[i].selected)) {
			winningLines.push({
				type: 'diagonal',
				direction: 'top-left-to-bottom-right',
				cells: gameState.map((row, i) => row[i])
			});
		}

		// Return the winning lines
		if (gameState.every((row, i) => row[size - 1 - i].selected)) {
			winningLines.push({
				type: 'diagonal',
				direction: 'top-right-to-bottom-left',
				cells: gameState.map((row, i) => row[size - 1 - i])
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
	<div bind:this={objectElement} class="absolute z-10 h-full w-full"></div>

	<div class="flex h-full w-full flex-col items-center justify-center">
		<div class="mt-2 text-center font-zombie text-2xl text-orange-500">
			<span class="text-lime-500">ZOM</span>BINGO
			<button
				class="absolute right-2 top-2 rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700"
				onclick={resetCard}
			>
				R
			</button>
		</div>

		<div class="flex flex-grow items-center justify-center p-2">
			<div class="grid h-full w-full grid-cols-5 gap-1">
				{#each gameState as row, i}
					{#each row as cell, j}
						<BingoCardButton
							label={cell.label}
							onclick={() => handleButtonClick(i, j)}
							selected={cell.selected}
							winning={cell.winning}
							winningDirections={cell.winningDirections}
							center={i === 2 && j === 2}
						/>
					{/each}
				{/each}
			</div>
		</div>
	</div>
</div>
