<script>
	import pako from 'pako';
	import { resolve } from '$app/paths';
	import QRCode from 'qrcode';

	let textarea;
	export let shareUrl = ''; // Added export for potential external use, initialized empty
	let qrCodeDataUrl = ''; // Added export for potential external use, initialized empty

	let copyUrlStatus = 'Copy Link 📄';
	let copyQrStatus = 'Copy QR Code 🖼️';

	let lineCount = 0;
	const MIN_LINES = 25;
	const MAX_RECOMMENDED_LINES = 50;
	$: isReady = lineCount >= MIN_LINES; // Reactive declaration for button disabling
	$: showHighVolumeWarning = lineCount > MAX_RECOMMENDED_LINES;

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

		qrCodeDataUrl = await generateQrCodeWithOverlay(shareUrl, 'qroverlay/qrbrain.png');
		//qrCodeDataUrl = await generateQrCode(shareUrl);
	} // Function to copy the currently generated URL

	async function copyUrl() {
		if (!shareUrl) {
			return;
		}

		try {
			await navigator.clipboard.writeText(shareUrl);
			console.log('Share URL copied to clipboard successfully!');

			// 🌟 SUCCESS FEEDBACK 🌟
			copyUrlStatus = 'Copied! ✅';
			setTimeout(() => {
				copyUrlStatus = 'Copy Link 📄';
			}, 1000); // Reset after 1 second
		} catch (err) {
			console.error('Failed to copy text: ', err);
			// On error, show a message but still reset it
			copyUrlStatus = 'Error! ❌';
			setTimeout(() => {
				copyUrlStatus = 'Copy Link 📄';
			}, 1500); // Wait a bit longer for the error message
		}
	}

	async function copyQrCode() {
		if (!qrCodeDataUrl) {
			return;
		}

		try {
			const response = await fetch(qrCodeDataUrl);
			const blob = await response.blob();

			const item = new ClipboardItem({ [blob.type]: blob });

			await navigator.clipboard.write([item]);

			console.log('QR Code image copied to clipboard successfully!');

			// 🌟 SUCCESS FEEDBACK 🌟
			copyQrStatus = 'Copied! ✅';
			setTimeout(() => {
				copyQrStatus = 'Copy QR Code 🖼️';
			}, 1000); // Reset after 1 second
		} catch (err) {
			console.error('Failed to copy QR Code image: ', err);
			// On error, show a message but still reset it
			copyQrStatus = 'Error! ❌';
			setTimeout(() => {
				copyQrStatus = 'Copy QR Code 🖼️';
			}, 1500); // Wait a bit longer for the error message

			// alert('Failed to copy the QR code image...'); // You might remove this alert now that there's visual feedback
		}
	}

	async function generateQrCode(shareUrl) {
		try {
			// The URL you created in your Svelte component's createUrl function
			const textToEncode = shareUrl;

			// Generates the QR code as a Base64-encoded PNG Data URL
			const qrCodeDataUrl = await QRCode.toDataURL(textToEncode, {
				errorCorrectionLevel: 'L', // Use 'H'igh for better resilience
				type: 'image/png',
				margin: 1, // Minimal margin for smaller size
				color: {
					// Adjust colors if needed, otherwise defaults are fine
					dark: '#330232',
					light: '#ff7fb6'
				},
				scale: 1
			});

			// This is the string you would send back to the client
			return qrCodeDataUrl;
		} catch (err) {
			console.error(err);
			return null; // Handle error appropriately
		}
	}

	async function generateQrCodeWithOverlay(shareUrl, backgroundImageUrl) {
		const SCALE_FACTOR = 4; // 🌟 4x larger output 🌟

		try {
			// --- Configuration for QR Code Placement ---
			// These values are estimated based on your provided image.
			// You might need to adjust them for perfect alignment.
			const qrCodeTargetWidth = 67 * SCALE_FACTOR; // Estimated width of the pink square
			const qrCodeTargetHeight = 67 * SCALE_FACTOR; // Estimated height of the pink square
			const qrCodeXPos = 33 * SCALE_FACTOR; // Estimated X position for the top-left corner of the pink square
			const qrCodeYPos = 11 * SCALE_FACTOR; // Estimated Y position for the top-left corner of the pink square
			// ------------------------------------------

			// 1. Generate the QR Code Data URL
			const textToEncode = shareUrl;
			const qrCodeDataUrl = await QRCode.toDataURL(textToEncode, {
				errorCorrectionLevel: 'L', // Low error correction for bigger QR code modules
				type: 'image/png',
				margin: 0,
				// We'll set the QR code's intrinsic resolution here to match our target,
				// so it scales nicely when drawn onto the canvas.
				width: qrCodeTargetWidth,
				color: { dark: '#301b32', light: '#7d986b' },
				scale: SCALE_FACTOR
			});

			// 2. Load the Background Image and QR Code into Image objects
			const backgroundImage = new Image();
			const qrCodeImage = new Image();

			const loadImages = new Promise((resolve, reject) => {
				let loadedCount = 0;
				const checkDone = () => {
					if (++loadedCount === 2) resolve();
				};

				backgroundImage.onload = checkDone;
				backgroundImage.onerror = reject;
				qrCodeImage.onload = checkDone;
				qrCodeImage.onerror = reject;

				backgroundImage.src = backgroundImageUrl;
				qrCodeImage.src = qrCodeDataUrl;
			});

			await loadImages;

			// 3. Create a Canvas and Draw the Images

			// Use the background image's natural dimensions for the canvas
			const canvas = document.createElement('canvas');
			canvas.width = backgroundImage.naturalWidth * SCALE_FACTOR;
			canvas.height = backgroundImage.naturalHeight * SCALE_FACTOR;
			const ctx = canvas.getContext('2d');

			// Disable smoothing for pixel art style
			ctx.imageSmoothingEnabled = false;

			// Draw the background image first
			ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

			// Draw the QR Code image on top with fixed dimensions and position
			ctx.drawImage(qrCodeImage, qrCodeXPos, qrCodeYPos, qrCodeTargetWidth, qrCodeTargetHeight);

			// 4. Get the Final Composite Image Data URL
			const finalDataUrl = canvas.toDataURL('image/png');

			return finalDataUrl;
		} catch (err) {
			console.error('Error creating composite QR code image with fixed overlay:', err);
			return null;
		}
	}
</script>

<div class="mb-2 mt-2 text-center font-zombie text-2xl text-orange-500">
	<span class="text-lime-500 [letter-spacing:-0.25em]">Z</span><span
		class="[letter-spacing:-0.25em]">💀</span
	><span class="text-lime-500">M</span>BINGO
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
		{#if showHighVolumeWarning}
			<div
				class="mt-2 rounded-lg border border-yellow-500 bg-yellow-900 p-2 text-sm text-yellow-300"
			>
				⚠️ With {lineCount} items, the QR code is very dense and might be difficult to scan reliably.
			</div>
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
			{copyUrlStatus}
		</button>
		<button
			id="copy-qr-button"
			class="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-gray-500 disabled:text-gray-300"
			on:click={copyQrCode}
			disabled={!qrCodeDataUrl || !isReady}
		>
			{copyQrStatus}
		</button>
	</div>
	<div id="qr-code-container" style="margin-top: 15px;">
		{#if qrCodeDataUrl}
			<img src={qrCodeDataUrl} alt="ZOMBINGO Share QR Code" />
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
