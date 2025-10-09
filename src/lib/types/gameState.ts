import type { BingoCardButtonInstance } from '$lib/BingoCardButtonTypes';

export type StoredCellState = {
	label: string;
	selected: boolean;
};

export type CellState = StoredCellState & {
	winning: boolean;
	winningDirections: string[];
	// Note: 'element' is not stored in session, only active in memory
	element: BingoCardButtonInstance | null;
};

/**
 * The state stored in session storage.
 * Includes the board and an optional tileId to identify the custom tile set.
 */
export type StoredGameState = {
    tileId: string;
    board: StoredCellState[][];
};

/**
 * The full game state used in the component's memory.
 */
export type GameState = {
	tileId: string;
    board: CellState[][];
};
