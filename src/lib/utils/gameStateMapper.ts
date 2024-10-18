import type { GameState, StoredGameState } from '$lib/types/gameState';

export function mapToGameState(storedGameState: StoredGameState): GameState {
	return storedGameState.map((row) =>
		row.map((cell) => ({
			label: cell.label,
			selected: cell.selected,
			winning: false,
			winningDirections: []
		}))
	);
}

export function mapToStoredGameState(gameState: GameState): StoredGameState {
	return gameState.map((row) =>
		row.map((cell) => ({
			label: cell.label,
			selected: cell.selected
		}))
	);
}
