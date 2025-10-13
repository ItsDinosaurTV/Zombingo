<script>
	import '../app.css';
	export const prerender = true;
</script>

<slot />

<style>
	:global(body) {
		background-color: rgb(10, 10, 10);
	}
</style>
