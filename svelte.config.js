import adapter from "@sveltejs/adapter-static";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            // On GitHub pages, this will redirect every non-existing file to this app
            fallback: '404.html',
        }),
        prerender: { entries: [] },
    },
    preprocess: preprocess({ postcss: true }),
};

export default config;