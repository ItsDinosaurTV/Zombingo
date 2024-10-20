<script lang="ts">
	export let isOpen = false;
	export let onConfirm: () => void;
	export let onCancel: () => void;

	// Optional: Add a backdrop click to close the modal
	function handleBackdropClick(event: MouseEvent) {
		if ((event.target as HTMLElement).classList.contains('backdrop')) {
			onCancel();
		}
	}
</script>

{#if isOpen}
	<div
		class="backdrop fixed inset-0 z-50 flex items-center justify-center"
		on:click={handleBackdropClick}
	>
		<div class="border border-slate-500 bg-slate-950 p-4 font-vhs shadow-lg">
			<h2 class="text-lg uppercase text-red-500">Confirm Reset</h2>
			<p class=" text-slate-300">
				Are you sure you want to <span class="text-red-500">reset</span> the card?
			</p>
			<div class="mt-4 flex justify-end">
				<button
					class="mr-2 border border-slate-500 px-4 py-2 uppercase text-slate-300"
					on:click={onCancel}
				>
					Cancel
				</button>
				<button
					class="border border-red-500 bg-slate-950 px-4 py-2 uppercase text-red-500"
					on:click={() => {
						onConfirm();
					}}
				>
					Confirm
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
