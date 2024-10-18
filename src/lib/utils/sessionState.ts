import { browser } from '$app/environment';
import type { Card } from '$lib/types/gameCard';
import type { GameState } from '$lib/types/gameState';
import { pickRandom, shuffle } from './array';

export function initializeState(size: number, card: Card): GameState {
	const randomizedLabels = shuffle([...card.labels]);

	const initialState = Array.from({ length: size }, (_, i) =>
		Array.from({ length: size }, (_, j) => ({
			label: randomizedLabels[i * size + j],
			selected: false,
			winning: false
		}))
	);

	const centerIndex = Math.floor(size / 2);
	initialState[centerIndex][centerIndex].label = pickRandom(card.freeSpaces) ?? '';

	return initialState;
}

export function getStateFromSession(): GameState | null {
	if (!browser) return [];

	const storedState = sessionStorage.getItem('state');
	return storedState ? JSON.parse(storedState) : null;
}

export function saveStateToSession(state: GameState): void {
	if (!browser) return;

	sessionStorage.setItem('state', JSON.stringify(state));
}
