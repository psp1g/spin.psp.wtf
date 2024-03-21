import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
    plugins: [ sveltekit() ],
    optimizeDeps: {
        include: [ ],
    },
    server: {
        watch: {
            usePolling: true,
        },
        fs: {
            allow: [ 'static' ],
        },
    },
    build: {
        assetsInlineLimit: 0,
    },
};

export default config;