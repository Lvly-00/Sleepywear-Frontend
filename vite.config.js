import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    // Load environment variables from .env files
    const env = loadEnv(mode, process.cwd(), '');

    return {
        server: {
            host: '0.0.0.0',
            allowedHosts: env.VITE_HOST_URLS ? env.VITE_HOST_URLS.split(',') : [],
        },
        plugins: [
            react(),
            tailwindcss(), // Add Tailwind plugin here
        ],
        base: '/',
        resolve: {
            alias: {
                '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
            },
        },
    };
});