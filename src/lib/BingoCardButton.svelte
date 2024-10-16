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
  class="w-full h-full text-slate-300 border border-slate-500 shadow-lg"
  class:bg-red-950={selected}
  class:hover:bg-red-900={selected}
  class:bg-grey-950={!selected}
  class:hover:bg-grey-900={!selected}
  class:bg-red-800={winning}
  class:hover:bg-red-700={winning}
  {onclick}
>
  <div class="text-center text-xs">
    {label}
  </div>
</button>