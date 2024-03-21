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
};

export default config;