import { browser } from '$app/environment';
import type { GameState } from '$lib/types/gameState';

export function initializeState(size: number, randomizedLabels: string[]): GameState {
	return Array.from({ length: size }, (_, i) =>
		Array.from({ length: size }, (_, j) => ({
			label: randomizedLabels[i * size + j],
			selected: false,
			winning: false
		}))
	);
}

export function getStateFromSession(size: number, randomizedLabels: string[]): GameState {
	if (!browser) return [];

	const storedState = sessionStorage.getItem('state');
	return storedState ? JSON.parse(storedState) : initializeState(size, randomizedLabels);
}

export function saveStateToSession(state: GameState): void {
	if (!browser) return;

	sessionStorage.setItem('state', JSON.stringify(state));
}
