<script lang="ts">
	const { label, onclick, selected, winning, font } = $props();
</script>

<button
  class="w-full h-full text-slate-300 border border-slate-500 shadow-lg"
  class:bg-orange-950={selected}
  class:bg-grey-950={!selected}
  class:bg-orange-600={winning}
  class:text-orange-500={selected && !winning}
  class:text-orange-950={winning}
  {onclick}
>
  <div class="text-center {font}">
    {label}
  </div>
</button>