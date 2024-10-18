<script context="module" lang="ts">
	import confetti from 'canvas-confetti';

	export function launchConfettiAtPosition(x: Number, y: Number) {
		const defaults = {
			spread: 360,
			ticks: 60,
			gravity: 0,
			decay: 0.9,
			startVelocity: 6,
			colors: ['FFE400', 'FFBD00', 'E89400', 'FFCA6C', 'FDFFB8'],
			origin: { x: x, y: y }
		};

		function shoot() {
			confetti({
				...defaults,
				particleCount: 10,
				decay: 0.95,
				scalar: 0.75,
				shapes: ['star']
			});

			confetti({
				...defaults,
				particleCount: 15,
				decay: 0.99,
				scalar: 0.65,
				shapes: ['circle']
			});
		}

		setTimeout(shoot, 0);
	}

	export function launchConfetti(emojis: string[]) {
		const scalar = 2;
		const shapes = emojis.map((emoji) => confetti.shapeFromText({ text: emoji, scalar }));

		const defaults = {
			spread: 55,
			ticks: 60,
			gravity: 0.2,
			startVelocity: 20,
			shapes: shapes,
			scalar: scalar
		};

		function shoot() {
			// left
			confetti({
				...defaults,
				particleCount: 2,
				decay: 0.96,
				angle: 60,
				origin: { x: 0, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 5,
				decay: 0.85,
				flat: true,
				angle: 60,
				origin: { x: 0, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 5,
				decay: 0.9,
				scalar: scalar / 2,
				shapes: ['circle'],
				angle: 60,
				origin: { x: 0, y: 1 }
			});

			// right
			confetti({
				...defaults,
				particleCount: 2,
				decay: 0.96,
				angle: 120,
				origin: { x: 1, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 5,
				decay: 0.85,
				flat: true,
				angle: 120,
				origin: { x: 1, y: 1 }
			});
			confetti({
				...defaults,
				particleCount: 5,
				decay: 0.9,
				scalar: scalar / 2,
				shapes: ['circle'],
				angle: 120,
				origin: { x: 1, y: 1 }
			});

			// top
			confetti({
				...defaults,
				particleCount: 2,
				decay: 0.96,
				angle: 90,
				origin: { y: -0.1 },
				spread: 180,
				startVelocity: -35
			});
			confetti({
				...defaults,
				particleCount: 5,
				decay: 0.85,
				flat: true,
				angle: 90,
				origin: { y: -0.1 },
				spread: 180,
				startVelocity: -35
			});
			confetti({
				...defaults,
				particleCount: 5,
				decay: 0.9,
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
