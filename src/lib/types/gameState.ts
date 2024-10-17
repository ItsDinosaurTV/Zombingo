export type CellState = {
	label: string;
	selected: boolean;
	winning: boolean;
};

export type GameState = CellState[][];
