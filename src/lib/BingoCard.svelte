<script lang="ts">
    import { onMount } from 'svelte';
    import BingoCardButton from './BingoCardButton.svelte';
    import ConfirmModal from './ConfirmModal.svelte';
    import demoLabels from './cards/demo';
    import { launchConfetti, launchConfettiAtPosition } from './ConfettiLauncher.svelte';
    import { initPhysics, spawnTrophy, destroyTrophy } from './Trophies.svelte';
    import { clearSession, getStateFromSession, saveStateToSession } from './utils/sessionStorage';
    import type { GameState } from './types/gameState';
    import { randomInRange } from './utils/mathUtils';
	import LZString from 'lz-string';

	let tiles: string[];

	const size = 5;
	let gameState = $state<GameState>({ tileId: '', board: [] });
	let showModal = $state(false); // State to control modal visibility

	$effect(() => {
		isMounted && saveStateToSession(gameState);
	});

    function decodeTiles(encoded: string) {
        try {
            // Use the matching decompression function
            const tileString = LZString.decompressFromEncodedURIComponent(encoded);
            
            if (tileString === null) {
                // This happens if decompression fails (e.g., bad data)
                throw new Error('Decompression failed (returned null).');
            }

            // Split the decompressed string back into an array
            return tileString.split('\n');
        } catch (e) {
            console.error('Failed to decode/decompress tiles:', e);
            return '';
        }
    }

	function initializeState( sourceTiles: string[], sourceId: string | '' ): GameState {
		let sourceLabels: string[];

		// 1. Determine the source of tiles
		// Check if custom tiles were passed and if they meet the 5x5 requirement (25 tiles)
		if (sourceTiles  && sourceTiles.length >= size * size) {
			// Use custom tiles from the URL
			sourceLabels = sourceTiles;
		} else {
			// Use default demo tiles
			sourceLabels = demoLabels;
		}

		// 2. Separate Center Tile and Shuffling
		const centerTileLabel = sourceLabels[0];
		const otherTiles = sourceLabels.slice(1);

		// Shuffle the remaining tiles (4x4 = 24 tiles)
		const shuffledOthers = otherTiles.sort(() => Math.random() - 0.5);

		// 3. Recombine: Insert the center tile back at index 12 (the 3rd row, 3rd column)
		shuffledOthers.splice(12, 0, centerTileLabel); 
		
		// The final list of 25 tiles, shuffled but with the fixed center
		const finalTiles = shuffledOthers;
		
		// 4. Create the GameState 5x5 grid
        const newBoard = Array.from({ length: size }, (_, i) =>
            Array.from({ length: size }, (_, j) => ({
                label: finalTiles[i * size + j] ?? '',
                selected: false,
                winning: false,
                winningDirections: [],
				element: null
            }))
        );

		// 5. Return the full GameState object (as defined by your type)
        return { 
            tileId: sourceId,
            board: newBoard 
        };
	}

	let winningBingos: any[] = []; // This will keep track of currently valid lines
	let trophies = new Map(); // Stores trophies associated with each bingo line

	let rigidbodiesElement: HTMLElement;

	let isMounted = $state(false);

	/*
	onMount(() => {
		gameState = getStateFromSession() ?? initializeState();

		initPhysics(rigidbodiesElement);

		setWinningStates(true);

		isMounted = true;
	});
	*/
    onMount(() => {
        initPhysics(rigidbodiesElement);
        
        const params = new URLSearchParams(location.search);
        let urlEncoded: string | null = params.get('data');

        if (urlEncoded) {
            // Decode the tiles from the URL only once
            tiles = decodeTiles(urlEncoded);

            // 1. Load saved state (this fills gameState.tileId with old ID or null)
            const savedState = getStateFromSession();
            gameState = savedState ?? initializeState(tiles, urlEncoded); // Use URL data for initial load if no saved state

            // 2. Check for ID mismatch (New URL vs. Saved State ID)
            if (gameState.tileId !== urlEncoded) {

                // 3. NEW TILE ID FOUND: Update reactive state and force reset
                gameState.tileId = urlEncoded; // 👈 🎯 THIS SAVES THE NEW TILE ID
                
                // If you are forcing a reset, you must also call initializeState to use the new tiles
                // Note: resetCard calls initializeState(), so we handle it there.
                resetCard(); 

                console.log('New tile data detected from URL, resetting game state.');
            } else {
                // Same URL, resume existing game
                console.log('Tile data from URL matches existing state, retaining game state.');
            }
        } else {
			tiles = demoLabels;
			
            // No URL data, load saved or initialize default
            gameState = getStateFromSession() ?? initializeState(demoLabels, null);
        }

        setWinningStates(true);
        isMounted = true;
    });

	function resetCard() {
		clearSession();

		gameState = initializeState(tiles, gameState.tileId);

		// Clear any active trophies and winning lines
		for (const trophy of trophies.values()) {
			destroyTrophy(trophy);
		}
		trophies.clear();

		winningBingos = [];
	}

	function handleButtonClick(i: number, j: number) {
		// Toggle the selected state of the clicked cell
		gameState.board[i][j].selected = !gameState.board[i][j].selected;

		if (gameState.board[i][j].selected) {
			new Audio('/sfx/clickOff.mp3').play();
		} else {
			new Audio('/sfx/clickOn.mp3').play();
		}

		setWinningStates();
	}

	function setWinningStates(ignoreConfetti: boolean = false) {
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

				// cell element is null on init, but that's fine
				if (cell.element != null) cell.element.triggerFlash();

				cell.winningDirections.push(line.direction);
			}

			const spawnPoint = {
				x: randomInRange(0.45, 0.55) * window.innerWidth,
				y: randomInRange(0.8, 0.9) * window.innerHeight
			};

			const trophy = spawnTrophy(spawnPoint); // Store the trophy reference
			trophies.set(line.cells.map((cell) => cell.label).join(','), trophy); // Associate the trophy with the line

			//launchConfettiAtPosition(spawnPoint.x / window.innerWidth, spawnPoint.y / window.innerHeight);
		}

		// only launch confetti once
		if (!ignoreConfetti && toAdd.length > 0) {
			// Launch confetti for every newly valid line
			launchConfetti(['🎃', '☠️', '🍫', '🍬', '🍭']);

			// Play sfx
			new Audio('/sfx/horn.mp3').play();
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
				const trophyPosition = trophy.position;

				destroyTrophy(trophy);
				trophies.delete(lineKey); // Remove the trophy reference from the map

				launchConfettiAtPosition(
					trophyPosition.x / window.innerWidth,
					trophyPosition.y / window.innerHeight
				);
			}
		}
	}

	// Function to check for valid bingo lines
	function checkBingo() {
		let winningLines = [];

		// Check rows and columns
		for (let i = 0; i < size; i++) {
			if (gameState.board[i].every((cell) => cell.selected)) {
				winningLines.push({ type: 'row', direction: 'horizontal', cells: gameState.board[i] });
			}
			if (gameState.board.every((row) => row[i].selected)) {
				winningLines.push({
					type: 'column',
					direction: 'vertical',
					cells: gameState.board.map((row) => row[i])
				});
			}
		}

		// Check diagonals
		if (gameState.board.every((row, i) => row[i].selected)) {
			winningLines.push({
				type: 'diagonal',
				direction: 'top-left-to-bottom-right',
				cells: gameState.board.map((row, i) => row[i])
			});
		}

		// Return the winning lines
		if (gameState.board.every((row, i) => row[size - 1 - i].selected)) {
			winningLines.push({
				type: 'diagonal',
				direction: 'top-right-to-bottom-left',
				cells: gameState.board.map((row, i) => row[size - 1 - i])
			});
		}

		// Return the winning lines
		return winningLines;
	}
</script>

<!-- Use the dynamic height for main container -->
<div
	class="relative select-none bg-gradient-to-t from-slate-950 to-neutral-950"
	style="height: 100dvh;"
>
	<div bind:this={rigidbodiesElement} class="absolute z-10 h-full w-full"></div>

	<div class="flex h-full w-full flex-col items-center justify-center">
		<div class="mt-2 text-center font-zombie text-2xl text-orange-500">
			<span class="text-lime-500">ZOM</span>BINGO
			<button
				class="border-bg-red-500 absolute right-2 top-2 aspect-square border border-red-500 px-2 font-vhs text-xs text-white"
				onclick={() => (showModal = true)}
			>
				Rst
			</button>
		</div>

		<div class="flex flex-grow items-center justify-center p-2">
			<div class="grid h-full w-full auto-rows-fr grid-cols-5 gap-1">
				{#each gameState.board as row, i}
					{#each row as cell, j}
						<BingoCardButton
							bind:this={cell.element}
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

	<ConfirmModal
		isOpen={showModal}
		onConfirm={() => {
			resetCard();
			showModal = false;
		}}
		onCancel={() => (showModal = false)}
	/>
</div>
