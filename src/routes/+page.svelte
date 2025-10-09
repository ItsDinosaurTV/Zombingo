<script>
    import LZString from 'lz-string';

    let textarea;
    let shareUrl = '';
    let lineCount = 0;
    const MIN_LINES = 25;

    function getLines(text) {
        return text
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l.length > 0);
    }

    function updateLineCount() {
        const lines = getLines(textarea.value || '');
        lineCount = lines.length;
    }

    function createUrl() {
        const lines = getLines(textarea.value || '');
        if (lines.length < MIN_LINES) {
            shareUrl = `Please enter at least ${MIN_LINES} non-empty lines.`;
            return;
        }
        
        const tileString = lines.join('$$');
        const encoded = LZString.compressToEncodedURIComponent(tileString);
        
        shareUrl = `${location.origin}/card?data=${encoded}`;
        navigator.clipboard?.writeText(shareUrl).catch(() => {});
    }
</script>

<div style="display: flex; flex-direction: column; align-items: center; width: 100%;">

    <textarea 
        bind:this={textarea} 
        id="tile-input" 
        class="textarea" 
        placeholder="Paste each tile on a new line (minimum 25)."
        on:input={updateLineCount} 
        rows="25" cols="50" style="max-width: 100%; margin-bottom: 5px;"
    ></textarea>

    <div style="margin-bottom: 15px;">
        <span style="font-weight: bold;">
            Lines: {lineCount} / {MIN_LINES}
        </span>
        {#if lineCount < MIN_LINES}
            <span style="color: #e66; margin-left: 10px;">
                (Need {MIN_LINES - lineCount} more)
            </span>
        {:else}
            <span style="color: #28a745; margin-left: 10px;">
                (Ready! ✅)
            </span>
        {/if}
    </div>

    <button id="create-button" class="btn" on:click={createUrl}>Create Shareable URL</button>

    <div id="result-container" style="margin-top: 20px; text-align: center; max-width: 500px;">
        <a href={shareUrl} target="_blank" style="font-weight: bold; word-break: break-all;">
            {shareUrl}
        </a>
    </div>
</div>