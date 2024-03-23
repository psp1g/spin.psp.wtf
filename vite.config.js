import { sveltekit } from '@sveltejs/kit/vite';
import pkg from "./package.json" assert { type: "json" };

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
    define: {
        APP_VERSION: JSON.stringify(pkg.version),
    },
    build: {
        assetsInlineLimit: 0,
    },
};

export default config;