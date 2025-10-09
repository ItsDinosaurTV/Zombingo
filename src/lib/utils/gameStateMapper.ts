import type { GameState, StoredGameState } from '$lib/types/gameState';

export function mapToGameState(storedGameState: StoredGameState): GameState {
	return { 
		tileId: storedGameState.tileId,
		board: storedGameState.board.map((row) =>
		row.map((cell) => ({
			label: cell.label,
			selected: cell.selected,
			winning: false,
			winningDirections: []
		})))
		};
}

export function mapToStoredGameState(gameState: GameState): StoredGameState {
	return { 
		tileId: gameState.tileId,
		board: gameState.board.map((row) =>
		row.map((cell) => ({
			label: cell.label,
			selected: cell.selected
		})))
		};
}
