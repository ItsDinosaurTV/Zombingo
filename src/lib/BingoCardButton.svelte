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
  class="w-full h-full aspect-square text-slate-300 border border-slate-500 shadow-lg"
  class:bg-red-950={selected}
  class:hover:bg-red-900={selected}
  class:bg-cyan-950={!selected}
  class:hover:bg-cyan-900={!selected}
  class:bg-green-950={winning}
  class:hover:bg-green-900={winning}
  {onclick}
>
  <div class="text-center">
    {label}
  </div>
</button>