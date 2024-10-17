<script>
	const { label, onclick, selected, winning, font } = $props();

	// Variables to store the click position
	let clickX = $state(50); // Click X in percentage
	let clickY = $state(50); // Click Y in percentage
	let rippleSize = $state(0); // Will hold the size of the ripple

	function handleClick(event) {
		const rect = event.currentTarget.getBoundingClientRect();

		// Calculate click position relative to the button
		clickX = ((event.clientX - rect.left) / rect.width) * 100;
		clickY = ((event.clientY - rect.top) / rect.height) * 100;

		// Calculate the distance to the farthest corner
		const dx = Math.max(event.clientX - rect.left, rect.right - event.clientX);
		const dy = Math.max(event.clientY - rect.top, rect.bottom - event.clientY);
		const maxDistance = Math.sqrt(dx * dx + dy * dy);

		// Set the size of the ripple based on the distance to the farthest corner
		rippleSize = maxDistance * 2;

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
		class="absolute rounded-full bg-orange-950 transition-transform duration-500 ease-in-out"
		style="
      width: {rippleSize}px; 
      height: {rippleSize}px;
      left: calc({clickX}% - {rippleSize / 2}px); 
      top: calc({clickY}% - {rippleSize / 2}px);
      transform: scale({selected ? 1 : 0});
    "
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
</style>
