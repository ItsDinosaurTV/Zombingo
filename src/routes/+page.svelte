<script>
	import pako from 'pako';
	import { resolve } from '$app/paths';
	import QRCode from 'qrcode';

	let textarea;
	export let shareUrl = ''; // Added export for potential external use, initialized empty
	let qrCodeDataUrl = ''; // Added export for potential external use, initialized empty
	let lineCount = 0;
	const MIN_LINES = 25;
	$: isReady = lineCount >= MIN_LINES; // Reactive declaration for button disabling
	// Function to extract non-empty lines

	/**
	 * Converts a Pako/zlib Uint8Array buffer into a URL-safe Base64 string.
	 * This is the crucial step to make the binary data work in a URL query parameter.
	 */
	function bufferToUrlSafeBase64(buffer) {
		// 1. Convert Uint8Array to a binary string
		let binary = '';
		const len = buffer.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(buffer[i]);
		}
		// 2. Encode the binary string to Base64 (standard a-zA-Z0-9+/=)
		const base64 = btoa(binary);
		// 3. Make Base64 URL-safe (replace +, / with -, _, and remove =)
		return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	}

	function getLines(text) {
		return text
			.split(/\r?\n/)
			.map((l) => l.trim())
			.filter((l) => l.length > 0);
	} // Function to update the line count on input

	function updateLineCount() {
		const lines = getLines(textarea.value || '');
		lineCount = lines.length; // Clear the URL if the count drops below MIN_LINES after a URL was created
		if (!isReady) {
			shareUrl = '';
		}
	} // Function to only create the URL

	async function createUrl() {
		const lines = getLines(textarea.value || '');
		if (lines.length < MIN_LINES) {
			// This case should be prevented by button disabling, but as a fallback:
			shareUrl = `Please enter at least ${MIN_LINES} non-empty lines.`;
			return;
		}
		const tileString = lines.join('\n');

		// --- START Pako Compression ---
		// 1. Compress the string to a Uint8Array buffer
        const compressedBuffer = pako.deflate(tileString, {
            level: 9 // 🌟 MAXIMIZE COMPRESSION HERE 🌟
        });
		// 2. Convert the buffer to a URL-safe string
		const encoded = bufferToUrlSafeBase64(compressedBuffer);
		// --- END Pako Compression ---

		shareUrl = location.origin + resolve(`/card?data=${encoded}`);

		qrCodeDataUrl = await generateQrCode(shareUrl);
	} // Function to copy the currently generated URL

	function copyUrl() {
		if (shareUrl) {
			navigator.clipboard?.writeText(shareUrl).catch((err) => {
				console.error('Failed to copy text: ', err); // Optionally update shareUrl to show a copy error message
			});
		}
	}

	async function generateQrCode(shareUrl) {
		try {
			// The URL you created in your Svelte component's createUrl function
			const textToEncode = shareUrl;

			// Generates the QR code as a Base64-encoded PNG Data URL
			const qrCodeDataUrl = await QRCode.toDataURL(textToEncode, {
				errorCorrectionLevel: 'H', // Use 'H'igh for better resilience
				type: 'image/png',
				margin: 1, // Minimal margin for smaller size
				color: {
					// Adjust colors if needed, otherwise defaults are fine
					dark: '#000000',
					light: '#ffffff'
				}
			});

			// This is the string you would send back to the client
			return qrCodeDataUrl;
		} catch (err) {
			console.error(err);
			return null; // Handle error appropriately
		}
	}
</script>

<div class="mb-2 mt-2 text-center font-zombie text-2xl text-orange-500">
	<span class="text-lime-500">ZOM</span>BINGO
</div>

<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
	<textarea
		bind:this={textarea}
		id="tile-input"
		class="textarea rounded border border-slate-600 bg-slate-800 p-2 text-slate-200"
		style="max-width: 100%; margin-bottom: 5px;"
		placeholder="Each Line is a Tile, First Line is the Center Tile."
		on:input={updateLineCount}
		rows="25"
		cols="50"
	></textarea>
	<div style="margin-bottom: 15px;">
		<span class="text-slate-300" style="font-weight: bold;">
			Lines: {lineCount} / {MIN_LINES}
		</span>
		{#if lineCount < MIN_LINES}
			<span class="text-red-500" style="margin-left: 10px;">
				(Need {MIN_LINES - lineCount} more)
			</span>
		{:else}
			<span class="text-green-500" style="margin-left: 10px;"> (Ready!) </span>
		{/if}
	</div>
	<div style="display: flex; gap: 10px; margin-bottom: 10px;">
		<button
			id="create-url-button"
			class="rounded-full bg-lime-500 px-4 py-2 text-sm font-semibold text-black disabled:bg-gray-500 disabled:text-gray-300"
			on:click={createUrl}
			disabled={!isReady}
		>
			Create Card 🔗
		</button>
		<button
			id="copy-url-button"
			class="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-black disabled:bg-gray-500 disabled:text-gray-300"
			on:click={copyUrl}
			disabled={!shareUrl || !isReady}
		>
			Copy Link 📄
		</button>
	</div>
	<div id="qr-code-container" style="margin-top: 15px;">
		{#if qrCodeDataUrl}
			<img src={qrCodeDataUrl} alt="ZOMBINGO Share QR Code" style="width: 200px; height: 200px;" />
		{/if}
	</div>
	<div id="result-container" style="margin-top: 20px; text-align: center; max-width: 500px;">
		<a
			href={shareUrl}
			class="text-slate-300"
			target="_blank"
			style="font-weight: bold; word-break: break-all;"
		>
			{shareUrl}
		</a>
	</div>
</div>
