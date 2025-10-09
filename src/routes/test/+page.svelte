<script lang="ts">
    import LZString from 'lz-string';
    import { onMount } from 'svelte';

    let outputValue = 'Waiting for tiles from URL...';

    function decodeTiles(encoded: string) {
        try {
            // Use the matching decompression function
            const tileString = LZString.decompressFromEncodedURIComponent(encoded);
            
            if (tileString === null) {
                // This happens if decompression fails (e.g., bad data)
                throw new Error('Decompression failed (returned null).');
            }

            // Split the decompressed string back into an array
            return tileString.split('$$');
        } catch (e) {
            console.error('Failed to decode/decompress tiles:', e);
            return null;
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

<textarea id="decoded-tiles-output" rows="15" cols="50" readonly bind:value={outputValue}
    placeholder="Waiting for tiles from URL..."></textarea>