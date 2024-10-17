<script>
	const { label, onclick, selected, winning, font } = $props();

	// Variables to store the click position
	let clickX = $state('0%');
	let clickY = $state('0%');

	// Function to capture click position
	function handleClick(event) {
		// Calculate the click position relative to the button
		const rect = event.currentTarget.getBoundingClientRect();
		clickX = `${((event.clientX - rect.left) / rect.width) * 100}%`;
		clickY = `${((event.clientY - rect.top) / rect.height) * 100}%`;

		// Trigger the onclick function passed from parent
		onclick();
	}
</script>

<button
	class="relative h-full w-full overflow-hidden border border-slate-500 shadow-lg"
	onclick={handleClick}
>
	<!-- Ripple effect container for selected state -->
	<div
		class="absolute inset-0 bg-orange-950 transition-transform duration-500 ease-out"
		class:scale-0={!selected}
		class:scale-100={selected}
		style="transform: translate(calc({clickX} - 50%), calc({clickY} - 50%)) scale(var(--scale));"
	></div>

	<!-- Ripple effect for winning state -->
	<div
		class="absolute inset-0 bg-orange-500 opacity-0 transition-opacity duration-500 ease-in-out"
		class:opacity-100={winning}
	></div>

	<!-- Label text -->
	<div class="relative z-10 text-center {font}">
		{label}
	</div>
</button>

<style>
	:global(.scale-0) {
		--scale: 0; /* Ripple is not visible */
	}
	:global(.scale-100) {
		--scale: 2; /* Adjust for the desired size of the ripple */
	}
</style>
