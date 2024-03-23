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
    define: {
        APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    build: {
        assetsInlineLimit: 0,
    },
};

export default config;