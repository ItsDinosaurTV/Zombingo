<script context="module" lang="ts">
	import confetti from 'canvas-confetti';

	export function launchConfetti(emojis: string[]) {
		const scalar = 2;
		const shapes = emojis.map((emoji) => confetti.shapeFromText({ text: emoji, scalar }));

		var defaults = {
			spread: 55,
			ticks: 60,
			gravity: 0,
			decay: 0.96,
			startVelocity: 20,
			shapes: shapes,
			scalar: scalar
		};

		function shoot() {
			// left
			confetti({
				...defaults,
				particleCount: 30,
				angle: 60,
				origin: { x: 0, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 5,
				flat: true,
				angle: 60,
				origin: { x: 0, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 15,
				scalar: scalar / 2,
				shapes: ['circle'],
				angle: 60,
				origin: { x: 0, y: 1 }
			});

			// right
			confetti({
				...defaults,
				particleCount: 30,
				angle: 120,
				origin: { x: 1, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 5,
				flat: true,
				angle: 120,
				origin: { x: 1, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 15,
				scalar: scalar / 2,
				shapes: ['circle'],
				angle: 120,
				origin: { x: 1, y: 1 }
			});

			// top
			confetti({
				...defaults,
				particleCount: 30,
				angle: 90,
				origin: { y: -0.1 },
				spread: 180,
				startVelocity: -35
			});
			confetti({
				...defaults,
				particleCount: 5,
				flat: true,
				angle: 90,
				origin: { y: -0.1 },
				spread: 180,
				startVelocity: -35
			});
			confetti({
				...defaults,
				particleCount: 15,
				scalar: scalar / 2,
				shapes: ['circle'],
				angle: 90,
				origin: { y: -0.1 },
				spread: 180,
				startVelocity: -35
			});
		}

		setTimeout(shoot, 0);
		setTimeout(shoot, 100);
		setTimeout(shoot, 200);
	}
</script>
