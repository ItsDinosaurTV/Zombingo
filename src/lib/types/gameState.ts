export type StoredCellState = {
	label: string;
	selected: boolean;
};

export type CellState = StoredCellState & {
	winning: boolean;
	winningDirections: string[];
};

export type StoredGameState = StoredCellState[][];
export type GameState = CellState[][];
