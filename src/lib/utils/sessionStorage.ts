import type { GameState } from '$lib/types/gameState';
import { mapToGameState, mapToStoredGameState } from './gameStateMapper';

export function getStateFromSession(): GameState | null {
	const storedValue = sessionStorage.getItem('state');
	return storedValue ? mapToGameState(JSON.parse(storedValue)) : null;
}

export function saveStateToSession(state: GameState): void {
	sessionStorage.setItem('state', JSON.stringify(mapToStoredGameState(state)));
}

export function clearSession(): void {
	sessionStorage.clear();
}
