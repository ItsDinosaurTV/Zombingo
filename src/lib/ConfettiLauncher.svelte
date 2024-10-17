<script context="module" lang="ts">
	import confetti from 'canvas-confetti';

	export function launchConfetti(emojis: string[]) {
		const scalar = 2;
		const shapes = emojis.map((emoji) => confetti.shapeFromText({ text: emoji, scalar }));

		function shoot() {
			confetti({
				scalar: scalar,
				particleCount: 20,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 1 },
				shapes
			});
			confetti({
				scalar: scalar,
				particleCount: 20,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 1 },
				shapes
			});
		}

		setTimeout(shoot, 0);
		setTimeout(shoot, 100);
		setTimeout(shoot, 200);
	}
</script>
