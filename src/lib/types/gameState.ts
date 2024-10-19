import type { BingoCardButtonInstance } from '$lib/BingoCardButtonTypes';

export type StoredCellState = {
	label: string;
	selected: boolean;
};

export type CellState = StoredCellState & {
	winning: boolean;
	winningDirections: string[];
	element: BingoCardButtonInstance;
};

export type StoredGameState = StoredCellState[][];
export type GameState = CellState[][];
