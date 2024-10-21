<script lang="ts">
	import { onDestroy } from 'svelte';

	const { label, onclick, selected, winning, winningDirections, center } = $props();

	// Variables to store the click position
	let clickX = $state(25 + Math.random() * 50); // Click X position in percentage
	let clickY = $state(25 + Math.random() * 50); // Click Y position in percentage
	let clientHeight = $state(0);
	let clientWidth = $state(0);
	let rippleSize = $derived(Math.max(clientWidth, clientHeight)); // The size of the ripple, based on the button size

	function handleClick(event) {
		const rect = event.currentTarget.getBoundingClientRect();

		// Calculate click position relative to the button
		clickX = ((event.clientX - rect.left) / rect.width) * 100;
		clickY = ((event.clientY - rect.top) / rect.height) * 100;

		// Trigger the onclick function passed from parent
		onclick();
	}

	let isFlashing = $state(false);
	let flashTimeoutId = $state<ReturnType<typeof setTimeout>>();
	export function triggerFlash() {
		isFlashing = true;

		clearTimeout(flashTimeoutId);

		flashTimeoutId = setTimeout(() => {
			isFlashing = false;
		}, 400); // Keep in sync with the animation duration
	}

	$effect(() => {
		if (!winning) {
			isFlashing = false;
			clearTimeout(flashTimeoutId);
		}
	});

	onDestroy(() => {
		clearTimeout(flashTimeoutId);
	});
</script>

<button
	bind:clientHeight
	bind:clientWidth
	class="relative h-full w-full overflow-hidden border border-slate-500 shadow-lg"
	onclick={handleClick}
>
	<div
		class="duration-250 absolute rounded-full {center
			? 'from-lime-950 from-60% to-lime-800 to-100% bg-radient-ellipse-c'
			: 'from-orange-950 from-60% to-orange-800 to-100% bg-radient-ellipse-c'} transition-transform ease-out"
		style="
      width: {rippleSize}px;
      height: {rippleSize}px;
      left: calc({clickX}% - {rippleSize / 2}px);
      top: calc({clickY}% - {rippleSize / 2}px);
      transform: scale({selected ? 1 : 0});
      opacity: {selected ? 1 : 0}; 
    "
	></div>

	<div
		class="absolute inset-0 {center
			? 'bg-lime-950'
			: 'bg-orange-950'} opacity-0 transition-opacity duration-500 ease-out"
		class:opacity-100={winning}
	></div>

	<div
		id="winHLine"
		class="absolute inset-0 mix-blend-lighten {center
			? 'bg-gradient-to-t from-lime-950 from-10% via-lime-900 via-50% to-lime-950 to-90%'
			: 'bg-gradient-to-t from-orange-950 from-10% via-orange-900 via-50% to-orange-950 to-90%'} opacity-0 transition-opacity duration-500 ease-out"
		class:opacity-100={winningDirections.includes('horizontal')}
	></div>

	<div
		id="winVLine"
		class="absolute inset-0 mix-blend-lighten {center
			? 'bg-gradient-to-r from-lime-950 from-10% via-lime-900 via-50% to-lime-950 to-90%'
			: 'bg-gradient-to-r from-orange-950 from-10% via-orange-900 via-50% to-orange-950 to-90%'} opacity-0 transition-opacity duration-500 ease-out"
		class:opacity-100={winningDirections.includes('vertical')}
	></div>

	<div
		id="winDRLine"
		class="absolute inset-0 mix-blend-lighten {center
			? 'bg-gradient-to-tr from-lime-950 from-10% via-lime-900 via-50% to-lime-950 to-90%'
			: 'bg-gradient-to-tr from-orange-950 from-10% via-orange-900 via-50% to-orange-950 to-90%'} opacity-0 transition-opacity duration-500 ease-out"
		class:opacity-100={winningDirections.includes('top-left-to-bottom-right')}
	></div>

	<div
		id="winDLLine"
		class="absolute inset-0 mix-blend-lighten {center
			? 'bg-gradient-to-tl from-lime-950 from-10% via-lime-900 via-50% to-lime-950 to-90%'
			: 'bg-gradient-to-tl from-orange-950 from-10% via-orange-900 via-50% to-orange-950 to-90%'} opacity-0 transition-opacity duration-500 ease-out"
		class:opacity-100={winningDirections.includes('top-right-to-bottom-left')}
	></div>

	<div class="cell-label relative text-center">
		<div
			id="selected"
			class={selected
				? winning
					? center
						? 'font-zombie uppercase text-lime-500'
						: 'font-vhs text-orange-500'
					: center
						? 'font-zombie uppercase text-lime-500'
						: 'font-vhs text-orange-500'
				: 'hidden'}
		>
			{label}
		</div>

		<div
			id="notselected"
			class={!selected
				? center
					? 'font-zombie uppercase text-lime-500'
					: 'font-vhs text-slate-300'
				: 'hidden'}
		>
			{label}
		</div>
	</div>
	{#if isFlashing}
		<div class="animate-flash absolute inset-0 bg-white"></div>
	{/if}
</button>

<style>
	@media (max-height: 400px) {
		.cell-label {
			font-size: 13px;
		}
	}
	@keyframes fadeOut {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	.animate-flash {
		animation: fadeOut 0.4s ease-out forwards;
	}
</style>
