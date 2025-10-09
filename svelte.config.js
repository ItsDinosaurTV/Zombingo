import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // Use the static adapter so the build produces a static `build` folder suitable for GitHub Pages
        adapter: adapter(),

        // If you host at a subpath (e.g. username.github.io/repo), set base via an env var:
        // paths: { base: process.env.SITE_BASE || '' }
    }
};

export default config;
