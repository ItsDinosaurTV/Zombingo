<style>
	@font-face {
	  font-family: 'Satan';
	  src: url('/fonts/satan.ttf') format('truetype');
	}
</style>

<script>
	const { label, onclick, selected, winning, font } = $props();
</script>

<button
	font-family={font}
	class="size-32 rounded font-bold text-white"
	class:bg-red-700={selected}
	class:hover:bg-red-500={selected}
	class:bg-cyan-500={!selected}
	class:hover:bg-cyan-300={!selected}
	class:bg-green-500={winning}
	class:hover:bg-green-300={winning}
	{onclick}
>
	{label}
</button>
