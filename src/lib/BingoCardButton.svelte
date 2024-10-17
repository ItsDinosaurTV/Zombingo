<script>
	const { label, onclick, selected, winning, center } = $props();

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
		rippleSize = maxDistance * 1;

		// Trigger the onclick function passed from parent
		onclick();
	}
</script>

<button
	class="relative h-full w-full overflow-hidden border border-slate-500 shadow-lg"
	onclick={handleClick}
>
	<div
		class="duration-250 absolute rounded-full {center
			? 'bg-radient-ellipse-c from-lime-950 from-60% to-lime-800 to-100%'
			: 'bg-radient-ellipse-c from-orange-950 from-60% to-orange-800 to-100%'} transition-transform ease-out"
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

	<div class="relative text-center">
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
					? 'font-zombie uppercase text-orange-500'
					: 'font-vhs text-slate-300'
				: 'hidden'}
		>
			{label}
		</div>
	</div>
</button>
