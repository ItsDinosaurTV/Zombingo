<script lang="ts">
	import pako from 'pako';
	import { onMount } from 'svelte';

	let outputValue = 'Waiting for tiles from URL...';

	/**
	 * Decodes the URL-safe Base64 string back into a Pako/zlib Uint8Array buffer.
	 */
	function urlSafeBase64ToBuffer(str) {
		// 1. Reverse the URL-safe replacements
		let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
		// 2. Add padding back (required for standard btoa/atob)
		while (base64.length % 4) {
			base64 += '=';
		}
		// 3. Decode from Base64 to a binary string
		const binary = atob(base64);
		// 4. Convert binary string back to Uint8Array
		const buffer = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			buffer[i] = binary.charCodeAt(i);
		}
		return buffer;
	}

	function decodeTiles(encoded: string) {
		// 2. Decompress
		try {
			// 1. Convert the URL-safe Base64 string back to a Uint8Array buffer
			const compressedBuffer = urlSafeBase64ToBuffer(encoded);

			// 2. Decompress the buffer back to a string
			const decompressedString = pako.inflate(compressedBuffer, { to: 'string' });

			// The decompressed string is your original tile list, ready to be split and displayed!
			return decompressedString.split('\n');
		} catch (e) {
			console.error('Decompression failed:', e);

			return ''; // Return empty array on failure
		}
	}

	onMount(() => {
		const params = new URLSearchParams(location.search);

		if (params.has('data')) {
			const encoded = params.get('data')!;
			const allTiles = decodeTiles(encoded);

			if (allTiles) {
				outputValue = allTiles.join('\n');
				console.log('Custom Bingo Tiles:', allTiles);
			} else {
				outputValue = 'Error: Could not decode tiles from URL data.';
			}
		} else {
			outputValue =
				'No custom tile data found in the URL. Please use the generator page to create a link.';
		}
	});
</script>

<h1>Custom B-Movie Bingo Board</h1>

<textarea
	id="decoded-tiles-output"
	rows="15"
	cols="50"
	readonly
	bind:value={outputValue}
	placeholder="Waiting for tiles from URL..."
></textarea>
